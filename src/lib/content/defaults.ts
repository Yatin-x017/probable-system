// Default/fallback content for every editable section of the site.
// These values are ONLY used when a row hasn't been created in Supabase yet
// (e.g. right after cloning the project) or while content is loading, so the
// site never renders blank. Once the admin saves a section in
// /admin/content, the real row takes over.

export interface HeroContent {
  heading_top: string
  heading_highlight: string
  heading_bottom: string
  subheading: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
}

export interface AboutTeaserContent {
  heading: string
  body: string
  image_url: string
  skills: string[]
}

export interface CtaContent {
  heading: string
  body: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
}

export interface QuickFact {
  label: string
  value: string
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface ExperienceItem {
  title: string
  company: string
  period: string
  description: string
}

export interface AboutPageContent {
  heading: string
  intro: string
  bio_paragraphs: string[]
  portrait_url: string
  location: string
  years_experience: string
  quick_facts: QuickFact[]
  skills: SkillGroup[]
  experience: ExperienceItem[]
  cta_heading: string
  cta_body: string
}

export interface SiteSettingsContent {
  site_name: string
  footer_tagline: string
  social_github: string
  social_linkedin: string
  contact_email: string
}

export interface ContactPageContent {
  intro: string
  email: string
  location: string
}

export interface MarqueeContent {
  heading: string
  body: string
  images: string[]
}

export const DEFAULT_HERO: HeroContent = {
  heading_top: 'Designer & Developer',
  heading_highlight: 'crafting digital',
  heading_bottom: 'experiences',
  subheading:
    "I design and build thoughtful, pixel-perfect interfaces that help businesses connect with their audience.",
  primary_cta_label: 'View My Work',
  primary_cta_href: '/work',
  secondary_cta_label: 'Get in Touch',
  secondary_cta_href: '/contact',
}

export const DEFAULT_ABOUT_TEASER: AboutTeaserContent = {
  heading: "Hi, I'm Yatin",
  body:
    "I'm a multidisciplinary designer and developer based in [your city]. With over [X] years of experience, I specialize in creating digital products that are both beautiful and functional. My approach combines strategic thinking with meticulous attention to detail.",
  image_url: '',
  skills: ['UI/UX Design', 'React', 'TypeScript', 'Three.js', 'Node.js'],
}

export const DEFAULT_CTA: CtaContent = {
  heading: 'Have a project in mind?',
  body:
    "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.",
  primary_cta_label: 'Start a Conversation',
  primary_cta_href: '/contact',
  secondary_cta_label: 'Book a Call',
  secondary_cta_href: '/book',
}

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  heading: 'About',
  intro:
    "I'm Yatin Sharma — a designer and developer who believes great digital experiences sit at the intersection of clarity, craft, and care.",
  bio_paragraphs: [
    "With over [X] years in the industry, I've had the privilege of working with startups, agencies, and established brands to bring their digital visions to life. My work spans from initial concept and user research through to polished, production-ready code.",
    "I approach every project with a simple philosophy: understand the user, respect the constraints, and sweat the details. Whether I'm wireframing a new feature or optimizing a React component, I'm always thinking about the person on the other side of the screen.",
    "When I'm not designing or coding, you'll find me [your hobby], exploring new technologies, or contributing to open-source projects.",
  ],
  portrait_url: '',
  location: '[Your City, Country]',
  years_experience: '[X]+',
  quick_facts: [
    { label: 'Focus', value: 'UI/UX & Frontend' },
    { label: 'Location', value: '[Your City]' },
    { label: 'Timezone', value: '[Your TZ]' },
    { label: 'Availability', value: 'Open to projects' },
  ],
  skills: [
    { category: 'Design', items: ['UI/UX Design', 'Design Systems', 'Figma', 'Prototyping', 'User Research'] },
    { category: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Three.js'] },
    { category: 'Backend', items: ['Node.js', 'PostgreSQL', 'Supabase', 'REST APIs', 'GraphQL'] },
    { category: 'Tools', items: ['Git', 'Vercel', 'Docker', 'VS Code', 'Claude'] },
  ],
  experience: [
    {
      title: 'Senior Product Designer',
      company: 'Company Name',
      period: '2022 — Present',
      description: 'Leading design for core product features, mentoring junior designers, and establishing design system standards.',
    },
    {
      title: 'UI/UX Designer & Developer',
      company: 'Agency Name',
      period: '2019 — 2022',
      description: 'Designed and built websites and web applications for clients across fintech, healthcare, and e-commerce.',
    },
    {
      title: 'Frontend Developer',
      company: 'Startup Name',
      period: '2017 — 2019',
      description: 'Built React components, implemented responsive designs, and collaborated with the design team on product iterations.',
    },
  ],
  cta_heading: "Let's build something together",
  cta_body: "I'm always interested in hearing about new projects and opportunities.",
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsContent = {
  site_name: 'Yatin Sharma',
  footer_tagline: 'Designer & developer crafting thoughtful digital experiences.',
  social_github: 'https://github.com',
  social_linkedin: 'https://www.linkedin.com/in/yatin-sharma-87b15b37a/',
  contact_email: 'yatinx017@gmail.com',
}

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  intro: "Have a project in mind, a question, or just want to say hello? I'd love to hear from you.",
  email: 'yatinx017@gmail.com',
  location: '[Your City, Country]',
}

export const DEFAULT_MARQUEE: MarqueeContent = {
  heading: 'A closer look',
  body: 'Screens and shots from recent work.',
  images: [],
}

// Registry of every editable content section, keyed by the id used in the
// `site_content` table. Used by the generic loader/saver and by the admin UI.
export const CONTENT_DEFAULTS = {
  home_hero: DEFAULT_HERO,
  home_about_teaser: DEFAULT_ABOUT_TEASER,
  home_cta: DEFAULT_CTA,
  home_marquee: DEFAULT_MARQUEE,
  about_page: DEFAULT_ABOUT_PAGE,
  site_settings: DEFAULT_SITE_SETTINGS,
  contact_page: DEFAULT_CONTACT_PAGE,
} as const

export type ContentKey = keyof typeof CONTENT_DEFAULTS
