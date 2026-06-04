import React from 'react';
import { Link } from 'react-router-dom';

const Docs = () => {
    return (
        <div className="container page-container" style={{ padding: '4rem 0' }}>
            <div className="page-header">
                <span className="badge badge-primary mb-4">Documentation</span>
                <h1>Documentation de la plateforme</h1>
                <p className="text-muted" style={{ maxWidth: '700px' }}>
                    Trouvez rapidement les guides pour démarrer, configurer vos tenants, intégrer votre ERP
                    et utiliser le moteur de recommandations IA.
                </p>
            </div>

            <div className="docs-grid">
                {[
                    { title: 'Premiers pas', description: 'Création de compte, onboarding et configuration initiale.', path: '/register' },
                    { title: 'Gestion des produits', description: 'Importer et organiser votre catalogue parfum.', path: '/perfumes' },
                    { title: 'Flux de commandes', description: 'Traiter les commandes, gérer les statuts et les paiements.', path: '/orders' },
                    { title: 'API & intégrations', description: 'Connecter votre ERP, CRM ou service externe.', path: '/contact' }
                ].map((doc) => (
                    <div key={doc.title} className="saas-card docs-card">
                        <h3>{doc.title}</h3>
                        <p className="text-muted">{doc.description}</p>
                        <Link to={doc.path} className="btn btn-secondary btn-sm">
                            Voir le guide
                        </Link>
                    </div>
                ))}
            </div>

            <div className="faq-callout saas-card">
                <h2>Besoin d'aide personnalisée ?</h2>
                <p className="text-muted">
                    Contactez notre équipe support pour une configuration multi-tenant ou un accompagnement sur mesure.
                </p>
                <Link to="/contact" className="btn btn-primary">
                    Contacter le support
                </Link>
            </div>
        </div>
    );
};

export default Docs;
