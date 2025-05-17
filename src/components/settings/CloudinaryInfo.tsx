import React from 'react';
import { AlertCircle, CloudLightning } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const CloudinaryInfo = () => {
  return (
    <Alert className="mb-6">
      <CloudLightning className="h-4 w-4" />
      <AlertTitle>Penyimpanan File dengan Cloudinary</AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          Logo dan favicon aplikasi disimpan menggunakan layanan Cloudinary untuk performa dan keamanan yang lebih baik.
          File yang diunggah akan disimpan di folder <code>fisioapp/app_config</code> di akun Cloudinary.
        </p>
        <div className="mt-2 text-sm text-muted-foreground">
          <p>Keuntungan menggunakan Cloudinary:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Optimasi gambar otomatis untuk performa yang lebih baik</li>
            <li>Transformasi gambar sesuai kebutuhan (resize, crop, dll)</li>
            <li>Pengiriman melalui CDN untuk akses yang lebih cepat</li>
            <li>Backup dan keamanan data yang lebih baik</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CloudinaryInfo;
