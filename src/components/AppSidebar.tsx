
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

import {
  Home,
  Users,
  Calendar,
  Receipt,
  Settings,
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();
  
  const isAdmin = userData?.role === 'admin';
  
  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-primary">Fisioapp</h1>
          <p className="text-xs text-muted-foreground">Physiotherapy Clinic</p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === '/'}
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname.startsWith('/employees')}
                    onClick={() => navigate('/employees')}
                  >
                    <Users className="h-4 w-4" />
                    <span>Employees</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname.startsWith('/services')}
                  onClick={() => navigate('/services')}
                >
                  <Settings className="h-4 w-4" />
                  <span>Services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname.startsWith('/bookings')}
                  onClick={() => navigate('/bookings')}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Bookings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.pathname.startsWith('/payments')}
                    onClick={() => navigate('/payments')}
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Payments</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-2">
          <p className="text-xs text-center text-muted-foreground">© 2025 Fisioapp</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
