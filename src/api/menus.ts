import { authApi } from "./auth";

export const menusApi = {
  list: () => authApi.getMenus(),
};
