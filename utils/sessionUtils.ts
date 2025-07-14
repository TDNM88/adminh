import { TradingSession, SessionStatusType } from "@/types"

/**
 * Generate a formatted session ID based on current timestamp
 * @returns Formatted session ID string
 */
export function generateFormattedSessionId(): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '')
  return `S${timestamp}`
}

/**
 * Parse a timestamp string into a Date object
 * @param timestamp - Timestamp string in format YYYYMMDDHHmm
 * @returns Date object
 */
export function parseTimestamp(timestamp: string): Date {
  // Format: YYYYMMDDHHmm (e.g., 202706041201 for June 4, 2027, 12:01)
  const year = parseInt(timestamp.slice(0, 4))
  const month = parseInt(timestamp.slice(4, 6)) - 1 // Months are 0-indexed
  const day = parseInt(timestamp.slice(6, 8))
  const hours = parseInt(timestamp.slice(8, 10))
  const minutes = parseInt(timestamp.slice(10, 12))
  
  return new Date(year, month, day, hours, minutes)
}

/**
 * Get the current active trading session
 * @param sessions - Array of trading sessions
 * @returns Current active session or undefined if none is active
 */
export function getCurrentSession(sessions: TradingSession[]): TradingSession | undefined {
  if (!sessions || sessions.length === 0) return undefined
  
  const now = new Date()
  
  return sessions.find(session => {
    const startTime = new Date(session.startTime)
    const endTime = new Date(session.endTime)
    return now >= startTime && now <= endTime
  })
}

/**
 * Generate mock trading sessions for testing
 * @param count - Number of sessions to generate
 * @returns Array of trading sessions
 */
export function generateSessions(count: number = 10): TradingSession[] {
  const sessions: TradingSession[] = []
  const now = new Date()
  
  // Create one active session
  const activeStartTime = new Date(now)
  activeStartTime.setMinutes(activeStartTime.getMinutes() - 1)
  
  const activeEndTime = new Date(now)
  activeEndTime.setMinutes(activeEndTime.getMinutes() + 2)
  
  sessions.push({
    id: generateFormattedSessionId(),
    startTime: activeStartTime,
    endTime: activeEndTime,
    status: 'active',
    result: '',
    session: `S${activeStartTime.toISOString().replace(/[-:.TZ]/g, '').substring(0, 12)}`,
    progress: calculateSessionProgress(activeStartTime, activeEndTime)
  })
  
  // Create past sessions
  for (let i = 1; i < count; i++) {
    const startTime = new Date(now)
    startTime.setMinutes(startTime.getMinutes() - (i * 5) - 5)
    
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + 3)
    
    const result = Math.random() > 0.5 ? "up" : "down"
    
    sessions.push({
      id: generateFormattedSessionId(),
      startTime,
      endTime,
      status: 'completed',
      result,
      session: `S${startTime.toISOString().replace(/[-:.TZ]/g, '').substring(0, 12)}`,
      isWin: Math.random() > 0.3
    })
  }
  
  // Create future sessions
  for (let i = 0; i < 3; i++) {
    const startTime = new Date(now)
    startTime.setMinutes(startTime.getMinutes() + (i * 5) + 5)
    
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + 3)
    
    sessions.push({
      id: generateFormattedSessionId(),
      startTime,
      endTime,
      status: 'upcoming',
      result: '',
      session: `S${startTime.toISOString().replace(/[-:.TZ]/g, '').substring(0, 12)}`
    })
  }
  
  return sessions
}

/**
 * Get the status of a session based on its start and end times
 * @param startTime - Session start time
 * @param endTime - Session end time
 * @returns Session status
 */
export function getSessionStatus(
  startTime: string | Date, 
  endTime: string | Date
): SessionStatusType {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const now = new Date()
  
  if (now < start) {
    return 'upcoming'
  } else if (now >= start && now <= end) {
    return 'active'
  } else {
    return 'completed'
  }
}

/**
 * Calculate the progress percentage of a session
 * @param startTime - Session start time
 * @param endTime - Session end time
 * @returns Progress percentage (0-100)
 */
export function calculateSessionProgress(
  startTime: string | Date, 
  endTime: string | Date
): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const now = new Date().getTime()
  
  if (now <= start) return 0
  if (now >= end) return 100
  
  const totalDuration = end - start
  const elapsed = now - start
  
  return Math.min(100, Math.max(0, Math.floor((elapsed / totalDuration) * 100)))
}
