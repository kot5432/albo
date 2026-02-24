export type ChallengeStatus = 'not_started' | 'first_action' | 'in_progress' | 'completed' | 'failed'

export type ChallengeType = 'first' | 'retry' | 'stuck'

export interface Challenge {
  id: string
  title: string
  description: string
  deadline?: Date
  status: ChallengeStatus
  firstActionDeadline: Date
  createdAt: Date
  updatedAt: Date
  reason?: string
  isReasonShared: boolean
  actionLogs: ActionLog[]
  retryCount: number
  initialAction?: string
}

export interface ActionLog {
  id: string
  challengeId: string
  date: Date
  content: string
  type: 'first_action' | 'daily_action' | 'completion'
  imageUrl?: string
}

export interface SharedReason {
  id: string
  content: string
  createdAt: Date
  isAnonymous: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isPromotedToChallenge: boolean
}

export interface ChallengeStats {
  totalDeclared: number
  firstActionCompleted: number
  notStarted: number
  totalRetries: number
  currentStreak: number
}

export interface AIResponse {
  message: string
  type: ChallengeType
}