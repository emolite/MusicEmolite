import { Injectable, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { MessageService } from './message.service';
import { ENVI } from '../../../environment/environment';
import { ChatMessage } from '../models/message/message.model';
import { FriendUser } from '../models/friend/friend-user.model';

@Injectable({
  providedIn: 'root'
})
export class ChatHubService {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private messageService = inject(MessageService);

  private hubConnection: signalR.HubConnection | null = null;

  totalUnreadCount = signal(0);
  incomingMessage = signal<ChatMessage | null>(null);
  incomingFriendRequest = signal<FriendUser | null>(null);
  friendRequestAccepted = signal<FriendUser | null>(null);
  typingUserId = signal<number | null>(null);
  messageDeleted = signal<{ messageId: number } | null>(null);

  /** Conversation currently open on screen - suppresses its own notification. */
  private activeConversationUserId: number | null = null;

  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(ENVI.hubUrl, {
        accessTokenFactory: () => this.authService.getToken() ?? '',
        // We authenticate with a Bearer token, not cookies - and the server's
        // CORS policy uses AllowAnyOrigin(), which the Fetch/CORS spec forbids
        // combining with credentialed (withCredentials) requests.
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      this.incomingMessage.set(message);

      if (this.activeConversationUserId === message.senderId) return;

      this.totalUnreadCount.update(count => count + 1);
      this.playNotificationSound();
      this.toastService.success(`Bạn có ${this.totalUnreadCount()} tin nhắn mới`);
    });

    this.hubConnection.on('FriendRequestReceived', (friend: FriendUser) => {
      this.incomingFriendRequest.set(friend);
      this.playNotificationSound();
      this.toastService.success(`${friend.fullName || friend.username} đã gửi lời mời kết bạn`);
    });

    this.hubConnection.on('FriendRequestAccepted', (friend: FriendUser) => {
      this.friendRequestAccepted.set(friend);
      this.toastService.success(`${friend.fullName || friend.username} đã chấp nhận lời mời kết bạn`);
    });

    this.hubConnection.on('UserTyping', (payload: { senderId: number }) => {
      this.typingUserId.set(payload.senderId);

      if (this.typingTimer) clearTimeout(this.typingTimer);

      this.typingTimer = setTimeout(() => {
        this.typingUserId.set(null);
        this.typingTimer = null;
      }, 3000);
    });

    this.hubConnection.on('MessageDeleted', (payload: { messageId: number }) => {
      this.messageDeleted.set(payload);
    });

    this.hubConnection.start().catch(() => {
      // Best-effort - REST endpoints still work without the realtime channel.
    });

    this.refreshUnreadCount();
  }

  stop(): void {
    this.hubConnection?.stop();
    this.hubConnection = null;
    this.totalUnreadCount.set(0);

    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = null;
    this.typingUserId.set(null);
  }

  sendTyping(receiverId: number): void {
    this.hubConnection?.invoke('Typing', receiverId).catch(() => {
      // Best-effort - typing indicator is a nice-to-have, not worth surfacing errors for.
    });
  }

  refreshUnreadCount(): void {
    this.messageService.getConversations().subscribe({
      next: res => {
        const total = (res.data ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
        this.totalUnreadCount.set(total);
      },
      error: () => {}
    });
  }

  setActiveConversation(userId: number | null): void {
    this.activeConversationUserId = userId;
  }

  clearUnreadFor(count: number): void {
    this.totalUnreadCount.update(current => Math.max(0, current - count));
  }

  private playNotificationSound(): void {
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioContextCtor();
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(now + start);
        oscillator.stop(now + start + duration);
      };

      playTone(880, 0, 0.15);
      playTone(1175, 0.12, 0.2);
    } catch {
      // Web Audio not available - sound is a nice-to-have, fail silently.
    }
  }
}
