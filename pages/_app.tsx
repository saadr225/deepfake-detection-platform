import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { UserProvider } from '../contexts/UserContext'
import { ThemeProvider } from 'next-themes'
import { DetectionHistoryProvider } from '../contexts/DetectionHistoryContext'
import { Toaster } from '../components/Toaster'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <UserProvider>
        <DetectionHistoryProvider>
          <Component {...pageProps} />
        </DetectionHistoryProvider>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  )
}

export default MyApp