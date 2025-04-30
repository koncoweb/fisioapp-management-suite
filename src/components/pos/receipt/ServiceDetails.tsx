
import React from 'react';
import { CartItem } from '@/types/pos';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

interface ServiceDetailsProps {
  items: CartItem[];
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ items }) => {
  return (
    <div>
      <h3 className="font-medium mb-1 text-xs">Detail Layanan:</h3>
      <ul className="space-y-1 text-[10px]">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col">
            <div className="flex justify-between">
              <div>
                <span>{item.name}</span>
                <span className="text-[9px] text-muted-foreground"> x{item.quantity}</span>
              </div>
              <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
            
            {/* Display appointment details for packages with multiple appointments */}
            {item.appointments && item.appointments.length > 0 && item.type === 'service' && (
              <div className="ml-2 mt-0.5 space-y-1">
                {item.isPackage ? (
                  // For package with multiple appointments
                  item.appointments.map((appointment, idx) => (
                    <div key={idx} className="flex items-center text-[9px] text-muted-foreground">
                      <span className="mr-1 font-semibold">Visit {idx + 1}:</span>
                      <Calendar className="h-2.5 w-2.5 mr-0.5" />
                      <span className="mr-1">{format(appointment.date, "dd MMM yyyy")}</span>
                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                      <span>{appointment.time}</span>
                    </div>
                  ))
                ) : (
                  // For single appointment (backward compatibility)
                  <div className="flex items-center text-[9px] text-muted-foreground">
                    <Calendar className="h-2.5 w-2.5 mr-0.5" />
                    <span className="mr-1">
                      {format(item.appointments[0].date, "dd MMM yyyy")}
                    </span>
                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                    <span>{item.appointments[0].time}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Legacy support for old appointmentDate format */}
            {!item.appointments && item.appointmentDate && item.appointmentTime && item.type === 'service' && (
              <div className="flex items-center text-[9px] text-muted-foreground mt-0.5 ml-2">
                <Calendar className="h-2.5 w-2.5 mr-0.5" />
                <span className="mr-1">{format(item.appointmentDate, "dd MMM yyyy")}</span>
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                <span>{item.appointmentTime}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceDetails;
