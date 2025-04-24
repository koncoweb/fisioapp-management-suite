
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Calendar, Heart, Activity } from 'lucide-react';

const PatientDashboard = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">Patient Dashboard</h1>
        <p className="text-blue-600/80">Welcome to your medical care center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-800">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">3</div>
            <p className="text-xs text-blue-600">Next: Tomorrow at 10:00 AM</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-800">Active Therapists</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">2</div>
            <p className="text-xs text-blue-600">Assigned to your care</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-800">Treatment Progress</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">75%</div>
            <p className="text-xs text-blue-600">Overall completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-800">Wellness Score</CardTitle>
            <Heart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">8.5</div>
            <p className="text-xs text-blue-600">out of 10</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6 bg-white border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Recent Activities</CardTitle>
          <CardDescription>Your latest medical activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Today", activity: "Completed physiotherapy session", type: "Therapy" },
              { date: "Yesterday", activity: "Updated medical records", type: "Admin" },
              { date: "2 days ago", activity: "Scheduled next appointment", type: "Appointment" },
            ].map((item, index) => (
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
    </div>
  );
};

export default PatientDashboard;
