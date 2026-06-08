export interface SessionDetail {
  day: string
  time: string
  location: string
  cost: string
}

export interface Programme {
  id: 'stay-strong' | 'run-club' | 'weightlifting' | 'couch-to-5k' | 'womens-run-club' | 'girls-gym-session'
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
    id: 'couch-to-5k',
    title: 'Couch to 5K',
    tagline: 'From first steps to 5 kilometres in 8 weeks',
    badge: 'All Ages · Beginners Welcome',
    description:
      'Our free Couch to 5K programme takes complete beginners from no running experience to comfortably completing a 5K in just nine weeks. Guided by qualified running coaches, sessions are friendly, social, and never competitive.',
    targetAudience:
      'Designed for adults who have never run before, or who are returning to running after a long break. If you can walk for 30 minutes, you can start Couch to 5K. All ages welcome — no fitness test required.',
    whatToExpect:
      "Each session follows a structured run/walk interval plan that gradually increases over 8 weeks. You'll be supported by a coach throughout and run as part of a small group. Sessions include a warm-up walk, intervals, and a cool-down stretch.",
    sessions: [
      { day: 'Thursday', time: '18:00', location: 'Number One HSP, CH5 2TF, Flintshire', cost: 'Free' },
    ],
  },
  {
    id: 'womens-run-club',
    title: "Women's Track Running",
    tagline: 'A safe, social space to run every first Saturday of the month',
    badge: 'Women & Girls · All Abilities',
    description:
      "Our Women's Run Club meets on the first Saturday of every month for a social group run across Flintshire and North Wales. It's a welcoming, low-pressure environment led by a female coach — walkers are always included.",
    targetAudience:
      "Open to women and girls of all abilities. Whether you're a complete beginner or a regular runner, you'll find your pace here. No one gets left behind.",
    whatToExpect:
      "Sessions run for approximately one hour, starting with a group walk-up and ending with a cool-down and coffee together. Most sessions will be based at Deeside Athletics Track but we may venture a bit further out as the community grows.",
    sessions: [
      { day: 'First Saturday of each month', time: '10:00–11:00am', location: 'Deeside Athletics Track', cost: 'Free' },
    ],
  },
  {
    id: 'girls-gym-session',
    title: 'Girls Gym Session',
    tagline: 'A free, confidence-building gym session for young women',
    badge: 'High School Girls · Free',
    description:
      'Our Girls Gym Sessions give young women their first positive experience of the gym — a welcoming, coach-led session where no previous experience is needed. We focus on fun, confidence, and building a healthy relationship with movement.',
    targetAudience:
      'Open to girls in Years 7–13 (ages 11–18). Sessions are led by our qualified coaches and are designed specifically for young women. No gym experience required — this is exactly the kind of session you can bring a friend to.',
    whatToExpect:
      'A fun, structured gym session where our coaches explain how to use equipment safely and confidently. Groups are small, sessions are social, and the atmosphere is never competitive. We want every young woman who attends to leave feeling capable and welcomed.',
    sessions: [
      { day: 'By arrangement', time: 'TBC', location: 'Number One HSP, CH5 2TF', cost: 'Free' },
    ],
  },
  {
    id: 'stay-strong',
    title: 'Stay Strong',
    tagline: 'Building strength and confidence in the over-60s',
    badge: '60+ · Strength Training',
    description:
      'Stay Strong is our flagship programme for adults aged 55 and over. Using resistance training and functional movement, we help participants build the strength they need to stay active, independent, and confident in everyday life.',
    targetAudience:
      'Designed for adults aged 55 and over, including those recovering from falls, living with long-term conditions, or who have been inactive for a while. No experience required — our qualified coaches adapt every session to suit you.',
    whatToExpect:
      'Each 45-minute session combines seated and standing resistance exercises using bands and light weights, balance work, and time to connect with others in the group. Sessions are led by qualified strength coaches and are fully inclusive.',
    sessions: [
      { day: 'Wednesday', time: '11:00–11:45am', location: 'Number One HSP, CH5 2TF', cost: '4 weeks Free, then £15 per month' },
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
      { day: 'Tuesday', time: '18:00', location: 'Hawarden - Tinkersdale Car Park', cost: 'Free, then £30 annually' },
      { day: 'Thursday', time: '18:00', location: 'Number One HSP, CH5 2TF', cost: 'Free, then £30 annually' },
      { day: 'Sunday', time: '09:00', location: 'Number One HSP, CH5 2TF', cost: 'Free, then £30 annually' },
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
      { day: 'Monday', time: '19:30–20:30', location: 'Number One HSP, CH5 2TF', cost: '£9 per session, or £25 per month' },
      { day: 'Wednesday', time: '16:30–17:30', location: 'Number One HSP, CH5 2TF', cost: '£9 per session or £25 per month' },
      { day: 'Friday', time: '16:30–17:30', location: 'Number One HSP, CH5 2TF', cost: '£9 per session or £25 per month' },
    ],
  },
]
