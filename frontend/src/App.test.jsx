import { render, screen } from '@testing-library/react';
import App from './App';

describe('App routing', () => {
  it('renders the login page on /login route', () => {
    window.history.pushState({}, 'Login page', '/login');

    render(<App />);

    expect(screen.getByRole('heading', { name: /CONNEXION/i })).toBeInTheDocument();
  });
});
