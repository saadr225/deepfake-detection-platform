import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { UserProvider } from '../contexts/UserContext'
import { ThemeProvider } from 'next-themes'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ThemeProvider>
  )
}

export default MyApp