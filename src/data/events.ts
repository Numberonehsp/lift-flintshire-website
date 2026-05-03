export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  price: number
  description: string
  programme?: 'stay-strong' | 'run-club' | 'weightlifting' | 'general'
  stripeLink?: string
}

export const events: Event[] = [
  {
    id: '1',
    title: 'Stay Strong Taster Session',
    date: '2026-06-07',
    time: '10:00am',
    location: 'Mold Leisure Centre',
    price: 0,
    description: 'Never tried Stay Strong before? Come along for a free taster session. No experience needed — just bring comfortable clothing and a willingness to give it a go.',
    programme: 'stay-strong',
  },
  {
    id: '2',
    title: 'Flintshire 5K Fun Run',
    date: '2026-06-14',
    time: '9:00am',
    location: 'Ewloe Country Park',
    price: 5,
    description: 'Join us for our monthly 5K fun run through Ewloe Country Park. All abilities welcome — walk, jog, or run. Finishers get a hot drink and a medal.',
    programme: 'run-club',
    stripeLink: 'https://buy.stripe.com/placeholder',
  },
  {
    id: '3',
    title: 'Introduction to Olympic Weightlifting',
    date: '2026-06-21',
    time: '11:00am',
    location: 'Deeside Leisure Centre',
    price: 10,
    description: 'A hands-on 90-minute workshop introducing the fundamentals of Olympic weightlifting. Suitable for complete beginners. All equipment provided.',
    programme: 'weightlifting',
    stripeLink: 'https://buy.stripe.com/placeholder',
  },
  {
    id: '4',
    title: 'Community Open Day',
    date: '2026-07-05',
    time: '10:00am–2:00pm',
    location: 'Mold Leisure Centre',
    price: 0,
    description: 'Come and meet the Lift Flintshire team, try a taster of each programme, and find out how to get involved. Fun for the whole family.',
    programme: 'general',
  },
]
