import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_SERVICE } from './commons/api.service';
import { API_END } from '../constants/api-end.constants';
import { BaseResponse } from '../models/base/base-res.model';
import { DashboardSummaryResponse } from '../models/dashboard/dashboardsummary.model';
import { DashboardTrendResponse } from '../models/dashboard/dashboardtrend.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private api = inject(API_SERVICE);

  getSummary(): Observable<BaseResponse<DashboardSummaryResponse>> {
    return this.api.getData<BaseResponse<DashboardSummaryResponse>>(
      API_END.DASHBOARD.SUMMARY
    );
  }
   getTrend(): Observable<BaseResponse<DashboardTrendResponse[]>> {
    return this.api.getData<BaseResponse<DashboardTrendResponse[]>>(
      API_END.DASHBOARD.TREND
    );
  }
}