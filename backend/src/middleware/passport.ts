// Temporary placeholder for passport - Google OAuth disabled for production build
// This file provides mock implementations to allow TypeScript compilation

export default {
  initialize: () => (req: any, res: any, next: any) => next(),
  session: () => (req: any, res: any, next: any) => next(),
  authenticate: (strategy: string, options?: any) => (req: any, res: any, next: any) => {
    // Mock authentication - always pass through
    next();
  },
  serializeUser: (fn: any) => {
    // Mock serialize - do nothing
  },
  deserializeUser: (fn: any) => {
    // Mock deserialize - do nothing
  }
};
