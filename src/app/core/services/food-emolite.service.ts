import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_SERVICE } from './commons/api.service';
import { FOOD_EMOLITE_API_END } from '../constants/food-emolite-api-end.constants';

/**
 * Thin client for our own FoodEmoliteController, which itself just proxies
 * FoodEmolite's AdminController. Response shapes belong to FoodEmolite's own
 * models (list endpoints use `items`, not `data`; some are wrapped as
 * { isSuccess, message, data }, others aren't) - kept loosely typed here
 * rather than re-declaring every nested DTO from a repo we don't own.
 */
@Injectable({
  providedIn: 'root'
})
export class FoodEmoliteService {

  private api = inject(API_SERVICE);

  getUsers(page = 1, pageSize = 10): Observable<any> {
    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.USERS}?page=${page}&pageSize=${pageSize}`);
  }

  getAgents(page = 1, pageSize = 10): Observable<any> {
    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.AGENTS}?page=${page}&pageSize=${pageSize}`);
  }

  createAgent(data: { username: string; email: string; password: string }): Observable<any> {
    return this.api.postData<any, any>(FOOD_EMOLITE_API_END.AGENTS, data);
  }

  getAllStores(page = 1, pageSize = 10): Observable<any> {
    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.STORES}?page=${page}&pageSize=${pageSize}`);
  }

  createStore(formData: FormData): Observable<any> {
    return this.api.postData<any, FormData>(FOOD_EMOLITE_API_END.STORES, formData);
  }

  getStoresByOwner(ownerRefCode: string, page = 1, pageSize = 10): Observable<any> {
    return this.api.getData<any>(
      `${FOOD_EMOLITE_API_END.STORES_BY_OWNER(ownerRefCode)}?page=${page}&pageSize=${pageSize}`
    );
  }

  getStoreDetail(id: number): Observable<any> {
    return this.api.getData<any>(FOOD_EMOLITE_API_END.STORE_DETAIL(id));
  }

  getRevenue(fromDate?: string | null, toDate?: string | null, groupBy: 'day' | 'month' = 'day'): Observable<any> {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    params.set('groupBy', groupBy);

    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.REVENUE}?${params.toString()}`);
  }

  getTopProducts(top = 10, fromDate?: string | null, toDate?: string | null, storeRefCode?: string | null): Observable<any> {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    if (storeRefCode) params.set('storeRefCode', storeRefCode);
    params.set('top', String(top));

    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.TOP_PRODUCTS}?${params.toString()}`);
  }

  searchProductRevenue(data: any): Observable<any> {
    return this.api.postData<any, any>(FOOD_EMOLITE_API_END.PRODUCT_REVENUE_SEARCH, data);
  }

  getStoreFoods(page = 1, pageSize = 10): Observable<any> {
    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.STORE_FOODS}?page=${page}&pageSize=${pageSize}`);
  }
}
