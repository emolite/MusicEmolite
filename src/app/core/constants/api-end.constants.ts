import { ENVI } from "../../../environment/environment";

const BASE_URL = ENVI.apiUrl;

export const API_END = {
  AUTH: {
    LOGIN: `${BASE_URL}auth/login`,
    REGISTER: `${BASE_URL}auth/register`,
    CHECK_EMAIL: `${BASE_URL}auth/check-email`,
    CHECK_IP: `${BASE_URL}auth/check-ip`,
    CURRENT_USER: `${BASE_URL}auth/current-user`
  },

  USER: {
    BASE: `${BASE_URL}users`,
    PROFILE: `${BASE_URL}users/profile`
  },

  SONG: {
    BASE: `${BASE_URL}songs`,
    SEARCH: `${BASE_URL}songs/search`,
    SEARCH_PUBLIC: `${BASE_URL}songs/public/search`,
    TRENDINGS: `${BASE_URL}songs/public/trending`,
    RECENTS: `${BASE_URL}songs/recent`,
    SONG_TO_ALBUMS: `${BASE_URL}songs/albums`,
    DETAIL: (id: number) => `${BASE_URL}songs/${id}`,
    VIEW: (id: number) => `${BASE_URL}songs/${id}/view`,
    HISTORY: (id: number) => `${BASE_URL}songs/${id}/history`,
    LIKE: (id: number) => `${BASE_URL}songs/${id}/like`,
    LYRICS: `${BASE_URL}songs/lyrics`,
    LYRICS_SEARCH: `${BASE_URL}songs/lyrics/search`,
    LYRICS_BY_ID: (id: number) => `${BASE_URL}songs/lyrics/${id}`,
    LYRICS_PUBLISH: `${BASE_URL}songs/publish`
  },

  ALBUM: {
    BASE: `${BASE_URL}albums`,
    SEARCH: `${BASE_URL}albums/search`,
    SEARCH_PUBLIC: `${BASE_URL}albums/public/search`
  },

  ARTIST: {
    BASE: `${BASE_URL}artists`,
    SEARCH: `${BASE_URL}artists/search`,
    EDIT: (id: number) => `${BASE_URL}artists/${id}`,
  }
};