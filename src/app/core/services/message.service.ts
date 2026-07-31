import { Injectable, inject } from '@angular/core';
import { API_SERVICE } from './commons/api.service';
import { API_END } from '../constants/api-end.constants';
import { BaseResponse } from '../models/base/base-res.model';
import { ChatMessage } from '../models/message/message.model';
import { Conversation } from '../models/message/conversation.model';
import { SendMessageRequest } from '../models/message/req-send-message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private api = inject(API_SERVICE);

  getConversations() {
    return this.api.getData<BaseResponse<Conversation[]>>(API_END.MESSAGE.CONVERSATIONS);
  }

  getConversation(otherUserId: number, page = 1, pageSize = 30) {
    return this.api.getData<BaseResponse<ChatMessage[]>>(
      `${API_END.MESSAGE.CONVERSATION(otherUserId)}?page=${page}&pageSize=${pageSize}`
    );
  }

  sendMessage(payload: SendMessageRequest) {
    return this.api.postData<BaseResponse<ChatMessage>, SendMessageRequest>(
      API_END.MESSAGE.BASE,
      payload
    );
  }

  markAsRead(otherUserId: number) {
    return this.api.putData<BaseResponse<boolean>, {}>(
      API_END.MESSAGE.MARK_READ(otherUserId),
      {}
    );
  }

  deleteMessage(id: number) {
    return this.api.deleteData<BaseResponse<boolean>>(API_END.MESSAGE.DELETE(id));
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.api.postData<BaseResponse<string>, FormData>(
      API_END.MESSAGE.UPLOAD_IMAGE,
      formData
    );
  }
}
