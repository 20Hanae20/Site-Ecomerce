import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, Check, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TenantBilling = () => {
    const { tenant, subscription } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const plans = [
        {
            name: 'Growth',
            price: '49 €/mois',
            desc: 'Parfait pour les maisons de parfums en pleine croissance.',
            features: [
                'Jusqu\'à 1,000 clients',
                'Analyses de ventes standards',
                '1 utilisateur administrateur',
                'Support par email sous 48h'
            ]
        },
        {
            name: 'Enterprise',
            price: '199 €/mois',
            desc: 'Pour les marques de luxe B2B établies nécessitant des performances ML.',
            features: [
                'Clients illimités',
                'Recommandations olfactives IA (SVD)',
                'Segmentation IA (K-Means)',
                'Utilisateurs et équipe illimités',
                'Support prioritaire 24/7'
            ]
        }
    ];

    const handleUpgrade = async (planName) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/billing/checkout', {
                plan: planName.toLowerCase(),
                tenant_id: tenant?.id
            });

            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else if (response.data.session_id) {
                const stripe = window.Stripe(process.env.REACT_APP_STRIPE_KEY);
                stripe.redirectToCheckout({ sessionId: response.data.session_id });
            }
        } catch (err) {
            console.error("Upgrade checkout failed", err);
            setError(err.response?.data?.message || "Impossible d'initier le paiement Stripe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tenant-billing-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Active Subscription Banner */}
            <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Abonnement Actif</div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'capitalize', marginTop: '0.25rem' }}>Plan {subscription?.plan || 'Free'}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            Votre compte est actif. Le renouvellement se fera automatiquement.
                        </p>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '1rem 1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prochaine facture</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
                            {subscription?.plan === 'enterprise' ? '199.00 €' : subscription?.plan === 'growth' ? '49.00 €' : '0.00 €'}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Plans List */}
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Faire évoluer mon forfait</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {plans.map((p, idx) => {
                        const isCurrent = subscription?.plan?.toLowerCase() === p.name.toLowerCase();
                        return (
                            <div key={idx} className="glass-premium" style={{ background: '#fff', border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-light)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                                {isCurrent && (
                                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        Actuel
                                    </span>
                                )}
                                <div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{p.name}</h4>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>{p.price}</div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{p.desc}</p>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {p.features.map((f, fIdx) => (
                                        <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <Check size={14} style={{ color: '#10b981' }} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} w-full`}
                                    disabled={loading || isCurrent}
                                    onClick={() => handleUpgrade(p.name)}
                                    style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <CreditCard size={16} /> {isCurrent ? 'Forfait Actif' : 'Mettre à niveau'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Invoices history */}
            <div className="glass-premium" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Historique des factures</h3>
                <div className="table-responsive">
                    <table className="premium-table" style={{ margin: 0 }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-alt)' }}>
                                <th>Facture N°</th>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>INV-2026-001</td>
                                <td>{new Date().toLocaleDateString('fr-FR')}</td>
                                <td>{subscription?.plan === 'enterprise' ? '199.00 €' : '49.00 €'}</td>
                                <td><span className="badge badge-success">Payée</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TenantBilling;
