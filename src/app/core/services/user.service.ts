import { inject, Injectable } from "@angular/core";
import { API_SERVICE } from "./commons/api.service";
import { API_END } from "../constants/api-end.constants";
import { ReqUserProfile, ReqUsers } from "../models/user/req-user-profile.model";
import { BaseResponse } from "../models/base/base-res.model";
import { ResUserProfile, ResUsers } from "../models/user/res-user-profile.model";
import { BaseTableResponse } from "../models/base/base-table-res.model";
import { ResBankUser } from "../models/user/bankuser/res-bank-user.model";
import { ReqBankUser } from "../models/user/bankuser/req-bank-user.model";

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

  getBankUser() {
    return this.api.getData<BaseResponse<ResBankUser>>(
      API_END.USER.BANK_USER
    );
  }

  createBankUser(data: ReqBankUser) {
    return this.api.postData<
      BaseResponse<ResBankUser>,
      ReqBankUser
    >(
      API_END.USER.BANK_USER_ADD,
      data
    );
  }

  updateBankUser(id: number, data: ReqBankUser) {
    return this.api.putData<
      BaseResponse<ResBankUser>,
      ReqBankUser
    >(
      API_END.USER.BANK_USER_EDIT(id),
      data
    );
  }

  deleteBankUser(id: number) {
    return this.api.deleteData<BaseResponse<boolean>>(
      API_END.USER.BANK_USER_EDIT(id)
    );
  }
}