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
    const [user] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });
    const [tenantBrand, setTenantBrand] = useState({
        name: 'SITE PARFUM',
        logo: null,
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

        if (!user || !token) {
            navigate('/login');
            return;
        }

        const isStaff = ['admin', 'super_admin', 'moderateur', 'gestionnaire'].includes(user.role);

        if (!isStaff) {
            navigate('/');
            return;
        }

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
    }, [navigate, user]);

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
                :root {
                    --admin-bg-base: #f8fafc;
                    --admin-sidebar-bg: #1e293b;
                    --admin-cta-navy: #1e40af;
                    --admin-cta-hover: #1d4ed8;
                    --admin-text-primary: #0f172a;
                    --admin-text-secondary: #64748b;
                    --admin-sidebar-text: #e2e8f0;
                    --admin-sidebar-hover: rgba(255, 255, 255, 0.1);
                    --admin-border: #e2e8f0;
                    --admin-success: #10b981;
                    --admin-warning: #f59e0b;
                    --admin-danger: #ef4444;
                }

                .admin-shell-premium {
                    display: flex;
                    min-height: 100vh;
                    background: var(--admin-bg-base);
                    color: var(--admin-text-primary);
                }

                .admin-sidebar-premium {
                    width: 280px;
                    background: var(--admin-sidebar-bg);
                    color: var(--admin-sidebar-text);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    z-index: 100;
                    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
                }

                .admin-brand-premium {
                    padding: 2rem 1.5rem;
                    text-align: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .brand-link-luxury { text-decoration: none; display: flex; flex-direction: column; align-items: center; }
                .tenant-logo-premium {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    object-fit: contain;
                    margin-bottom: 0.75rem;
                    background: #fff;
                    padding: 4px;
                }
                .brand-link-luxury h2 {
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    font-size: 1.25rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .tenant-brand-name {
                    margin-top: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--admin-sidebar-text);
                    opacity: 0.8;
                }

                .role-badge-premium {
                    display: inline-block;
                    font-size: 0.65rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    padding: 0.3rem 0.8rem;
                    border-radius: 4px;
                    margin-top: 0.75rem;
                }

                .admin-nav-luxury {
                    flex: 1;
                    padding: 1.5rem 1rem;
                    overflow-y: auto;
                }

                .admin-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    color: var(--admin-sidebar-text);
                    text-decoration: none;
                    border-radius: 6px;
                    margin-bottom: 0.25rem;
                    transition: all 0.2s ease;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .admin-nav-item:hover, .admin-nav-item.active {
                    background: var(--admin-sidebar-hover);
                    color: #fff;
                }

                .admin-nav-item.active {
                    background: var(--admin-cta-navy);
                    color: #fff;
                    border-left: 3px solid #60a5fa;
                }

                .icon-wrapper { opacity: 0.8; }
                .admin-nav-item:hover .icon-wrapper, .admin-nav-item.active .icon-wrapper { opacity: 1; }

                .nav-divider {
                    height: 1px;
                    background: rgba(255,255,255,0.05);
                    margin: 1.5rem 0;
                }

                .return-site { margin-top: auto; }

                .admin-sidebar-footer {
                    padding: 1.5rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }

                .admin-mini-user {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }

                .admin-avatar {
                    width: 36px;
                    height: 36px;
                    background: var(--admin-cta-navy);
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }
                
                .admin-user-details .name {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .admin-logout-btn {
                    width: 100%;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 0.6rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                
                .admin-logout-btn:hover {
                    background: #ef4444;
                    color: #fff;
                }

                .admin-main-premium {
                    flex: 1;
                    margin-left: 280px;
                    padding: 2rem 3rem;
                }

                .admin-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 2rem;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid var(--admin-border);
                    margin-bottom: 2rem;
                }

                .admin-top-bar h2 { font-size: 1.25rem; font-weight: 600; color: var(--admin-text-primary); }

                .system-status {
                    font-size: 0.75rem;
                    background: #dcfce7;
                    color: #166534;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }

                .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
                .pulse { animation: pulse 2s infinite; }

                .gold-text { color: #f59e0b !important; }
                .gold-glow-icon { color: #f59e0b; }
                
                .gold-border-nav {
                    background: rgba(245, 158, 11, 0.1) !important;
                    color: #f59e0b !important;
                }

                .btn-master-hub {
                    background: var(--admin-cta-navy);
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-right: 1rem;
                    transition: all 0.2s;
                }

                .btn-master-hub:hover {
                    background: var(--admin-cta-hover);
                }

                .full-control-diagnostic-overlay {
                    display: flex;
                    gap: 2rem;
                    background: #fff8f1;
                    border: 1px solid #fed7aa;
                    color: #9a3412;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    margin-bottom: 2rem;
                    font-family: monospace;
                    font-size: 0.8rem;
                }

                .diag-label { opacity: 0.8; }
                .diag-value { font-weight: 700; }

                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                @media (max-width: 1024px) {
                    .admin-sidebar-premium { width: 80px; }
                    .admin-nav-item .label, .admin-user-details, .role-badge-premium { display: none; }
                    .admin-main-premium { margin-left: 80px; padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
