/** guest_rsvps.status values enforced by Postgres CHECK constraint */
export const GUEST_RSVP_STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  declined: 'declined',
} as const

export type GuestRsvpStatus = (typeof GUEST_RSVP_STATUS)[keyof typeof GUEST_RSVP_STATUS]

/** Statuses that count as a confirmed guest seat */
export const GUEST_RSVP_CONFIRMED_STATUSES = [
  GUEST_RSVP_STATUS.accepted,
  // legacy rows written before status alignment fix
  'approved',
] as const
