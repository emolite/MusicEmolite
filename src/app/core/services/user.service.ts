import { inject, Injectable } from "@angular/core";
import { API_SERVICE } from "./commons/api.service";
import { API_END } from "../constants/api-end.constants";
import { ReqUserProfile, ReqUsers } from "../models/user/req-user-profile.model";
import { BaseResponse } from "../models/base/base-res.model";
import { ResUserProfile, ResUsers } from "../models/user/res-user-profile.model";
import { BaseTableResponse } from "../models/base/base-table-res.model";

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

  getUsers(data: ReqUsers) {

    return this.api.postData<
      BaseTableResponse<ResUsers>,
      ReqUsers
    >(
      API_END.USER.BASE,
      data
    );
  }
  getUserProfile() {
    return this.api.postData<BaseResponse<ResUserProfile>, {}>(
      API_END.USER.PROFILE,
      {}
    );
  }
}