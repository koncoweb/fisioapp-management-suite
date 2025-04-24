
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  SidebarTrigger, 
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const { userData, signOut } = useAuth();

  // Determine the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/employees') return 'Employee Management';
    if (path === '/services') return 'Therapy Services';
    if (path === '/bookings') return 'Session Bookings';
    if (path === '/payments') return 'Payment Records';
    if (path === '/profile') return 'My Profile';
    
    // Extract dynamic paths
    if (path.startsWith('/employees/')) return 'Employee Details';
    if (path.startsWith('/services/')) return 'Service Details';
    if (path.startsWith('/bookings/')) return 'Booking Details';
    
    // Default title
    return 'Fisioapp';
  };

  return (
    <header className="border-b sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : <User />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col">
                <span>{userData?.name}</span>
                <span className="text-xs text-muted-foreground">{userData?.role.toUpperCase()}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => window.location.href = '/profile'}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-500"
              onClick={() => signOut()}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
