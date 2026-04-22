export interface SocialLink {
  platform: string
  url: string
}

export interface WhoData {
  name: string
  role: string
  bio: string
  skills: string[]
  socialLinks: SocialLink[]
}
