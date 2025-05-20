# NaijaRails - Train Booking System

A comprehensive train booking system built with Next.js, TypeScript, and MongoDB, featuring real-time train schedules, booking management, and payment processing.

## 🚂 Core Features

### Train Management
- Train simulation with multiple classes (Economy, Business, First Class)
- Route management with station details
- Dynamic schedule generation
- Real-time seat availability tracking
- Fare calculation based on class and route

### Booking System
- Multi-step booking process
- Passenger information management
- Seat selection
- PNR generation
- Booking history
- Payment integration with Paystack

### User Interface
- Responsive dashboard
- Real-time train search
- Interactive booking interface
- Payment processing
- Booking confirmation and management

## 📁 Project Structure

```
app/
├── (auth)/                 # Authentication routes
│   ├── login/
│   ├── register/
│   └── set-password/
├── (dashboard)/           # Dashboard routes
│   ├── trains/           # Train management
│   │   ├── search/      # Train search interface
│   │   ├── booking/     # Booking management
│   │   ├── payment/     # Payment processing
│   │   └── booking-success/ # Booking confirmation
│   └── user/            # User profile and settings
├── api/                  # API routes
│   ├── auth/            # Authentication endpoints
│   ├── booking/         # Booking management
│   ├── payment/         # Payment processing
│   ├── schedules/       # Train schedules
│   └── trains/          # Train management
└── utils/               # Utility functions
    ├── mongodb/         # Database models and connection
    └── auth/            # Authentication utilities
```

## 🔄 System Flow

### 1. Train Search & Booking
1. User searches for trains
   - Selects departure/arrival stations
   - Chooses date and class
   - Views available trains
2. Selects train and proceeds to booking
3. Enters passenger details
4. Reviews booking
5. Proceeds to payment

### 2. Payment Processing
1. User selects payment method
2. Integration with Paystack
3. Payment verification
4. Booking confirmation
5. PNR generation

### 3. Booking Management
1. View booking history
2. Check booking status
3. Manage passenger details
4. View payment history

## 🛠️ Technical Implementation

### Database Models
- Train
- Schedule
- Route
- Station
- Booking
- Payment
- User

### Authentication
- NextAuth.js integration
- JWT token management
- Role-based access control
- Session management

### Payment Integration
- Paystack API integration
- Payment verification
- Transaction logging
- Error handling

### Real-time Features
- Seat availability updates
- Schedule changes
- Booking status updates
- Payment status tracking

## 🔒 Security Features
- Input validation
- Data sanitization
- CSRF protection
- Rate limiting
- Secure payment processing

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables:
   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_secret
   PAYSTACK_SECRET_KEY=your_paystack_key
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## 🛠️ Development Tools
- Next.js 15.3.2
- TypeScript
- MongoDB with Mongoose
- TailwindCSS
- Shadcn UI
- React Hook Form
- Zod Validation
- Jest Testing

## 📱 User Interface Components
- Responsive dashboard
- Interactive train search
- Multi-step booking form
- Payment interface
- Booking management
- User profile

## 🔄 Data Flow
1. User initiates train search
2. System queries available trains
3. User selects train and enters passenger details
4. System validates booking data
5. User proceeds to payment
6. System processes payment
7. Booking confirmation and PNR generation
8. Email notification

## 🎯 Key Features
- Real-time train search
- Dynamic seat allocation
- Multi-passenger booking
- Secure payment processing
- Booking management
- User profile management
- Admin dashboard
- Email notifications

## 🔍 Search Functionality
- Station-based search
- Date-based filtering
- Class-based filtering
- Price range filtering
- Availability checking

## 💳 Payment Processing
- Paystack integration
- Multiple payment methods
- Transaction verification
- Payment history
- Refund processing

## 📊 Booking Management
- Booking history
- Passenger management
- Seat allocation
- PNR tracking
- Booking modification
- Cancellation handling

## 🔐 Authentication & Authorization
- User registration
- Login/logout
- Password management
- Role-based access
- Session handling

## 📈 Performance Optimization
- Database indexing
- Caching strategies
- API optimization
- Image optimization
- Code splitting

## 🧪 Testing
- Unit tests
- Integration tests
- E2E testing
- Performance testing
- Security testing

## 📝 License
MIT License
