import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: '/login',
  },
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
