# 📝 Task Manager App

A simple RESTful API for managing tasks and users, built with **Node.js**, **Express**, **Sequelize**, **MySQL**, and paired with a Flutter frontend.

---

## 📁 Project Structure

```
.
├── config/           # Sequelize DB config
├── tasks/            # Task model, controller, and route
├── users/            # User model, controller, and route
├── routes/           # Combined API routes
├── utils/            # Utility functions (e.g., normalization)
├── task_app/         # Flutter frontend app (modularized)
│   ├── android/ios/web/linux/windows/macos/ # Platform folders
│   ├── lib/          # Flutter Dart source files
│   ├── assets/       # App icons and splash assets
│   ├── pubspec.yaml  # Flutter dependencies
├── .env              # Environment variables (not committed)
├── index.js          # Express app entry point
├── package.json      # NPM scripts and metadata
├── README.md         # Project overview and docs
```

---

## ⚙️ Features

- ✅ Full CRUD for tasks and users
- 🛡 Field validation (e.g. unique task titles, allowed roles)
- ⏳ Prevent past due dates and future birthdates
- 📲 Flutter frontend with splash screen and launcher icons
- 🔌 API-first backend with modular separation

---

## 🧱 Technologies

- **Backend**:
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [Sequelize](https://sequelize.org/)
  - [MySQL](https://www.mysql.com/)
- **Frontend**:
  - [Flutter](https://flutter.dev/)
  - [Dart](https://dart.dev/)
  - [flutter_launcher_icons](https://pub.dev/packages/flutter_launcher_icons)
  - [flutter_native_splash](https://pub.dev/packages/flutter_native_splash)

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/task-manager-app.git
cd task-manager-app
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```env
# Remote DB (optional)
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=your-db-name
DB_USER=your-username
DB_PASS=your-password
DB_DIALECT=mysql

# Local fallback
LOCAL_DB_HOST=localhost
LOCAL_DB_NAME=task_manager
LOCAL_DB_USER=root
LOCAL_DB_PASS=
```

### 4. Setup Flutter frontend

```bash
cd task_app
flutter pub get
flutter pub run flutter_launcher_icons
flutter pub run flutter_native_splash:create
```

The API should be running at:

```
http://localhost:3000/api
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

- Uses modular structure: `tasks/`, `users/`, etc.
- Sequelize is initialized via `config/database.js`
- Flutter icons and splash screens are generated via pub commands

---

## 🧹 To Do

- [ ] Add JWT authentication
- [ ] Add pagination support
- [ ] Deployment (Render, Vercel, etc.)

---

## 📄 License

MIT © 2025 ferdy101
