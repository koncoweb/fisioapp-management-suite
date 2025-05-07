
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Sorry, you don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>
        {userData && (
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 border p-2 rounded bg-gray-50 dark:bg-gray-700">
            Current role: {userData.role}
          </p>
        )}
        <div className="space-y-2">
          <Button onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
