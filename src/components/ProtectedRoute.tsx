
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = []
}) => {
  const { currentUser, userData, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    // Check if user is logged in
    if (!currentUser) {
      // Store the attempted URL for redirecting after login
      sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
      navigate('/login', { replace: true });
      setIsAuthorized(false);
      return;
    }

    // If no specific roles required, allow access
    if (allowedRoles.length === 0) {
      setIsAuthorized(true);
      return;
    }

    // Check if user has required role
    if (userData && allowedRoles.includes(userData.role)) {
      setIsAuthorized(true);
    } else {
      console.warn(`Access denied. Required roles: ${allowedRoles.join(', ')}. User role: ${userData?.role}`);
      navigate('/unauthorized', { replace: true });
      setIsAuthorized(false);
    }
  }, [currentUser, userData, isLoading, navigate, allowedRoles, location]);

  // Show loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Memverifikasi otorisasi...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render children
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
