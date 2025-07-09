import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './ThemeProvider';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';
import QueryProvider from './QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <UserProvider>
            <AppProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </AppProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}