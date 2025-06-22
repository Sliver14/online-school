import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './ThemeProvider';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UserProvider>
          <AppProvider>
              <ThemeProvider>{children}</ThemeProvider>
        </AppProvider>
        </UserProvider>
        
      </body>
    </html>
  );
}