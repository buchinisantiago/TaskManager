# Task Manager App

A full-stack task management application with React, Node.js, and SQLite.

## Prerequisites
- **Node.js**: You must have Node.js installed to run this application.
  - Download: [https://nodejs.org/](https://nodejs.org/)

## Setup Instructions

### 1. Backend (Server)
Navigate to the server directory and install dependencies:
```bash
cd task-manager/server
npm install
```
Start the server:
```bash
npm start
```
The server will run on `http://localhost:5000`.

### 2. Frontend (Client)
Open a new terminal, navigate to the client directory:
```bash
cd task-manager/client
npm install
```
Start the React development server:
```bash
npm run dev
```
Open the URL shown (usually `http://localhost:5173`) in your browser.

## Features
- **Dashboard**: Create tasks, filter by status (All/Pending/Completed).
- **Calendar**: View tasks by due date.
- **Categorization**: Tasks are automatically categorized by Importance/Urgency (Eisenhower Matrix).
- **Email Summary**: (Console Log simulation) Runs daily at 8:00 AM.

## Troubleshooting
- If `npm install` fails, ensure Node.js is correctly installed and added to your PATH.
- If dependencies are missing, run `npm install` in both folders.
