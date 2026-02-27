import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BLOProvider } from "./admin/BLOContext";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./admin/AdminDashboard";
import CreateBLO from "./admin/CreateBLO";
import AssignRegion from "./admin/AssignRegion";
import ViewReports from "./admin/ViewReports";

import SimpleLogin from "./login/SimpleLogin";
import FormDashboard from "./agent/Dashboard";

function App() {
  return (
    <BLOProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleLogin />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <FormDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bda"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <FormDashboard />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/survey" 
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <FormDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/create-blo" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateBLO />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/assign-region" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AssignRegion />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ViewReports />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </BLOProvider>
  );
}

export default App;
