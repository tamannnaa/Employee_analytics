import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Grid from "@mui/material/Grid";

type DashboardStats = {
  total_employees: number;
  active_projects: number;
  average_salary: number;
  new_hires_this_month: number;
  attrition_rate: number;
  top_department: string;
  department_distribution?: { name: string; value: number }[];
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await axios.get(
    "http://127.0.0.1:8000/analytics/dashboard-stats"
  );
  return data;
};

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading)
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", mt: 5 }}
      >
        <CircularProgress />
      </Box>
    );
  if (isError)
    return (
      <Typography color="error" align="center" mt={4}>
        Failed to load dashboard stats.
      </Typography>
    );

  const hiresVsAttrition = [
    { name: "New Hires", value: data?.new_hires_this_month || 0 },
    { name: "Attrition %", value: (data?.attrition_rate || 0) * 100 },
  ];

  // Use backend data if provided, otherwise fallback
  const departmentDist =
    data?.department_distribution || [
      { name: data?.top_department, value: 60 },
      { name: "Others", value: 40 },
    ];

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

  return (
    <Grid container spacing={3} padding={3}>
      {/* KPI CARDS */}
      {[
        { label: "Total Employees", value: data?.total_employees },
        { label: "Active Projects", value: data?.active_projects },
        { label: "Average Salary", value: `$${data?.average_salary}` },
        { label: "New Hires (This Month)", value: data?.new_hires_this_month },
        {
          label: "Attrition Rate",
          value: `${(data?.attrition_rate * 100).toFixed(1)}%`,
        },
        { label: "Top Department", value: data?.top_department },
      ].map((kpi, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: 4,
              height: "100%",
              background: "linear-gradient(135deg, #f9f9f9, #f1f1f1)",
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                {kpi.label}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {kpi.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* CHARTS */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: "16px", boxShadow: 4, height: 350 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              New Hires vs Attrition
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={hiresVsAttrition}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: "16px", boxShadow: 4, height: 350 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Department Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={departmentDist}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {departmentDist.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
