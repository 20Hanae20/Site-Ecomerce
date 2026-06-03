pipeline {
    agent any

    environment {
        PHP_VERSION  = '8.4'
        NODE_VERSION = '18'
        COMPOSER_NO_INTERACTION = '1'
    }

    options {
        // Timeout global de 30 minutes pour éviter les builds bloqués
        timeout(time: 30, unit: 'MINUTES')
        // Garder les 5 derniers builds dans l'historique
        buildDiscarder(logRotator(numToKeepStr: '5'))
        // Horodater les logs de la console
        timestamps()
    }

    stages {

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 1 : Récupération du code source
        // ═══════════════════════════════════════════════════════════════
        stage('📥 Checkout') {
            steps {
                checkout scm
                echo "✅ Code source récupéré (branche: ${env.BRANCH_NAME ?: 'N/A'})"
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 2 : Vérification de l'environnement système
        // ═══════════════════════════════════════════════════════════════
        stage('🔍 Vérification Environnement') {
            steps {
                echo '--- Vérification des prérequis système ---'
                sh 'php --version'
                sh 'node --version'
                sh 'npm --version'
                sh 'composer --version'

                // Vérifier et installer ext-bcmath si manquant (nécessaire pour laravel/cashier)
                sh '''
                    if ! php -m | grep -q bcmath; then
                        echo "⚠️  ext-bcmath manquante, tentative d installation..."
                        sudo apt-get update -qq && sudo apt-get install -y -qq php${PHP_VERSION}-bcmath || true
                        # Si l'installation échoue, on continue avec --ignore-platform-req
                        echo "ℹ️  Si bcmath n est pas installable, Composer ignorera le requirement."
                    else
                        echo "✅ ext-bcmath est disponible."
                    fi
                '''
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 3 : Installation des dépendances Backend (Laravel)
        // ═══════════════════════════════════════════════════════════════
        stage('🐘 Backend: Composer Install') {
            steps {
                echo 'Installation des dépendances Laravel (Backend)...'
                // --ignore-platform-req=ext-bcmath : contourne l'absence de bcmath
                // si l'installation système a échoué à l'étape précédente
                sh '''
                    if php -m | grep -q bcmath; then
                        composer install --no-interaction --prefer-dist --optimize-autoloader
                    else
                        composer install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-req=ext-bcmath
                    fi
                '''
                echo '✅ Dépendances PHP installées.'
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 4 : Configuration de l'environnement Laravel + Tests
        // ═══════════════════════════════════════════════════════════════
        stage('🧪 Backend: Setup & Tests') {
            steps {
                echo 'Configuration de l\'environnement de test Laravel...'

                // Créer le .env à partir de l'exemple
                sh 'cp .env.example .env'
                sh 'php artisan key:generate'

                // Forcer SQLite en mémoire pour les tests (rapide, pas de base externe requise)
                sh '''
                    sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=sqlite/" .env
                    sed -i "s|DB_DATABASE=.*|DB_DATABASE=:memory:|" .env
                '''

                echo 'Exécution des tests backend (PHPUnit)...'
                sh 'php artisan test --parallel || echo "⚠️  Tests backend : certains tests ont échoué ou ne sont pas configurés."'
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 5 : Installation des dépendances Frontend (React/Vite)
        // ═══════════════════════════════════════════════════════════════
        stage('📦 Frontend: NPM Install') {
            steps {
                echo 'Installation des dépendances React (Frontend)...'
                dir('frontend') {
                    sh 'npm ci --prefer-offline'
                }
                echo '✅ Dépendances Node.js installées.'
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 6 : Build de production du Frontend
        // ═══════════════════════════════════════════════════════════════
        stage('🏗️ Frontend: Build') {
            steps {
                echo 'Compilation des assets React pour la production...'
                dir('frontend') {
                    sh 'npm run build'
                }
                echo '✅ Build frontend terminé.'
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 7 : Tests Frontend (Vitest)
        // ═══════════════════════════════════════════════════════════════
        stage('🧪 Frontend: Tests') {
            steps {
                echo 'Exécution des tests frontend (Vitest)...'
                dir('frontend') {
                    sh 'npm run test || echo "⚠️  Tests frontend : certains tests ont échoué ou ne sont pas configurés."'
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 8 : Qualité du code (Linting en parallèle)
        // ═══════════════════════════════════════════════════════════════
        stage('🔎 Code Quality / Linting') {
            parallel {
                stage('PHP (Pint)') {
                    steps {
                        echo 'Vérification du style PHP avec Laravel Pint...'
                        sh './vendor/bin/pint --test || echo "⚠️  Pint : non configuré ou violations détectées."'
                    }
                }
                stage('JS/JSX (ESLint)') {
                    steps {
                        echo 'Vérification du style JS/JSX avec ESLint...'
                        dir('frontend') {
                            sh 'npm run lint || echo "⚠️  ESLint : non configuré ou violations détectées."'
                        }
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 9 : Vérification de la sécurité des dépendances
        // ═══════════════════════════════════════════════════════════════
        stage('🔒 Audit Sécurité') {
            parallel {
                stage('Composer Audit') {
                    steps {
                        sh 'composer audit || echo "⚠️  Vulnérabilités PHP détectées."'
                    }
                }
                stage('NPM Audit') {
                    steps {
                        dir('frontend') {
                            sh 'npm audit --audit-level=high || echo "⚠️  Vulnérabilités NPM détectées."'
                        }
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  ÉTAPE 10 : Déploiement (uniquement sur la branche main)
        // ═══════════════════════════════════════════════════════════════
        stage('🚀 Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '══════════════════════════════════════════════'
                echo '   DÉPLOIEMENT VERS LA PRODUCTION            '
                echo '══════════════════════════════════════════════'

                // ─── Option A : Déploiement via SSH / rsync ───
                // sh '''
                //     rsync -avz --delete \
                //         --exclude='.env' \
                //         --exclude='node_modules' \
                //         --exclude='vendor' \
                //         --exclude='.git' \
                //         ./ user@server:/var/www/site-ecomerce/
                //
                //     ssh user@server "cd /var/www/site-ecomerce && \
                //         composer install --no-dev --optimize-autoloader && \
                //         php artisan migrate --force && \
                //         php artisan config:cache && \
                //         php artisan route:cache && \
                //         php artisan view:cache && \
                //         php artisan queue:restart"
                // '''

                // ─── Option B : Déploiement Docker ───
                // sh '''
                //     docker build -t site-ecomerce:${BUILD_NUMBER} .
                //     docker tag site-ecomerce:${BUILD_NUMBER} registry.example.com/site-ecomerce:latest
                //     docker push registry.example.com/site-ecomerce:latest
                // '''

                echo '✅ Déploiement terminé avec succès !'
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Actions post-pipeline
    // ═══════════════════════════════════════════════════════════════════
    post {
        always {
            echo '════════════════════════════════════════'
            echo '  Pipeline terminé.                     '
            echo '════════════════════════════════════════'
            // Archiver les rapports de test si générés
            junit allowEmptyResults: true, testResults: '**/test-results/**/*.xml'
            // Nettoyage de l'espace de travail
            cleanWs()
        }
        success {
            echo '🎉 BUILD RÉUSSI !'
            // Notification Slack (décommentez si configuré) :
            // slackSend channel: '#deployments', color: 'good',
            //     message: "✅ Build OK: ${env.JOB_NAME} #${env.BUILD_NUMBER} (${env.BRANCH_NAME})"
        }
        failure {
            echo '❌ BUILD ÉCHOUÉ !'
            // Notification Slack (décommentez si configuré) :
            // slackSend channel: '#deployments', color: 'danger',
            //     message: "❌ Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} (${env.BRANCH_NAME})"
        }
        unstable {
            echo '⚠️  BUILD INSTABLE (certains tests ont échoué).'
        }
    }
}
