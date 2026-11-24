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
  heading_top: 'Good work.',
  heading_highlight: 'Good taste.',
  heading_bottom: 'Good follow-through.',
  subheading:
    'I’m Yatin. I help small businesses bring brand, web, and social into one recognisable presence — with care in the details and a clear reason behind every choice.',
  primary_cta_label: 'See what I make',
  primary_cta_href: '/work',
  secondary_cta_label: 'Tell me what you’re building',
  secondary_cta_href: '/contact',
}

export const DEFAULT_ABOUT_TEASER: AboutTeaserContent = {
  heading: 'A small practice, with the whole picture in mind.',
  body:
    'Yats is Yatin Sharma’s independent creative practice. I work across identity, useful websites, and social content so the whole business feels like itself wherever people meet it.',
  image_url: '',
  skills: ['Brand identity', 'Website design', 'Social media management', 'Content systems'],
}

export const DEFAULT_CTA: CtaContent = {
  heading: 'Got something good in mind?',
  body:
    "Tell me what you're building and where you could use a thoughtful creative partner.",
  primary_cta_label: 'Start a conversation',
  primary_cta_href: '/contact',
  secondary_cta_label: 'More about Yats',
  secondary_cta_href: '/about',
}

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  heading: 'About Yats',
  intro:
    "I'm Yatin Sharma, an independent creative working across brand design, websites, and social media.",
  bio_paragraphs: [
    'Yats is my personal creative practice for helping small businesses build a more considered online presence. My work brings visual identity, clear web experiences, and social content together.',
    'I like projects with a clear purpose and room for good craft. I work from the first ideas through the final details, keeping the process direct and collaborative.',
    "I'm growing this practice through hands-on freelance work and personal projects, and I'm open to remote collaborations worldwide.",
  ],
  portrait_url: '',
  location: 'Remote · worldwide',
  years_experience: '',
  quick_facts: [
    { label: 'Focus', value: 'Brand & digital presence' },
    { label: 'Working style', value: 'Independent & collaborative' },
    { label: 'Availability', value: 'Open to freelance projects' },
  ],
  skills: [
    { category: 'Brand & Visual', items: ['Visual identity', 'Social media design', 'Content systems'] },
    { category: 'Web', items: ['UI design', 'Responsive websites', 'React', 'TypeScript'] },
    { category: 'Social', items: ['Social media management', 'Content planning', 'Brand consistency'] },
    { category: 'Tools', items: ['Figma', 'GitHub', 'Tailwind CSS', 'Supabase'] },
  ],
  experience: [],
  cta_heading: "Let's make something clear and useful",
  cta_body: "Tell me what you're working on and where you need a hand.",
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsContent = {
  site_name: 'Yats',
  footer_tagline: 'Brand, web, and social made to feel like the same business.',
  social_github: 'https://github.com/Yatin-x017',
  social_linkedin: 'https://www.linkedin.com/in/yatin-sharma-87b15b37a/',
  contact_email: 'yatinx017@gmail.com',
}

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  intro: "Have a project in mind, a question, or just want to say hello? I'd love to hear from you.",
  email: 'yatinx017@gmail.com',
  location: 'Remote · worldwide',
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
