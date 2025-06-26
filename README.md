# 📝 Task Manager App

A simple RESTful API for managing tasks and users, built with **Node.js**, **Express**, **Sequelize**, and **MySQL**.

---

## 📁 Project Structure

```
.
├── config/           # Sequelize DB config
├── models/           # Sequelize models (User, Task)
├── routes/           # Express route handlers
├── tasks/            # Task controller and route
├── users/            # User controller and route
├── utils/            # Utility functions (e.g., role/status normalization)
├── index.js          # App entry point
├── .env              # Environment variables (not committed)
├── .gitignore        # Git ignore file
├── package.json      # NPM metadata and scripts
```

---

## ⚙️ Features

- ✅ Create, read, update, delete (CRUD) for both users and tasks.
- 🛡 Validations for fields like title uniqueness, allowed roles and statuses.
- 📅 Prevent past due dates.
- 📦 Clean modular folder structure.

---

## 🧱 Technologies

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [MySQL](https://www.mysql.com/)
- [dotenv](https://github.com/motdotla/dotenv)

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/task-manager-app.git
cd task-manager-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
# Remote DB (e.g., PlanetScale, Railway, etc.)
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=your-db-name
DB_USER=your-username
DB_PASS=your-password
DB_DIALECT=mysql

# Local fallback (used if remote is unreachable)
LOCAL_DB_HOST=localhost
LOCAL_DB_NAME=task_manager
LOCAL_DB_USER=root
LOCAL_DB_PASS=
```

### 4. Run the app

```bash
# For development
npm run dev

# Or basic
node index.js
```

The API should now be running at:

```
http://localhost:4000/api
```

---

## 📬 API Endpoints

### Users

| Method | Endpoint        | Description          |
|--------|------------------|----------------------|
| GET    | `/api/users`     | List all users       |
| POST   | `/api/users`     | Create a user        |
| PUT    | `/api/users/:id` | Update a user        |
| DELETE | `/api/users/:id` | Delete a user        |

### Tasks

| Method | Endpoint        | Description          |
|--------|------------------|----------------------|
| GET    | `/api/tasks`     | List all tasks       |
| POST   | `/api/tasks`     | Create a task        |
| PUT    | `/api/tasks/:id` | Update a task        |
| DELETE | `/api/tasks/:id` | Delete a task        |

---

## 🔍 Validations

### User
- `name`: required, unique
- `birthDate`: required, must not be in the future
- `role`: must be either `user` or `administrator`

### Task
- `title`: required, unique
- `status`: must be one of `pending`, `in-progress`, `done`
- `dueDate`: optional, but must not be in the past

---

## 📌 Notes

- Controllers are modular and rely on model imports (`require('../models')`).
- Sequelize is initialized once and injected globally via `models/index.js`.

---

## 🧹 To Do

- [ ] Add authentication (e.g., JWT)
- [ ] Add pagination
- [ ] Deploy to production (Render, Vercel, etc.)

---

## 📄 License

MIT © 2025 Your Name