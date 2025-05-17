import React, { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Komponen untuk mengelola title tag dan favicon secara dinamis
 * Komponen ini tidak merender apapun di UI, hanya mengubah elemen head dokumen
 */
const AppHead: React.FC = () => {
  useEffect(() => {
    // Subscribe ke perubahan konfigurasi aplikasi
    const unsubscribe = onSnapshot(doc(db, 'appConfig', 'general'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        
        // Update title tag
        if (data.title) {
          document.title = data.title;
        }
        
        // Update favicon
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          
          // Jika tidak ada link favicon, buat elemen baru
          if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          
          // Update href
          link.href = data.faviconUrl;
        }
        
        // Update meta tags
        if (data.description) {
          // Update meta description
          let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
          if (metaDesc) {
            metaDesc.content = data.description;
          }
          
          // Update OG description
          let ogDesc = document.querySelector("meta[property='og:description']") as HTMLMetaElement;
          if (ogDesc) {
            ogDesc.content = data.description;
          }
        }
        
        // Update OG title
        if (data.title) {
          let ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
          if (ogTitle) {
            ogTitle.content = data.title;
          }
        }
        
        // Update OG image if logo is set
        if (data.logoUrl) {
          let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
          if (ogImage) {
            ogImage.content = data.logoUrl;
          }
          
          let twitterImage = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
          if (twitterImage) {
            twitterImage.content = data.logoUrl;
          }
        }
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  // Komponen ini tidak merender apapun
  return null;
};

export default AppHead;
