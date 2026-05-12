import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class API_SERVICE {

  private http = inject(HttpClient);

  getData<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  postData<T, D>(url: string, data: D): Observable<T> {
    return this.http.post<T>(url, data);
  }

  putData<T, D>(url: string, data: D): Observable<T> {
    return this.http.put<T>(url, data);
  }

  patchData<T, D>(url: string, data: D): Observable<T> {
    return this.http.patch<T>(url, data);
  }

  deleteData<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }

}