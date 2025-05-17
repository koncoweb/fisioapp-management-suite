import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AppConfigLoader = () => {
  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          
          // Update document title
          if (data.title) {
            document.title = data.title;
          }
          
          // Update favicon
          if (data.faviconUrl) {
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = data.faviconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
          }
        }
      } catch (error) {
        console.error('Error loading app configuration:', error);
      }
    };

    loadAppConfig();
  }, []);

  return null; // This component doesn't render anything
};

export default AppConfigLoader;
