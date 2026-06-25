import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata = {
  title: 'Fundamental — Stock Analysis Tool',
  description: 'WealthFort checklist-based fundamental analysis tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <NavBar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 sm:py-8">
          {children}
        </main>

        {/* Footer — WealthFort Credit */}
        <footer className="border-t border-gray-100 bg-gray-50/30">
          <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
              <img
                src="/wealthfort-logo.jpg"
                alt="WealthFort International"
                className="h-6 sm:h-7 w-auto opacity-70"
              />
              <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                Fundamental is powered by{' '}
                <span className="font-medium text-gray-500">WealthFort International Sdn. Bhd.</span>
                <br />
                All Rights Reserved &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
