# Cloud Tasks Pro - Cloud Project

A polished microservices project for a cloud computing course.

## Stack
- Frontend: React + Vite
- API service: Node.js + Express + PostgreSQL
- Auth service: Node.js + Express + JWT
- Database: PostgreSQL
- Containers: Docker
- Orchestration: Kubernetes
- Gateway: Ingress NGINX

## Architecture
Client -> Ingress -> Frontend / API / Auth -> PostgreSQL

## Features
- Modern task manager UI
- User registration and login endpoints
- Task CRUD API
- PostgreSQL persistence
- Dockerfiles for each service
- Kubernetes deployments, services, secrets, config map, ingress

## Quick local run with Docker Compose
1. Run:
   ```bash
   docker compose up --build
   ```
2. Open:
   - Frontend: http://localhost:8080
   - API health: http://localhost:3000/health
   - Auth health: http://localhost:3001/health

## Kubernetes deployment
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-configmap.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/auth.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

## CI/CD Docker Hub (GitHub Actions)
This project includes a workflow at `.github/workflows/dockerhub-cicd.yml`.

It automatically builds and pushes these images on each push to `main` or `master`:
- `<DOCKERHUB_USERNAME>/api-service:latest`
- `<DOCKERHUB_USERNAME>/auth-service:latest`
- `<DOCKERHUB_USERNAME>/cloud-frontend:latest`

It also pushes a commit-specific tag for traceability:
- `<DOCKERHUB_USERNAME>/<image>:<GITHUB_SHA>`

Required GitHub repository secrets:
- `DOCKERHUB_USERNAME` (Docker Hub username, lowercase)
- `DOCKERHUB_TOKEN` (Docker Hub access token)

You can also run the workflow manually from the Actions tab using `workflow_dispatch`.
