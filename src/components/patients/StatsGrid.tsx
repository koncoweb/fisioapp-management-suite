
import React, { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import { Users, Calendar, Heart, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const StatsGrid = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activeTherapists: 0,
    progressPercentage: 0,
    healthScore: 0
  });
  const [nextAppointment, setNextAppointment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!userData?.uid) return;

        // Get upcoming appointments
        const today = new Date().toISOString().split('T')[0];
        const appointmentsQuery = query(
          collection(db, 'therapySessions'),
          where('patientId', '==', userData.uid),
          where('date', '>=', today),
          where('status', '==', 'scheduled'),
          orderBy('date'),
          limit(10)
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
        
        // Get next appointment date and time
        let nextAppointmentText = "Tidak ada jadwal";
        if (appointments.length > 0) {
          const nextAppt = appointments[0];
          const date = new Date(nextAppt.date);
          const formattedDate = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
          nextAppointmentText = `${formattedDate} jam ${nextAppt.time}`;
        }
        
        // Get therapists assigned to patient
        const therapistsQuery = query(
          collection(db, 'therapySessions'),
          where('patientId', '==', userData.uid),
          where('status', '!=', 'cancelled')
        );
        
        const therapistsSnapshot = await getDocs(therapistsQuery);
        const therapistIds = new Set();
        therapistsSnapshot.forEach(doc => {
          const data = doc.data();
          therapistIds.add(data.therapistId);
        });
        
        // Calculate treatment progress - based on completed vs total sessions
        const completedSessionsQuery = query(
          collection(db, 'therapySessions'),
          where('patientId', '==', userData.uid),
          where('status', '==', 'completed')
        );
        
        const totalSessionsQuery = query(
          collection(db, 'therapySessions'),
          where('patientId', '==', userData.uid),
          where('status', '!=', 'cancelled')
        );
        
        const [completedSnapshot, totalSnapshot] = await Promise.all([
          getDocs(completedSessionsQuery),
          getDocs(totalSessionsQuery)
        ]);
        
        const completedSessions = completedSnapshot.size;
        const totalSessions = totalSnapshot.size;
        
        // Calculate progress percentage
        const progressPercentage = totalSessions > 0 
          ? Math.round((completedSessions / totalSessions) * 100) 
          : 0;
        
        // Calculate health score (simplified version)
        // In a real app, this would be based on multiple factors
        const healthScore = 5 + (progressPercentage / 20); // Score between 5-10
        
        setStats({
          upcomingAppointments: appointments.length,
          activeTherapists: therapistIds.size,
          progressPercentage,
          healthScore: parseFloat(healthScore.toFixed(1))
        });
        
        setNextAppointment(nextAppointmentText);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-blue-50/20 dark:bg-gray-800 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Jadwal Pemeriksaan"
        value={stats.upcomingAppointments}
        description={`Berikutnya: ${nextAppointment}`}
        icon={Calendar}
      />
      <StatsCard
        title="Terapis Aktif"
        value={stats.activeTherapists}
        description="Ditugaskan untuk perawatan Anda"
        icon={Users}
      />
      <StatsCard
        title="Progres Pengobatan"
        value={`${stats.progressPercentage}%`}
        description="Penyelesaian keseluruhan"
        icon={Activity}
      />
      <StatsCard
        title="Skor Kesehatan"
        value={stats.healthScore}
        description="dari 10"
        icon={Heart}
      />
    </div>
  );
};

export default StatsGrid;
