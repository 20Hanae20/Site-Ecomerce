import React, { useState } from 'react';
import { HelpCircle, Send, MessageSquare, ShieldCheck, Tag, ShoppingBag, Clock } from 'lucide-react';

const ClientSupport = () => {
    const [faqOpen, setFaqOpen] = useState({});
    const [tickets, setTickets] = useState([
        { id: 'TKT-8902', subject: 'Délai de livraison pour Santal Royal', category: 'Livraison', status: 'En cours', date: '04/06/2026', messages: 2 },
        { id: 'TKT-7612', subject: 'Demande de retour parfum Oud Wood', category: 'Retours', status: 'Résolu', date: '28/05/2026', messages: 4 }
    ]);
    const [newTicket, setNewTicket] = useState({ subject: '', category: 'Autre', message: '' });
    const [formSuccess, setFormSuccess] = useState('');

    const faqs = [
        { q: "Quels sont vos délais de livraison B2B ?", a: "Pour toute commande standard, nos délais de livraison varient de 2 à 4 jours ouvrés en France métropolitaine. Pour les livraisons Enterprise en volume, comptez 5 à 7 jours.", cat: "Livraison" },
        { q: "Comment fonctionne le moteur de recommandations olfactives IA ?", a: "Notre algorithme SVD analyse vos préférences notées lors du Quiz Parfum ainsi que l'historique de vos consultations. Nous calculons un pourcentage d'affinité pour vous guider vers la fragrance parfaite.", cat: "Algorithme" },
        { q: "Quelle est votre politique concernant les retours ?", a: "Vous disposez de 14 jours à compter de la réception de vos flacons pour effectuer une demande de retour depuis votre espace client. Les flacons doivent être scellés et renvoyés dans leur écrin d'origine.", cat: "Retours" },
        { q: "Comment sont sécurisées nos transactions Stripe ?", a: "Toutes les transactions sont cryptées et traitées via la passerelle sécurisée de Stripe. Nous ne stockons aucune information bancaire sur nos serveurs.", cat: "Paiement" }
    ];

    const toggleFaq = (idx) => {
        setFaqOpen({ ...faqOpen, [idx]: !faqOpen[idx] });
    };

    const handleCreateTicket = (e) => {
        e.preventDefault();
        if (!newTicket.subject || !newTicket.message) return;

        const ticket = {
            id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
            subject: newTicket.subject,
            category: newTicket.category,
            status: 'Nouveau',
            date: new Date().toLocaleDateString('fr-FR'),
            messages: 1
        };

        setTickets([ticket, ...tickets]);
        setNewTicket({ subject: '', category: 'Autre', message: '' });
        setFormSuccess('Votre ticket a été créé avec succès ! Un conseiller vous répondra sous 24h.');
        setTimeout(() => setFormSuccess(''), 5000);
    };

    return (
        <div className="client-support-wrapper" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            {/* FAQ and Ticket List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Accordion FAQ */}
                <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <HelpCircle size={20} className="gold-text" /> Questions Fréquentes (FAQ)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {faqs.map((faq, idx) => (
                            <div key={idx} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}
                                >
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{faq.q}</span>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{faqOpen[idx] ? '−' : '+'}</span>
                                </button>
                                {faqOpen[idx] && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6, paddingLeft: '0.25rem' }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket history */}
                <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <MessageSquare size={20} /> Historique de mes échanges
                    </h3>
                    {tickets.length > 0 ? (
                        <div className="table-responsive">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Sujet</th>
                                        <th>Catégorie</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((t) => (
                                        <tr key={t.id}>
                                            <td><code style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', background: 'var(--bg-alt)', borderRadius: '4px' }}>{t.id}</code></td>
                                            <td><strong>{t.subject}</strong></td>
                                            <td>{t.category}</td>
                                            <td>
                                                <span className={`badge ${t.status === 'Résolu' ? 'badge-success' : t.status === 'En cours' ? 'badge-warning' : 'badge-primary'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td>{t.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Aucun ticket en cours de traitement.</p>
                    )}
                </div>
            </div>

            {/* Create Ticket Form */}
            <aside>
                <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px', position: 'sticky', top: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Send size={18} /> Créer un nouveau ticket
                    </h3>

                    {formSuccess && (
                        <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '8px' }}>
                            {formSuccess}
                        </div>
                    )}

                    <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label>Sujet de votre demande</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="ex: Colis non reçu..."
                                value={newTicket.subject}
                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Catégorie</label>
                            <select
                                className="form-input"
                                value={newTicket.category}
                                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                            >
                                <option value="Livraison">Livraison</option>
                                <option value="Retours">Retours / Annulation</option>
                                <option value="Facturation">Facturation / Stripe</option>
                                <option value="IA / Recommendations">IA & Recommandations</option>
                                <option value="Autre">Autre demande</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description détaillée</label>
                            <textarea
                                className="form-input"
                                placeholder="Expliquez-nous en détail votre demande..."
                                rows="5"
                                value={newTicket.message}
                                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                            <Send size={14} /> Envoyer la demande
                        </button>
                    </form>
                </div>
            </aside>
        </div>
    );
};

export default ClientSupport;
