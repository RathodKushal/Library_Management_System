# LJKU Library Management System

A premium, full-stack library management system featuring a sleek, glassmorphic UI and an intuitive dashboard for managing library operations. 

## Features

- **High-End UI/UX:** Built with React, Vite, and Framer Motion for beautiful, fluid interactions. Features a signature Deep Navy and Champagne Gold aesthetic.
- **Library Dashboard:** Track active issues, overdue books, and registered students at a glance.
- **Transactions:** Manage issuing, returning, and tracking books effortlessly.
- **Robust Backend:** Powered by Node.js and Express to securely handle member data, book collections, and fines.

## Project Structure

The repository is structured as a monorepo with two main directories:

- `/client` - The React + Vite frontend application.
- `/server` - The Node.js + Express backend API.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Start the Backend Server

Navigate to the `server` directory, install dependencies, and start the development server:

```bash
cd server
npm install
npm run dev
```
*(The server will typically start on `http://localhost:5000`)*

### 2. Start the Frontend Client

In a new terminal window, navigate to the `client` directory, install dependencies, and start the Vite development server:

```bash
cd client
npm install
npm run dev
```
*(The client will typically start on `http://localhost:5173`)*

## Tech Stack

**Frontend:**
- React (v19)
- Vite
- Framer Motion & GSAP (Animations)
- React Router DOM
- Phosphor Icons & Lucide React

**Backend:**
- Node.js
- Express
- SQLite (Database)
- Express Validator
- JSON Web Tokens (JWT)

## License

This project is proprietary and confidential.
