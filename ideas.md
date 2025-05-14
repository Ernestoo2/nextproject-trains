# Authentication Implementation

## Overview
This document outlines the implementation of our authentication system using NextAuth.js with both credential and social login providers.

## Implementation Details

### Authentication Components
- **Login Component**: Implements credential login and social provider buttons
- **Signup Component**: Handles new user registration and social signup options
- **NextAuth Configuration**: Centralized in `app/lib/auth.ts`

### Authentication Flow
1. **Credential Login**:
   - User submits email/password via form
   - NextAuth validates credentials against the database
   - On success, JWT token is created and user is redirected to dashboard

2. **Social Login**:
   - User clicks on social provider button (Google, Facebook, Apple)
   - NextAuth redirects to provider's authentication page
   - Provider returns with user info
   - System checks if user exists:
     - If yes: Updates user info and logs them in
     - If no: Creates new user account and logs them in

3. **Registration**:
   - User submits registration form
   - System validates input
   - Password is hashed using bcrypt
   - New user created in database
   - User is redirected to login page

## Social Provider Setup

### Google OAuth
1. Create a project on [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Create OAuth client ID for web application
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
5. Note Client ID and Client Secret

### Facebook OAuth
1. Create an app on [Facebook Developers](https://developers.facebook.com/)
2. Navigate to "Settings" > "Basic" to get App ID and App Secret
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (development)
   - `https://yourdomain.com/api/auth/callback/facebook` (production)

### Apple OAuth
1. Access [Apple Developer Portal](https://developer.apple.com/)
2. Create Services ID with "Sign In with Apple" capability
3. Configure domains and redirect URIs
4. Create private key and note Key ID
5. Generate client secret using private key

## Environment Variables
Add to `.env.local`:
```
# NextAuth Config
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secure-secret

# Google Provider
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook Provider
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Apple Provider
APPLE_CLIENT_ID=your-apple-services-id
APPLE_CLIENT_SECRET=your-generated-apple-client-secret
```

For Windows users without OpenSSL, generate a secure random NEXTAUTH_SECRET using:
- Online generators like [GRC's Password Generator](https://www.grc.com/passwords.htm)
- Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Database Integration
- User model stores credential and social login information
- Social login creates users with verified email status
- Common user ID system across all authentication methods
- Login events update last login timestamp

## Security Considerations
- Passwords hashed with bcrypt (12 rounds)
- JWT session strategy with appropriate timeouts
- Input validation using Zod schema
- Error handling with appropriate user feedback
- Social provider profiles linked to maintain single user account

## Next Steps
- Implement password reset functionality
- Add email verification for credential signups
- Implement account linking (connecting multiple providers)
- Add two-factor authentication option
- Create admin dashboard for user management 