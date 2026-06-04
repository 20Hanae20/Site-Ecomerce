import React, { useState, useEffect } from 'react';
import { BarChart3, ShoppingCart, Users, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';

const TenantDashboard = () => {
    const { stats, fetchStats, loading } = useTenant();
    const { tenant, subscription } = useAuth();

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="tenant-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Tableau de bord</h1>
                    <p className="dashboard-subtitle">
                        Bienvenue dans votre espace {tenant?.name}
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon revenue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Revenus</div>
                        <div className="kpi-value">{stats?.revenue || '0'} €</div>
                        <div className="kpi-change positive">+12% ce mois</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon products">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Produits</div>
                        <div className="kpi-value">{stats?.products_count || '0'}</div>
                        <div className="kpi-change neutral">{stats?.products_active || '0'} actifs</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon orders">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Commandes</div>
                        <div className="kpi-value">{stats?.orders_count || '0'}</div>
                        <div className="kpi-change neutral">{stats?.orders_pending || '0'} en attente</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon users">
                        <Users size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-label">Clients</div>
                        <div className="kpi-value">{stats?.customers_count || '0'}</div>
                        <div className="kpi-change neutral">{stats?.customers_new || '0'} nouveaux</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Actions rapides</h2>
                <div className="actions-grid">
                    <button className="action-btn">
                        <Plus size={20} />
                        <span>Ajouter un produit</span>
                    </button>
                    <button className="action-btn">
                        <ShoppingCart size={20} />
                        <span>Voir les commandes</span>
                    </button>
                    <button className="action-btn">
                        <Users size={20} />
                        <span>Gérer l'équipe</span>
                    </button>
                    <button className="action-btn">
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </button>
                </div>
            </div>

            {/* Subscription Status */}
            <div className="subscription-widget">
                <h2>Plan actuel</h2>
                <div className="subscription-card">
                    <div className="subscription-info">
                        <div className="subscription-plan">
                            <div className="plan-name">{subscription?.plan || 'Free'}</div>
                            <div className="plan-features">
                                {subscription?.features?.slice(0, 3).map((feature, idx) => (
                                    <span key={idx} className="feature-badge">{feature}</span>
                                ))}
                                {subscription?.features?.length > 3 && (
                                    <span className="feature-badge">+{subscription.features.length - 3}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-secondary">Gérer l'abonnement</button>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="recent-section">
                <h2>Commandes récentes</h2>
                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>N° Commande</th>
                                <th>Client</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#ORD-001</td>
                                <td>Marie Durand</td>
                                <td>245.50 €</td>
                                <td><span className="status-badge pending">En attente</span></td>
                                <td>Aujourd'hui</td>
                            </tr>
                            <tr>
                                <td>#ORD-002</td>
                                <td>Jean Dupont</td>
                                <td>150.00 €</td>
                                <td><span className="status-badge completed">Livrée</span></td>
                                <td>Hier</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .tenant-dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .dashboard-header h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .dashboard-subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }

                /* KPI Cards */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .kpi-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    display: flex;
                    gap: 1.5rem;
                    transition: all 0.3s ease;
                }

                .kpi-card:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }

                .kpi-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0;
                }

                .kpi-icon.revenue {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }

                .kpi-icon.products {
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--primary);
                }

                .kpi-icon.orders {
                    background: rgba(168, 85, 247, 0.1);
                    color: #a855f7;
                }

                .kpi-icon.users {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .kpi-content {
                    flex: 1;
                }

                .kpi-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }

                .kpi-value {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .kpi-change {
                    font-size: 0.8rem;
                    margin-top: 0.5rem;
                }

                .kpi-change.positive {
                    color: #22c55e;
                }

                .kpi-change.negative {
                    color: #ef4444;
                }

                .kpi-change.neutral {
                    color: var(--text-muted);
                }

                /* Quick Actions */
                .quick-actions {
                    margin-top: 1rem;
                }

                .quick-actions h2,
                .subscription-widget h2,
                .recent-section h2 {
                    font-size: 1.3rem;
                    margin-bottom: 1rem;
                }

                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1.5rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .action-btn:hover {
                    background: var(--bg-alt);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                /* Subscription Widget */
                .subscription-widget {
                    margin-top: 2rem;
                }

                .subscription-card {
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-surface) 100%);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .subscription-plan {
                    flex: 1;
                }

                .plan-name {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 0.75rem;
                    text-transform: capitalize;
                }

                .plan-features {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .feature-badge {
                    display: inline-block;
                    padding: 0.4rem 0.8rem;
                    background: var(--bg-surface);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                /* Table */
                .table-container {
                    overflow-x: auto;
                }

                .dashboard-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }

                .dashboard-table thead {
                    background: var(--bg-alt);
                    border-bottom: 1px solid var(--border-light);
                }

                .dashboard-table th {
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .dashboard-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-light);
                    color: var(--text-main);
                }

                .dashboard-table tbody tr:hover {
                    background: var(--bg-alt);
                }

                .status-badge {
                    display: inline-block;
                    padding: 0.4rem 0.8rem;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-badge.pending {
                    background: var(--warning-bg);
                    color: var(--warning);
                }

                .status-badge.completed {
                    background: var(--success-bg);
                    color: var(--success);
                }

                @media (max-width: 768px) {
                    .kpi-grid {
                        grid-template-columns: 1fr;
                    }

                    .subscription-card {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .dashboard-table {
                        font-size: 0.85rem;
                    }

                    .dashboard-table th,
                    .dashboard-table td {
                        padding: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default TenantDashboard;
