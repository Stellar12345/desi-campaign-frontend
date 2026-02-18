# Campaign Admin Dashboard

A production-ready Campaign Admin Dashboard frontend built with React, Vite, Tailwind CSS, and modern React ecosystem tools.

## Features

- 🎨 **Modern SaaS UI** - Clean, professional design inspired by Linear/Stripe
- 📱 **Mobile-First** - Fully responsive design
- 🔐 **User Management** - Complete CRUD operations for users
- 📊 **Dashboard** - Analytics-ready dashboard with statistics
- ⚡ **Performance** - Optimized with React Query for efficient data fetching
- 🎯 **Type Safety** - Full TypeScript support
- ✅ **Form Validation** - React Hook Form + Zod validation

## Tech Stack

- **React 18** - Latest React with hooks
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **TanStack Query (React Query)** - Data fetching and caching
- **React Hook Form** - Performant forms
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

## Project Structure

```
src/
 ├─ app/              # App configuration and routing
 ├─ components/        # Reusable components
 │   ├─ ui/           # Base UI components (Button, Input, Modal, etc.)
 │   ├─ layout/       # Layout components (Sidebar, Navbar)
 │   └─ users/        # User-specific components
 ├─ pages/            # Page components
 ├─ hooks/            # Custom React hooks
 ├─ services/         # API service layer
 ├─ types/            # TypeScript type definitions
 └─ utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## API Configuration

The application is configured to use the backend API at:
```
https://api.desi-campaign-backend.stellarsolutions.org
```

### API Endpoints

#### Users Management

- `POST /private/users` - Create user
- `GET /private/users` - Get all users
- `GET /private/users/:id` - Get single user
- `PUT /public/users/:id` - Update user
- `DELETE /public/users/:id` - Soft delete user
- `PATCH /public/users/restore/:id` - Restore user
- `DELETE /private/users/hard-delete/:id` - Hard delete user

## Features Overview

### Dashboard
- Statistics cards with placeholder data
- Analytics area ready for charts
- Clean, modern design

### Users Management
- **List View**: Data table with search, pagination, and filtering
- **Create User**: Drawer form with validation
- **Edit User**: Update user information
- **View Details**: Detailed user information page
- **Soft Delete**: Mark user as deleted (reversible)
- **Restore**: Restore soft-deleted user
- **Hard Delete**: Permanently delete user

### User Form
- Dynamic contacts array management
- Add/remove contact rows
- Full validation with error messages
- Loading states

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint configured for React best practices
- Prettier-ready (add prettier config if needed)

### Path Aliases

The project uses `@/` as an alias for the `src/` directory:
```typescript
import { Button } from "@/components/ui/Button";
import { useUsers } from "@/hooks/useUsers";
```

## Environment Variables

Create a `.env` file in the root directory if you need to customize the API URL:

```env
VITE_API_BASE_URL=https://api.desi-campaign-backend.stellarsolutions.org
```

## License

MIT
