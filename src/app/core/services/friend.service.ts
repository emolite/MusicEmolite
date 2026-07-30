import { Injectable, inject } from '@angular/core';
import { API_SERVICE } from './commons/api.service';
import { API_END } from '../constants/api-end.constants';
import { BaseResponse } from '../models/base/base-res.model';
import { FriendUser } from '../models/friend/friend-user.model';
import { FriendSearchResult } from '../models/friend/friend-search-result.model';
import { SendFriendRequest } from '../models/friend/req-send-friend-request.model';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  private api = inject(API_SERVICE);

  getFriends() {
    return this.api.getData<BaseResponse<FriendUser[]>>(API_END.FRIEND.BASE);
  }

  getPendingRequests() {
    return this.api.getData<BaseResponse<FriendUser[]>>(API_END.FRIEND.REQUESTS);
  }

  getSentRequests() {
    return this.api.getData<BaseResponse<FriendUser[]>>(API_END.FRIEND.REQUESTS_SENT);
  }

  searchUsers(keyword: string) {
    return this.api.getData<BaseResponse<FriendSearchResult[]>>(
      `${API_END.FRIEND.SEARCH}?keyword=${encodeURIComponent(keyword)}`
    );
  }

  sendRequest(addresseeId: number) {
    return this.api.postData<BaseResponse<FriendUser>, SendFriendRequest>(
      API_END.FRIEND.REQUESTS,
      { addresseeId }
    );
  }

  acceptRequest(friendshipId: number) {
    return this.api.putData<BaseResponse<boolean>, {}>(
      API_END.FRIEND.ACCEPT(friendshipId),
      {}
    );
  }

  rejectRequest(friendshipId: number) {
    return this.api.putData<BaseResponse<boolean>, {}>(
      API_END.FRIEND.REJECT(friendshipId),
      {}
    );
  }

  removeFriend(friendUserId: number) {
    return this.api.deleteData<BaseResponse<boolean>>(
      API_END.FRIEND.REMOVE(friendUserId)
    );
  }
}
