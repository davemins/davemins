import { createContext, useContext } from 'react'
import { useParams, Navigate, Outlet } from 'react-router-dom'
import { translations, isValidLang } from '../i18n'
import type { Lang, Translations } from '../i18n'

interface LangContextValue {
  lang: Lang
  t: Translations
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider() {
  const { lang } = useParams<{ lang: string }>()

  if (!isValidLang(lang)) {
    return <Navigate to="/ko" replace />
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang] }}>
      <Outlet />
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
