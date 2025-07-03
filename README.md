# 📖 Documentation API – Mbongou.App

Bienvenue dans la documentation de l’API de Mbongou.App, l’application de gestion de budget personnel.

---

## Sommaire

- [Authentification](#authentification)
- [Endpoints Utilisateurs](#endpoints-utilisateurs)
- [Endpoints Catégories](#endpoints-catégories)
- [Endpoints Transactions](#endpoints-transactions)
- [Endpoints Budgets](#endpoints-budgets)
- [Endpoints Paramètres](#endpoints-paramètres)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Sécurité & Auth](#sécurité--auth)
- [Exemples de requêtes](#exemples-de-requêtes)

---

## Authentification

Toutes les routes protégées nécessitent un utilisateur authentifié via Supabase.  
Le token d’authentification doit être transmis dans les headers.

---

## Endpoints Utilisateurs

### `POST /api/users`

- **Description** : Crée ou met à jour un utilisateur.
- **Body** :
  ```json
  {
    "id": "uuid",
    "email": "user@email.com",
    "name": "Nom"
  }
  ```
- **Réponse** :  
  - `200 OK` : Utilisateur créé/mis à jour
  - `401 Unauthorized` : Non authentifié
  - `409 Conflict` : Email déjà utilisé

---

## Endpoints Catégories

### `GET /api/categories`

- **Description** : Liste toutes les catégories de l’utilisateur.
- **Réponse** :  
  - `200 OK` : Liste des catégories

### `POST /api/categories`

- **Description** : Crée une nouvelle catégorie.
- **Body** :
  ```json
  {
    "name": "Alimentation",
    "type": "EXPENSE" // ou "INCOME"
  }
  ```
- **Réponse** :  
  - `201 Created` : Catégorie créée

### `PUT /api/categories/[id]`

- **Description** : Met à jour une catégorie.
- **Body** :
  ```json
  {
    "name": "Nouveau nom"
  }
  ```
- **Réponse** :  
  - `200 OK` : Catégorie mise à jour
  - `404 Not Found` : Catégorie non trouvée

### `DELETE /api/categories/[id]`

- **Description** : Supprime une catégorie.
- **Réponse** :  
  - `200 OK` : Catégorie supprimée
  - `404 Not Found` : Catégorie non trouvée

---

## Endpoints Transactions

### `GET /api/transactions`

- **Description** : Liste toutes les transactions de l’utilisateur.

### `POST /api/transactions`

- **Description** : Crée une transaction.
- **Body** :
  ```json
  {
    "amount": 100,
    "categoryId": "uuid",
    "date": "2025-07-03",
    "type": "EXPENSE" // ou "INCOME"
  }
  ```

### `PUT /api/transactions/[id]`

- **Description** : Met à jour une transaction.

### `DELETE /api/transactions/[id]`

- **Description** : Supprime une transaction.

---

## Endpoints Budgets

### `GET /api/budgets`

- **Description** : Liste tous les budgets de l’utilisateur.

### `POST /api/budgets`

- **Description** : Crée un budget.
- **Body** :
  ```json
  {
    "amount": 500,
    "categoryId": "uuid",
    "period": "2025-07"
  }
  ```

### `PUT /api/budgets/[id]`

- **Description** : Met à jour un budget.

### `DELETE /api/budgets/[id]`

- **Description** : Supprime un budget.

---

## Endpoints Paramètres

### `GET /api/settings`

- **Description** : Récupère les paramètres utilisateur.

### `PUT /api/settings`

- **Description** : Met à jour les paramètres utilisateur.
- **Body** :
  ```json
  {
    "theme": "light" // ou "dark" ou "system"
  }
  ```

---

## Gestion des erreurs

- `401 Unauthorized` : Utilisateur non authentifié
- `404 Not Found` : Ressource non trouvée
- `409 Conflict` : Conflit de données (ex: email déjà utilisé)
- `500 Internal Server Error` : Erreur serveur

---

## Sécurité & Auth

- Toutes les routes sont protégées par Supabase Auth.
- Les données sont isolées par utilisateur (`userId`).
- Les règles RLS (Row Level Security) sont activées côté base.

---

## Exemples de requêtes

### Exemple de création de catégorie

```bash
curl -X POST https://votre-domaine/api/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Santé","type":"EXPENSE"}'
```

---

## Contact

Pour toute question ou contribution, ouvrez une issue sur le dépôt
