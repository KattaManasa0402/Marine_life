import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Mock the AuthContext to provide a default user state
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAuth: () => ({
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    fetchUser: jest.fn(),
  }),
}));

test('renders App component', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
  const appElement = screen.getByRole('banner'); // The header is a banner landmark
  expect(appElement).toBeInTheDocument();
});