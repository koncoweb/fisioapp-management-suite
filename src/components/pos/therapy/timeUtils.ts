
// Generate time slots from 8:00 to 18:00 with 30-minute intervals
export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      // Skip 18:30 as the last appointment should be at 18:00
      if (hour === 18 && minute === 30) continue;
      
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }
  return slots;
};

// Disable past dates and today if it's after 5 PM
export const disabledDates = (currentDate: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If it's after 5 PM, disable today as well
  if (new Date().getHours() >= 17) {
    today.setDate(today.getDate() + 1);
  }
  
  return currentDate < today;
};
