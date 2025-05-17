import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Loader2, Upload, Check, X, Image } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

const AppConfig = () => {
  const { toast } = useToast();
  const [appTitle, setAppTitle] = useState('Fisioapp');
  const [appDescription, setAppDescription] = useState('Klinik Fisioterapi');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{logo: number, favicon: number}>({ logo: 0, favicon: 0 });
  const [uploadStatus, setUploadStatus] = useState<{logo: 'idle' | 'uploading' | 'success' | 'error', favicon: 'idle' | 'uploading' | 'success' | 'error'}>({ 
    logo: 'idle', 
    favicon: 'idle' 
  });

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setAppTitle(data.title || 'Fisioapp');
          setAppDescription(data.description || 'Klinik Fisioterapi');
          setLogoUrl(data.logoUrl || '');
          setFaviconUrl(data.faviconUrl || '');
          
          // Update document title
          document.title = data.title || 'Fisioapp';
        }
      } catch (error) {
        console.error('Error fetching app config:', error);
      }
    };

    fetchAppConfig();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaviconFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFavicon(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, type: 'logo' | 'favicon') => {
    try {
      // Set status uploading
      setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      
      // Simulasi progress upload (karena Cloudinary API tidak memberikan progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[type];
          if (currentProgress < 90) {
            return { ...prev, [type]: currentProgress + 10 };
          }
          return prev;
        });
      }, 300);
      
      // Upload ke Cloudinary dengan folder yang sesuai
      const folder = `fisioapp/app_config/${type}`;
      const result = await uploadToCloudinary(file, folder);
      
      // Upload selesai
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [type]: 100 }));
      setUploadStatus(prev => ({ ...prev, [type]: 'success' }));
      
      return result.secure_url;
    } catch (error) {
      console.error(`Error uploading ${type} to Cloudinary:`, error);
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let newLogoUrl = logoUrl;
      let newFaviconUrl = faviconUrl;

      // Upload new logo if selected
      if (logoFile) {
        newLogoUrl = await uploadImage(logoFile, 'logo');
      }

      // Upload new favicon if selected
      if (faviconFile) {
        newFaviconUrl = await uploadImage(faviconFile, 'favicon');
      }

      // Save to Firestore
      await setDoc(doc(db, 'appConfig', 'general'), {
        title: appTitle,
        description: appDescription,
        logoUrl: newLogoUrl,
        faviconUrl: newFaviconUrl,
        updatedAt: new Date()
      });

      // Update document title
      document.title = appTitle;

      // Update favicon if changed
      if (faviconFile) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.setAttribute('rel', 'shortcut icon');
        link.setAttribute('href', newFaviconUrl);
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      toast({
        title: "Pengaturan Berhasil Disimpan",
        description: "Pengaturan aplikasi telah berhasil diperbarui",
      });

      // Reset file inputs
      setLogoFile(null);
      setFaviconFile(null);
    } catch (error) {
      console.error('Error saving app config:', error);
      toast({
        title: "Gagal Menyimpan Pengaturan",
        description: "Terjadi kesalahan saat menyimpan pengaturan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="appTitle">Judul Aplikasi</Label>
          <Input
            id="appTitle"
            value={appTitle}
            onChange={(e) => setAppTitle(e.target.value)}
            placeholder="Masukkan judul aplikasi"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Judul ini akan ditampilkan di tab browser dan header aplikasi
          </p>
        </div>

        <div>
          <Label htmlFor="appDescription">Deskripsi Aplikasi</Label>
          <Input
            id="appDescription"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            placeholder="Masukkan deskripsi singkat aplikasi"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Deskripsi ini akan ditampilkan di bawah judul aplikasi di sidebar
          </p>
        </div>

        <div>
          <Label htmlFor="logo">Logo Aplikasi</Label>
          <div className="flex items-center gap-4 mt-2">
            {(previewLogo || logoUrl) ? (
              <div className="w-16 h-16 rounded overflow-hidden border border-border bg-muted flex items-center justify-center relative">
                <img 
                  src={previewLogo || logoUrl} 
                  alt="Logo Preview" 
                  className="w-full h-full object-contain"
                />
                {uploadStatus.logo === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                {uploadStatus.logo === 'success' && (
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 rounded border border-border bg-muted flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="max-w-sm"
                disabled={isLoading || uploadStatus.logo === 'uploading'}
              />
              {uploadStatus.logo === 'uploading' && (
                <Progress value={uploadProgress.logo} className="h-2 w-full max-w-sm" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Logo akan ditampilkan di sidebar dan header aplikasi
          </p>
        </div>

        <div>
          <Label htmlFor="favicon">Favicon</Label>
          <div className="flex items-center gap-4 mt-2">
            {(previewFavicon || faviconUrl) ? (
              <div className="w-10 h-10 rounded overflow-hidden border border-border bg-muted flex items-center justify-center relative">
                <img 
                  src={previewFavicon || faviconUrl} 
                  alt="Favicon Preview" 
                  className="w-full h-full object-contain"
                />
                {uploadStatus.favicon === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                )}
                {uploadStatus.favicon === 'success' && (
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                    <Check className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded border border-border bg-muted flex items-center justify-center">
                <Image className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Input
                id="favicon"
                type="file"
                accept="image/x-icon,image/png,image/jpeg"
                onChange={handleFaviconChange}
                className="max-w-sm"
                disabled={isLoading || uploadStatus.favicon === 'uploading'}
              />
              {uploadStatus.favicon === 'uploading' && (
                <Progress value={uploadProgress.favicon} className="h-2 w-full max-w-sm" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Favicon akan ditampilkan di tab browser
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          'Simpan Pengaturan'
        )}
      </Button>
    </form>
  );
};

export default AppConfig;
