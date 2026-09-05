import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_SERVICE } from './commons/api.service';
import { API_END } from '../constants/api-end.constants';
import { BaseSearchDto } from '../models/base/base-search.model';
import { BaseTableResponse } from '../models/base/base-table-res.model';

export interface ActivityLogSearchParams {
  keyword?: string | null;
  actionType?: string | null;
  sortBy?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface ActivityLogResponse {
  userId: number;
  userName: string;
  actionType: string;
  songId: number;
  songTitle: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {

  private api = inject(API_SERVICE);

  search(data: BaseSearchDto<ActivityLogSearchParams>): Observable<BaseTableResponse<ActivityLogResponse>> {
    return this.api.postData<BaseTableResponse<ActivityLogResponse>, BaseSearchDto<ActivityLogSearchParams>>(
      API_END.ACTIVITY_LOG.SEARCH,
      data
    );
  }
}
