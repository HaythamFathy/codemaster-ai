# CodeMaster AI 🚀

An AI-powered learning platform for coding education with role-based dashboards, interactive analytics, and comprehensive course management.

## ✨ Features

- **Role-Based Dashboards** - Tailored interfaces for Admin, Instructor, Support, and Students
- **Interactive Analytics** - Real-time charts and metrics using Recharts
- **Course Management** - Complete CRUD operations for courses, lessons, and challenges
- **Code Execution** - Run and test student code submissions
- **User Management** - Search, view activity, and impersonate users (support)
- **Access Control** - JWT-based authentication with role-based permissions

## 🚀 Live Demo

**Production:** https://codemaster-ai.vercel.app

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

### Analytics
![Analytics](https://via.placeholder.com/800x400?text=Analytics+Dashboard)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Monaco Editor** - Code editor
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database (Supabase)
- **JWT** - Authentication
- **Pydantic** - Data validation

### Deployment
- **Vercel** - Frontend & API hosting
- **Supabase** - Database hosting
- **GitHub** - Version control

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.7+
- PostgreSQL database (or Supabase account)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/HaythamFathy/codemaster-ai.git
cd codemaster-ai
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
pip install -r requirements.txt
```

4. **Set up environment variables**

Create `.env` file in backend:
```env
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=http://localhost:3000
SECRET_KEY=your_secret_key
```

5. **Run database migrations**
```bash
# In Supabase SQL Editor, run:
# 1. fix_user_role_enum.sql
# 2. setup_test_data.sql
```

6. **Start development servers**

Frontend:
```bash
cd frontend
npm run dev
```

Backend (if running separately):
```bash
cd backend
uvicorn app.main:app --reload
```

## 📚 Documentation

- [Walkthrough](./docs/walkthrough.md) - Complete project overview
- [Testing Plan](./docs/testing_plan.md) - Comprehensive testing guide
- [Quick Reference](./docs/quick_reference.md) - Common tasks and commands
- [API Docs](https://codemaster-ai.vercel.app/api/docs) - Interactive API documentation

## 🎯 User Roles

### Admin
- Full platform access
- User management
- Analytics and insights
- Course creation and management

### Instructor
- Course creation
- Student tracking
- Submission review
- Performance metrics

### Support
- User search and diagnostics
- Activity log viewing
- User impersonation
- Issue resolution

### Student
- Course enrollment
- Lesson viewing
- Code challenges
- Progress tracking

## 🔑 Key Endpoints

### Authentication
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Log in
- `GET /api/auth/google/login` - Google OAuth

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (admin)
- `GET /api/courses/{id}` - Get course details

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/activity` - Recent activity
- `GET /api/admin/users/search` - Search users

### Instructor
- `GET /api/instructor/courses` - My courses
- `GET /api/instructor/stats` - My statistics
- `GET /api/instructor/submissions` - Recent submissions

## 🧪 Testing

Run the comprehensive testing plan:

```bash
# See docs/testing_plan.md for detailed scenarios
```

Key test areas:
- Authentication & access control
- Role-based dashboards
- Course management
- Code execution
- Analytics visualization

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

```bash
# Build frontend
cd frontend
npm run build

# Deploy to your hosting provider
```

## 📊 Database Schema

Key tables:
- `users` - User accounts and profiles
- `courses` - Course information
- `lessons` - Course lessons
- `challenges` - Coding challenges
- `submissions` - Student code submissions
- `enrollments` - Course enrollments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Haytham Fathy** - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI for the excellent Python web framework
- Supabase for database hosting
- Vercel for seamless deployment

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the testing plan

---

**Built with ❤️ using Next.js and FastAPI**
