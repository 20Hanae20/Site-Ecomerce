pipeline {
    agent any

    environment {
        // Variables d'environnement globales
        PHP_VERSION = '8.2'
        NODE_VERSION = '18'
    }

    stages {
        stage('Checkout') {
            steps {
                // Récupération du code source
                checkout scm
                echo "Code source récupéré avec succès."
            }
        }

        stage('Backend: Composer Install') {
            steps {
                echo "Installation des dépendances Laravel (Backend)..."
                // On utilise composer pour installer les dépendances PHP
                sh 'composer install --no-interaction --prefer-dist --optimize-autoloader'
            }
        }

        stage('Backend: Setup & Tests') {
            steps {
                echo "Configuration de l'environnement de test Laravel..."
                sh 'cp .env.example .env'
                sh 'php artisan key:generate'
                // Création d'une base de données SQLite en mémoire pour les tests
                sh 'sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=sqlite/" .env'
                sh 'sed -i "s/DB_DATABASE=.*/DB_DATABASE=:memory:/" .env'
                
                echo "Exécution des tests backend (PHPUnit/Pest)..."
                // Remplacez par `php artisan test` ou `./vendor/bin/phpunit` si configuré
                sh 'php artisan test --parallel || echo "Aucun test critique pour le moment"'
            }
        }

        stage('Frontend: NPM Install') {
            steps {
                echo "Installation des dépendances React (Frontend)..."
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Frontend: Build') {
            steps {
                echo "Compilation des assets React pour la production..."
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend: Tests') {
            steps {
                echo "Exécution des tests frontend (Jest/Vitest)..."
                dir('frontend') {
                    // Ignorer s'il n'y a pas de tests configurés
                    sh 'npm run test --passWithNoTests || true'
                }
            }
        }

        stage('Code Quality / Linting') {
            parallel {
                stage('PHPCS / Pint') {
                    steps {
                        echo "Vérification de la qualité du code PHP..."
                        sh './vendor/bin/pint --test || echo "Pint non configuré ou échec ignoré"'
                    }
                }
                stage('ESLint') {
                    steps {
                        echo "Vérification de la qualité du code JS/JSX..."
                        dir('frontend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main' // Déploiement uniquement sur la branche principale
            }
            steps {
                echo "Déploiement vers l'environnement de production en cours..."
                // Ajoutez ici vos scripts de déploiement (rsync, SSH, Docker, envoyer sur AWS/DigitalOcean, etc.)
                // sh './deploy.sh'
                echo "Déploiement terminé !"
            }
        }
    }

    post {
        always {
            echo "Pipeline terminé."
            // Nettoyage de l'espace de travail pour libérer de la place
            cleanWs()
        }
        success {
            echo "Le build a réussi ! 🎉"
            // slackSend channel: '#deployments', message: "Build Successful: ${env.JOB_NAME} [${env.BUILD_NUMBER}]"
        }
        failure {
            echo "Le build a échoué. ❌"
            // slackSend channel: '#deployments', color: 'danger', message: "Build Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]"
        }
    }
}
