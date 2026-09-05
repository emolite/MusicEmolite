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

  getUsers(page = 1, pageSize = 10, keyword?: string | null): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (keyword) params.set('keyword', keyword);

    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.USERS}?${params.toString()}`);
  }

  getAgents(page = 1, pageSize = 10, keyword?: string | null, isActive?: boolean | null): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (keyword) params.set('keyword', keyword);
    if (isActive !== null && isActive !== undefined) params.set('isActive', String(isActive));

    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.AGENTS}?${params.toString()}`);
  }

  createAgent(data: { username: string; email: string; password: string }): Observable<any> {
    return this.api.postData<any, any>(FOOD_EMOLITE_API_END.AGENTS, data);
  }

  getAllStores(page = 1, pageSize = 10, keyword?: string | null, isActive?: boolean | null): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (keyword) params.set('keyword', keyword);
    if (isActive !== null && isActive !== undefined) params.set('isActive', String(isActive));

    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.STORES}?${params.toString()}`);
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

  getStoreFoods(page = 1, pageSize = 10, storeRefCode?: string | null, keyword?: string | null): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (storeRefCode) params.set('storeRefCode', storeRefCode);
    if (keyword) params.set('keyword', keyword);

    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.STORE_FOODS}?${params.toString()}`);
  }

  getAllCategories(
    page = 1,
    pageSize = 10,
    keyword?: string | null,
    storeRefCode?: string | null,
    sortBy?: string | null,
    asc = false
  ): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    params.set('asc', String(asc));
    if (keyword) params.set('keyword', keyword);
    if (storeRefCode) params.set('storeRefCode', storeRefCode);
    if (sortBy) params.set('sortBy', sortBy);

    return this.api.getData<any>(`${FOOD_EMOLITE_API_END.CATEGORIES}?${params.toString()}`);
  }

  searchCustomers(data: any): Observable<any> {
    return this.api.postData<any, any>(FOOD_EMOLITE_API_END.CUSTOMERS_SEARCH, data);
  }

  searchOrders(data: any): Observable<any> {
    return this.api.postData<any, any>(FOOD_EMOLITE_API_END.ORDERS_SEARCH, data);
  }

  searchActivityLogs(data: any): Observable<any> {
    return this.api.postData<any, any>(FOOD_EMOLITE_API_END.ACTIVITY_LOGS_SEARCH, data);
  }
}
