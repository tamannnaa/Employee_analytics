import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/Authcontext';
import AuthForm from './pages/AuthForm';
import Statistics from './pages/employees/Statistics';
import BulkImport from './pages/employees/BulkImport';
import ExportEmployees from './pages/employees/ExportEmployees';
import Profile from './pages/employees/Profile';
import Employees from './pages/employees/Employees';
import UpdateEmployee from './pages/employees/UpdateEmployee';
import Dashboard from './pages/Dashboard';
import DashboardStats from './pages/analytics/DashboardStats';
import SalaryDistribution from './pages/analytics/SalaryDistribution';
import DepartmentPerformance from './pages/analytics/DepartmentPerformance';
import HiringTrends from './pages/analytics/HiringTrends';
import RetentionRate from './pages/analytics/RetentionRate';
import PerformanceTrends from './pages/analytics/PerformanceTrends';
import CustomQuery from './pages/analytics/CustomQuery';
import ReportingSystem from './pages/reports/ReportingSystem';
import FileManagement from './pages/files/FileManagement';
import CustomReportBuilder from './pages/reports/CustomReportBuilder';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const context = useAuth();
  if (!context) {
    throw new Error("Auth Context not found");
  }
  const { user, loading } = context;
  if (loading) {
    return <p>Loading the page...</p>;
  }
  if (!user) {
    return <AuthForm />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
          path="/user/:employeeId"
          element={
          <ProtectedRoute>
            <UpdateEmployee />
            </ProtectedRoute>
          }
          />

          <Route
            path="/employees/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/import"
            element={
              <ProtectedRoute>
                <BulkImport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/exportpage"
            element={
              <ProtectedRoute>
                <ExportEmployees />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/analytics/dashboard-stats" 
            element={
              <ProtectedRoute>
                <DashboardStats />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics/salary-distribution" 
            element={
              <SalaryDistribution />
            } 
          />
          <Route 
            path="/analytics/department-performance" 
            element={
              <DepartmentPerformance />
            } 
          />
          <Route 
            path="/analytics/hiring-trends" 
            element={
              <HiringTrends />
            } 
          />
          <Route 
            path="/analytics/retention-rate" 
            element={
              <RetentionRate />
            } 
          />
          <Route 
            path="/analytics/performance-trends" 
            element={
              <PerformanceTrends />
            } 
          />
          <Route 
            path="/analytics/custom" 
            element={
              <CustomQuery />
            } 
          />
          <Route
          path="/files"
          element={
          <ProtectedRoute>
            <FileManagement />
          </ProtectedRoute>
          }
          />
          <Route
          path="/reports"
          element={
          <ProtectedRoute>
            <ReportingSystem />
          </ProtectedRoute>
          }
          />
           <Route
            path="/reports/custom-builder"
            element={
              <ProtectedRoute>
                <CustomReportBuilder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
