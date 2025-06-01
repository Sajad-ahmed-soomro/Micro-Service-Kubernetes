# 🧩 Microservices-Based Application

This project is a modular, containerized microservices application composed of **Auth**, **Blog**, and **Analytics** services. It demonstrates full-stack development, CI/CD automation with GitHub Actions, Docker-based containerization, and deployment on a local Kubernetes cluster.

---

## 🔧 Technologies Used

* **Backend:** Node.js, Express.js
* **Microservices:** Auth Service, Blog Service, Analytics Service
* **Containerization:** Docker
* **CI/CD:** GitHub Actions (YAML workflow files)
* **Orchestration:** Kubernetes (local cluster)
* **Registry:** Docker Hub

---

## 📦 Services Overview

### 1. Auth Service

* Handles user registration, login, and authentication
* Issues and validates JWT tokens

### 2. Blog Service

* Enables CRUD operations for blog posts
* Authenticates users via Auth Service

### 3. Analytics Service

* Tracks and analyzes blog usage and user interaction

---

## 🚀 CI/CD Pipeline

Each service includes a GitHub Actions YAML workflow to:

* Run tests
* Build Docker images
* Push images to **Docker Hub**

Workflows are triggered on `push` and `pull_request`.

---

## 🐳 Docker & Kubernetes

### Docker

* Each service has its own `Dockerfile`
* Docker images are built and tagged automatically through GitHub Actions
* Images are pushed to [Docker Hub](https://hub.docker.com/repositories/sajadahmed)

### Kubernetes

* All services are deployed via Kubernetes using:

  * Deployment and Service YAML files
  * Local Kubernetes cluster (Minikube)
* Services communicate through internal DNS names

---

## 📁 Folder Structure

```
/
├── auth-service/
│   ├── Dockerfile
│   └── ...
├── blog-service/
│   ├── Dockerfile
│   └── ...
├── analytics-service/
│   ├── Dockerfile
│   └── ...
├── k8s/
│   ├── auth-deployment.yaml
│   ├── blog-deployment.yaml
│   ├── analytics-deployment.yaml
│   └── ...
├── .github/workflows/
│   ├──  ci-cd.yml
│   
│  
└── README.md
```

---

## 🛠️ How to Run Locally

1. **Clone the repo**

   ```bash
   git clone https://github.com/Sajad-ahmed-soomro/Mirco-Service
   cd your-dir
   ```

2. **Start Kubernetes Cluster (e.g., Minikube)**

   ```bash
   minikube start
   ```

3. **Apply Kubernetes Manifests**

   ```bash
   kubectl apply -f k8s/
   ```

4. **Check Services**

   ```bash
   kubectl get pods
   kubectl get services
   ```

---

## ✅ Future Improvements

* Add API Gateway
* Implement centralized logging and monitoring
* Enable HTTPS and service mesh
* Add frontend UI

---


---

