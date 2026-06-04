import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Shield, ShieldAlert, ShieldCheck, UserPlus, Users, Ban, Unlock, RefreshCw } from 'lucide-react';

const TenantTeam = () => {
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchTeam = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/users');
            // Filter users who are part of the administrative team or roles
            const allUsers = response.data.data || [];
            
            // Map or filter to show administrative team members and a few test user roles
            const teamMembers = allUsers.map(user => {
                // Ensure there are some administrative roles represented for the merchant view
                let updatedRole = user.role;
                if (user.id === currentUser.id) {
                    updatedRole = 'owner';
                }
                return { ...user, role: updatedRole };
            });

            setTeam(teamMembers);
        } catch (err) {
            console.error("Failed to fetch team members", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser.id]);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const handleUpdateRole = async (userId, newRole) => {
        if (userId === currentUser.id) {
            alert("Vous ne pouvez pas modifier votre propre rôle de propriétaire.");
            return;
        }
        if (!window.confirm(`Confirmer la modification du rôle vers : ${getRoleLabel(newRole)} ?`)) return;

        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            setTeam(team.map(member => member.id === userId ? { ...member, role: newRole } : member));
            setMessage({ text: "Rôle de l'employé mis à jour avec succès.", type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Error updating member role", err);
            setMessage({ text: "Erreur d'autorisation pour modifier le rôle.", type: 'error' });
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (userId === currentUser.id) {
            alert("Vous ne pouvez pas désactiver votre propre compte.");
            return;
        }
        const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
        try {
            await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
            setTeam(team.map(member => member.id === userId ? { ...member, status: nextStatus } : member));
            setMessage({ text: `Accès collaborateur ${nextStatus === 'blocked' ? 'suspendu' : 'activé'} !`, type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err) {
            console.error("Error toggling member status", err);
            setMessage({ text: "Erreur lors du changement d'accès.", type: 'error' });
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            'owner': 'Propriétaire',
            'admin': 'Administrateur',
            'gestionnaire': 'Gestionnaire stock',
            'moderateur': 'Modérateur avis',
            'user': 'Invité / Client'
        };
        return labels[role] || role;
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'owner': return { background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
            case 'admin': return { background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' };
            case 'gestionnaire': return { background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe' };
            case 'moderateur': return { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' };
            default: return { background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
        }
    };

    return (
        <div className="tenant-team-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Gérez les accès et les permissions de vos collaborateurs sur ce tenant.</p>
                <button className="btn btn-secondary" onClick={fetchTeam} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} /> Rafraîchir
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                    {message.text}
                </div>
            )}

            {isLoading ? (
                <div className="analytics-loader"><div className="loader-spinner" /><p>Recrutement de l'équipe...</p></div>
            ) : (
                <div className="glass-premium" style={{ borderRadius: '20px', padding: '1rem', background: '#fff', border: '1px solid var(--border-light)' }}>
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Collaborateur</th>
                                    <th>Email</th>
                                    <th>Rôle & Autorisations</th>
                                    <th>Statut</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.map(member => (
                                    <tr key={member.id} style={{ opacity: member.status === 'blocked' ? 0.6 : 1 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-alt)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                    {member.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{member.name} {member.id === currentUser.id && "(Vous)"}</span>
                                            </div>
                                        </td>
                                        <td>{member.email}</td>
                                        <td>
                                            <span style={{ 
                                                display: 'inline-block',
                                                padding: '0.25rem 0.6rem', 
                                                borderRadius: '20px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700,
                                                ...getRoleBadgeStyle(member.role)
                                            }}>
                                                {getRoleLabel(member.role)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                {member.status === 'active' ? 'Actif' : 'Suspendu'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                {member.role !== 'owner' && (
                                                    <>
                                                        <select
                                                            className="filter-select"
                                                            value={member.role}
                                                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                                            style={{ width: '150px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                        >
                                                            <option value="user">Collaborateur standard</option>
                                                            <option value="moderateur">Modérateur avis</option>
                                                            <option value="gestionnaire">Gestionnaire de stock</option>
                                                            <option value="admin">Administrateur</option>
                                                        </select>
                                                        <button 
                                                            onClick={() => handleToggleStatus(member.id, member.status)}
                                                            className={`btn btn-sm ${member.status === 'active' ? 'btn-secondary text-danger' : 'btn-primary'}`}
                                                            style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                        >
                                                            {member.status === 'active' ? <Ban size={12} /> : <Unlock size={12} />}
                                                            {member.status === 'active' ? 'Bloquer' : 'Activer'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantTeam;
