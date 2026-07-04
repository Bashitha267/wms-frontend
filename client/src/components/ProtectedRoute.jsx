import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  // Show a clean, centered loading animation while restoring authentication session
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Verifying session...</p>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, verify user's role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`User role "${user.role}" is not authorized for this route.`);
    return <Navigate to="/dashboard" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
