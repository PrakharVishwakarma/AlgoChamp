/**
 * Format a duration in minutes to a human-readable string
 * @param minutes - The duration in minutes
 * @returns Formatted duration string (e.g., "2 hours 30 minutes", "3 days 2 hours")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0 minutes";

  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = Math.floor(minutes % 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins} ${mins === 1 ? "minute" : "minutes"}`);
  }

  // Return up to 2 most significant parts
  return parts.slice(0, 2).join(" ");
}

/**
 * Calculate duration between two dates in minutes
 * @param startTime - Start date
 * @param endTime - End date
 * @returns Duration in minutes
 */
export function calculateDurationMinutes(
  startTime: Date,
  endTime: Date
): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Format duration between two dates
 * @param startTime - Start date
 * @param endTime - End date
 * @returns Formatted duration string
 */
export function formatContestDuration(
  startTime: Date,
  endTime: Date
): string {
  const minutes = calculateDurationMinutes(startTime, endTime);
  return formatDuration(minutes);
}

/**
 * Get time remaining until a date
 * @param targetDate - The target date
 * @returns Object with days, hours, minutes, seconds
 */
export function getTimeRemaining(targetDate: Date): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const total = targetDate.getTime() - Date.now();

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
}

/**
 * Format time remaining in a compact format
 * @param targetDate - The target date
 * @returns Formatted string (e.g., "2d 3h 45m")
 */
export function formatTimeRemaining(targetDate: Date): string {
  const { days, hours, minutes } = getTimeRemaining(targetDate);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "Starting soon";
  }
}
