import NavBar from '@/components/NavBar';
import SessionProvider from '@/components/SessionProvider';
import { auth } from '@/lib/auth';
import './globals.css';

export const metadata = {
  title: 'Fundamental — Stock Analysis Tool',
  description: 'WealthFort checklist-based fundamental analysis tool',
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `,
        }} />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <SessionProvider session={session}>
          <NavBar />
          <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 sm:py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50">
            <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Built by{' '}
                  <a
                    href="https://linkedin.com/in/zahiruddin-zaki"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    Zahiruddin Zaki
                  </a>
                  {' · '}Based on WealthFort International Sdn. Bhd. checklists
                </p>
                <p className="text-[11px] text-gray-400/60 dark:text-gray-500/60 italic">
                  Independent tool — not affiliated with WealthFort
                </p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
