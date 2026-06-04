import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="container page-container" style={{ padding: '4rem 0' }}>
            <div className="page-header">
                <span className="badge badge-primary mb-4">Conditions</span>
                <h1>Conditions générales d'utilisation</h1>
                <p className="text-muted" style={{ maxWidth: '700px' }}>
                    Lisez les règles d'utilisation de la plateforme, les engagements de service et les responsabilités
                    liées à votre abonnement SaaS.
                </p>
            </div>

            <section className="legal-section saas-card">
                <h2>Accès et comptes</h2>
                <p>
                    L'accès à la plateforme est réservé aux utilisateurs autorisés par votre organisation.
                    Chaque compte est personnel et ne doit pas être partagé.
                </p>

                <h2>Facturation</h2>
                <p>
                    Les paiements sont gérés via Stripe. Les modifications de plan sont prises en compte sur le cycle suivant.
                    Le non-paiement peut entraîner la suspension de l'accès.
                </p>

                <h2>Support et maintenance</h2>
                <p>
                    Notre équipe assure la maintenance de la plateforme et met à jour les fonctions SaaS régulièrement.
                    Les incidents sont traités selon la priorité du plan choisi.
                </p>

                <Link to="/contact" className="btn btn-secondary mt-4">
                    Contacter le support juridique
                </Link>
            </section>
        </div>
    );
};

export default Terms;
