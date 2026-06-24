import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata = {
  title: 'FundCheck — Fundamental Analysis Tool',
  description: 'WealthFort checklist-based fundamental analysis tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <NavBar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
