import { logisticsApi } from "./logistics";

export const waybillsApi = {
  list: logisticsApi.getWaybills.bind(logisticsApi),
  detail: logisticsApi.getWaybillDetail.bind(logisticsApi),
  rearchive: logisticsApi.rearchiveWaybill.bind(logisticsApi),
  stagnant: logisticsApi.getStagnantWaybills.bind(logisticsApi),
};
