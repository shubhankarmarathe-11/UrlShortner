# URL Shortner

A URL Shortener application built using **Microservices Architecture**.

This project allows users to create short URLs, redirect users efficiently, and track basic analytics. It was created to practice system design, service separation, Docker, Kubernetes, Redis, and production deployment concepts.

---

## Features

- Create short URLs
- Redirect short links to original URLs
- Basic analytics tracking
- Link expiry support
- Authentication service
- Email service integration
- Redis caching / session management
- Dockerized deployment
- Kubernetes-ready architecture

---

## Architecture

```plaintext
Frontend

├── URL Service
│   ├── Create Short URL
│   ├── Redirect URL
│   └── Analytics

├── Auth Service
│   ├── Login
│   └── Authentication

└── Email Service
    └── Email Processing


Redis
(Cache / Session Storage)
```

Each service is independently managed and separated by responsibility.

---

## Tech Stack

### Frontend

- React
- Vite

### Backend

- Node.js
- Express.js

### Database

- MongoDB

### Cache

- Redis

### DevOps

- Docker
- Kubernetes
- Nginx
- VPS Deployment

---

## Installation

Clone repository:

```bash
git clone <repository-url>
cd urlshortner
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

---

## Docker

Build image:

```bash
docker build -t urlshortner .
```

Run container:

```bash
docker run -p 80:80 urlshortner
```

---

## Environment Variables

Create `.env` file:

```env
PORT=
MONGO_URI=
REDIS_URL=
BASE_URL=
```

---

## Future Improvements

- Custom aliases
- Advanced analytics
- Rate limiting
- Geo analytics
- Device analytics
- Queue-based email processing
- CI/CD pipeline

---

## Purpose

This project was built for learning and practicing:

- Microservices Architecture
- Backend System Design
- Redis Integration
- Containerization
- Kubernetes Deployment
- Production-ready Deployment

---

## License

Personal learning and portfolio project.
