import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Package, Lightbulb, LogOut, Search, MapPin, Instagram, Facebook, Twitter, ShieldAlert } from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
    }
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="app-layout">
            <nav className="saas-navbar">
                <div className="container navbar-flex">
                    <Link to="/" className="brand-logo">
                        <span className="brand-icon">❖</span>
                        <span className="brand-text">AURA SaaS</span>
                    </Link>

                    <div className="nav-links">
                        <Link to="/" className="nav-link">Tableau de bord</Link>
                        <Link to="/perfumes" className="nav-link">Catalogue</Link>
                        <Link to="/about" className="nav-link">À Propos</Link>
                        <Link to="/contact" className="nav-link">Support</Link>
                    </div>

                    <div className="nav-actions">
                        <div className="nav-icon-btn" title="Rechercher">
                            <Search size={18} />
                        </div>

                        <Link to="/cart" className="nav-icon-btn" title="Panier">
                            <ShoppingBag size={18} />
                        </Link>

                        {token && user ? (
                            <div className="user-menu">
                                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'gestionnaire') && (
                                    <Link to="/admin/dashboard" className="nav-icon-btn admin-btn" title="Administration">
                                        <ShieldAlert size={18} />
                                    </Link>
                                )}
                                <Link to="/recommendations" className="nav-icon-btn" title="Recommandations">
                                    <Lightbulb size={18} />
                                </Link>
                                <Link to="/orders" className="nav-icon-btn" title="Mes Commandes">
                                    <Package size={18} />
                                </Link>
                                <Link to="/profile" className="user-profile-btn" title="Profil">
                                    <div className="avatar">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name">{user.name?.split(' ')[0]}</span>
                                </Link>
                                <button onClick={handleLogout} className="nav-icon-btn text-danger" title="Se déconnecter">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-text">Connexion</Link>
                                <Link to="/register" className="btn btn-primary">Créer un compte</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content animate-fade-up">
                <Outlet />
            </main>

            <footer className="saas-footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <div className="brand-logo mb-4">
                            <span className="brand-icon">❖</span>
                            <span className="brand-text">AURA SaaS</span>
                        </div>
                        <p className="text-muted">La plateforme B2B nouvelle génération pour la gestion de votre inventaire de parfumerie.</p>
                    </div>

                    <div className="footer-links">
                        <h4>Produit</h4>
                        <Link to="/perfumes">Catalogue Complet</Link>
                        <Link to="/recommendations">Moteur IA</Link>
                        <Link to="/pricing">Tarifs</Link>
                    </div>

                    <div className="footer-links">
                        <h4>Ressources</h4>
                        <Link to="/docs">Documentation</Link>
                        <Link to="/contact">Support Technique</Link>
                        <Link to="/faq">F.A.Q</Link>
                    </div>

                    <div className="footer-links">
                        <h4>Légal</h4>
                        <Link to="/privacy">Confidentialité</Link>
                        <Link to="/terms">CGV & CGU</Link>
                        <div className="social-links mt-4">
                            <Twitter size={18} />
                            <Facebook size={18} />
                            <Instagram size={18} />
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 AURA SaaS. Tous droits réservés.</p>
                </div>
            </footer>

            <style>{`
                /* SaaS Navbar */
                .saas-navbar {
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-light);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    padding: 0.75rem 0;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }

                .navbar-flex {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: var(--text-main);
                }

                .brand-icon {
                    color: var(--primary);
                    font-size: 1.5rem;
                }

                .brand-text {
                    font-weight: 700;
                    font-size: 1.25rem;
                    letter-spacing: -0.5px;
                }

                .nav-links {
                    display: flex;
                    gap: 2rem;
                }

                .nav-link {
                    color: var(--text-muted);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: color var(--transition-fast);
                }

                .nav-link:hover {
                    color: var(--primary);
                }

                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .nav-icon-btn {
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-fast);
                    text-decoration: none;
                }

                .nav-icon-btn:hover {
                    color: var(--primary);
                    transform: translateY(-1px);
                }

                .admin-btn {
                    color: var(--warning);
                }

                .text-danger {
                    color: var(--danger);
                }
                .text-danger:hover {
                    color: #b91c1c;
                }

                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding-left: 1.25rem;
                    border-left: 1px solid var(--border-light);
                }

                .user-profile-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: var(--text-main);
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-md);
                    transition: background var(--transition-fast);
                }

                .user-profile-btn:hover {
                    background: var(--bg-alt);
                }

                .avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary-light);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .user-name {
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .auth-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                /* SaaS Footer */
                .saas-footer {
                    background: var(--bg-surface);
                    border-top: 1px solid var(--border-light);
                    padding: 4rem 0 0 0;
                    margin-top: auto;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 3rem;
                    margin-bottom: 3rem;
                }

                .footer-brand p {
                    font-size: 0.875rem;
                    max-width: 300px;
                    line-height: 1.6;
                }

                .footer-links h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1.25rem;
                    color: var(--text-main);
                }

                .footer-links a {
                    display: block;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.875rem;
                    margin-bottom: 0.75rem;
                    transition: color var(--transition-fast);
                }

                .footer-links a:hover {
                    color: var(--primary);
                }

                .social-links {
                    display: flex;
                    gap: 1rem;
                    color: var(--text-muted);
                }

                .social-links svg {
                    cursor: pointer;
                    transition: color var(--transition-fast);
                }
                .social-links svg:hover {
                    color: var(--primary);
                }

                .footer-bottom {
                    background: var(--bg-alt);
                    padding: 1.5rem 0;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }

                @media (max-width: 768px) {
                    .nav-links { display: none; }
                    .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default Layout;
