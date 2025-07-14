export interface Session {
  id: string;
  startTime: Date;
  endTime: Date;
  label: string;
}

export function generateSessions(startTime: Date, count: number): Session[] {
  const sessions: Session[] = [];
  let currentTime = new Date(startTime);
  
  // Set seconds to 0 and milliseconds to 0 for clean minute start
  currentTime.setSeconds(0, 0);

  for (let i = 0; i < count; i++) {
    const sessionStart = new Date(currentTime);
    const sessionEnd = new Date(currentTime);
    
    // Set end time to :59.999 of the same minute (60 seconds total duration)
    sessionEnd.setSeconds(59, 999);
    
    // Format: YYMMDDhhmm
    const formatDate = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      return `${year}${month}${day}${hours}${minutes}`;
    };

    sessions.push({
      id: formatDate(sessionStart),
      startTime: new Date(sessionStart),
      endTime: new Date(sessionEnd),
      label: sessionStart.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    });
    
    // Move to the start of the next minute
    currentTime.setMinutes(currentTime.getMinutes() + 1);
    currentTime.setSeconds(0, 0);
  }
  
  return sessions;
}

export function getCurrentSession(): Session {
  const now = new Date();
  const sessionStart = new Date(now);
  const sessionEnd = new Date(now);
  
  // Set to start of current minute:00.000
  sessionStart.setSeconds(0, 0);
  
  // Set to end of current minute:59.999 (60 seconds total duration)
  sessionEnd.setSeconds(59, 999);
  
  // Format: YYMMDDhhmm for current session
  const formatDate = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}${month}${day}${hours}${minutes}`;
  };

  return {
    id: formatDate(sessionStart),
    startTime: sessionStart,
    endTime: sessionEnd,
    label: sessionStart.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  };
}

export function getNextSessions(count: number): Session[] {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1); // Start from next minute
  now.setSeconds(1, 0);
  return generateSessions(now, count);
}

export function isSessionActive(session: Session): boolean {
  const now = new Date();
  return now >= session.startTime && now <= session.endTime;
}
