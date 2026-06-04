import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="container page-container" style={{ padding: '4rem 0' }}>
            <div className="page-header">
                <span className="badge badge-primary mb-4">Confidentialité</span>
                <h1>Politique de confidentialité</h1>
                <p className="text-muted" style={{ maxWidth: '720px' }}>
                    Nous protégeons vos données clients et votre tenant avec des standards de sécurité élevés.
                    Toutes les informations sont isolées et accessibles uniquement par votre organisation.
                </p>
            </div>

            <section className="legal-section saas-card">
                <h2>Collecte des données</h2>
                <p>
                    Nous collectons uniquement les informations nécessaires pour gérer votre compte,
                    traiter les commandes et améliorer les recommandations personnalisées.
                </p>

                <h2>Partage des données</h2>
                <p>
                    Vos données ne sont partagées qu'avec des partenaires nécessaires à l'exécution des services
                    (paiement, hébergement, analytics). Nous ne vendons jamais vos informations.
                </p>

                <h2>Stockage sécurisé</h2>
                <p>
                    Les données sont hébergées de manière sécurisée avec chiffrement et protections multi-tenant.
                    Vous pouvez demander la suppression de votre compte à tout moment.
                </p>

                <Link to="/contact" className="btn btn-secondary mt-4">
                    Nous contacter
                </Link>
            </section>
        </div>
    );
};

export default Privacy;
