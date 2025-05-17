
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  Calendar,
  MessageSquare,
  LogOut,
  Bell,
  ShoppingCart,
  DollarSign,
  Fingerprint,
  ClipboardCheck,
  ClipboardList,
  Receipt,
  BarChart,
  Settings,
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, signOut } = useAuth();
  const [appTitle, setAppTitle] = useState('Fisioapp');
  const [appDescription, setAppDescription] = useState('Klinik Fisioterapi');
  const [logoUrl, setLogoUrl] = useState('');
  
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setAppTitle(data.title || 'Fisioapp');
          setAppDescription(data.description || 'Klinik Fisioterapi');
          setLogoUrl(data.logoUrl || '');
        }
      } catch (error) {
        console.error('Error fetching app config:', error);
      }
    };

    fetchAppConfig();
  }, []);
  
  console.log('User Data in AppSidebar:', userData);
  const isAdmin = userData?.role === 'admin';
  console.log('Is Admin:', isAdmin);

  const adminMenuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employees', label: 'Karyawan', icon: Users },
    { path: '/products', label: 'Produk', icon: Package },
    // { path: '/bookings', label: 'Jadwal', icon: Calendar }, // Disembunyikan sesuai permintaan
    { path: '/attendance', label: 'Absensi', icon: Fingerprint },
    { path: '/therapy-sessions-management', label: 'Konfirmasi Terapi', icon: ClipboardCheck },
    { path: '/therapy-payments', label: 'Pembayaran Terapi', icon: Receipt },
    { path: '/therapist-salary', label: 'Gaji Terapis', icon: DollarSign },
    { path: '/therapy-reports', label: 'Laporan Terapi', icon: BarChart },
    { path: '/pos', label: 'Point of Sale', icon: ShoppingCart },
    { path: '/keuangan', label: 'Keuangan', icon: DollarSign },
    // { path: '/messages', label: 'Pesan', icon: MessageSquare }, // Disembunyikan sesuai permintaan
    // { path: '/notifications', label: 'Notifikasi', icon: Bell }, // Disembunyikan sesuai permintaan
    { path: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  const therapistMenuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    // { path: '/bookings', label: 'Jadwal', icon: Calendar }, // Disembunyikan sesuai permintaan
    { path: '/attendance', label: 'Absensi', icon: Fingerprint },
    { path: '/therapy-sessions', label: 'Catat Terapi', icon: ClipboardList },
    // { path: '/messages', label: 'Pesan', icon: MessageSquare }, // Disembunyikan sesuai permintaan
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
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={appTitle} 
              className="h-12 w-auto mb-2" 
            />
          ) : (
            <h1 className="text-2xl font-bold text-primary">{appTitle}</h1>
          )}
          <p className="text-xs text-muted-foreground">{appDescription}</p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
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
                <span>Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
