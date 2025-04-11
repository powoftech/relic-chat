import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const storageKey = 'vite-ui-theme'

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || 'system',
  )

  useEffect(() => {
    if (theme === 'system') {
      const darkThemeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)',
      )
      document.documentElement.classList.toggle(
        'dark',
        darkThemeMediaQuery.matches,
      )
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }

    localStorage.setItem(storageKey, theme)
  }, [theme])

  useEffect(() => {
    if (theme === 'system') {
      const darkThemeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)',
      )

      const handleChange = (event: MediaQueryListEvent) => {
        window.document.documentElement.classList.toggle('dark', event.matches)
      }

      darkThemeMediaQuery.addEventListener('change', handleChange)
      return () =>
        darkThemeMediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => setTheme(theme),
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
