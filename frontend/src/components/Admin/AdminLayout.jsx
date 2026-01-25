import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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

const AdminLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

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
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="loader">Initialisation du Sillage...</div>;

    const menuItems = [
        { label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard', roles: ['*'] },
        { label: 'Produits', icon: <Package size={20} />, path: '/catalogue', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Ajouter un Produit', icon: <PlusCircle size={20} />, path: '/ajouter', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Catégories', icon: <Layers size={20} />, path: '/admin/categories', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Commandes', icon: <ShoppingBag size={20} />, path: '/admin/orders', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Promotions', icon: <Tag size={20} />, path: '/admin/promotions', roles: ['super_admin', 'admin', 'gestionnaire', 'moderateur'] },
        { label: 'Modération Avis', icon: <MessageSquare size={20} />, path: '/admin/reviews', roles: ['super_admin', 'moderateur'] },
        { label: 'Utilisateurs', icon: <Users size={20} />, path: '/admin/users', roles: ['super_admin', 'moderateur'] },
        { label: 'Paramètres Système', icon: <Settings size={20} />, path: '/admin/settings', roles: ['super_admin', 'moderateur'] },
        { label: 'Logs de sécurité', icon: <ShieldAlert size={20} />, path: '/admin/logs', roles: ['super_admin', 'moderateur'] },
    ];

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes('*') || item.roles.includes(user.role)
    );

    return (
        <div className="admin-dashboard-premium">
            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>

            <aside className="premium-sidebar glass-premium">
                <div className="admin-brand">
                    <Link to="/" className="brand-link">
                        <div className="logo-container">
                            <span className="logo-icon">✨</span>
                            <h2 className="gradient-text-gold">Site Parfum</h2>
                        </div>
                    </Link>
                    <div className="role-tag">
                        <span className="dot pulse"></span>
                        {user.role.replace('_', ' ')}
                    </div>
                </div>

                <nav className="premium-nav">
                    {filteredMenu.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                    <Link to="/" className="nav-item return-link">
                        <span className="nav-icon"><Home size={20} /></span>
                        <span className="nav-label">Retour au Site</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-mini-profile">
                        <div className="avatar">{user.name[0]}</div>
                        <div className="info">
                            <span className="name">{user.name}</span>
                            <span className="email">{user.email}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="premium-logout">
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main className="premium-main">
                {children}
            </main>
        </div>
    )
}

export default AdminLayout;
