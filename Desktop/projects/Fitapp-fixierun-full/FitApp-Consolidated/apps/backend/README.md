# FitApp Python Backend: Google Fitness API Integration

This is the unified Flask-based backend microservice for FitApp, responsible for:
- Secure integration with Google Fitness API (OAuth2, data pull)
- Data aggregation and advanced queries
- Metrics export (Prometheus)
- Service API (REST) for use by the Next.js frontend and move-to-earn modules

---

## Features

- Google Fitness API integration (secure OAuth2 flow, token refresh, bucketed stats)
- Flask REST API endpoints
- Modular structure for future device/support extensions (e.g., Strava)
- Prometheus metrics endpoint (`/metrics`)
- Containerized with Docker (for local & CI dev)
- Secure `.env` configuration (do not commit real secrets!)

---

## Setup: Local Development

### 1. Python environment

- **Recommended:** Python 3.11+
- Use `venv`, `pipenv`, or Docker (see below)

### 2. Install dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables

- Copy `.env.example` to `.env`
- Fill in values for:
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `OAUTH_REDIRECT_URI`
    - `FLASK_SECRET_KEY`

_For Google OAuth client setup, see: https://console.cloud.google.com/apis/credentials_

### 4. Run the Flask app

```bash
export FLASK_APP=app.py
flask run
```

or with Gunicorn (recommended in prod):

```bash
gunicorn --bind 0.0.0.0:5000 wsgi:app
```

---

## Docker Usage (optional)

```bash
# Build the container
docker build -t fitapp-backend .

# Run it (with your env file)
docker run --env-file .env -p 5000:5000 fitapp-backend
```

---

## Google Fitness API
- Fully OAuth 2.0-compliant (token refresh handled)
- Recommended scopes in `.env.example`
- [API Docs](https://developers.google.com/fit/rest/v1/get-started)

---

## Prometheus Metrics

- Metrics exported on `/metrics` (port defaults to 8000, see `.env`)
- Add scraping job to your Prometheus config as needed

---

## Project Structure

- `app.py` – Flask app entrypoint
- `config/`, `models/`, `routes/`, `utils/`, `web3/` – modular logic
- `Dockerfile`/`requirements.txt` – core build
- `wsgi.py` – For Gunicorn serving

---

## Dev Workflows

- Edit in `apps/backend`, use `venv`, or Docker
- Secrets/settings in `.env`
- Automated tests in `/tests`
- For extensions (other health APIs), add blueprints/modules

---

## Onboarding

Anyone can get started with:
1. `cp .env.example .env`
2. Fill values from your cloud console
3. `pip install -r requirements.txt` (or `docker build ...`)
4. `flask run`

---

## CI/CD Compatibility

- Minimal, standard Python structure (venv/.env approach)
- Docker-ready for K8s or Compose
- Add your pipelines in `.github/workflows` as needed

---

