import { inject, Injectable } from '@angular/core';
import { API_SERVICE } from './commons/api.service';
import { API_END } from '../constants/api-end.constants';
import { BaseResponse } from '../models/base/base-res.model';
import { ResBank } from '../models/bank/res-bank.model';

@Injectable({
  providedIn: 'root'
})
export class BankService {

  private api = inject(API_SERVICE);

  getBanks() {
    return this.api.getData<BaseResponse<ResBank[]>>(
      API_END.BANK.LIST
    );
  }
}