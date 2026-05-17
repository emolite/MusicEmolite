import { ENVI } from "../../../environment/environment";

const BASE_URL = ENVI.apiUrl;

export const API_END = {
  AUTH: {
    LOGIN: `${BASE_URL}auth/login`,
    REGISTER: `${BASE_URL}auth/register`,
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
    DETAIL: (id: number) => `${BASE_URL}songs/${id}`,
    VIEW: (id: number) => `${BASE_URL}songs/${id}/view`,
    LIKE: (id: number) => `${BASE_URL}songs/${id}/like`,
    LYRICS: `${BASE_URL}songs/lyrics`
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