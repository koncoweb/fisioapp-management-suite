
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, userData, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // If user is not logged in, redirect to login
      if (!currentUser) {
        navigate("/login");
        return;
      }

      // If specific roles are required
      if (allowedRoles && allowedRoles.length > 0 && userData) {
        if (!allowedRoles.includes(userData.role)) {
          navigate("/unauthorized");
          return;
        }
      }
    }
  }, [currentUser, userData, isLoading, navigate, allowedRoles]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in or not authorized, don't render children
  if (!currentUser || 
      (allowedRoles && allowedRoles.length > 0 && userData && !allowedRoles.includes(userData.role))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
