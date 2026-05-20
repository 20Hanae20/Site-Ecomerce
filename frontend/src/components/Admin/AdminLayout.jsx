import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    Layers,
    ShoppingBag,
    Tag,
    MessageSquare,
    Users,
    Settings,
    ShieldAlert,
    LogOut,
    Home
} from 'lucide-react';
import api from '../../services/api';

const AdminLayout = () => {
    const [user, setUser] = useState(null);
    const [tenantBrand, setTenantBrand] = useState({
        name: 'SITE PARFUM',
        logo: null,
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const isStaff = ['admin', 'super_admin', 'moderateur', 'gestionnaire'].includes(parsedUser.role);

        if (!isStaff) {
            navigate('/');
            return;
        }

        setUser(parsedUser);

        api.get('/tenant/current')
            .then(({ data }) => {
                setTenantBrand({
                    name: data?.name || 'SITE PARFUM',
                    logo: data?.theme?.logo || null,
                });
            })
            .catch(() => {
                setTenantBrand({
                    name: 'SITE PARFUM',
                    logo: null,
                });
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="loader-premium">Initialisation du Sillage...</div>;

    const menuItems = [
        { label: 'Centre de Contrôle', icon: <ShieldAlert size={20} />, path: '/admin/dashboard', roles: ['super_admin', 'admin'] },
        { label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard', roles: ['*'] },
        { label: 'Produits', icon: <Package size={20} />, path: '/perfumes', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Catégories', icon: <Layers size={20} />, path: '/admin/categories', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Commandes', icon: <ShoppingBag size={20} />, path: '/admin/orders', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Promotions', icon: <Tag size={20} />, path: '/admin/promotions', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Modération Avis', icon: <MessageSquare size={20} />, path: '/admin/reviews', roles: ['super_admin', 'admin', 'moderateur'] },
        { label: 'Utilisateurs', icon: <Users size={20} />, path: '/admin/users', roles: ['super_admin', 'admin'] },
        { label: 'Paramètres Scellés', icon: <Settings size={20} />, path: '/admin/settings', roles: ['super_admin', 'admin'] },
        { label: 'Registres (Logs)', icon: <ShieldAlert size={20} />, path: '/admin/logs', roles: ['super_admin', 'admin'] },
    ];

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes('*') || item.roles.includes(user.role)
    );

    return (
        <div className="admin-shell-premium">
            <aside className="admin-sidebar-premium glass-premium">
                <div className="admin-brand-premium">
                    <Link to="/" className="brand-link-luxury">
                        {tenantBrand.logo && (
                            <img
                                src={tenantBrand.logo}
                                alt={`${tenantBrand.name} logo`}
                                className="tenant-logo-premium"
                            />
                        )}
                        <h2 className="font-serif gradient-text-gold">S.P ADMIN</h2>
                        <p className="tenant-brand-name">{tenantBrand.name}</p>
                    </Link>
                    <div className="role-badge-premium">
                        {user.role}
                    </div>
                </div>

                <nav className="admin-nav-luxury">
                    {filteredMenu.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="icon-wrapper">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </Link>
                    ))}

                    {(user.role === 'super_admin' || user.role === 'admin') && (
                        <div className="admin-special-access">
                            <div className="nav-divider"></div>
                            <Link to="/admin/settings" className="admin-nav-item gold-border-nav">
                                <span className="icon-wrapper gold-glow-icon"><Settings size={20} /></span>
                                <span className="label font-serif gold-text">MAÎTRISE TOTALE</span>
                            </Link>
                        </div>
                    )}
                    <div className="nav-divider"></div>
                    <Link to="/" className="admin-nav-item return-site">
                        <span className="icon-wrapper"><Home size={20} /></span>
                        <span className="label">Retour au Site</span>
                    </Link>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-mini-user">
                        <div className="admin-avatar">{user.name[0]}</div>
                        <div className="admin-user-details">
                            <span className="name">{user.name}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={18} />
                        DÉCONNEXION
                    </button>
                </div>
            </aside>

            <main className="admin-main-premium">
                <header className="admin-top-bar glass-premium">
                    <div className="top-bar-left">
                        <h2>{menuItems.find(i => i.path === location.pathname)?.label || 'Administration'}</h2>
                    </div>
                    <div className="top-bar-actions">
                        {(user.role === 'super_admin' || user.role === 'admin') && (
                            <Link to="/admin/settings" className="btn-master-hub">
                                <ShieldAlert size={16} /> Hub de Contrôle
                            </Link>
                        )}
                        <span className="system-status"><span className="dot pulse"></span> Système Actif</span>
                    </div>
                </header>

                <div className="admin-page-content animate-fade-in">
                    {(user.role === 'admin' || user.role === 'super_admin') && location.pathname === '/admin/dashboard' && (
                        <div className="full-control-diagnostic-overlay">
                            <div className="diagnostic-line"><span className="diag-label">OVERSIGHT MODE:</span> <span className="diag-value">ENABLED</span></div>
                            <div className="diagnostic-line"><span className="diag-label">SECURITY PROTOCOL:</span> <span className="diag-value">FULL PARITY</span></div>
                        </div>
                    )}
                    <Outlet />
                </div>
            </main>

            <style>{`
                .admin-shell-premium {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg-deep);
                }

                .admin-sidebar-premium {
                    width: 280px;
                    border-right: 1px solid var(--glass-border);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    z-index: 100;
                }

                .admin-brand-premium {
                    padding: 3rem 2rem;
                    text-align: center;
                }

                .brand-link-luxury { text-decoration: none; }
                .tenant-logo-premium {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-bottom: 0.75rem;
                    border: 1px solid var(--glass-border);
                }
                .tenant-brand-name {
                    margin-top: 0.5rem;
                    opacity: 0.65;
                    font-size: 0.7rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                }

                .role-badge-premium {
                    display: inline-block;
                    font-size: 0.6rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    background: var(--glass-glow);
                    color: var(--primary);
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    margin-top: 0.5rem;
                }

                .admin-nav-luxury {
                    flex: 1;
                    padding: 0 1.25rem;
                }

                .admin-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 0.85rem 1.25rem;
                    color: var(--text-secondary);
                    text-decoration: none;
                    border-radius: 8px;
                    margin-bottom: 0.4rem;
                    transition: all 0.3s ease;
                    font-size: 0.85rem;
                }

                .admin-nav-item:hover, .admin-nav-item.active {
                    background: var(--glass-hover);
                    color: #fff;
                }

                .admin-nav-item.active {
                    background: var(--glass-glow);
                    color: var(--primary);
                    border-left: 2px solid var(--primary);
                }

                .icon-wrapper { opacity: 0.7; transition: opacity 0.3s; }
                .admin-nav-item:hover .icon-wrapper, .admin-nav-item.active .icon-wrapper { opacity: 1; }

                .nav-divider {
                    height: 1px;
                    background: var(--glass-border);
                    margin: 1.5rem 0;
                }

                .return-site { margin-top: auto; }

                .admin-sidebar-footer {
                    padding: 2rem;
                    border-top: 1px solid var(--glass-border);
                }

                .admin-mini-user {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .admin-avatar {
                    width: 36px;
                    height: 36px;
                    background: var(--grad-gold);
                    color: #000;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .admin-logout-btn {
                    width: 100%;
                    background: none;
                    border: 1px solid rgba(220, 38, 38, 0.3);
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .admin-main-premium {
                    flex: 1;
                    margin-left: 280px;
                    padding: 2rem;
                }

                .admin-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    margin-bottom: 2.5rem;
                }

                .admin-top-bar h2 { font-size: 1.1rem; letter-spacing: 2px; font-weight: 500; }

                .system-status {
                    font-size: 0.75rem;
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
                .pulse { animation: pulse 2s infinite; }

                .admin-nav-luxury {
                    flex: 1;
                    padding: 0 1.25rem;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: var(--primary) transparent;
                }

                .admin-nav-luxury::-webkit-scrollbar { width: 4px; }
                .admin-nav-luxury::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }

                .gold-text { color: var(--primary) !important; font-weight: 700 !important; }
                .gold-glow-icon { filter: drop-shadow(0 0 5px var(--primary)); opacity: 1 !important; }
                
                .gold-border-nav {
                    border: 1px solid var(--primary) !important;
                    background: rgba(212, 175, 55, 0.05) !important;
                    margin-top: 1rem;
                }

                .btn-master-hub {
                    background: var(--grad-gold);
                    color: #000;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-right: 1.5rem;
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .btn-master-hub:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px var(--primary-glow);
                }

                .full-control-diagnostic-overlay {
                    display: flex;
                    gap: 2rem;
                    background: rgba(212, 175, 55, 0.05);
                    border: 1px solid rgba(212, 175, 55, 0.1);
                    padding: 0.5rem 1.5rem;
                    border-radius: 50px;
                    margin-bottom: 2rem;
                    font-family: monospace;
                    font-size: 0.7rem;
                    letter-spacing: 1px;
                }

                .diag-label { color: rgba(255,255,255,0.4); }
                .diag-value { color: var(--primary); font-weight: 700; }

                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                @media (max-width: 1024px) {
                    .admin-sidebar-premium { width: 80px; }
                    .admin-nav-item .label, .admin-user-details, .role-badge-premium { display: none; }
                    .admin-main-premium { margin-left: 80px; }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
