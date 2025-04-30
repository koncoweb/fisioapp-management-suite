
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VisitTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  maxAppointments: number;
}

const VisitTabs: React.FC<VisitTabsProps> = ({
  activeTab,
  setActiveTab,
  maxAppointments
}) => {
  const currentTabIndex = parseInt(activeTab);
  const canNavigatePrevious = currentTabIndex > 0;
  const canNavigateNext = currentTabIndex < maxAppointments - 1;

  return (
    <div className="flex items-center justify-between mb-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 p-0" 
        onClick={() => setActiveTab((parseInt(activeTab) - 1).toString())}
        disabled={!canNavigatePrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 mx-1">
        <TabsList className="grid grid-cols-4 h-7">
          {Array.from({ length: maxAppointments }).map((_, index) => (
            <TabsTrigger 
              key={index} 
              value={index.toString()} 
              className="text-[10px] px-0 py-1 h-full data-[state=active]:shadow-none"
            >
              Visit {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 p-0" 
        onClick={() => setActiveTab((parseInt(activeTab) + 1).toString())}
        disabled={!canNavigateNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VisitTabs;
