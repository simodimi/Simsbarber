# Sim'sBarber

Application web de réservation en ligne pour un salon de coiffure barbershop, avec un espace **client** et un espace **administrateur**, messagerie en temps réel, notifications, avis clients et un **chatbot IA** capable de répondre aux questions sur le catalogue et le fonctionnement du salon.

---

## Fonctionnalités

### Côté client

- Inscription / connexion (JWT access token + refresh token via cookie httpOnly)
- Catalogue de prestations organisé par **catégories** et **sous-catégories**
- Prise de rendez-vous via un calendrier interactif (créneaux, horaires d'ouverture, quota de réservations/jour)
- Modification et annulation de ses réservations (annulation possible uniquement au-delà de 24h avant le rendez-vous)
- Suivi de ses réservations : **en attente**, **confirmée**, **annulée**
- Dépôt d'un avis (note + commentaire), uniquement sur une prestation confirmée par le salon
- Messagerie en temps réel avec le salon (texte, emoji, photos)
- Notifications en temps réel (nouveaux messages, rappels de rendez-vous)
- Rappels automatiques par email (J-1 et jour J)
- Paramètres de compte (photo de profil, mot de passe, fond d'écran de messagerie)
- Assistant chatbot (RAG) pour répondre aux questions sur les prestations, horaires, réservations, etc.

### Côté administrateur

- Authentification admin séparée
- Planning global : création, modification, annulation et suivi de toutes les réservations (avec couleur personnalisable par réservation)
- Gestion des catégories et prestations (image, galerie, prix, durée, description)
- Gestion des clients (activation/blocage, suppression, historique des réservations et avis)
- Modération et consultation des avis clients (filtrage par nom, email, note)
- Messagerie avec les clients + diffusion de messages à tous les utilisateurs (broadcast)
- Notifications en temps réel (nouveaux messages, nouvelles demandes)
- Reconstruction à la demande de l'index du chatbot après modification du catalogue

---

## Stack technique

**Frontend**

- React + TypeScript (Vite)
- React Router
- Axios (avec intercepteur de refresh token automatique)
- Socket.IO Client (temps réel)
- react-big-calendar + date-fns (calendrier de réservation)
- Material UI (dialogues, composants)
- React Toastify (notifications UI)

**Backend**

- Node.js + Express
- Sequelize (MySQL)
- Socket.IO (temps réel : messages, notifications, mises à jour de réservations)
- JWT (access token + refresh token httpOnly)
- Zod (validation des données)
- Multer (upload d'images)
- node-cron (rappels de rendez-vous automatisés)
- Mailjet (envoi d'emails transactionnels)
- Day.js (gestion des dates)

**Chatbot / IA**

- Ollama (modèle de langage local, ex. `ollama qwen2.5:3b`)
- Qdrant (base vectorielle) pour la recherche sémantique (RAG)
- `nomic-embed-text` pour la génération d'embeddings

---

## Structure du projet

```
backend/
├── controllers/      # Logique des routes (reservations, prestations, categories, messages, reviews, notifications, chatbot...)
├── services/         # Logique métier (reservations.service, reviews.service, chatbot.service, embeddings.service...)
├── routes/           # Définition des endpoints Express
├── validators/       # Schémas de validation Zod
├── models/           # Modèles Sequelize + associations
├── middlewares/       # Auth (user/admin), upload, validation
├── config/           # Config DB, Mailjet, Ollama, Qdrant, socket.io
└── scripts/          # Scripts utilitaires (ex. benchmark des modèles Ollama)

frontend/
├── pages/            # Pages côté client (Accueil, Profil, Reservation, Message, Para...)
├── pagesAdmin/       # Pages côté admin (Planning, Client, MessageAdmin, Avis, Categories...)
├── components/       # Composants partagés (Calendrier, Siderbar, SiderbarAdmin...)
├── services/         # Contextes React (Auth, Notification), client Axios, Socket.IO
├── ui/               # Composants UI réutilisables (Button, Card, Emoji, Notification)
└── styles/           # Feuilles de style CSS
```

---

## Installation

### Prérequis

- Node.js (v18+)
- MySQL
- [Ollama](https://ollama.com) installé localement (pour le chatbot)
- Un compte [Mailjet](https://www.mailjet.com) (pour les emails)
- Une instance [Qdrant](https://qdrant.tech) (locale via Docker ou cloud)

### Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` à la racine du backend :

```env
# Base de données
DB_HOST=localhost
DB_NAME=simsbarber
DB_USER=root
DB_PASSWORD=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# Frontend
FRONT_URL=http://localhost:5173

# Emails (Mailjet)
EMAIL_USER=            # clé API Mailjet
EMAIL_PASSWORD=        # clé secrète Mailjet
EMAIL_FROM_EMAIL=
EMAIL_FROM_NAME=

# Chatbot / IA
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_EMBED_MODEL=nomic-embed-text
```

Lancer le serveur :

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Chatbot (index à construire)

Après le premier démarrage (ou après avoir modifié le catalogue en masse), reconstruire l'index vectoriel :

```
POST /api/chatbot/reindex   (route admin)
```

---

## Règles métier principales

- Salon ouvert du **lundi au samedi, 9h–19h** (fermé le dimanche)
- Maximum **2 réservations par jour** et par client
- Annulation par le client possible uniquement **au-delà de 24h** avant le rendez-vous ; en dessous, seul le salon peut annuler
- Un avis ne peut être laissé que sur une prestation **confirmée** par l'administrateur

---

## À venir / pistes d'amélioration

- Statut « non honoré » distinct de l'annulation pour les no-show
- Paiement en ligne

---

## Auteur

Développé par **Simo Dimitri**
