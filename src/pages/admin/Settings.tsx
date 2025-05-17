
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirebaseConfig from '@/components/settings/FirebaseConfig';
import AppConfig from '@/components/settings/AppConfig';
import CloudinaryInfo from '@/components/settings/CloudinaryInfo';

const Settings = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>
      
      <Tabs defaultValue="app" className="w-full">
        <TabsList>
          <TabsTrigger value="app">Pengaturan Aplikasi</TabsTrigger>
          <TabsTrigger value="firebase">Firebase Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Aplikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <CloudinaryInfo />
              <AppConfig />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="firebase">
          <Card>
            <CardHeader>
              <CardTitle>Firebase Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <FirebaseConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
