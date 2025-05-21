# Train Booking System

A modern web application for train ticket booking and management built with Next.js 14, featuring real-time train schedules, user authentication, and booking management.

## Project Structure

```
app/
├── (auth)/                 # Authentication routes
│   ├── login/             # Login page and components
│   └── register/          # Registration page and components
├── (dashboard)/           # Protected dashboard routes
│   ├── trains/            # Train-related features
│   │   ├── train-search/  # Train search functionality
│   │   └── booking/       # Booking management
│   ├── user/              # User profile and settings
│   └── booking-page/      # Booking process pages
├── _components/           # Shared components
│   ├── Header/            # Header components
│   └── UI/                # Reusable UI components
├── api/                   # API routes
│   └── trains/            # Train-related API endpoints
└── utils/                 # Utility functions and helpers
```

## Key Features

- **User Authentication**: Secure login and registration system
- **Train Search**: Real-time train schedule search and filtering
- **Booking System**: Complete booking flow with payment integration
- **User Dashboard**: Manage bookings and profile settings
- **Responsive Design**: Mobile-friendly interface

## Local Development Setup

1. **Clone the repository**

   ```bash
   git clone [your-repo-url]
   cd nextthird
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   DATABASE_URL=your_mongodb_url
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   TRAIN_API_KEY=your_api_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Workflow

- **Authentication**: Located in `app/(auth)/`

  - Login: `app/(auth)/login`
  - Registration: `app/(auth)/register`

- **Dashboard**: Located in `app/(dashboard)/`

  - Train Search: `app/(dashboard)/trains/train-search`
  - User Profile: `app/(dashboard)/user`
  - Bookings: `app/(dashboard)/booking-page`

- **API Routes**: Located in `app/api/`
  - Train endpoints: `app/api/trains/`

## Dependencies

- Next.js 14
- React
- MongoDB
- NextAuth.js
- Tailwind CSS
- TypeScript

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Your License]

## Deployment Instructions

### Prerequisites

- Node.js 18.x or later
- Vercel account
- Production database credentials
- API keys for external services

### Environment Variables

Create a `.env.production` file with the following variables:

```env
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret
TRAIN_API_KEY=your_production_train_api_key
NODE_ENV=production
```

### Vercel Deployment Steps

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy to Vercel:

   ```bash
   vercel --prod
   ```

4. Set up environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.production`

### Post-Deployment

1. Verify the deployment:

   - Check the production URL
   - Test all major features
   - Verify authentication flow

2. Set up custom domain (optional):
   - Add domain in Vercel dashboard
   - Configure DNS settings

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Security Considerations

- Keep all API keys and secrets secure
- Use HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


npx tsc --noEmit
Invoke-WebRequest -Uri http://localhost:3000/api/seed -Method POST