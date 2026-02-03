# Aurora

A modern React-based web application built with Vite, TypeScript, and Material-UI for enterprise-level user and resource management.

## 🚀 Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6.3.1
- **UI Library**: Material-UI (MUI) 7.0.2
- **State Management**: Redux Toolkit + React Redux
- **Routing**: React Router 7.5.2
- **Styling**: SCSS + Emotion
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Phosphor Icons + MUI Icons
- **Rich Text**: Slate.js editor
- **Date Handling**: Moment.js
- **Notifications**: Notistack
- **Development**: ESLint + PostCSS + Autoprefixer

## 📁 Project Structure

```
aurora/
├── src/
│   ├── app/                    # Redux store & auth middleware
│   ├── components/             # Reusable UI components
│   │   ├── layout/            # Layout components (header, footer, sidebar)
│   │   ├── ui/                # UI components (buttons, inputs, dialogs)
│   │   └── dialogs/           # Modal dialogs
│   ├── features/              # Feature-based modules
│   │   ├── api/               # API calls & RTK Query
│   │   └── slices/            # Redux slices
│   ├── pages/                 # Page components
│   │   ├── (masterlist)/      # Master data management
│   │   ├── (settings)/        # Application settings
│   │   ├── dashboard/         # Main dashboard
│   │   ├── login/             # Main Authentication
│   │   └── NEW PAGES HERE/    # just add more pages here
│   ├── hooks/                 # Custom React hooks
│   ├── router/                # Route configuration & guards
│   ├── styles/                # SCSS styles & theme colors
│   ├── themes/                # MUI theme configuration
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
└── [config files]            # Vite, TypeScript, ESLint configs
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd aurora
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy the appropriate `.env` file for your environment
   - Update environment variables as needed

### Available Scripts

```bash
# Development
npm run local           # Start local development server
npm run development     # Start development server
npm run production      # Start production server

# Building
npm run build:dev       # Build for development
npm run build:prod      # Build for production

# Preview
npm run preview:dev     # Preview development build
npm run preview:prod    # Preview production build

# Utilities
npm run lint            # Run ESLint
npm run generate:scss   # Generate CSS from SCSS
```

## 🌍 Environment Configuration

### Local Development (.env.local.dev)

- **API Endpoint**: `http://10.10.13.6:8081/api`
- **File Server**: `https://pretest-aurora.rdfymir.com`

### Development (.env.development)

- **API Endpoint**: `https://pretest-aurora.rdfymir.com/backend/public/api`
- **File Server**: `https://pretest-aurora.rdfymir.com`

### Production (.env.production)

- **API Endpoint**: `https://pretestomega.rdfymir.com/backend/public/api`
- **File Server**: `https://pretest-aurora.rdfymir.com`

## 🎨 Features

### Core Features

- **User Management**: Complete CRUD for users, roles, and permissions
- **Master Data**: Business units, departments, locations, companies
- **Authentication**: Secure login with JWT tokens
- **Dashboard**: Real-time analytics and monitoring
- **File Management**: Upload and manage documents
- **Theming**: 40+ custom color themes with dark/light mode
- **Responsive Design**: Mobile-first approach
- **Rich Text Editing**: Markdown editor with live preview

### UI Components

- **Smart Components**: Intelligent forms, tables, and dialogs
- **Search & Filter**: Global search with advanced filtering
- **Pagination**: Table pagination with sorting
- **Notifications**: Toast notifications with actions
- **Context Menus**: Right-click functionality
- **Responsive Dialogs**: Mobile-optimized modals
- **Custom Icons**: Phosphor icon integration

### Developer Experience

- **TypeScript**: Full type safety throughout the application
- **Hot Reload**: Instant development feedback
- **Code Splitting**: Automatic bundle optimization
- **Tree Shaking**: Dead code elimination
- **SCSS Modules**: Scoped styling
- **ESLint**: Code quality enforcement
- **PostCSS**: Advanced CSS processing

## 🔐 Authentication & Security

- **JWT Token**: Secure authentication with encrypted tokens
- **Route Guards**: Protected routes based on user permissions
- **Encryption**: Client-side encryption for sensitive data
- **Environment Variables**: Secure configuration management
- **CORS**: Cross-origin request handling

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoint System**: Consistent responsive behavior
- **Touch Gestures**: Swipe and touch interactions
- **Adaptive UI**: Components adapt to screen size

## 🎨 Theming System

### Available Themes

The application includes 40+ custom color themes named after team members:

- Ambatali, Arjay, Berry, Blue, Boris, Boss Bry
- CarlJustine, Charlizard, DanDanDan, Daroy, El Roi
- Ford, Gibs, HackerMan, Henanie, Jeric, Jerome
- JK, Joker, Justine, Keigh, Keli, Lucky Greg
- Mario, Mickelly Mouse, Mint, Neil, Neon, Orange
- Perona, Pikachu, Plum, Pluto, Purple, Ralph
- Rannie, Sam, Sian, SpiderMan, Tons, Vega
- Vince, Xenh, Ymir

### Theme Features

- **Dark/Light Mode**: System preference detection
- **Color Customization**: CSS custom properties
- **Dynamic Switching**: Runtime theme changes
- **Persistent Selection**: User preference storage

## 🚀 Deployment

### Development Build

```bash
npm run build:dev
npm run preview:dev
```

### Production Build

```bash
npm run build:prod
npm run preview:prod
```

### Environment Variables

Ensure all required environment variables are set:

- `VITE_AURORA_ENDPOINT`: API base URL
- `VITE_AURORA_FILES`: File server URL
- `VITE_SECRET`: Encryption secret
- `VITE_SALT`: Encryption salt
- `VITE_AURORA_MASTERKEY`: Master key for admin access

## 📚 Development Guidelines

### Code Organization

- **Feature-based**: Group related files together
- **Component Co-location**: Keep components with their styles and tests
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Type Safety**: Use TypeScript for all components and functions

### Styling Guidelines

- **SCSS Modules**: Use scoped styles for components
- **CSS Custom Properties**: Leverage CSS variables for theming
- **Mobile First**: Write styles for mobile, then enhance for desktop
- **BEM Methodology**: Use consistent naming conventions

### API Integration

- **RTK Query**: Use for all API calls
- **Type Generation**: Generate types from API schemas
- **Error Handling**: Consistent error handling across the app
- **Caching**: Intelligent caching strategies

## 🔧 Troubleshooting

### Common Issues

**Build Errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment Issues**

- Verify `.env` file is properly configured
- Check API endpoint connectivity
- Ensure all required environment variables are set

**SCSS Compilation**

```bash
npm run generate:scss
```

### Creating a new Git Workflow

1. Create a specific branch for the changes

```
git checkout -b "A-ticketnumberhere"
```

2. After creating changes on the current branch workflow:
   a. Push the changes to the branch:
   ```
   git add .
   ```
   ```
   git commit -m "commit type here e.g. 'chore': commit message here"
   ```
   ```
   git push
   ```
3. Compare changes in the current branch and the "dev" branch in github website
4. Review changes, proceed to approval of changes, and create a pull request
5. Upon approve, merge it to dev branch and close the pull request
6. Delete the current branch workflow
7. Merge the dev branch to main branch upon confirmed releases

### Development Tips

- Use React DevTools for debugging
- Enable Redux DevTools for state inspection
- Check browser network tab for API issues
- Use TypeScript strict mode for better type checking

---

**Built with ❤️ by the MIS Team**

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
