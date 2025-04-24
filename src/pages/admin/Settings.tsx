
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirebaseConfig from '@/components/settings/FirebaseConfig';

const Settings = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="firebase" className="w-full">
        <TabsList>
          <TabsTrigger value="firebase">Firebase Configuration</TabsTrigger>
        </TabsList>
        
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
