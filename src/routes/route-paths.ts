/** Central path segments for controllers (Nest still maps these via @Controller). */
export const RoutePaths = {
  root: '',
  health: 'health',
  bookings: 'bookings',
  auth: 'auth',
  signup: 'signup',
  signin: 'signin',
} as const;
