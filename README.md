# VIO - Healing Journey Companion 🌱

A compassionate digital companion for individuals navigating their healing journey from trauma and PTSD. Built with React, TypeScript, and Django.

![React](https://img.shields.io/badge/React-18.x-blue) ![Django](https://img.shields.io/badge/Django-5.x-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## ✨ Features

- **Treatment Routine Builder** - Schedule and track daily routines (+5 points per completion)
- **Progress Dashboard** - View stats, scores, and streaks
- **Memory Constellation** - Create visual maps of resilience moments
- **Breathing Exercises** - Guided 4-4-4-4 box breathing
- **Gamification** - Earn points, unlock avatars, build streaks
- **Future Self Messages** - Write encouraging messages to your future self

## 🛠️ Tech Stack

**Frontend:** React 18 • TypeScript • Vite • TailwindCSS • Axios • React Router DOM • Framer Motion

**Backend:** Django 5 • Django REST Framework • SQLite • JWT Authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/hanane-rh/vio.git
cd vio
```

**2. Backend Setup**
```bash
cd mon_projet
python manage.py migrate
python manage.py runserver  # Runs on http://localhost:8000
```

**3. Frontend Setup** (in a new terminal)
```bash
cd front
npm install
npm run dev  # Runs on http://localhost:5173
```

**4. Access the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## 📁 Project Structure

```
VIO-1/
├── front/                  # React frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── types/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── context/
│   └── package.json
│
└── mon_projet/            # Django backend
    ├── main/              # Main app
    │   ├── models.py
    │   ├── views.py
    │   └── serializers.py
    ├── manage.py
    └── db.sqlite3
```

## 🔑 Key Models

- **Users, Profiles, Scores** - Authentication and user data
- **Routines, Completions** - Routine tracking
- **Tasks** - Daily tasks and challenges
- **Constellation Stars** - Memory points
- **Notifications** - User notifications

## 🎮 Usage

### Creating a Routine
1. Go to **Routines** page
2. Click **Create New Routine**
3. Set name, time, frequency, and icon
4. Complete routines to earn +5 points!

### Django Admin
```bash
python manage.py createsuperuser
# Visit http://localhost:8000/admin
```

## 📡 API Endpoints

**Authentication:**
- `POST /api/auth/register/` - Register user
- `POST /api/auth/login/` - Login

**Routines:**
- `GET /api/routines/` - List routines
- `POST /api/routines/` - Create routine
- `POST /api/routines/{id}/complete/` - Complete (+5 pts)
- `POST /api/routines/{id}/toggle_pause/` - Pause/Resume

**Score:**
- `GET /api/user/score/` - Get user score and streaks

**Tasks:**
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/{id}/toggle/` - Toggle completion

Full API docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🛠️ Common Commands

**Backend:**
```bash
cd mon_projet
python manage.py runserver        # Start server
python manage.py migrate           # Run migrations
python manage.py createsuperuser   # Create admin
```

**Frontend:**
```bash
cd front
npm run dev      # Start dev server
npm run build    # Build for production
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)



**Made with 💚 for healing and growth**
