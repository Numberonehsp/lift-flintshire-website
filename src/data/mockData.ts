export interface SheetRow {
  date: string
  programme: string
  sessionType: string
  totalParticipants: number
  ageUnder18: number
  age18to30: number
  age30to60: number
  ageOver60: number
  genderMale: number
  genderFemale: number
  genderOther: number
}

export const mockRows: SheetRow[] = [
  // June 2025
  { date: '2025-06-03', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 12, ageUnder18: 0, age18to30: 0, age30to60: 3, ageOver60: 9, genderMale: 4, genderFemale: 7, genderOther: 1 },
  { date: '2025-06-05', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 10, ageUnder18: 0, age18to30: 0, age30to60: 2, ageOver60: 8, genderMale: 3, genderFemale: 7, genderOther: 0 },
  { date: '2025-06-04', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 18, ageUnder18: 1, age18to30: 4, age30to60: 10, ageOver60: 3, genderMale: 8, genderFemale: 9, genderOther: 1 },
  { date: '2025-06-07', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 14, ageUnder18: 1, age18to30: 3, age30to60: 8, ageOver60: 2, genderMale: 6, genderFemale: 7, genderOther: 1 },
  { date: '2025-06-02', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 8, ageUnder18: 0, age18to30: 3, age30to60: 4, ageOver60: 1, genderMale: 5, genderFemale: 3, genderOther: 0 },
  // July 2025
  { date: '2025-07-01', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 14, ageUnder18: 0, age18to30: 0, age30to60: 4, ageOver60: 10, genderMale: 5, genderFemale: 9, genderOther: 0 },
  { date: '2025-07-03', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 11, ageUnder18: 0, age18to30: 0, age30to60: 3, ageOver60: 8, genderMale: 4, genderFemale: 7, genderOther: 0 },
  { date: '2025-07-02', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 22, ageUnder18: 2, age18to30: 5, age30to60: 12, ageOver60: 3, genderMale: 10, genderFemale: 11, genderOther: 1 },
  { date: '2025-07-05', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 19, ageUnder18: 1, age18to30: 5, age30to60: 10, ageOver60: 3, genderMale: 9, genderFemale: 9, genderOther: 1 },
  { date: '2025-07-07', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 9, ageUnder18: 0, age18to30: 4, age30to60: 4, ageOver60: 1, genderMale: 6, genderFemale: 3, genderOther: 0 },
  // August 2025
  { date: '2025-08-05', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 9, ageUnder18: 0, age18to30: 0, age30to60: 2, ageOver60: 7, genderMale: 3, genderFemale: 6, genderOther: 0 },
  { date: '2025-08-07', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 16, ageUnder18: 1, age18to30: 4, age30to60: 9, ageOver60: 2, genderMale: 7, genderFemale: 8, genderOther: 1 },
  { date: '2025-08-04', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 7, ageUnder18: 0, age18to30: 3, age30to60: 3, ageOver60: 1, genderMale: 5, genderFemale: 2, genderOther: 0 },
  // September 2025
  { date: '2025-09-02', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 15, ageUnder18: 0, age18to30: 0, age30to60: 4, ageOver60: 11, genderMale: 5, genderFemale: 10, genderOther: 0 },
  { date: '2025-09-04', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 13, ageUnder18: 0, age18to30: 0, age30to60: 3, ageOver60: 10, genderMale: 4, genderFemale: 9, genderOther: 0 },
  { date: '2025-09-03', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 24, ageUnder18: 2, age18to30: 6, age30to60: 13, ageOver60: 3, genderMale: 11, genderFemale: 12, genderOther: 1 },
  { date: '2025-09-06', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 20, ageUnder18: 1, age18to30: 5, age30to60: 11, ageOver60: 3, genderMale: 9, genderFemale: 10, genderOther: 1 },
  { date: '2025-09-01', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 11, ageUnder18: 0, age18to30: 5, age30to60: 5, ageOver60: 1, genderMale: 7, genderFemale: 4, genderOther: 0 },
  // October 2025
  { date: '2025-10-07', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 16, ageUnder18: 0, age18to30: 0, age30to60: 4, ageOver60: 12, genderMale: 5, genderFemale: 11, genderOther: 0 },
  { date: '2025-10-02', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 21, ageUnder18: 2, age18to30: 5, age30to60: 11, ageOver60: 3, genderMale: 10, genderFemale: 10, genderOther: 1 },
  { date: '2025-10-06', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 10, ageUnder18: 0, age18to30: 4, age30to60: 5, ageOver60: 1, genderMale: 6, genderFemale: 3, genderOther: 1 },
  // November 2025
  { date: '2025-11-04', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 17, ageUnder18: 0, age18to30: 0, age30to60: 5, ageOver60: 12, genderMale: 6, genderFemale: 11, genderOther: 0 },
  { date: '2025-11-06', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 15, ageUnder18: 1, age18to30: 3, age30to60: 8, ageOver60: 3, genderMale: 7, genderFemale: 7, genderOther: 1 },
  { date: '2025-11-03', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 12, ageUnder18: 0, age18to30: 5, age30to60: 6, ageOver60: 1, genderMale: 7, genderFemale: 4, genderOther: 1 },
  // December 2025
  { date: '2025-12-02', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 11, ageUnder18: 0, age18to30: 0, age30to60: 3, ageOver60: 8, genderMale: 4, genderFemale: 7, genderOther: 0 },
  { date: '2025-12-04', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 12, ageUnder18: 1, age18to30: 2, age30to60: 7, ageOver60: 2, genderMale: 5, genderFemale: 6, genderOther: 1 },
  // January 2026
  { date: '2026-01-06', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 18, ageUnder18: 0, age18to30: 0, age30to60: 5, ageOver60: 13, genderMale: 6, genderFemale: 12, genderOther: 0 },
  { date: '2026-01-08', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 16, ageUnder18: 0, age18to30: 0, age30to60: 4, ageOver60: 12, genderMale: 5, genderFemale: 11, genderOther: 0 },
  { date: '2026-01-07', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 20, ageUnder18: 1, age18to30: 5, age30to60: 11, ageOver60: 3, genderMale: 9, genderFemale: 10, genderOther: 1 },
  { date: '2026-01-05', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 13, ageUnder18: 0, age18to30: 6, age30to60: 6, ageOver60: 1, genderMale: 8, genderFemale: 4, genderOther: 1 },
  // February 2026
  { date: '2026-02-03', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 19, ageUnder18: 0, age18to30: 0, age30to60: 5, ageOver60: 14, genderMale: 6, genderFemale: 13, genderOther: 0 },
  { date: '2026-02-05', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 23, ageUnder18: 1, age18to30: 6, age30to60: 13, ageOver60: 3, genderMale: 11, genderFemale: 11, genderOther: 1 },
  { date: '2026-02-02', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 14, ageUnder18: 0, age18to30: 6, age30to60: 7, ageOver60: 1, genderMale: 8, genderFemale: 5, genderOther: 1 },
  // March 2026
  { date: '2026-03-03', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 20, ageUnder18: 0, age18to30: 0, age30to60: 5, ageOver60: 15, genderMale: 7, genderFemale: 13, genderOther: 0 },
  { date: '2026-03-05', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 26, ageUnder18: 2, age18to30: 6, age30to60: 14, ageOver60: 4, genderMale: 12, genderFemale: 13, genderOther: 1 },
  { date: '2026-03-02', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 15, ageUnder18: 0, age18to30: 7, age30to60: 7, ageOver60: 1, genderMale: 9, genderFemale: 5, genderOther: 1 },
  // April 2026
  { date: '2026-04-07', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 21, ageUnder18: 0, age18to30: 0, age30to60: 5, ageOver60: 16, genderMale: 7, genderFemale: 14, genderOther: 0 },
  { date: '2026-04-02', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 28, ageUnder18: 2, age18to30: 7, age30to60: 15, ageOver60: 4, genderMale: 13, genderFemale: 14, genderOther: 1 },
  { date: '2026-04-06', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 16, ageUnder18: 0, age18to30: 7, age30to60: 8, ageOver60: 1, genderMale: 9, genderFemale: 6, genderOther: 1 },
  // May 2026
  { date: '2026-05-05', programme: 'Stay Strong', sessionType: 'Weekly Session', totalParticipants: 22, ageUnder18: 0, age18to30: 0, age30to60: 6, ageOver60: 16, genderMale: 7, genderFemale: 15, genderOther: 0 },
  { date: '2026-05-07', programme: 'Flintshire Run Club', sessionType: 'Group Run', totalParticipants: 30, ageUnder18: 2, age18to30: 8, age30to60: 16, ageOver60: 4, genderMale: 14, genderFemale: 15, genderOther: 1 },
  { date: '2026-05-04', programme: 'Flintshire Weightlifting Club', sessionType: 'Training Session', totalParticipants: 17, ageUnder18: 0, age18to30: 8, age30to60: 8, ageOver60: 1, genderMale: 10, genderFemale: 6, genderOther: 1 },
]
