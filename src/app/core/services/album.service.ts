import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { API_SERVICE } from "./commons/api.service";
import { API_END } from "../constants/api-end.constants";
import { BaseTableResponse } from "../models/base/base-table-res.model";
import { AlbumResponse } from "../models/album/res-album.model";
import { AlbumRequest } from "../models/album/req-album.model";
import { BaseSearchDto } from "../models/base/base-search.model";

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  private api = inject(API_SERVICE);

  searchAlbums(
    data: BaseSearchDto<AlbumRequest>
  ): Observable<BaseTableResponse<AlbumResponse>> {

    return this.api.postData<
      BaseTableResponse<AlbumResponse>,
      BaseSearchDto<AlbumRequest>
    >(
      API_END.ALBUM.SEARCH,
      data
    );
  }
}