import { inject, Injectable } from "@angular/core";
import { API_SERVICE } from "./commons/api.service";
import { API_END } from "../constants/api-end.constants";
import { ReqUserProfile } from "../models/user/req-user-profile.model";
import { BaseResponse } from "../models/base/base-res.model";
import { ResUserProfile } from "../models/user/res-user-profile.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = inject(API_SERVICE);

  updateUser(data: FormData) {
    return this.api.putData<BaseResponse<boolean>, FormData>(
      API_END.USER.BASE,
      data
    );
  }

  getUsers(data: any) {
    return this.api.postData(API_END.USER.BASE, data);
  }

  getUserProfile() {
    return this.api.postData<BaseResponse<ResUserProfile>, {}>(
      API_END.USER.PROFILE,
      {}
    );
  }
}