📄 FICHIER STRUCTURÉ — ÉTAT ACTUEL DU PROJET
1. Informations générales

Nom du projet : Projet Fire

Type : Backend (API)

Objectif actuel :
Mettre en place une base backend fonctionnelle avec FastAPI et PostgreSQL, prête à accueillir les fonctionnalités métier.

2. Technologies utilisées

Langage : Python 3.12

Framework backend : FastAPI

Serveur ASGI : Uvicorn

Base de données : PostgreSQL 15

ORM : SQLAlchemy

Driver PostgreSQL : psycopg

Gestion de configuration : pydantic-settings

Conteneurisation : Docker / Docker Compose

3. Architecture actuelle du projet
projet/
├── docker-compose.yml
├── backend/
│   ├── .env
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── core/
│       │   └── settings.py
│       └── db/
│           ├── session.py
│           └── deps.py

4. Mise en place de la base de données

PostgreSQL est lancé dans un conteneur Docker.

La base de données projet_fire est créée automatiquement.

Les données de connexion sont définies via des variables d’environnement.

Commandes utilisées
docker compose up -d
docker ps

5. Backend FastAPI
5.1 Environnement virtuel

Un environnement virtuel Python est utilisé pour isoler les dépendances.

python -m venv .venv
.venv\Scripts\activate

5.2 Dépendances

Les dépendances nécessaires au backend sont listées dans requirements.txt.

fastapi
uvicorn
sqlalchemy
psycopg[binary]
pydantic-settings
python-dotenv


Installation :

pip install -r requirements.txt

6. Configuration de l’application

La configuration est chargée depuis le fichier .env.

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=projet_fire
DB_USER=projet_fire_user
DB_PASSWORD=projet_fire_password

7. Connexion à la base de données

La connexion est configurée avec SQLAlchemy.

Un test de connexion est exécuté au démarrage de l’application.

Les erreurs de connexion sont clairement affichées dans les logs.

Exemple de log
Database connection successful

8. Lancement du serveur

Le serveur FastAPI est lancé en mode développement avec rechargement automatique.

uvicorn app.main:app --reload

9. Endpoint disponible
Health Check

URL : GET /health

Rôle : vérifier que le serveur est actif

Réponse attendue :

{
  "status": "UP"
}

10. Documentation automatique

FastAPI génère automatiquement une documentation interactive :

Swagger UI : http://127.0.0.1:8000/docs

ReDoc : http://127.0.0.1:8000/redoc

11. État actuel du projet

✔️ Backend FastAPI fonctionnel

✔️ PostgreSQL opérationnel via Docker

✔️ Connexion backend ↔ base de données validée

✔️ Configuration centralisée et sécurisée

✔️ Structure prête pour l’ajout des modèles métier