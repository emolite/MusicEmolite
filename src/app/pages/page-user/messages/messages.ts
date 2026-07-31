import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, HostListener, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, throttleTime, forkJoin } from 'rxjs';

import { FriendService } from '../../../core/services/friend.service';
import { MessageService } from '../../../core/services/message.service';
import { ChatHubService } from '../../../core/services/chat-hub.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PlayerService } from '../../../core/services/player.service';

import { FriendUser } from '../../../core/models/friend/friend-user.model';
import { FriendSearchResult } from '../../../core/models/friend/friend-search-result.model';
import { Conversation } from '../../../core/models/message/conversation.model';
import { ChatMessage } from '../../../core/models/message/message.model';

type Tab = 'chats' | 'friends' | 'search';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html'
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesScroll') messagesScrollRef?: ElementRef<HTMLDivElement>;

  private friendService = inject(FriendService);
  private messageService = inject(MessageService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  public chatHubService = inject(ChatHubService);
  public player = inject(PlayerService);

  get currentUserId(): number | null {
    return this.authService.user()?.userId ?? null;
  }

  /**
   * <main> reserves bottom space via padding (pb-32/pb-24) for the floating
   * player bar, even when nothing is playing - a percentage-height or
   * calc() child can't reach into a parent's own padding without causing
   * overflow, so this uses `absolute inset-0` (sized to main's now-`relative`
   * padding box) instead, then re-adds just enough clearance of its own for
   * whichever floating bars are actually visible right now.
   */
  get rootClass(): string {
    const hasPlayer = !!this.player.currentTrack();
    const clearance = hasPlayer ? 'pb-36 md:pb-24' : 'pb-16 md:pb-0';
    return `absolute inset-0 flex overflow-hidden bg-[#0f0d1a] text-white ${clearance}`;
  }

  activeTab = signal<Tab>('chats');

  conversations = signal<Conversation[]>([]);
  loadingConversations = signal(true);

  friends = signal<FriendUser[]>([]);
  pendingRequests = signal<FriendUser[]>([]);
  sentRequests = signal<FriendUser[]>([]);
  loadingFriends = signal(true);

  searchKeyword = '';
  searchResults = signal<FriendSearchResult[]>([]);
  searching = signal(false);

  activeConversation = signal<Conversation | null>(null);
  messages = signal<ChatMessage[]>([]);
  loadingMessages = signal(false);

  messageText = '';
  sendingMessage = signal(false);
  uploadingImage = signal(false);

  selectedImageFile: File | null = null;
  selectedImagePreviewUrl = signal<string | null>(null);

  showScrollToBottom = signal(false);
  private shouldScrollToBottom = false;

  openMessageMenuId = signal<number | null>(null);
  replyingTo = signal<ChatMessage | null>(null);
  forwardingMessage = signal<ChatMessage | null>(null);
  selectedForwardFriendIds = signal<number[]>([]);
  forwardingInProgress = signal(false);
  highlightedMessageId = signal<number | null>(null);

  isFriendTyping = computed(() => {
    const conv = this.activeConversation();
    return !!conv && this.chatHubService.typingUserId() === conv.friendUserId;
  });

  private searchSubject = new Subject<string>();
  private typingSubject = new Subject<void>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(keyword => this.performSearch(keyword));

    this.typingSubject.pipe(
      throttleTime(2000, undefined, { leading: true, trailing: false })
    ).subscribe(() => {
      const conv = this.activeConversation();
      if (conv) this.chatHubService.sendTyping(conv.friendUserId);
    });

    // untracked() below is load-bearing, not defensive style: handleIncomingMessage
    // (transitively) reads other signals (activeConversation, showScrollToBottom) and
    // writes some of them (messages, conversations). Without untracked, those reads
    // register as dependencies of THIS effect, so writing them later (e.g. on scroll,
    // or from this same handler) reschedules the effect - which re-reads the still-set
    // incomingMessage() and reprocesses the same message again, forever. Keep this
    // effect's only dependency as incomingMessage().
    effect(() => {
      const msg = this.chatHubService.incomingMessage();
      if (!msg) return;
      untracked(() => this.handleIncomingMessage(msg));
    });

    effect(() => {
      const friend = this.chatHubService.incomingFriendRequest();
      if (!friend) return;
      untracked(() => this.pendingRequests.update(list => [friend, ...list.filter(f => f.friendshipId !== friend.friendshipId)]));
    });

    effect(() => {
      const friend = this.chatHubService.friendRequestAccepted();
      if (!friend) return;
      untracked(() => {
        this.friends.update(list => [friend, ...list.filter(f => f.userId !== friend.userId)]);
        this.sentRequests.update(list => list.filter(f => f.userId !== friend.userId));
      });
    });

    effect(() => {
      const deleted = this.chatHubService.messageDeleted();
      if (!deleted) return;
      untracked(() => {
        this.messages.update(list =>
          list.map(m => m.id === deleted.messageId
            ? { ...m, isDeleted: true, content: null, imageUrl: null }
            : m)
        );
        this.loadConversations(true);
      });
    });
  }

  ngOnInit(): void {
    this.loadConversations();
    this.loadFriendsData();
  }

  ngOnDestroy(): void {
    this.chatHubService.setActiveConversation(null);
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom) return;

    this.shouldScrollToBottom = false;
    this.scrollToBottom();
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  @HostListener('document:click')
  closeMessageMenu(): void {
    this.openMessageMenuId.set(null);
  }

  toggleMessageMenu(messageId: number, event: Event): void {
    event.stopPropagation();
    this.openMessageMenuId.update(id => id === messageId ? null : messageId);
  }

  onMessageInput(): void {
    this.typingSubject.next();
  }

  onMessagesScroll(): void {
    const el = this.messagesScrollRef?.nativeElement;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.showScrollToBottom.set(distanceFromBottom > 150);
  }

  /**
   * Message images load after the surrounding container is already
   * measured, so a scroll-to-bottom triggered right when the message
   * arrives lands short by the image's eventual height. Re-snap once it
   * finishes loading - but only if the user hasn't scrolled away since.
   */
  onMessageImageLoad(): void {
    if (this.showScrollToBottom()) return;
    this.scrollToBottom();
  }

  scrollToBottom(smooth = false): void {
    const el = this.messagesScrollRef?.nativeElement;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });

    this.showScrollToBottom.set(false);
  }

  /**
   * Jumps to the original message a reply is quoting. Only works if it's
   * still within the currently loaded page of messages - there's no
   * "load older messages until found" fallback here.
   */
  scrollToMessage(messageId: number): void {
    if (!this.messages().some(m => m.id === messageId)) {
      this.toastService.error('Không tìm thấy tin nhắn gốc');
      return;
    }

    const el = document.getElementById('msg-' + messageId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    this.highlightedMessageId.set(messageId);
    setTimeout(() => {
      if (this.highlightedMessageId() === messageId) {
        this.highlightedMessageId.set(null);
      }
    }, 1500);
  }

  /**
   * `silent` skips flipping loadingConversations - used for background
   * refreshes (after sending/receiving a message) so the sidebar doesn't
   * flash a loading skeleton on every message.
   */
  private loadConversations(silent = false): void {
    if (!silent) {
      this.loadingConversations.set(true);
    }

    this.messageService.getConversations().subscribe({
      next: res => {
        this.conversations.set(res.data ?? []);
        this.loadingConversations.set(false);
      },
      error: () => this.loadingConversations.set(false)
    });
  }

  private loadFriendsData(): void {
    this.loadingFriends.set(true);

    this.friendService.getFriends().subscribe({
      next: res => this.friends.set(res.data ?? []),
      error: () => {}
    });

    this.friendService.getPendingRequests().subscribe({
      next: res => this.pendingRequests.set(res.data ?? []),
      error: () => {}
    });

    this.friendService.getSentRequests().subscribe({
      next: res => {
        this.sentRequests.set(res.data ?? []);
        this.loadingFriends.set(false);
      },
      error: () => this.loadingFriends.set(false)
    });
  }

  private handleIncomingMessage(msg: ChatMessage): void {
    const active = this.activeConversation();

    if (active && active.friendUserId === msg.senderId) {
      this.messages.update(list => [...list, msg]);
      this.messageService.markAsRead(msg.senderId).subscribe();

      // Only yank the view down if they're already near the bottom - if
      // they've scrolled up to read history, let the "jump to bottom"
      // button handle it instead of interrupting them.
      if (!this.showScrollToBottom()) {
        this.shouldScrollToBottom = true;
      }
    }

    this.loadConversations(true);
  }

  selectConversation(conv: Conversation): void {
    this.activeConversation.set(conv);
    this.chatHubService.setActiveConversation(conv.friendUserId);
    this.loadMessages(conv.friendUserId);

    if (conv.unreadCount > 0) {
      const unread = conv.unreadCount;

      this.messageService.markAsRead(conv.friendUserId).subscribe(() => {
        this.chatHubService.clearUnreadFor(unread);

        this.conversations.update(list =>
          list.map(c => c.friendUserId === conv.friendUserId ? { ...c, unreadCount: 0 } : c)
        );
      });
    }
  }

  backToList(): void {
    this.activeConversation.set(null);
    this.chatHubService.setActiveConversation(null);
  }

  private loadMessages(friendUserId: number): void {
    this.loadingMessages.set(true);

    this.messageService.getConversation(friendUserId).subscribe({
      next: res => {
        this.messages.set(res.data ?? []);
        this.loadingMessages.set(false);
        this.shouldScrollToBottom = true;
      },
      error: () => this.loadingMessages.set(false)
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => this.selectedImagePreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    input.value = '';
  }

  clearSelectedImage(): void {
    this.selectedImageFile = null;
    this.selectedImagePreviewUrl.set(null);
  }

  sendMessage(): void {
    const conv = this.activeConversation();
    if (!conv) return;

    const text = this.messageText.trim();
    if (!text && !this.selectedImageFile) return;

    this.sendingMessage.set(true);

    if (this.selectedImageFile) {
      this.uploadingImage.set(true);

      this.messageService.uploadImage(this.selectedImageFile).subscribe({
        next: uploadRes => {
          this.uploadingImage.set(false);
          this.doSendMessage(conv.friendUserId, text, uploadRes.data ?? null);
        },
        error: () => {
          this.uploadingImage.set(false);
          this.sendingMessage.set(false);
          this.toastService.error('Tải ảnh lên thất bại');
        }
      });
      return;
    }

    this.doSendMessage(conv.friendUserId, text, null);
  }

  private doSendMessage(receiverId: number, text: string, imagePublicId: string | null): void {
    const replyToMessageId = this.replyingTo()?.id ?? null;

    this.messageService.sendMessage({
      receiverId,
      content: text || null,
      imagePublicId,
      replyToMessageId
    }).subscribe({
      next: res => {
        this.sendingMessage.set(false);

        if (res.data) {
          this.messages.update(list => [...list, res.data as ChatMessage]);
        }

        this.messageText = '';
        this.clearSelectedImage();
        this.replyingTo.set(null);
        this.shouldScrollToBottom = true;
        this.loadConversations(true);
      },
      error: (err) => {
        this.sendingMessage.set(false);
        this.toastService.error(err?.error?.message || 'Gửi tin nhắn thất bại');
      }
    });
  }

  startReply(message: ChatMessage): void {
    this.replyingTo.set(message);
    this.openMessageMenuId.set(null);
  }

  cancelReply(): void {
    this.replyingTo.set(null);
  }

  startForward(message: ChatMessage): void {
    this.forwardingMessage.set(message);
    this.selectedForwardFriendIds.set([]);
    this.openMessageMenuId.set(null);
  }

  cancelForward(): void {
    if (this.forwardingInProgress()) return;

    this.forwardingMessage.set(null);
    this.selectedForwardFriendIds.set([]);
  }

  toggleForwardFriend(friendId: number): void {
    if (this.forwardingInProgress()) return;

    this.selectedForwardFriendIds.update(ids =>
      ids.includes(friendId) ? ids.filter(id => id !== friendId) : [...ids, friendId]
    );
  }

  confirmForwardSelection(): void {
    const source = this.forwardingMessage();
    const ids = this.selectedForwardFriendIds();

    if (!source || ids.length === 0 || this.forwardingInProgress()) return;

    this.forwardingInProgress.set(true);

    forkJoin(
      ids.map(receiverId =>
        this.messageService.sendMessage({
          receiverId,
          content: null,
          imagePublicId: null,
          forwardFromMessageId: source.id
        })
      )
    ).subscribe({
      next: results => {
        this.forwardingInProgress.set(false);
        this.toastService.success('Đã chuyển tiếp tin nhắn');

        const activeFriendId = this.activeConversation()?.friendUserId;
        const activeIdx = activeFriendId != null ? ids.indexOf(activeFriendId) : -1;
        const activeData = activeIdx !== -1 ? results[activeIdx]?.data : null;

        if (activeData) {
          this.messages.update(list => [...list, activeData as ChatMessage]);
          this.shouldScrollToBottom = true;
        }

        this.forwardingMessage.set(null);
        this.selectedForwardFriendIds.set([]);
        this.loadConversations(true);
      },
      error: (err) => {
        this.forwardingInProgress.set(false);
        this.toastService.error(err?.error?.message || 'Chuyển tiếp thất bại');
      }
    });
  }

  removeMessage(message: ChatMessage): void {
    this.openMessageMenuId.set(null);

    if (!confirm('Thu hồi tin nhắn này?')) return;

    this.messageService.deleteMessage(message.id).subscribe({
      next: () => {
        this.messages.update(list =>
          list.map(m => m.id === message.id
            ? { ...m, isDeleted: true, content: null, imageUrl: null }
            : m)
        );
        this.loadConversations(true);
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Thu hồi thất bại')
    });
  }

  onSearchInput(value: string): void {
    this.searchKeyword = value;
    this.searchSubject.next(value);
  }

  private performSearch(keyword: string): void {
    const trimmed = keyword.trim();

    if (!trimmed) {
      this.searchResults.set([]);
      return;
    }

    this.searching.set(true);

    this.friendService.searchUsers(trimmed).subscribe({
      next: res => {
        this.searchResults.set(res.data ?? []);
        this.searching.set(false);
      },
      error: () => this.searching.set(false)
    });
  }

  sendFriendRequest(user: FriendSearchResult): void {
    this.friendService.sendRequest(user.userId).subscribe({
      next: () => {
        this.searchResults.update(list =>
          list.map(u => u.userId === user.userId ? { ...u, friendStatus: 'PENDING_SENT' } : u)
        );
        this.toastService.success('Đã gửi lời mời kết bạn');
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Gửi lời mời thất bại')
    });
  }

  acceptRequest(req: FriendUser): void {
    this.friendService.acceptRequest(req.friendshipId).subscribe({
      next: () => {
        this.pendingRequests.update(list => list.filter(f => f.friendshipId !== req.friendshipId));
        this.friends.update(list => [{ ...req, status: 'ACCEPTED' }, ...list]);
        this.toastService.success('Đã chấp nhận kết bạn');
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Có lỗi xảy ra')
    });
  }

  rejectRequest(req: FriendUser): void {
    this.friendService.rejectRequest(req.friendshipId).subscribe({
      next: () => {
        this.pendingRequests.update(list => list.filter(f => f.friendshipId !== req.friendshipId));
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Có lỗi xảy ra')
    });
  }

  removeFriend(friend: FriendUser): void {
    if (!confirm(`Hủy kết bạn với ${friend.fullName || friend.username}?`)) return;

    this.friendService.removeFriend(friend.userId).subscribe({
      next: () => {
        this.friends.update(list => list.filter(f => f.userId !== friend.userId));
        this.conversations.update(list => list.filter(c => c.friendUserId !== friend.userId));

        if (this.activeConversation()?.friendUserId === friend.userId) {
          this.activeConversation.set(null);
        }
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Có lỗi xảy ra')
    });
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  isMine(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  openChatWithFriend(friend: FriendUser): void {
    let conv = this.conversations().find(c => c.friendUserId === friend.userId);

    if (!conv) {
      conv = {
        friendUserId: friend.userId,
        username: friend.username,
        fullName: friend.fullName,
        avatarUrl: friend.avatarUrl,
        lastMessage: null,
        lastMessageHasImage: false,
        isLastMessageDeleted: false,
        isLastMessageMine: false,
        lastMessageAt: null,
        unreadCount: 0
      };

      this.conversations.update(list => [conv as Conversation, ...list]);
    }

    this.activeTab.set('chats');
    this.selectConversation(conv);
  }
}
