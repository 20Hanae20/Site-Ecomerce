import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const DummyComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to /login when there is no token', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/protected" element={<ProtectedRoute component={DummyComponent} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
