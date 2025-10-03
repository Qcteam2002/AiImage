// Temporarily disabled passport for production stability
// Will re-enable Google OAuth after database migration is complete

const passport = {
  use: () => {},
  serializeUser: () => {},
  deserializeUser: () => {}
};

export default passport;