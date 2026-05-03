export interface SessionDetail {
  day: string
  time: string
  location: string
  cost: string
}

export interface Programme {
  id: 'stay-strong' | 'run-club' | 'weightlifting'
  title: string
  tagline: string
  badge: string
  description: string
  targetAudience: string
  whatToExpect: string
  sessions: SessionDetail[]
}

export const programmes: Programme[] = [
  {
    id: 'stay-strong',
    title: 'Stay Strong',
    tagline: 'Building strength and confidence in the over-60s',
    badge: '60+ · Strength Training',
    description:
      'Stay Strong is our flagship programme for adults aged 60 and over. Using gentle resistance training and functional movement, we help participants build the strength they need to stay active, independent, and confident in everyday life.',
    targetAudience:
      'Designed for adults aged 60 and over, including those recovering from falls, living with long-term conditions, or who have been inactive for a while. No experience required — our qualified coaches adapt every session to suit you.',
    whatToExpect:
      'Each 60-minute session combines seated and standing resistance exercises using bands and light weights, balance work, and time to connect with others in the group. Sessions are led by qualified strength coaches and are fully inclusive.',
    sessions: [
      { day: 'Tuesday', time: '10:00–11:00am', location: 'Mold Leisure Centre', cost: 'Free' },
      { day: 'Thursday', time: '10:00–11:00am', location: 'Flint Leisure Centre', cost: 'Free' },
    ],
  },
  {
    id: 'run-club',
    title: 'Flintshire Run Club',
    tagline: 'Running for every pace, every person',
    badge: 'All Abilities · Running',
    description:
      "Flintshire Run Club is a welcoming, inclusive running group open to everyone — whether you've never run before or you're training for your next race. We focus on enjoyment, community, and getting outside together.",
    targetAudience:
      "Open to all abilities from complete beginners to experienced runners. We run as a group and no one gets left behind. Walkers are always welcome too.",
    whatToExpect:
      "We meet twice a week for guided group runs across Flintshire's beautiful countryside and parks. Sessions include a warm-up, the run itself, and a cool-down. We always finish together and often for a well-earned coffee.",
    sessions: [
      { day: 'Wednesday', time: '6:30–7:30pm', location: 'Ewloe Country Park', cost: 'Free' },
      { day: 'Saturday', time: '9:00–10:00am', location: 'Mold Town Centre', cost: 'Free' },
    ],
  },
  {
    id: 'weightlifting',
    title: 'Flintshire Weightlifting Club',
    tagline: 'Learn the snatch, clean & jerk, and build real strength',
    badge: 'All Levels · Olympic Lifting',
    description:
      "Flintshire Weightlifting Club teaches the Olympic lifts — the snatch and the clean & jerk — in a supportive, technical environment. Whether you're curious about the sport or a seasoned lifter, you'll be challenged and supported at every level.",
    targetAudience:
      'Open to adults of all experience levels. Complete beginners will start with foundational movement work before progressing to the barbell. Experienced lifters can train competitively under our qualified British Weightlifting coaches.',
    whatToExpect:
      'Sessions include technical coaching on the Olympic lifts, strength accessory work, and programming support for those looking to compete. All equipment is provided. Affiliated with British Weightlifting.',
    sessions: [
      { day: 'Monday', time: '7:00–8:30pm', location: 'Deeside Leisure Centre', cost: '£5 per session' },
      { day: 'Saturday', time: '10:00–11:30am', location: 'Deeside Leisure Centre', cost: '£5 per session' },
    ],
  },
]
