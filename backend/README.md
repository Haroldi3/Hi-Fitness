# FlexIQ Backend API (Starter)

## Setup
1) npm install
2) cp .env.example .env   # fill keys
3) npm start

## Endpoints
- GET /health
- GET /api/exercises?muscle=chest&difficulty=beginner
- POST /api/nutrition/natural  body: { "query": "2 eggs and 1 bagel" }
- GET /api/places/trails?lat=40.7128&lon=-74.0060&radius=5000
- POST /api/meal-photo/estimate (multipart form-data image=<file>)
