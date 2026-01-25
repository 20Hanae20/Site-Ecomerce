import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { success, orderId, transactionId, failureReason } = location.state || {};

    useEffect(() => {
        if (!orderId) {
            navigate('/');
        }
    }, [orderId, navigate]);

    if (success) {
        return (
            <div className="page-container confirmation-page success">
                <div className="confirmation-card">
                    <div className="success-icon">✓</div>
                    <h1>Paiement réussi !</h1>
                    <p className="confirmation-message">
                        Votre paiement a été effectué avec succès.
                    </p>

                    <div className="confirmation-details">
                        <div className="detail-row">
                            <span className="label">Numéro de transaction</span>
                            <span className="value">{transactionId}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Commande</span>
                            <span className="value">
                                <Link to={`/orders/${orderId}`}>Voir la commande</Link>
                            </span>
                        </div>
                    </div>

                    <div className="next-steps">
                        <h3>Prochaines étapes</h3>
                        <ul>
                            <li>Vous recevrez un email de confirmation</li>
                            <li>Votre commande sera préparée sous 24-48h</li>
                            <li>Vous serez notifié lors de l'expédition</li>
                        </ul>
                    </div>

                    <div className="action-buttons">
                        <Link to={`/orders/${orderId}`} className="submit-btn">
                            Voir ma commande
                        </Link>
                        <Link to="/catalogue" className="btn-secondary">
                            Continuer mes achats
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container confirmation-page failure">
            <div className="confirmation-card">
                <div className="failure-icon">✗</div>
                <h1>Paiement échoué</h1>
                <p className="confirmation-message">
                    Votre paiement n'a pas pu être traité.
                </p>

                <div className="error-details">
                    <p className="error-reason">
                        <strong>Raison :</strong> {failureReason || 'Erreur inconnue'}
                    </p>
                </div>

                <div className="next-steps">
                    <h3>Que faire ?</h3>
                    <ul>
                        <li>Vérifiez vos informations de paiement</li>
                        <li>Assurez-vous d'avoir des fonds suffisants</li>
                        <li>Essayez une autre méthode de paiement</li>
                        <li>Contactez votre banque si le problème persiste</li>
                    </ul>
                </div>

                <div className="action-buttons">
                    <Link to={`/orders/${orderId}`} className="submit-btn">
                        Réessayer le paiement
                    </Link>
                    <Link to="/cart" className="btn-secondary">
                        Retour au panier
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;
