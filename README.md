# SharinGo - Modern Marketplace & Communication Platform

A modern, professional, and interactive frontend website built with React, TailwindCSS, shadcn/ui, and Framer Motion. SharinGo is a community-driven marketplace that combines buying, selling, and sharing items with built-in communication tools.

## 🚀 Features

### Core Pages & Sections
- **Landing Page** - Hero section, how it works, features, testimonials
- **Authentication** - Login, Signup, and Forgot Password pages with role-based access
- **User Dashboard** - Sidebar navigation with overview and stats
- **Marketplace** - Browse ads, post ads, and detailed ad views
- **Communication Center** - Messages, calls, and email integration
- **Admin Dashboard** - Complete admin panel for managing users, ads, and reports
- **Additional Pages** - Contact, FAQ, About, Terms, and Privacy

### 🔑 Access Control & Roles
- **Protected Routes** - Login required for posting ads and contacting users
- **Role-Based Access** - Admin and User roles with different permissions
- **Guest Browsing** - Users can browse ads without login
- **Login Redirects** - Automatic redirect to login when accessing protected features

### Key Features
- 🛒 **Modern Marketplace** - Browse and post items with advanced filtering
- 💬 **Real-time Messaging** - Chat with buyers and sellers
- 📞 **Voice & Video Calls** - Secure communication without sharing personal numbers
- 📧 **Email Integration** - Send and receive emails through the platform
- 🔒 **Secure Sharing** - All transactions are protected and monitored
- 👑 **Admin Panel** - Complete admin dashboard for platform management
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ✨ **Smooth Animations** - Framer Motion animations throughout
- 🎨 **Modern UI** - Clean design with shadcn/ui components

### 👑 Admin Features
- **User Management** - View, block/unblock users, manage roles
- **Ad Management** - Approve/reject ads, remove inappropriate content
- **Reports System** - Handle user reports and complaints
- **System Settings** - Configure platform settings and preferences
- **Analytics Dashboard** - View platform statistics and activity

## 🛠️ Tech Stack

- **React 18** - Modern React with TypeScript
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Framer Motion** - Production-ready motion library
- **Lucide React** - Beautiful & consistent icon toolkit
- **React Router** - Client-side routing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd share-go
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   └── ui/                 # shadcn/ui components
├── pages/                  # All page components
├── data/                   # Mock data and types
├── utils/                  # Utility functions
├── types/                  # TypeScript type definitions
└── main.tsx               # Application entry point
```

## 📱 Pages Overview

### Landing Page
- Hero section with call-to-action
- "How It Works" step-by-step guide
- Features showcase with icons and animations
- Testimonials carousel
- Footer with links and contact info

### Authentication
- **Login Page** - Email/password with social login options
- **Signup Page** - Registration with password validation
- **Forgot Password** - Password reset functionality

### Dashboard
- Sidebar navigation (Home, My Ads, Messages, Calls, Emails, Notifications, Settings)
- Overview with stats and recent activity
- Quick actions and recent ads
- Responsive mobile navigation

### Marketplace
- **Browse Ads** - Grid/list view with search and filters
- **Post Ad** - Multi-step form with image upload
- **Ad Details** - Full ad information with contact options

### Communication
- **Messages** - Real-time chat interface
- **Calls** - Call history with voice/video options
- **Emails** - Inbox with compose functionality

### Additional Pages
- **Contact** - Contact form and company information
- **FAQ** - Searchable frequently asked questions
- **About** - Company story, team, and values
- **Terms** - Terms of service
- **Privacy** - Privacy policy

## 🎨 Design Features

- **Modern SaaS Design** - Clean, professional interface
- **Consistent Color Scheme** - Primary blue with proper contrast
- **Smooth Animations** - Framer Motion for engaging interactions
- **Responsive Layout** - Mobile-first design approach
- **Accessibility** - WCAG compliant components
- **Loading States** - Proper feedback for user actions

## 📊 Mock Data

The application includes comprehensive mock data for:
- Users with avatars and ratings
- Ads with images and details
- Messages and conversations
- Call history
- Email threads
- Notifications
- Testimonials
- FAQ entries

## 🚀 Getting Started

1. **Development**
   ```bash
   npm run dev
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

4. **Linting**
   ```bash
   npm run lint
   ```

## 🔧 Customization

### Colors
Edit the color scheme in `tailwind.config.js` and `src/index.css`

### Components
All UI components are in `src/components/ui/` and can be customized

### Mock Data
Update mock data in `src/data/mockData.ts`

### Pages
Add new pages in `src/pages/` and update routing in `src/App.tsx`

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Future Enhancements

- Backend integration with real APIs
- Real-time messaging with WebSockets
- Payment processing integration
- Advanced search and filtering
- Push notifications
- Mobile app development
- Admin dashboard
- Analytics and reporting

## 📄 License

This project is for demonstration purposes. Please ensure you have the proper licenses for any commercial use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 👤 Author

**Malik Ashir Ali**
- GitHub: [@malikashirali25](https://github.com/malikashirali25)
- Email: iammalikashirali@gmail.com

## 📞 Support

For questions or support, please contact:
- Email: support@shareandgo.com
- Phone: +1 (555) 123-4567

---

Built with ❤️ using React, TailwindCSS, and Framer Motion
