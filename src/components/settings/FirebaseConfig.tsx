
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Settings } from 'lucide-react';

interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const FirebaseConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<FirebaseConfigType>({
    apiKey: "AIzaSyCarY_vnsN-_IDOftyWhJgfZv9ITNPXTHI",
    authDomain: "tutorialappklinik.firebaseapp.com",
    projectId: "tutorialappklinik",
    storageBucket: "tutorialappklinik.appspot.com",
    messagingSenderId: "348839854014",
    appId: "1:348839854014:web:39dfc2935a7d7655d783ef",
    measurementId: "G-R67R3Y42M4"
  });

  const handleInputChange = (key: keyof FirebaseConfigType, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Since this is a public config, we can store it in localStorage for persistence
    localStorage.setItem('firebaseConfig', JSON.stringify(config));
    
    toast({
      title: "Configuration Saved",
      description: "Firebase configuration has been updated. Please refresh the page for changes to take effect.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Settings className="h-5 w-5" />
        <p>Update your Firebase configuration. These are public keys that are safe to store in the client.</p>
      </div>
      
      <div className="grid gap-4">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="grid gap-2">
            <Label htmlFor={key}>{key}</Label>
            <Input
              id={key}
              value={value}
              onChange={(e) => handleInputChange(key as keyof FirebaseConfigType, e.target.value)}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSave}>Save Configuration</Button>
    </div>
  );
};

export default FirebaseConfig;
