import { api } from "./axios";

// Dashboard stats
export const fetchDashboardStats = async () => {
  const { data } = await api.get("/analytics/dashboard-stats");
  return data;
};

// Salary distribution
export const fetchSalaryDistribution = async () => {
  const { data } = await api.get("/analytics/salary-distribution");
  return data;
};

// Department performance
export const fetchDepartmentPerformance = async () => {
  const { data } = await api.get("/analytics/department-performance");
  return data;
};

// Hiring trends
export const fetchHiringTrends = async () => {
  const { data } = await api.get("/analytics/hiring-trends");
  return data;
};

// Retention rate
export const fetchRetentionRate = async () => {
  const { data } = await api.get("/analytics/retention-rate");
  return data;
};

// Performance trends
export const fetchPerformanceTrends = async () => {
  const { data } = await api.get("/analytics/performance-trends");
  return data;
};

// Custom query
export const runCustomQuery = async (query: Record<string, any>) => {
  const { data } = await api.post("/analytics/custom-query", query);
  return data;
};
