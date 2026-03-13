# Gmax Electric Dealer Portal

A modern, full-stack B2B Order Management SaaS platform built to replace WhatsApp ordering with a professional digital experience. 

## Features

- **Role-Based Workflows**: Dealers, Sales Managers, and Admins.
- **Electric Aesthetics**: Tailwind CSS dark/light theme designed for a slick SaaS vibe.
- **Persistent Cart**: Zustand-powered shopping cart.
- **Order Tracking**: Interactive timelines and PDF invoice download mockups.
- **Analytics Dashboard**: Real-time sales charts powered by Recharts.

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS v4
- **Backend**: Node.js, Express.js, Mongoose, JWT Auth
- **Database**: MongoDB

## How to Run Locally

### 1. Backend Setup
1. `cd backend`
2. Run `npm install`
3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gmax-platform
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the server: `npm run dev`

### 2. Frontend Setup
1. `cd frontend`
2. Run `npm install`
3. Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start Next.js: `npm run dev`
5. Open `http://localhost:3000`

## Deployment Instructions

### Deploying the Backend (Render/Railway)
1. Push the `/backend` folder to a GitHub repository.
2. Connect the repository to your Render or Railway account.
3. Add the environment variables (`MONGO_URI`, `JWT_SECRET`, etc.).
4. The build command is `npm install`, and the start command is `node server.js`.

### Deploying the Frontend (Vercel)
1. Push the `/frontend` folder to GitHub.
2. Import the repository into Vercel.
3. Make sure the framework preset is set to **Next.js**.
4. Set the Environment Variable `NEXT_PUBLIC_API_URL` to the live URL of your backend (e.g. `https://gmax-api.onrender.com/api`).
5. Click **Deploy**. Vercel will automatically build and host the site.
