import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/Authcontext';
import AuthForm from './pages/AuthForm';
import Statistics from './pages/Statistics';
import BulkImport from './pages/BulkImport';
import ExportEmployees from './pages/ExportEmployees';
import Profile from './pages/Profile';
import Employees from './pages/Employees';
import UpdateEmployee from './pages/UpdateEmployee';
import Dashboard2 from './pages/Dashboard2';

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard2 />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
