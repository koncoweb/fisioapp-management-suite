
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
      <h3 className="font-bold mb-1 text-xs print:text-sm">DETAIL LAYANAN</h3>
      <ul className="space-y-1 text-[10px] print:text-xs">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col border-b pb-1 last:border-b-0">
            <div className="flex justify-between">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-[10px] text-muted-foreground ml-1">x{item.quantity}</span>
              </div>
              <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
            
            {/* Display appointment details for packages with multiple appointments */}
            {item.appointments && item.appointments.length > 0 && item.type === 'service' && (
              <div className="ml-1 mt-0.5 space-y-0.5">
                {item.isPackage ? (
                  // For package with multiple appointments
                  item.appointments.map((appointment, idx) => (
                    <div key={idx} className="flex items-center text-[9px] print:text-[10px] text-muted-foreground">
                      <span className="mr-0.5 font-medium">Visit {idx + 1}:</span>
                      <span className="mr-0.5">{format(appointment.date, "dd/MM/yy")}</span>
                      <span>{appointment.time}</span>
                    </div>
                  ))
                ) : (
                  // For single appointment (backward compatibility)
                  <div className="flex items-center text-[9px] print:text-[10px] text-muted-foreground">
                    <span className="mr-0.5">
                      {format(item.appointments[0].date, "dd/MM/yy")}
                    </span>
                    <span>{item.appointments[0].time}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Legacy support for old appointmentDate format */}
            {!item.appointments && item.appointmentDate && item.appointmentTime && item.type === 'service' && (
              <div className="flex items-center text-[9px] print:text-[10px] text-muted-foreground mt-0.5 ml-1">
                <span className="mr-0.5">{format(item.appointmentDate, "dd/MM/yy")}</span>
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
