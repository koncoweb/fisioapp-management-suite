
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
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
  const [appTitle, setAppTitle] = useState('Fisioapp');
  
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setAppTitle(data.title || 'Fisioapp');
        }
      } catch (error) {
        console.error('Error fetching app config:', error);
      }
    };

    fetchAppConfig();
  }, []);

  // Determine the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/employees') return 'Manajemen Karyawan';
    if (path === '/services') return 'Layanan Terapi';
    if (path === '/bookings') return 'Jadwal Sesi';
    if (path === '/payments') return 'Catatan Pembayaran';
    if (path === '/profile') return 'Profil Saya';
    if (path === '/pos') return 'Point of Sale';
    if (path === '/settings') return 'Pengaturan';
    
    // Extract dynamic paths
    if (path.startsWith('/employees/')) return 'Detail Karyawan';
    if (path.startsWith('/services/')) return 'Detail Layanan';
    if (path.startsWith('/bookings/')) return 'Detail Jadwal';
    
    // Default title
    return appTitle;
  };

  return (
    <header className="supabase-header px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="page-title text-foreground">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {userData?.namaLengkap ? userData.namaLengkap.charAt(0).toUpperCase() : <User />}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col">
                <span>{userData?.namaLengkap}</span>
                <span className="text-xs text-muted-foreground">{userData?.role.toUpperCase()}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => window.location.href = '/profile'}
            >
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-destructive"
              onClick={() => signOut()}
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
