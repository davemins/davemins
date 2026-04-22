import { ko } from './ko'
import { en } from './en'
import { es } from './es'

export type Lang = 'ko' | 'en' | 'es'
export type Translations = typeof ko

export const translations: Record<Lang, Translations> = { ko, en, es }

export const LANGS: Lang[] = ['ko', 'en', 'es']

export function isValidLang(lang: string | undefined): lang is Lang {
  return lang === 'ko' || lang === 'en' || lang === 'es'
}
