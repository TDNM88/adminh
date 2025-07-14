// Simple date utilities without relying on date-fns

/**
 * Format a date to a string with the specified format
 * @param date The date to format
 * @returns Formatted date string in dd/MM/yyyy HH:mm format
 */
export function formatDateTime(date: Date | string | number): string {
  if (!date) return '--';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    // Format as dd/MM/yyyy HH:mm
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * Format a date to a string with the date only (no time)
 * @param date The date to format
 * @returns Formatted date string in dd/MM/yyyy format
 */
export function formatDateOnly(date: Date | string | number): string {
  if (!date) return '--';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    // Format as dd/MM/yyyy
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}
