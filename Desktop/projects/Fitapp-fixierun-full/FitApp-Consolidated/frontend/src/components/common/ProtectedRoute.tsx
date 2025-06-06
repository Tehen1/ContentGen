import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [] 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip redirect during SSR or loading state
    if (typeof window === 'undefined' || loading) return;
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push({
        pathname: '/auth/login',
        query: { returnUrl: router.asPath }
      });
      return;
    }

    // Check permissions if required
    if (requiredPermissions.length > 0 && user) {
      // This assumes user has a permissions array in their data
      // Adjust based on how you store permissions
      const userPermissions = user.permissions || [];
      const hasRequiredPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasRequiredPermissions) {
        router.push('/dashboard'); // Redirect to dashboard or access denied page
      }
    }
  }, [isAuthenticated, loading, router, requiredPermissions, user]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;