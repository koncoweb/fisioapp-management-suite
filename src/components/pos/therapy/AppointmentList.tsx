
import React from 'react';
import { format } from 'date-fns';
import { AppointmentSlot } from '@/types/pos';

interface AppointmentListProps {
  appointments: AppointmentSlot[];
  selectedOption?: 'visit' | 'package';
  onEditAppointment?: (index: number) => void;
  onRemoveAppointment?: (index: number) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  selectedOption = 'visit',
  onEditAppointment,
  onRemoveAppointment
}) => {
  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1 mt-1">
      {appointments.map((appointment, index) => (
        <div key={index} className="flex items-center justify-between bg-secondary/10 rounded-md p-1.5 text-[9px]">
          <div>
            <span className="font-medium mr-1">
              {selectedOption === 'package' ? `Visit ${index + 1}:` : 'Appointment:'}
            </span>
            {format(appointment.date, "dd MMM yyyy")} at {appointment.time}
          </div>
          {(onEditAppointment || onRemoveAppointment) && (
            <div className="flex gap-1">
              {onEditAppointment && (
                <button 
                  onClick={() => onEditAppointment(index)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Edit
                </button>
              )}
              {onRemoveAppointment && (
                <button 
                  onClick={() => onRemoveAppointment(index)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;
