import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <nav className="navbar">
          <div className="logo">Site Parfum</div>
          <div className="nav-links">
            <Link to="/">Accueil</Link>
            <Link to="/about">À propos</Link>
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 Site Parfum. Tous droits réservés.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
