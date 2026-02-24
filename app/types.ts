export type ChallengeStatus = "not_started" | "first_action" | "in_progress" | "completed" | "failed"

export interface Challenge {
  id: string
  title: string
  description: string
  deadline: Date
  status: ChallengeStatus
  initialAction: string
  createdAt: Date
  updatedAt: Date
  firstActionDeadline: Date
  actionLogs: ActionLog[]
  isReasonShared: boolean
  retryCount: number
  reason?: string
}

export interface ActionLog {
  id: string
  date: Date
  description: string
  completed: boolean
}
