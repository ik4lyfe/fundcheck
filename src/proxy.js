import { auth } from '@/lib/auth';

// Next.js 16 renamed middleware → proxy.
// This wraps the next-auth v5 `auth` handler for route protection.
// Unauthenticated users on matched routes are redirected to /login
// via the `pages.signIn` and `authorized` callback in @/lib/auth.
export default auth;

export const config = {
  matcher: [
    '/analysis/:path*',
    '/dashboard/:path*',
  ],
};
