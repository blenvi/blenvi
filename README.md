# Blenvi

**Effortless Integration Management for Developers**

Blenvi is a comprehensive dashboard platform that helps developers track, manage, and streamline all their project integrations and environment variables from one powerful interface. Built with modern web technologies, it provides a seamless experience for managing complex development workflows.

## ✨ Features

### 🔌 Integration Management

- **Multi-Service Support**: Manage integrations across various platforms (Supabase, Prisma, Clerk, Auth0, and more)
- **Real-time Health Monitoring**: Track integration health scores, uptime, and performance metrics
- **Configuration Management**: Centralized configuration for all your integrations
- **Webhook Management**: Configure and monitor webhooks for real-time notifications

### 🛠️ Environment Management

- **Environment Variables**: Secure management of environment variables across different environments
- **Documentation**: Built-in documentation for environment setup and best practices
- **CLI Integration**: Command-line tools for automated environment extraction and integration tracking

### 👥 Team Collaboration

- **Team Management**: Organize projects by teams with proper access controls
- **Team Discussions**: Built-in communication tools for team collaboration
- **Member Management**: Invite and manage team members with role-based permissions

### 🔄 Workflow Automation

- **Data Flow Metrics**: Visualize and monitor data flows between integrations
- **Integration Cards**: Quick overview cards for all active integrations
- **Automated Monitoring**: Continuous monitoring of integration performance

### 🔐 Security & Authentication

- **Supabase Authentication**: Secure user authentication and session management
- **Password Security**: Robust password validation with security best practices
- **OAuth Integration**: Support for GitHub and Google OAuth providers
- **Session Management**: Secure session handling with middleware protection

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Modern utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Recharts** - Data visualization and charts

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Supabase SSR** - Server-side rendering support

### UI/UX

- **shadcn/ui** - Modern component library
- **Tabler Icons** - Beautiful icon set
- **next-themes** - Dark/light theme support
- **Sonner** - Toast notifications
- **Vaul** - Mobile-first drawer component

### Development Tools

- **ESLint** - Code linting with custom rules
- **Prettier** - Code formatting
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **TypeScript** - Static type checking

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd blenvi
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages with dynamic routing
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── landing/          # Landing page components
│   ├── pages/            # Page-specific components
│   ├── ui/               # Reusable UI components
│   └── shared/           # Shared components
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client configuration
├── hooks/                # Custom React hooks
├── constants/            # Application constants
└── middleware.ts         # Next.js middleware
```

## 🎯 Key Pages & Routes

### Authentication

- `/auth/login` - User login
- `/auth/sign-up` - User registration
- `/auth/confirm` - Email confirmation

### Dashboard

- `/dashboard/[teamId]/[projectId]` - Project overview
- `/dashboard/[teamId]/[projectId]/team` - Team management
- `/dashboard/[teamId]/[projectId]/workflow` - Workflow management
- `/dashboard/[teamId]/[projectId]/integration/[slug]` - Integration configuration

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run type-check      # Run TypeScript type checking
```

## 🎨 UI Components

The project uses a comprehensive set of UI components built on top of Radix UI:

- **Forms**: Input, Select, Checkbox, Switch, and more
- **Layout**: Card, Tabs, Dialog, Drawer, Sidebar
- **Data Display**: Table, Badge, Avatar, Progress
- **Navigation**: Breadcrumb, Dropdown Menu
- **Feedback**: Alert, Toast notifications, Skeleton loaders

## 🔧 Configuration Features

### Integration Configuration

- Environment-specific settings
- API key management
- Webhook configuration
- Health monitoring
- Feature toggles

### Security Features

- Password strength validation
- Multi-factor authentication ready
- Secure session handling
- CSRF protection via middleware

## 🌙 Theme Support

Blenvi includes built-in dark/light theme support with:

- System preference detection
- Manual theme switching
- Persistent theme selection
- Tailwind CSS dark mode integration

## 📊 Monitoring & Analytics

- Integration health scoring
- Performance metrics tracking
- Request monitoring
- Uptime tracking
- Data flow visualization

## 🐳 Docker Support

Blenvi comes with Docker support out of the box, making it easy to run the application in both development and production environments.

### Development Environment

Run the application in development mode with hot-reloading:

```bash
docker compose up dev
```

### Production Environment

Build and run the application in production mode:

```bash
docker compose up prod
```

### Docker Commands

- **Build the images**: `docker compose build`
- **Stop all containers**: `docker compose down`
- **View logs**: `docker compose logs -f [dev|prod]`
- **Rebuild and restart**: `docker compose up -d --build [dev|prod]`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help with setup, please:

- Check the documentation
- Open an issue on GitHub
- Contact the development team
