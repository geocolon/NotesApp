# Blerdalerts

A web-based notes application with user authentication powered by Keycloak, featuring a Python Flask backend and JavaScript frontend.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started with Docker](#getting-started-with-docker)
- [Getting Started on Localhost](#getting-started-on-localhost)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Ports](#ports)

## Overview

Blerdalerts is a full-stack notes application that provides secure user authentication and note management capabilities. The application uses Keycloak for identity and access management, Flask for the backend API, and a modern JavaScript frontend.

## Architecture

- **Frontend**: Static HTML/CSS/JavaScript served via Nginx
- **Backend**: Python Flask REST API
- **Authentication**: Keycloak identity provider
- **Deployment**: Docker containerized services

## Prerequisites

### For Docker Deployment
- Docker Engine 20.10 or higher
- Docker Compose 1.29 or higher

### For Localhost Deployment
- Python 3.8 or higher
- pip (Python package manager)
- Node.js and npm (for any frontend build tools, if needed)
- A web browser

## Getting Started with Docker

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd notes-app
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Keycloak Admin: http://localhost:8080

4. Default Keycloak credentials:
   - Username: `admin`
   - Password: `admin`

### Docker Commands

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

**Rebuild backend after changes:**
```bash
docker-compose up -d --build backend
```

**Production deployment:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Getting Started on Localhost

### File Locations by Platform

When running locally, project files are located as shown in the table below:

| Component | Mac/Linux | Windows | Description |
|-----------|-----------|---------|-------------|
| Project Root | `/Users/username/Documents/AWS/notes-app` | `C:\Users\username\Documents\AWS\notes-app` | Main project directory |
| Backend | `./backend/` | `.\backend\` | Flask application files |
| Backend Entry | `./backend/app.py` | `.\backend\app.py` | Flask server entry point |
| Backend Config | `./backend/config.py` | `.\backend\config.py` | Backend configuration |
| Frontend | `./frontend/` | `.\frontend\` | Static web files |
| Frontend HTML | `./frontend/index.html` | `.\frontend\index.html` | Main HTML page |
| Frontend JS | `./frontend/app.js` | `.\frontend\app.js` | Frontend JavaScript |
| Frontend CSS | `./frontend/styles.css` | `.\frontend\styles.css` | Stylesheet |
| Nginx Config | `./nginx.conf` | `.\nginx.conf` | Production nginx configuration |
| Docker Compose | `./docker-compose.yml` | `.\docker-compose.yml` | Local development setup |
| Production Compose | `./docker-compose.prod.yml` | `.\docker-compose.prod.yml` | Production deployment setup |

### Setup Instructions

#### 1. Set up Keycloak

You'll still need Keycloak running. The easiest way is using Docker:

```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:23.0 \
  start-dev
```

#### 2. Set up Backend

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export KEYCLOAK_URL=http://localhost:8080
export KEYCLOAK_REALM=notes-realm
export KEYCLOAK_CLIENT_ID=notes-client
python app.py
```

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:KEYCLOAK_URL="http://localhost:8080"
$env:KEYCLOAK_REALM="notes-realm"
$env:KEYCLOAK_CLIENT_ID="notes-client"
python app.py
```

**Windows (Command Prompt):**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
set KEYCLOAK_URL=http://localhost:8080
set KEYCLOAK_REALM=notes-realm
set KEYCLOAK_CLIENT_ID=notes-client
python app.py
```

The backend will start on http://localhost:5000

#### 3. Set up Frontend

The frontend consists of static files and can be served using Python's built-in HTTP server:

**Mac/Linux:**
```bash
cd frontend
python3 -m http.server 3000
```

**Windows:**
```cmd
cd frontend
python -m http.server 3000
```

Access the application at http://localhost:3000

## Project Structure

```
notes-app/
├── backend/
│   ├── Dockerfile              # Backend container configuration
│   ├── app.py                  # Flask application
│   ├── config.py               # Backend configuration
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html              # Main HTML page
│   ├── app.js                  # Frontend JavaScript
│   └── styles.css              # Application styles
├── keycloak/                   # Keycloak configuration
├── docker-compose.yml          # Local Docker setup
├── docker-compose.prod.yml     # Production Docker setup
├── nginx.conf                  # Production nginx config
├── nginx-frontend.conf         # Frontend nginx config
└── README.md                   # This file
```

## Configuration

### Environment Variables

The backend requires the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `KEYCLOAK_URL` | Keycloak server URL | `http://keycloak:8080` |
| `KEYCLOAK_REALM` | Keycloak realm name | `notes-realm` |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID | `notes-client` |

### Keycloak Setup

After starting Keycloak, you'll need to:

1. Access the admin console at http://localhost:8080
2. Log in with admin credentials
3. Create a new realm named `notes-realm`
4. Create a new client named `notes-client`
5. Configure the client for your application

## Ports

The application uses the following ports:

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Web interface |
| Backend API | 5001 | REST API (Docker) |
| Backend API | 5000 | REST API (Localhost) |
| Keycloak | 8080 | Authentication server |
| Nginx (Prod) | 80/443 | Production web server |
