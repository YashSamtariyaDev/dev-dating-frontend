# Dev Dating Frontend

An enterprise-grade Next.js frontend for a developer dating platform, built with best practices and modern technologies used by big tech companies.

## 🚀 Tech Stack

### Framework & Runtime
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **React 19** with latest features

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for accessible, reusable components
- **Lucide React** for beautiful icons
- **Framer Motion** for smooth animations

### State Management
- **Redux Toolkit** for global state management
- **TanStack Query** for server state management
- **React Hook Form** for form state

### Data & Validation
- **Zod** for runtime type validation
- **Axios** for HTTP client with interceptors

### Authentication
- **NextAuth.js** for secure authentication

### Tables & Data Display
- **TanStack Table** for powerful data tables

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   ├── forms/          # Form components
│   └── tables/         # Table components
├── features/           # Feature-based modules
│   ├── auth/           # Authentication features
│   ├── dashboard/      # Dashboard features
│   ├── profile/        # Profile management
│   ├── matching/       # Matching system
│   └── chat/           # Chat/messaging
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── validations/    # Zod schemas
│   └── utils/          # Helper functions
├── store/              # Redux store configuration
│   └── slices/         # Redux slices
├── types/              # TypeScript type definitions
├── config/             # Configuration files
│   ├── api.ts          # API client setup
│   ├── auth.ts         # Auth configuration
│   └── query-client.ts # Query client setup
└── constants/          # Application constants
```

### Design Patterns Used

#### 1. Feature-Based Architecture
- Organized by business features rather than technical layers
- Each feature contains its own components, hooks, and types
- Promotes scalability and maintainability

#### 2. Repository Pattern
- API calls abstracted through custom hooks
- Centralized data fetching logic
- Easy to mock and test

#### 3. Component Composition
- Highly reusable UI components
- Compound components pattern for complex UI
- Consistent design system

#### 4. State Management Strategy
- **Redux Toolkit** for global state (auth, UI state)
- **TanStack Query** for server state with caching
- **React Hook Form** for form state

#### 5. Type Safety
- Comprehensive TypeScript coverage
- Zod schemas for runtime validation
- Type-safe API client

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd dev-dating-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXTAUTH_SECRET=your-secret-key
```

### Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NEXTAUTH_URL`: Application URL (for production)

### API Configuration
The API client is configured with:
- Request/response interceptors
- Automatic token refresh
- Error handling
- Request timing

### State Management
- **Redux Store**: Global application state
- **Query Client**: Server state with caching and synchronization
- **Form State**: Optimized form handling with validation

## 📦 Key Features

### 1. Authentication System
- Secure login/logout with NextAuth.js
- Token management and refresh
- Protected routes
- Session persistence

### 2. Dashboard
- Real-time statistics
- Recent matches display
- Quick actions
- Responsive design

### 3. Profile Management
- Complete CRUD operations
- Form validation with Zod
- Image upload support
- Skills and interests management

### 4. Matching System
- Compatibility scoring
- Match recommendations
- Accept/reject functionality
- Real-time updates

### 5. Chat/Messaging
- Real-time messaging
- Chat history
- Typing indicators
- Message notifications

## 🎨 UI/UX Features

### Design System
- Consistent color palette
- Typography scale
- Spacing system
- Component variants

### Animations
- Page transitions
- Micro-interactions
- Loading states
- Gesture animations

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing
- Utility function testing

### Integration Tests
- API integration
- User flow testing
- Form submission testing

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Performance testing

## 📊 Performance Optimizations

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports

### Caching Strategy
- API response caching
- Static asset caching
- Browser caching

### Bundle Optimization
- Tree shaking
- Minification
- Image optimization

## 🔒 Security Features

### Authentication Security
- JWT token handling
- CSRF protection
- Session management
- Secure headers

### Data Validation
- Input sanitization
- XSS prevention
- SQL injection prevention
- Type validation

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- Development: Local development server
- Staging: Preview deployments
- Production: Optimized build

## 📝 Best Practices

### Code Organization
- Feature-based folder structure
- Consistent naming conventions
- Separation of concerns
- Single responsibility principle

### Performance
- Lazy loading
- Memoization
- Optimistic updates
- Error boundaries

### Accessibility
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Color contrast

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by enterprise-grade applications
- Following industry best practices
