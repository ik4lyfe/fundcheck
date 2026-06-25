import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Vercel auto-deploy auto-sets VERCEL_URL, but custom domains need explicit AUTH_URL.
// Fallback: use VERCEL_URL so Auth.js knows where it lives.
const authUrl = process.env.AUTH_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: {
    signIn: '/login',
  },
  trustHost: true,
  callbacks: {
    authorized({ request, auth }) {
      // Allow the login page itself and the auth callback handler
      const { pathname } = request.nextUrl;
      if (pathname === '/login') return true;
      if (pathname.startsWith('/api/auth')) return true;

      // Protect all other routes
      return !!auth?.user;
    },
  },
});
