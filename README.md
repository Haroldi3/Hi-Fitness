# FlexIQ Connected Package (Backend + Expo)

Open this folder in VS Code.

- backend/  -> Node/Express API
- expo_app/ -> Copy into an Expo project created with create-expo-app

## Backend
cd backend
npm install
cp .env.example .env   # fill keys
npm start
Test: http://localhost:5000/health

## Expo
1) npx create-expo-app flexiq-mobile
2) Copy expo_app/App.js and expo_app/src into your new Expo app
3) Install deps (see expo_app/README.md)
4) Set API_BASE in src/api/client.js
5) npx expo start
