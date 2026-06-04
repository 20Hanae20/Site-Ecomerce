# 🔧 FIXER.md - Plan d'Action Complet

**Statut**: 🟡 EN COURS D'ANALYSE ET CORRECTION
**Date**: 3 Juin 2026
**Responsable**: Lead Software Engineer Senior

---

## 📊 RÉSUMÉ EXÉCUTIF

### Architecture actuelle:
- ✅ Framework: Laravel 11 + React 18 + FastAPI ML-API
- ✅ Multi-tenant: Stancl Tenancy (ISOLATION COMPLÈTE)
- ✅ Auth: Sanctum API + Spatie Permission RBAC
- ✅ Billing: Stripe Cashier
- ✅ ML: K-Means, TF-IDF, SVD, Embeddings
- ✅ 19 Models, 17 Controllers, 43 Migrations, 22+ Pages React

---

## 🔍 AUDIT INITIAL - PROBLÈMES DÉTECTÉS

### 🔴 CRITIQUES (Bloquants)

#### 1. **RecommendationService centralisé MANQUANT**
- ❌ Pas de service PHP pour orchestrer les modèles ML
- ❌ RecommendationController appelle ML-API directement (pas d'abstraction)
- ❌ Pas de fallback gracieux si ML-API down
- ❌ Pas de cache des recommandations
- **ACTION**: Créer `app/Services/RecommendationService.php`

#### 2. **Endpoints ML-API incomplets**
- ❌ `/recommend` retourne seulement les IDs, pas les données complètes
- ❌ Pas d'endpoint pour récupérer les modèles disponibles
- ❌ Pas de gestion d'erreurs robuste (timeouts, validation)
- ❌ Pas de versioning des modèles
- **ACTION**: Augmenter FastAPI endpoints

#### 3. **Authentification incomplète**
- ❌ Email verification pas implémentée (pas de VerifyEmailController)
- ❌ Pas de refresh token rotation
- ❌ Pas de 2FA/MFA
- ❌ Pas de logout sécurisé (invalidate all tokens)
- ⚠️ ForgotPasswordController existe mais pas de ResetPasswordController complet
- **ACTION**: Ajouter VerifyEmailController, améliorer reset password

#### 4. **RBAC incomplet**
- ⚠️ 5 rôles définis (super_admin, admin, gestionnaire, moderateur, user)
- ❌ Permissions granulaires pas définies en database
- ❌ Pas de middleware pour valider les permissions
- ❌ Pas de seed pour initialiser rôles + permissions
- **ACTION**: Créer seeder RBAC + middleware permissions

#### 5. **Routes Admin incomplètes**
- ⚠️ Routes existent mais contrôleurs incomplets
- ❌ /admin/stats pas de données ML (accuracy, precision, recall)
- ❌ Pas d'endpoints pour gérer les modèles ML
- ❌ Pas d'endpoints pour dashboard IA
- **ACTION**: Compléter AdminController + créer MLDashboardController

#### 6. **Isolation multi-tenant FAIBLE**
- ⚠️ Trait BelongsToTenant existe mais pas appliqué à TOUS les modèles
- ❌ Perfume, Order, Review, etc. ont tenant_id mais pas systématiquement scopé
- ❌ Pas de middleware pour valider tenant_id dans les requêtes
- ❌ Cache Redis pas tenant-aware
- **ACTION**: Vérifier/forcer BelongsToTenant sur tous les models

#### 7. **Validation & Erreurs**
- ❌ Pas de FormRequest classes pour validation
- ❌ Pas d'exception handlers personnalisés
- ❌ Pas de logging des erreurs centralisé
- **ACTION**: Créer FormRequest + exception handler

#### 8. **Tests incomplets**
- ⚠️ Tests Feature existent mais couverture faible (<30%)
- ❌ Pas de tests pour les recommandations ML
- ❌ Pas de tests pour l'isolation multi-tenant
- ❌ Pas de tests pour RBAC
- **ACTION**: Augmenter couverture (>80% pour code critique)

---

### 🟡 IMPORTANTS (Dégradent la performance/UX)

#### 9. **Performance SQL**
- ❌ Eager loading pas systématique (N+1 queries)
- ❌ Pas d'indexes sur tenant_id, user_id, perfume_id
- ❌ Pas de pagination par défaut (risque timeout)
- **ACTION**: Auditer migrations, ajouter indexes, implémenter eager loading

#### 10. **API inconsistente**
- ⚠️ Réponses sans structure standardisée
- ❌ Pas de versioning API (/api/v1/)
- ❌ Pas de rates limiting sauf auth endpoints
- **ACTION**: Créer ApiResponse wrapper + ajouter versioning

#### 11. **Frontend API client**
- ⚠️ api.js exists mais incomplete
- ❌ Pas de retry logic
- ❌ Pas de abort/timeout management
- ❌ Pas de error boundary
- **ACTION**: Renforcer api.js + ajouter ErrorBoundary

#### 12. **Recommandations Frontend**
- ❌ Quiz flow existe pas
- ❌ Pas de UI pour afficher recommendations
- ❌ Pas de historique recommandations
- **ACTION**: Créer QuizComponent, RecommendationCard

#### 13. **Admin Dashboard vide**
- ❌ Pas de graphiques ML (clusters, accuracy)
- ❌ Pas de stats utilisateurs
- ❌ Pas de logs UI
- **ACTION**: Créer AdminDashboard avec recharts

#### 14. **Modèles ML pas optimisés**
- ⚠️ Models chargés à chaque requête (lent)
- ❌ Pas de model versioning
- ❌ Pas de monitoring (accuracy drift)
- **ACTION**: Implémenter cache + versioning

#### 15. **Documentation absente**
- ❌ Pas de README spécifique par module
- ❌ Pas de API docs (Swagger/OpenAPI)
- ❌ Pas de setup guide multi-tenant
- **ACTION**: Générer API docs + guide

---

### 🟢 MINEURS (À améliorer)

#### 16. **UX/UI**
- ⚠️ Frontend OK mais pas de dark mode complet
- ⚠️ Animations manquantes
- **ACTION**: Ajouter dark mode toggle + animations

#### 17. **Code Style**
- ⚠️ Pas d'ESLint rules strictes
- ⚠️ Pas de PHP-CS-Fixer
- **ACTION**: Ajouter linters + formatters

#### 18. **Logging & Monitoring**
- ⚠️ Logs basiques seulement
- ❌ Pas de Sentry/APM
- **ACTION**: Intégrer Sentry

---

## ✅ ACTIONS À FAIRE (Détaillées)

### **Phase 1: AUDIT & CORRECTIONS CRITIQUES** (Maintenant)

#### 1.1 Vérifier tous les modèles
- [ ] Confirmer `BelongsToTenant` sur: Perfume, Order, OrderItem, Review, Cart, CartItem, Category, Address, Promotion, Setting, StockMovement, PerfumeView, Subscription, Payment
- [ ] Ajouter `use BelongsToTenant` aux modèles manquants
- [ ] Vérifier tenant_id en fillable + mass assignment

#### 1.2 Vérifier toutes les routes API
- [ ] Valider structure RESTful
- [ ] Confirmer middleware auth:sanctum appliqué
- [ ] Confirmer rôles/permissions correctes

#### 1.3 Vérifier tous les contrôleurs
- [ ] Chercher les try-catch incomplets
- [ ] Chercher les $validated non utilisés
- [ ] Chercher les queries sans pagination

#### 1.4 Vérifier Tenant isolation
- [ ] Confirmer middleware tenancy dans routes/api.php
- [ ] Tester: 2 tenants ne voient pas les données l'un de l'autre
- [ ] Tester: Cache Redis isolé par tenant

#### 1.5 Vérifier Authentication
- [ ] Confirmer register -> user created
- [ ] Confirmer login -> token retourné
- [ ] Confirmer logout -> token invalidé
- [ ] Confirmer password reset flow complet

---

### **Phase 2: CRÉER SERVICES CENTRALISÉS** (Après audit)

#### 2.1 RecommendationService
```php
// app/Services/RecommendationService.php
- __construct(): Init cache
- recommendByContent(userId, perfumeId, topN=5)
- recommendBySVD(userId, topN=5)
- recommendHybrid(userId, topN=5)
- predictCluster(userData)
- trainModel(modelName) // Déclenche training
- modelMetrics(modelName) // Retourne: accuracy, precision, recall, f1, rmse, mae
```

#### 2.2 AuthService
```php
// app/Services/AuthService.php
- register(email, password, name)
- login(email, password)
- refreshToken(token)
- logout(token)
- forgotPassword(email)
- resetPassword(token, password)
- verifyEmail(token)
- validatePassword(password) // Règles sécurité
```

#### 2.3 TenantService
```php
// app/Services/TenantService.php
- createTenant(name, domain, plan)
- updateTenant(tenantId, data)
- resolveTenant(domain)
- isolateQueriesToTenant(tenantId)
- getMetrics(tenantId) // Revenue, users, orders
```

#### 2.4 PermissionService
```php
// app/Services/PermissionService.php
- initializeRoles() // Seed: super_admin, admin, gestionnaire, moderateur, user
- syncPermissions() // Toutes les permissions à la DB
- grantPermission(user, permission)
- hasPermission(user, permission)
- getPermissionsByRole(role)
```

#### 2.5 ValidationService
```php
// app/Services/ValidationService.php
- validatePerfume(data)
- validateOrder(data)
- validateReview(data)
- validatePayment(data)
```

---

### **Phase 3: CRÉER CONTROLLERS MANQUANTS** (Après services)

#### 3.1 VerifyEmailController
```php
// app/Http/Controllers/Api/VerifyEmailController.php
- verify(token): Email verified + unlock user
- resendVerificationEmail(email)
```

#### 3.2 ResetPasswordController
```php
// app/Http/Controllers/Api/ResetPasswordController.php
- reset(token, password): Password reset secure flow
```

#### 3.3 MLDashboardController
```php
// app/Http/Controllers/Api/Admin/MLDashboardController.php
- metrics(modelName): Return accuracy, precision, recall, f1, rmse, mae
- clusterDistribution(): K-Means clusters
- recommendationStats(): Volume, acceptance rate
- trainingHistory(): Model versions + dates
- trainNewModel(modelConfig): Trigger training job
```

#### 3.4 AdminStatsController
```php
// app/Http/Controllers/Api/Admin/AdminStatsController.php
- Améliorer /api/admin/stats
- Ajouter: Revenue by date, top products, top users
```

#### 3.5 AnalyticsController
```php
// app/Http/Controllers/Api/Admin/AnalyticsController.php
- userGrowth(): Users par date
- orderGrowth(): Orders par date
- recommendationAcceptance(): % recommendations cliquées
```

---

### **Phase 4: CRÉER FORMREQUESTS** (Validation)

#### 4.1 CreatePerfumeRequest
#### 4.2 CreateOrderRequest
#### 4.3 CreateReviewRequest
#### 4.4 CreatePromotionRequest
#### 4.5 RegisterRequest
#### 4.6 LoginRequest

---

### **Phase 5: CRÉER EXCEPTION HANDLERS**

#### 5.1 ApiException
#### 5.2 TenantNotFoundException
#### 5.3 UnauthorizedActionException
#### 5.4 ValidationException

---

### **Phase 6: CRÉER MIDDLEWARE**

#### 6.1 TenantMiddleware
- Valider tenant_id dans toutes les requêtes authenticated

#### 6.2 PermissionMiddleware
- Valider permission pour chaque action admin

#### 6.3 RateLimitMiddleware
- Rate limit par endpoint + tenant

---

### **Phase 7: OPTIMISER SQL** (N+1 queries)

#### 7.1 Auditer PerfumeController
- [ ] `index()`: with() eager loading
- [ ] `show()`: with() eager loading

#### 7.2 Auditer OrderController
- [ ] `index()`: with('items', 'user')
- [ ] `show()`: with('items', 'payments', 'address')

#### 7.3 Auditer ReviewController
- [ ] `index()`: with('user', 'perfume')

#### 7.4 Ajouter indexes
- [ ] perfumes: tenant_id, category_id, price
- [ ] orders: tenant_id, user_id, status, created_at
- [ ] reviews: tenant_id, perfume_id, user_id, is_approved
- [ ] carts: tenant_id, user_id
- [ ] users: tenant_id, email

---

### **Phase 8: FRONTEND**

#### 8.1 Créer QuizComponent
#### 8.2 Créer RecommendationCard
#### 8.3 Améliorer api.js (retry, timeout, abort)
#### 8.4 Créer ErrorBoundary
#### 8.5 Ajouter dark mode complet

---

### **Phase 9: TESTS**

#### 9.1 Tests Unit: Models, Services
#### 9.2 Tests Feature: Auth, CRUD, ML
#### 9.3 Tests Integration: Multi-tenant, Permissions

---

### **Phase 10: DOCUMENTATION**

#### 10.1 Générer Swagger/OpenAPI
#### 10.2 Créer README par module
#### 10.3 Guide setup multi-tenant
#### 10.4 Guide deployment production

---

## 🚀 ACTIONS DÉJÀ FAITES

- ✅ Architecture Laravel + Sanctum
- ✅ Multi-tenant Stancl Tenancy
- ✅ RBAC Spatie Permission
- ✅ Stripe Cashier Billing
- ✅ 19 Models
- ✅ 17 Controllers
- ✅ 80+ Routes API
- ✅ 22+ Pages React
- ✅ ML-API FastAPI
- ✅ K-Means, SVD, TF-IDF models

---

## 📋 PROCHAINES ÉTAPES (ORDONNÉES)

```
1. ✅ FIXER.md créé (maintenant)
2. 🔄 Phase 1: Audit détaillé (0-30min)
   - Lire chaque fichier critique
   - Lister les bugs réels
3. 🔄 Phase 2: Corrections critiques (30min-1h)
   - Fixer bugs authentification
   - Fixer bugs isolation multi-tenant
   - Fixer bugs validation
4. 🔄 Phase 3: Services centralisés (1h-2h)
   - RecommendationService
   - AuthService
   - TenantService
   - PermissionService
5. 🔄 Phase 4: Controllers manquants (1h-2h)
   - VerifyEmailController
   - ResetPasswordController
   - MLDashboardController
6. 🔄 Phase 5: Frontend fixes (30min-1h)
   - API client improvements
   - Quiz component
   - Error handling
7. 🔄 Phase 6: Tests + Docs (1h-2h)
   - Unit + Feature tests
   - API documentation
   - Setup guide
8. ✅ Final: Rapport détaillé + Livrable
```

---

## 📊 MÉTRIQUES

| Métrique | Actuel | Cible |
|----------|--------|-------|
| Code Coverage | ~30% | >80% |
| API Response Time | ? | <200ms |
| ML Latency | ? | <1s |
| Test Pass Rate | 100% | 100% |
| Security Score | ? | A+ |
| Documentation | 20% | 100% |

---

## 🔐 CHECKLIST SÉCURITÉ

- [ ] Email verification obligatoire
- [ ] Password reset token expiration (15 min)
- [ ] Login throttling (6 attempts)
- [ ] 2FA option available
- [ ] CSRF protection enabled
- [ ] XSS prevention (HTML escaping)
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting per tenant
- [ ] Audit logs for admin actions
- [ ] Stripe webhook signature validation
- [ ] JWT token expiration
- [ ] No sensitive data in logs
- [ ] Environment variables protected
- [ ] API keys not in git

---

**FIN FIXER.md**
Créé: 3 Juin 2026
Status: 🟡 PHASE 1 EN COURS
