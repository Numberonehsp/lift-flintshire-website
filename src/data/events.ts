export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  price: number
  description: string
  programme?: 'stay-strong' | 'run-club' | 'weightlifting' | 'couch-to-5k' | 'womens-run-club' | 'general'
  bookingLink?: string
}

// Static fallback events — shown only when Google Sheets is not connected.
// To manage events live, populate the 'Events' tab in the Google Sheet.
// Columns: id | title | date (YYYY-MM-DD) | time | location | price | description | programme | bookingLink
export const events: Event[] = []
