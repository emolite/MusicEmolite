import { ENVI } from "../../../environment/environment";

const BASE_URL = ENVI.apiUrl;

/**
 * Endpoints for our own FoodEmoliteController, which itself proxies
 * FoodEmolite's AdminController (a separate BE/repo). Kept in its own file,
 * away from api-end.constants.ts, so the FoodEmolite integration surface
 * stays easy to track as it grows.
 */
export const FOOD_EMOLITE_API_END = {
  USERS: `${BASE_URL}foodemolite/users`,
  AGENTS: `${BASE_URL}foodemolite/agents`,
  STORES: `${BASE_URL}foodemolite/stores`,
  STORES_BY_OWNER: (ownerRefCode: string) => `${BASE_URL}foodemolite/stores/owner/${ownerRefCode}`,
  STORE_DETAIL: (id: number) => `${BASE_URL}foodemolite/stores/${id}`,
  REVENUE: `${BASE_URL}foodemolite/revenue`,
  TOP_PRODUCTS: `${BASE_URL}foodemolite/revenue/top-products`,
  PRODUCT_REVENUE_SEARCH: `${BASE_URL}foodemolite/revenue/products/search`,
  STORE_FOODS: `${BASE_URL}foodemolite/store-foods`,
};
