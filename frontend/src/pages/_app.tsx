import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../contexts/AuthContext';
import theme from '../styles/theme';
import { createEmotionCache } from '../utils/createEmotionCache';
import '../styles/globals.css';

/**
 * Custom App Component
 * 
 * Wraps the entire application with necessary providers and global styles
 */

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// Create a client
const queryClient = new QueryClient();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App(props: MyAppProps): JSX.Element {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  
  React.useEffect(() => {
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles?.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon */}
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
} 