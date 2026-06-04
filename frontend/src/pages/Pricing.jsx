import React from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    return (
        <div className="container page-container" style={{ padding: '4rem 0' }}>
            <div className="page-header">
                <span className="badge badge-primary mb-4">Tarification B2B</span>
                <h1>Plans flexibles pour les équipes parfumées</h1>
                <p className="text-muted" style={{ maxWidth: '650px' }}>
                    Une plateforme SaaS conçue pour les distributeurs, les boutiques et les revendeurs.
                    Choisissez le plan qui correspond à votre croissance et à votre besoin de multi-tenancy.
                </p>
            </div>

            <div className="pricing-grid">
                {[
                    {
                        title: 'Starter',
                        price: '29€',
                        description: 'Pour les petites boutiques et les premiers utilisateurs.',
                        features: ['Catalogue produit illimité', 'Support email', 'Recommandations automatiques']
                    },
                    {
                        title: 'Croissance',
                        price: '79€',
                        description: 'Pour les équipes B2B qui souhaitent centraliser leurs stocks.',
                        features: ['Tableau de bord avancé', 'Gestion des commandes', 'Multi-sites', 'API intégrée']
                    },
                    {
                        title: 'Entreprise',
                        price: 'Sur devis',
                        description: 'Solution personnalisée avec intégration ERP et SLA dédiée.',
                        features: ['Support prioritaire', 'Migraton de données', 'Sécurité renforcée', 'Formation dédiée']
                    }
                ].map((plan) => (
                    <div key={plan.title} className="saas-card pricing-card">
                        <h3>{plan.title}</h3>
                        <p className="text-muted">{plan.description}</p>
                        <div className="pricing-price">{plan.price}</div>
                        <ul className="pricing-features">
                            {plan.features.map((feature) => (
                                <li key={feature}>{feature}</li>
                            ))}
                        </ul>
                        <Link to="/register" className="btn btn-primary btn-block">
                            Commencer
                        </Link>
                    </div>
                ))}
            </div>

            <section className="pricing-note">
                <p>
                    Toutes les offres incluent l'accès au moteur de recommandations IA, au support multi-tenant
                    et aux mises à jour de sécurité. Vous pouvez évoluer à tout moment vers un plan supérieur.
                </p>
                <Link to="/contact" className="btn btn-secondary">
                    Parler à un expert
                </Link>
            </section>
        </div>
    );
};

export default Pricing;
