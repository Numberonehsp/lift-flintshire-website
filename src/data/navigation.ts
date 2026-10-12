export interface NavItem {
  label: string
  to: string
}

// Six links in the desktop pill; Home is the logo, Contact is the button.
export const primaryNav: NavItem[] = [
  { label: 'Run Club', to: '/run-club' },
  { label: 'Weightlifting', to: '/weightlifting-club' },
  { label: 'Wellbeing', to: '/wellbeing' },
  { label: 'Events', to: '/events' },
  { label: 'Impact', to: '/impact' },
  { label: 'About', to: '/about' },
]

export const contactNav: NavItem = { label: 'Contact', to: '/contact' }

// Phone menu: the first group is large, the second is a small row.
export const mobileLargeNav: NavItem[] = primaryNav.filter(i => i.to !== '/about')
export const mobileSmallNav: NavItem[] = [
  { label: 'About', to: '/about' },
  contactNav,
  { label: 'Safeguarding', to: '/safeguarding' },
]

export const footerNav: NavItem[] = [
  { label: 'Home', to: '/' },
  ...primaryNav,
  contactNav,
]
