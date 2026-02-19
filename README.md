# 🔥📦 Fire Inventory — Plateforme de gestion d'inventaire (Angular + FastAPI + GraphQL)

🧠 Plateforme web full-stack pour gérer un inventaire de produits avec authentification JWT, API GraphQL, et interface Angular moderne.

**Fire Inventory** est une application full-stack **Angular + FastAPI + GraphQL + PostgreSQL**, avec authentification sécurisée, gestion de rôles (ADMIN / USER), et une interface responsive avec support dark/light mode et internationalisation (FR / EN).

---

## 🎯 Objectif

Fournir une application de gestion d'inventaire complète permettant de :
- Gérer des produits (CRUD complet avec contrôle d'accès par rôle)
- Authentifier les utilisateurs via JWT avec hachage bcrypt
- Interagir avec le backend via une API GraphQL (Strawberry)
- Profiter d'une interface moderne avec thème sombre/clair et traduction FR/EN

---

## 🚀 Fonctionnalités principales

- 🔐 **Authentification sécurisée** : register / login via GraphQL, tokens JWT signés
- 👤 **Gestion des rôles** : ADMIN (suppression produits) / USER (lecture & écriture)
- 📦 **CRUD Produits** : liste, détail, création, modification, suppression avec confirmation
- 🌗 **Thème Dark / Light** : toggle dans la toolbar, préférence persistée en localStorage
- 🌍 **Internationalisation** : ngx-translate, JSON de traduction EN / FR, switch instantané
- 🧪 **Tests unitaires** : Jest — AuthService, ProductsService, composants clés
- ⚠️ **Gestion d'erreurs centralisée** : snackbars, redirections automatiques, spinners de chargement

---

## 🧰 Technologies utilisées

| Catégorie | Technologies |
|---|---|
| Langage Backend | Python |
| API / Backend | **FastAPI** + **Strawberry GraphQL** |
| ORM / BDD | **SQLAlchemy** + **PostgreSQL** |
| Authentification | **JWT** + **bcrypt** |
| Frontend | **Angular** (strict mode) |
| Styling | **Tailwind CSS** + **Angular Material** |
| Client GraphQL | **Apollo Angular** |
| Internationalisation | **ngx-translate** |
| Tests Frontend | **Jest** |
| Conteneurisation | **Docker Compose** (PostgreSQL + pgAdmin) |

---

## ⚙️ Prérequis

- **Python** >= 3.10
- **Node.js** >= 18 + **npm** >= 9
- **Docker** + **Docker Compose**
- **Angular CLI** >= 17 (`npm install -g @angular/cli`)

---

## 🐳 Démarrage avec Docker (PostgreSQL)

Lancer la base de données PostgreSQL (et pgAdmin optionnel) :

```bash
docker-compose up -d
```

Vérifier que le conteneur tourne :

```bash
docker ps
```

---

## 🔧 Installation & Lancement du Backend

### 1. Configurer les variables d'environnement

Copier et remplir le fichier `.env` dans `backend/` :

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fire_inventory
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 2. Créer l'environnement virtuel et installer les dépendances

```bash
cd backend
python -m venv .venv

# Linux / macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

### 3. Lancer le serveur FastAPI

```bash
uvicorn main:app --reload
```

> API disponible sur : `http://localhost:8000`  
> Health check : `GET http://localhost:8000/health` → `{ "status": "UP" }`  
> GraphQL Playground : `http://localhost:8000/graphql`

---

## 🌐 Installation & Lancement du Frontend

```bash
cd frontend/fire-inventory-frontend
npm install
ng serve
```

> Application disponible sur : `http://localhost:4200`

---

## 🧪 Lancer les tests

```bash
cd frontend/fire-inventory-frontend
npm test
```

Les tests Jest couvrent :
- `AuthService` : login, logout, isLoggedIn
- `ProductsService` : queries et mutations GraphQL (Apollo mocké)
- Composants : `LoginComponent`, `ProductFormComponent`, `ProductsListComponent`

---

## ⚠️ Avertissement

Fire Inventory est distribué tel quel et nécessite une configuration de sécurité renforcée avant tout déploiement en production.  
Ce projet est distribué sous la licence **MIT**.  
Vous êtes libre de le réutiliser, le modifier et le distribuer avec attribution.
