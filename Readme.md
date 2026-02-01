# Task Management Web Application

A production-grade, full-stack task management system built with modern technologies. This project demonstrates enterprise-level practices including security, scalability, testing, and DevOps.

## 🎯 Project Overview

This application allows users to:

- **Register & authenticate** with JWT tokens
- **Create, read, update, delete** tasks (CRUD operations)
- **Manage tasks** with priority, status, due dates, and tags
- **Filter and search** tasks efficiently
- **Share tasks** with other users with permission levels
- **View audit logs** tracking all changes
- **Experience** a responsive, user-friendly interface

## 🏗️ Architecture

### Clean Architecture Principles

- **Controllers**: Coordinate requests, call services, return responses
- **Services**: Contain all business logic
- **Models**: Define data schemas and validation
- **Validators**: Input validation using Zod
- **Middlewares**: Handle authentication, errors, rate limiting, logging

### Technology Stack

#### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB 7 with Mongoose 8
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Logging**: Pino with structured logging
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest + Supertest

#### Frontend

- **Framework**: React 18 with Vite
- **Routing**: React Router 6
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Axios with interceptors
- **UI Components**: Lucide React
- **Styling**: Tailwind CSS
- **Notifications**: Sonner
- **Date Handling**: date-fns

#### DevOps

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions (ready)
- **Environment Management**: .env files

## 📋 Prerequisites

- Node.js 18 or higher
- MongoDB 7 (local or Atlas)
- Docker & Docker Compose (for containerized setup)
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd task-management

# Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Update .env with your MongoDB URI and JWT secrets
# MONGODB_URI=mongodb://localhost:27017/task-management
# JWT_SECRET=your-32-char-secret-key
# JWT_REFRESH_SECRET=your-32-char-refresh-key

# Run development server
npm run dev

# Or start production server
npm start

# Run tests
npm test

# Generate coverage report
npm run test:coverage
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Update .env.local with your API URL
# VITE_API_URL=http://localhost:5000/api/v1

# Run development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

### 4. Docker Setup (Alternative)

```bash
# Create .env files in project root
echo 'JWT_SECRET=your-32-character-secret-key-here' > .env
echo 'JWT_REFRESH_SECRET=your-32-character-refresh-key-here' >> .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: Access tokens (15m) + Refresh tokens (7d)
- **Role-Based Access**: User and Admin roles
- **Protected Routes**: All API endpoints require authentication
- **Token Refresh**: Automatic token refresh with interceptors

### Password Security

- **Bcrypt Hashing**: 10 rounds with salt
- **Account Lockout**: Lock after 5 failed attempts (30 minutes)
- **Password Validation**: Minimum 6 chars, require letters + numbers

### API Security

- **Helmet**: Sets secure HTTP headers
- **CORS**: Configurable origin-based access
- **Rate Limiting**:
  - General: 100 requests per 15 minutes
  - Auth: 5 requests per 15 minutes
  - Registration: 3 accounts per hour
- **Input Validation**: Zod schemas for all inputs
- **NoSQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content sanitization

### Data Protection

- **Soft Delete**: Tasks marked as deleted, not removed
- **Audit Logs**: Track all create/update/delete operations
- **TTL Index**: Audit logs auto-delete after 90 days
- **Field Permissions**: Sensitive fields excluded from responses

## 📚 API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response (201)**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "_id": "...", "email": "...", "name": "..." },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}
```

#### Get Profile

```http
GET /api/v1/auth/profile
Authorization: Bearer <accessToken>
```

### Task Endpoints

#### Create Task

```http
POST /api/v1/tasks
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task management app",
  "priority": "high",
  "status": "in_progress",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["important", "urgent"]
}
```

#### Get All Tasks

```http
GET /api/v1/tasks?page=1&limit=10&status=todo&priority=high&search=project&sortBy=dueDate&sortOrder=asc
Authorization: Bearer <accessToken>
```

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (todo, in_progress, done)
- `priority`: Filter by priority (low, medium, high)
- `search`: Search title and description
- `tags`: Filter by tags
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc or desc (default: desc)

#### Get Single Task

```http
GET /api/v1/tasks/:id
Authorization: Bearer <accessToken>
```

#### Update Task

```http
PATCH /api/v1/tasks/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "done"
}
```

#### Delete Task

```http
DELETE /api/v1/tasks/:id
Authorization: Bearer <accessToken>
```

#### Share Task

```http
POST /api/v1/tasks/:id/share
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "userId": "user-id",
  "permission": "view"
}
```

**Permission Levels**: `view`, `edit`, `admin`

#### Get Audit Log

```http
GET /api/v1/tasks/:id/audit?limit=50
Authorization: Bearer <accessToken>
```

### Health Check

```http
GET /health
```

Returns `200 OK` when server is healthy.

## 🧪 Testing

### Run All Tests

```bash
cd server
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Coverage Thresholds

- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

### Test Suite Includes

- ✅ Authentication (register, login, refresh, profile)
- ✅ Task CRUD operations
- ✅ Filtering and pagination
- ✅ Task sharing
- ✅ Error handling
- ✅ Authorization checks

## 📂 Project Structure

```
task-management/
├── server/                          # Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js              # Environment validation
│   │   │   └── db.js               # MongoDB connection
│   │   ├── models/
│   │   │   ├── user.model.js       # User schema
│   │   │   ├── task.model.js       # Task schema
│   │   │   └── audit.model.js      # Audit log schema
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── task.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js     # Auth business logic
│   │   │   └── task.service.js     # Task business logic
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── task.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── task.validator.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── token.js
│   │   ├── tests/
│   │   │   ├── auth.test.js
│   │   │   └── task.test.js
│   │   ├── app.js                  # Express app
│   │   └── server.js               # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── jest.config.js
│   └── Dockerfile
│
├── client/                          # Frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js      # Axios config + interceptors
│   │   │   ├── authApi.js
│   │   │   └── taskApi.js
│   │   ├── store/
│   │   │   ├── authStore.js        # Zustand auth store
│   │   │   └── taskStore.js        # Zustand task store
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml              # Docker orchestration
├── .env.example                    # Environment template
├── .gitignore
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME_MINUTES=30
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:5000/api/v1
```

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  name: String,
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  isActive: Boolean,
  loginAttempts: Number,
  lockUntil: Date,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  status: String (enum: ['todo', 'in_progress', 'done']),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date,
  tags: [String],
  owner: ObjectId (ref: User),
  sharedWith: [{
    userId: ObjectId,
    permission: String (enum: ['view', 'edit', 'admin'])
  }],
  isDeleted: Boolean (soft delete),
  createdAt: Date,
  updatedAt: Date
}
```

### Audits Collection

```javascript
{
  _id: ObjectId,
  action: String (enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGIN_FAILURE']),
  entityType: String (enum: ['TASK', 'USER']),
  entityId: ObjectId,
  userId: ObjectId (ref: User),
  changes: Mixed,
  metadata: Mixed,
  createdAt: Date (TTL: 90 days)
}
```

## 🎨 UI Features

### Components

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Task Cards**: Display tasks with status, priority, tags
- **Forms**: React Hook Form with validation
- **Filtering**: Real-time filtering by status, priority, search
- **Pagination**: Efficient data loading with pagination
- **Notifications**: Toast notifications for user feedback
- **Dark Mode Ready**: Easy to implement with Tailwind

### Pages

- **Login**: Email + password authentication
- **Register**: New user registration with password strength indicator
- **Dashboard**: Main task management interface
- **Task Details**: View individual task details

## 🚀 Deployment

### Heroku

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongo-uri

# Deploy
git push heroku main
```

### AWS/DigitalOcean

1. Use Docker images built from Dockerfile
2. Set environment variables in deployment
3. Connect to MongoDB Atlas or managed database
4. Configure domain and SSL

### Vercel (Frontend)

```bash
# Build
npm run build

# Deploy
vercel --prod
```

## 📈 Performance Optimization

### Backend

- ✅ Database indexing on frequently queried fields
- ✅ Connection pooling (min: 5, max: 10)
- ✅ Pagination for large datasets
- ✅ Compressed JSON responses
- ✅ Caching headers

### Frontend

- ✅ Code splitting with Vite
- ✅ Lazy loading components
- ✅ Zustand for efficient state management
- ✅ React Query for data caching
- ✅ Image optimization

## 🔍 Monitoring & Logging

### Backend Logging

- Structured logging with Pino
- Request/response logging
- Error logging with stack traces
- Custom contextual information

### Health Checks

```bash
curl http://localhost:5000/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For issues and questions:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Mongoose](https://mongoosejs.com)
- [React Documentation](https://react.dev)
- [JWT.io](https://jwt.io)
- [Tailwind CSS](https://tailwindcss.com)

## 🏁 Next Steps

### Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Task comments and discussions
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Calendar view integration
- [ ] Mobile app with React Native
- [ ] Teams/workspaces feature
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, GitHub)
- [ ] Dark mode toggle

---

**Built with ❤️ for enterprise-grade task management**
