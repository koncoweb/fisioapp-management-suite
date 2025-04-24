
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Activity {
  date: string;
  activity: string;
  type: string;
}

const activities: Activity[] = [
  { date: "Hari ini", activity: "Menyelesaikan sesi fisioterapi", type: "Terapi" },
  { date: "Kemarin", activity: "Memperbarui catatan medis", type: "Admin" },
  { date: "2 hari lalu", activity: "Menjadwalkan janji berikutnya", type: "Jadwal" },
];

const RecentActivities = () => {
  return (
    <Card className="mt-6 bg-white border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Aktivitas Terkini</CardTitle>
        <CardDescription>Aktivitas dan pembaruan medis terbaru Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-900">{item.activity}</span>
                <span className="text-xs text-blue-600">{item.date}</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
