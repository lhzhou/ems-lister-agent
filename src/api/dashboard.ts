import { logisticsApi } from "./logistics";

export const dashboardApi = {
  metrics: logisticsApi.getDashboardMetrics.bind(logisticsApi),
  alerts: logisticsApi.getDashboardAlerts.bind(logisticsApi),
  stagnant: logisticsApi.getStagnantWaybills.bind(logisticsApi),
};
