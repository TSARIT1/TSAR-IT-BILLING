import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './component/ProtectedRoute';

function renderProtectedRoute({ token, userRole, requiredRole } = {}) {
  localStorage.clear();
  if (token) localStorage.setItem('token', token);
  if (userRole) localStorage.setItem('userRole', userRole);

  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/protected"
          element={(
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Protected content</div>
            </ProtectedRoute>
          )}
        />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(() => localStorage.clear());

test('redirects an unauthenticated visitor to login', () => {
  renderProtectedRoute();
  expect(screen.getByText('Login page')).toBeInTheDocument();
});

test('allows a super-admin role returned by login to access protected administration', () => {
  renderProtectedRoute({ token: 'test-token', userRole: 'SUPER_ADMIN', requiredRole: 'SUPER_ADMIN' });
  expect(screen.getByText('Protected content')).toBeInTheDocument();
});
