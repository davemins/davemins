export interface SocialLink {
  platform: string
  url: string
}

export interface Experience {
  title: string
  company: string
  period: string
}

export interface WhoData {
  name: string
  bio: string[]
  makes: string[]
  experience: Experience[]
  socialLinks: SocialLink[]
}
