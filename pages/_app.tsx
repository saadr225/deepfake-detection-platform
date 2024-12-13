import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { UserProvider } from '../contexts/UserContext'
import { ThemeProvider } from 'next-themes'
import { DetectionHistoryProvider } from '../contexts/DetectionHistoryContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <UserProvider>
        <DetectionHistoryProvider>
          <Component {...pageProps} />
        </DetectionHistoryProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default MyApp