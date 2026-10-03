// The site tour, in exactly 5 stops. Each step optionally targets an element
// (via data-tour="<id>") on a given route — the TourProvider navigates there
// automatically before spotlighting it. A step with no `target` renders as a
// centered welcome/finish card instead of a spotlight.

export interface TourStep {
  id: string
  path: string
  target: string | null
  title: string
  description: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    path: '/',
    target: null,
    title: "Welcome aboard! 👋",
    description: "Let's take a 60-second tour of the site — 5 quick stops, then you're back here.",
  },
  {
    id: 'work',
    path: '/work',
    target: 'nav-work',
    title: 'See the work',
    description: 'This is where past projects live — real case studies, not just pretty screenshots.',
  },
  {
    id: 'about',
    path: '/about',
    target: 'nav-about',
    title: 'Meet the team',
    description: "Curious who's behind it? The About page covers the story and how we work.",
  },
  {
    id: 'pricing',
    path: '/pricing',
    target: 'nav-pricing',
    title: 'Check pricing',
    description: 'Transparent packages, no surprise quotes. Everything you need to budget your project.',
  },
  {
    id: 'book',
    path: '/book',
    target: 'nav-book',
    title: 'Ready when you are',
    description: "When you're ready to talk, this button books a call directly — no forms to chase.",
  },
]
