
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
  LayoutDashboard,
  Users,
  Package,
  Settings,
  Calendar,
  MessageSquare,
  Receipt,
  LogOut,
  Bell,
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, signOut } = useAuth();
  
  const isAdmin = userData?.role === 'admin';

  const adminMenuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/services', label: 'Services', icon: Settings },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/payments', label: 'Payments', icon: Receipt },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const therapistMenuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/services', label: 'Services', icon: Settings },
  ];

  const menuItems = isAdmin ? adminMenuItems : therapistMenuItems;
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
