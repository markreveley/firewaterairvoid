/**
 * Generate time options in 15-minute intervals (00:00 to 23:45)
 * Returns an array of 96 time strings in HH:mm format
 */
export const generateTimeOptions = (): string[] => {
  return Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });
};
