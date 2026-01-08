# Sello Frontend

A modern car marketplace frontend built with React, Vite, and Tailwind CSS.

## Features

- 🚗 Car listings and search
- 👤 User authentication (Email & Google OAuth)
- 💬 Real-time chat functionality
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 📊 Admin dashboard
- 🔔 Notifications
- 📝 Blog management
- 💳 Subscription management

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── redux/         # Redux store and slices
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── utils/         # Utility functions
└── assets/        # Static assets
```

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

The project is configured for deployment on Render. See `render.yml` for configuration.

For other platforms:
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables on your hosting platform

## License

ISC
