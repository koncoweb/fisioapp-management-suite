
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          Sorry, you don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>
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
