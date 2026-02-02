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
        <div className="app-shell-luxury">
            {/* Background Effects */}
            <div className="bg-orb orb-primary"></div>
            <div className="bg-orb orb-secondary"></div>

            <nav className="navbar-premium-luxury glass-premium">
                <div className="container-premium navbar-flex-luxury">
                    <Link to="/" className="brand-logo-luxury font-serif">
                        <span className="gradient-text-gold">SITE PARFUM</span>
                        <span className="brand-tagline">SILLAGE DE LUXE</span>
                    </Link>

                    <div className="nav-navigation-luxury">
                        <Link to="/" className="nav-link-luxury">ACCUEIL</Link>
                        <Link to="/perfumes" className="nav-link-luxury">COLLECTIONS</Link>
                        <Link to="/about" className="nav-link-luxury">LA MAISON</Link>
                        <Link to="/contact" className="nav-link-luxury">CONCIERGERIE</Link>
                    </div>

                    <div className="nav-actions-luxury">
                        <div className="search-trigger-luxury">
                            <Search size={20} />
                        </div>

                        <Link to="/cart" className="luxury-action-icon" title="Votre Panier">
                            <ShoppingBag size={22} />
                        </Link>

                        {token && user ? (
                            <div className="user-suite-luxury">
                                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'gestionnaire') && (
                                    <Link to="/admin/dashboard" className="luxury-action-icon gold-glow-nav" title="Contrôle Total">
                                        <ShieldAlert size={20} />
                                        <span className="admin-status-dot pulse"></span>
                                    </Link>
                                )}
                                <Link to="/recommendations" className="luxury-action-icon" title="Mes recommandations"><Lightbulb size={20} /></Link>
                                <Link to="/orders" className="luxury-action-icon" title="Mes Commandes"><Package size={20} /></Link>
                                <Link to="/profile" className="luxury-action-icon user-profile-link" title="Mon Profil">
                                    <User size={20} />
                                    <span className="user-name-hint">{user.name?.split(' ')[0]}</span>
                                </Link>
                                <button onClick={handleLogout} className="btn-logout-luxury" title="Déconnexion">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="auth-suite-luxury">
                                <Link to="/login" className="link-login-luxury">CONNEXION</Link>
                                <Link to="/register" className="btn-premium btn-nav-register">REJOINDRE</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content-luxury animate-fade-in">
                <Outlet />
            </main>

            <footer className="footer-premium-luxury">
                <div className="container-premium footer-grid-luxury">
                    <div className="footer-brand-luxury">
                        <h2 className="font-serif gradient-text-gold">SITE PARFUM</h2>
                        <p className="footer-desc">Éveillez vos sens avec nos fragrances d'exception. Une signature olfactive unique pour des moments inoubliables.</p>
                        <div className="footer-socials">
                            <Instagram size={18} />
                            <Facebook size={18} />
                            <Twitter size={18} />
                        </div>
                    </div>

                    <div className="footer-links-luxury">
                        <h4 className="font-serif">COLLECTIONS</h4>
                        <Link to="/perfumes">Nouveautés</Link>
                        <Link to="/perfumes?category=femme">Pour Elle</Link>
                        <Link to="/perfumes?category=homme">Pour Lui</Link>
                        <Link to="/recommendations">Sur Mesure</Link>
                    </div>

                    <div className="footer-links-luxury">
                        <h4 className="font-serif">SERVICES</h4>
                        <Link to="/contact">Conciergerie</Link>
                        <Link to="/faq">F.A.Q</Link>
                        <Link to="/orders">Suivi de Commande</Link>
                        <Link to="/legal">Mentions Légales</Link>
                    </div>

                    <div className="footer-contact-luxury">
                        <h4 className="font-serif">COMMUNAUTÉ</h4>
                        <div className="contact-item-footer">
                            <MapPin size={16} className="gold-icon" />
                            <span>Avenue Aboubakeer AL Sedik, CASABLANCA</span>
                        </div>
                        <p className="newsletter-hint">Inscrivez-vous pour recevoir les secrets de notre Maison.</p>
                        <div className="footer-newsletter-mini">
                            <input type="email" placeholder="Votre courriel..." />
                            <button>→</button>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-luxury">
                    <p className="copyright-luxury">&copy; 2026 SITE PARFUM. TOUS DROITS RÉSERVÉS. L'IMMORTALITÉ D'UN SILLAGE.</p>
                </div>
            </footer>

            <style>{`
                .app-shell-luxury { min-height: 100vh; display: flex; flex-direction: column; }
                
                .navbar-premium-luxury {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    padding: 1.25rem 0;
                    backdrop-filter: blur(20px);
                }

                .navbar-flex-luxury { display: flex; justify-content: space-between; align-items: center; }

                .brand-logo-luxury { text-decoration: none; display: flex; flex-direction: column; }
                .brand-logo-luxury .gradient-text-gold { font-size: 1.5rem; letter-spacing: 5px; font-weight: 800; line-height: 1; }
                .brand-tagline { font-size: 0.55rem; color: var(--primary); letter-spacing: 4px; margin-top: 0.4rem; opacity: 0.6; font-weight: 600; }

                .nav-navigation-luxury { display: flex; gap: 3rem; }
                .nav-link-luxury { color: #fff; text-decoration: none; font-size: 0.75rem; font-weight: 600; letter-spacing: 2px; opacity: 0.6; transition: 0.3s; }
                .nav-link-luxury:hover { opacity: 1; color: var(--primary); }

                .nav-actions-luxury { display: flex; align-items: center; gap: 2rem; }
                .search-trigger-luxury { opacity: 0.4; cursor: pointer; transition: 0.3s; }
                .search-trigger-luxury:hover { opacity: 1; color: var(--primary); }
                .luxury-action-icon { color: #fff; opacity: 0.6; transition: 0.3s; text-decoration: none; }
                .luxury-action-icon:hover { opacity: 1; color: var(--primary); transform: translateY(-2px); }

                .user-suite-luxury { display: flex; align-items: center; gap: 1.5rem; padding-left: 1.5rem; border-left: 1px solid var(--glass-border); }
                .user-profile-link { display: flex; align-items: center; gap: 0.75rem; }
                .user-name-hint { font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; }

                .btn-logout-luxury { background: none; border: none; color: #ef4444; opacity: 0.4; cursor: pointer; transition: 0.3s; }
                .btn-logout-luxury:hover { opacity: 1; transform: scale(1.1); }

                .auth-suite-luxury { display: flex; align-items: center; gap: 2rem; }
                .link-login-luxury { color: #fff; text-decoration: none; font-size: 0.75rem; font-weight: 700; letter-spacing: 1.5px; opacity: 0.6; }
                .link-login-luxury:hover { opacity: 1; color: var(--primary); }
                .btn-nav-register { padding: 0.7rem 1.5rem; font-size: 0.7rem; }

                .gold-glow-nav { color: var(--primary) !important; opacity: 1 !important; position: relative; }
                .admin-status-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 6px;
                    height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                }
                .pulse { animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                .main-content-luxury { flex: 1; }

                .footer-premium-luxury { background: #000; padding: 8rem 0 4rem; border-top: 1px solid var(--glass-border); }
                .footer-grid-luxury { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap: 4rem; margin-bottom: 6rem; }
                
                .footer-brand-luxury .footer-desc { font-size: 0.9rem; opacity: 0.5; margin: 2rem 0; line-height: 1.8; max-width: 300px; }
                .footer-socials { display: flex; gap: 1.5rem; opacity: 0.4; }
                
                .footer-links-luxury h4, .footer-contact-luxury h4 { font-size: 0.9rem; letter-spacing: 3px; color: var(--primary); margin-bottom: 2.5rem; }
                .footer-links-luxury a { display: block; color: #fff; text-decoration: none; font-size: 0.85rem; margin-bottom: 1.2rem; opacity: 0.4; transition: 0.3s; }
                .footer-links-luxury a:hover { opacity: 1; color: var(--primary); padding-left: 8px; }

                .contact-item-footer { display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; opacity: 0.5; margin-bottom: 2rem; }
                .newsletter-hint { font-size: 0.75rem; opacity: 0.3; font-style: italic; margin-bottom: 1.5rem; }
                .footer-newsletter-mini { display: flex; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; }
                .footer-newsletter-mini input { background: none; border: none; color: #fff; font-size: 0.85rem; flex: 1; outline: none; }
                .footer-newsletter-mini button { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 1.2rem; }

                .footer-bottom-luxury { text-align: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 4rem; }
                .copyright-luxury { font-size: 0.65rem; letter-spacing: 4px; opacity: 0.2; }

                @media (max-width: 1024px) {
                    .nav-navigation-luxury { display: none; }
                    .footer-grid-luxury { grid-template-columns: 1fr 1fr; gap: 4rem; }
                }
                @media (max-width: 640px) {
                    .footer-grid-luxury { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Layout;
