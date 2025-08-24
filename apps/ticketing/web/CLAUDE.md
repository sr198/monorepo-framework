# Ticketing Web App

React-based frontend for the Workalaya Ticketing System with modern tooling and AI integration.

## 🎯 Purpose

This is the main user interface for the ticketing system, providing:

- **Dashboard** for ticket overview and metrics
- **Ticket Management** for creating, updating, and tracking tickets
- **AI Insights** dashboard showing ML-powered analytics
- **Real-time Updates** via websockets and server-sent events

## 🛠️ Technology Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Zustand** for lightweight state management
- **React Router** for client-side routing
- **React Query** (to be added) for server state management

## 📁 Project Structure

```
src/
├── app/                    # Main application component
├── components/             # Reusable UI components
├── pages/                  # Page components
├── hooks/                  # Custom React hooks
├── services/              # API service layer
├── stores/                # Zustand stores
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── assets/                # Static assets
```

## 🚀 Development

### Running the App

```bash
# Development server (http://localhost:4200)
pnpm nx serve ticketing-web

# Build for production
pnpm nx build ticketing-web

# Run tests
pnpm nx test ticketing-web

# Run E2E tests
pnpm nx e2e ticketing-web-e2e
```

### Environment Variables

Create `.env.local` in this directory:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_AI_API_URL=http://localhost:8000
```

## 🧩 Key Components

### App Router Structure

- `/` - Dashboard with ticket overview and quick actions
- `/tickets` - Main ticket management interface
- `/tickets/:id` - Individual ticket details and updates
- `/ai` - AI insights and analytics dashboard
- `/settings` - Application configuration

### State Management

Using **Zustand** for simple, TypeScript-friendly state:

```typescript
// stores/ticketStore.ts
interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  fetchTickets: () => Promise<void>;
  createTicket: (ticket: CreateTicketRequest) => Promise<void>;
}
```

### API Integration

All backend communication goes through the API Gateway:

```typescript
// services/apiClient.ts
const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000,
});
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes

Use utility classes with consistent patterns:

```jsx
// Buttons
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">

// Cards
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

// Layout
<div className="container mx-auto px-4 max-w-7xl">
```

### Color Palette

- **Primary**: Blue gradient (#667eea to #764ba2)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Gray Scale**: Tailwind gray scale

## 📡 Real-time Features

### WebSocket Connection

```typescript
// hooks/useWebSocket.ts
const useWebSocket = (url: string) => {
  // WebSocket connection for real-time ticket updates
};
```

### Server-Sent Events

```typescript
// hooks/useSSE.ts
const useSSE = (endpoint: string) => {
  // SSE for real-time notifications
};
```

## 🧪 Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// components/__tests__/TicketCard.test.tsx
import { render, screen } from '@testing-library/react'
import TicketCard from '../TicketCard'

test('renders ticket information', () => {
  const ticket = mockTicket()
  render(<TicketCard ticket={ticket} />)
  expect(screen.getByText(ticket.title)).toBeInTheDocument()
})
```

### E2E Tests (Playwright)

```typescript
// e2e/ticket-flow.spec.ts
test('create and manage ticket', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid=create-ticket]');
  // ... test flow
});
```

## 🔌 API Integration

### REST Endpoints

All calls go through API Gateway (`http://localhost:3001`):

```typescript
// Tickets
GET /api/v1/tickets              # List tickets
POST /api/v1/tickets             # Create ticket
GET /api/v1/tickets/:id          # Get ticket
PUT /api/v1/tickets/:id          # Update ticket

// AI Integration
POST /api/v1/ai/analyze-ticket   # AI ticket analysis
GET /api/v1/ai/insights         # AI insights dashboard
```

### Error Handling

```typescript
const handleApiError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Handle authentication
  }
  // ... other error handling
};
```

## 🎛️ Configuration

### Vite Configuration

The app uses Vite with the following key configurations:

- TypeScript support
- Path aliases (`@/` for `src/`)
- Environment variables
- Hot module replacement

### Build Optimization

- **Tree shaking** for minimal bundle size
- **Code splitting** for better loading
- **Asset optimization** for images and fonts

## 🚀 Deployment

### Development

```bash
pnpm nx serve ticketing-web
```

### Production Build

```bash
pnpm nx build ticketing-web
# Outputs to dist/apps/ticketing/web/
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm nx build ticketing-web
EXPOSE 4200
CMD ["pnpm", "nx", "serve", "ticketing-web", "--host", "0.0.0.0"]
```

## 🐛 Debugging

### Development Tools

- **React DevTools** for component inspection
- **Vite DevTools** for build analysis
- **Network tab** for API monitoring
- **Console** for runtime debugging

### Common Issues

1. **Hot reload not working**: Check Vite config and port conflicts
2. **API calls failing**: Verify API Gateway is running
3. **Styling issues**: Check Tailwind compilation

## 📋 TODOs

- [ ] Implement React Query for better server state management
- [ ] Add dark mode support with Tailwind
- [ ] Set up component library with Storybook
- [ ] Implement proper error boundaries
- [ ] Add internationalization (i18n) support
- [ ] Set up performance monitoring

## 🔗 Related Services

- **API Gateway**: `services/api-gateway/` - Main backend API
- **AI Gateway**: `apps/ai-service/gateway/` - AI/ML services
- **Shared UI**: `libs/shared/ui/` - Component library (to be implemented)

## 📞 Component Support

For React/frontend specific questions:

1. Check this CLAUDE.md file
2. Review component patterns in existing code
3. Refer to Vite and React documentation
4. Check shared UI library patterns
