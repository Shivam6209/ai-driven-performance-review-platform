# AI-Driven Performance Review & OKR Platform

A comprehensive enterprise performance management platform that streamlines performance reviews through AI-generated content, structured OKRs, continuous feedback, and insightful analytics.

## 🚀 Features

### Core Features (MVP)
- **Employee Identity & Access Management** - Role-based access control with namespace isolation
- **OKR & Goal Management System** - Hierarchical OKR structure with visual progress tracking
- **Continuous Feedback System** - Peer-to-peer, upward, and downward feedback with threading
- **AI-Powered Performance Review Engine** - Automated review generation with human oversight
- **Advanced Analytics & Reporting** - Performance dashboards and sentiment analysis

### Key Value Propositions
- Reduce performance review time by 70% through AI assistance
- Eliminate bias through structured, data-driven feedback generation
- Improve feedback quality and consistency across the organization
- Provide real-time insights into team performance and goal progress

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js with TypeScript, Material-UI
- **Backend**: NestJS with TypeScript, PostgreSQL, Redis
- **AI Integration**: LangChain, OpenAI, Pinecone Vector Database
- **Real-time**: Firebase (optional)
- **Deployment**: Docker, GitHub Actions CI/CD

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │    NestJS       │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend API   │◄──►│   Primary DB    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   LangChain     │    │   Pinecone      │
│   Real-time     │    │   AI Engine     │    │   Vector DB     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- OpenAI API Key
- Pinecone API Key

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-driven-performance-review-platform
   ```

2. **Copy environment variables**
   ```bash
   cp env.example .env
   ```

3. **Configure environment variables**
   Edit `.env` file with your actual values:
   ```env
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=performance_review_db
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your-password
   
   # AI Configuration
   OPENAI_API_KEY=your-openai-api-key
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_ENVIRONMENT=your-pinecone-environment
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   ```

### Development Setup

#### Option 1: Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option 2: Manual Setup

1. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres123 postgres:15
   docker run -d --name redis -p 6379:6379 redis:7
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run migration:run
   npm run start:dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Setup

1. **Run migrations**
   ```bash
   cd backend
   npm run migration:run
   ```

2. **Seed initial data (optional)**
   ```bash
   npm run seed
   ```

### Email Service Setup (Mailjet)

1. **Create Mailjet Account**
   - Sign up at [Mailjet.com](https://www.mailjet.com/)
   - Get your API Key and Secret Key from the dashboard

2. **Configure Environment Variables**
   ```bash
   # Add to your .env file
   MAILJET_API_KEY=your-mailjet-api-key
   MAILJET_API_SECRET=your-mailjet-secret-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Test Email Integration**
   ```bash
   node test-mailjet-integration.js
   ```

The invitation system will now send professional HTML emails with login credentials to new users.

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Employee Endpoints
- `GET /employees` - List employees
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### OKR Endpoints
- `GET /okrs` - List OKRs
- `GET /okrs/:id` - Get OKR details
- `POST /okrs` - Create OKR
- `PUT /okrs/:id` - Update OKR
- `PATCH /okrs/:id/progress` - Update OKR progress

### Feedback Endpoints
- `GET /feedback` - List feedback
- `POST /feedback` - Create feedback
- `PUT /feedback/:id` - Update feedback
- `PATCH /feedback/:id/read` - Mark as read

### AI Endpoints
- `POST /ai/generate-review` - Generate AI review
- `POST /ai/analyze-sentiment` - Analyze feedback sentiment

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Test coverage
```

### Frontend Tests
```bash
cd frontend
npm run test             # Unit tests
npm run test:coverage    # Test coverage
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

### Docker Deployment
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring & Analytics

### Health Checks
- Backend: `GET /health`
- Database: Built-in PostgreSQL health checks
- Redis: Built-in Redis health checks

### Metrics
- API response times
- Database query performance
- AI generation success rates
- User engagement metrics

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Session management
- Password encryption

### Data Protection
- Data encryption in transit (HTTPS)
- Data encryption at rest
- Employee namespace isolation
- Audit logging

### AI Safety
- Source verification for all AI-generated content
- Real-time validation during content generation
- Human oversight requirements
- Confidence scoring and fallback mechanisms

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Jest for testing
- Conventional commits for commit messages

### Pull Request Process
1. Ensure all tests pass
2. Update documentation as needed
3. Add tests for new features
4. Follow the existing code style
5. Get approval from maintainers

## 📋 Project Status

### Phase 1: Foundation ✅
- [x] Project setup and infrastructure
- [x] Core backend modules
- [x] Basic frontend components
- [x] Authentication system
- [x] Database schema and migrations
- [x] Docker containerization
- [x] CI/CD pipeline

### Phase 2: AI Integration 🚧
- [x] Vector database setup
- [x] AI service integration
- [x] Review generation pipeline
- [x] Real-time validation
- [ ] Comprehensive testing
- [ ] Performance optimization

### Phase 3: Advanced Features 📋
- [ ] Sentiment analysis
- [ ] Advanced analytics
- [ ] Performance review workflows
- [ ] Mobile optimization
- [ ] Advanced OKR features

### Phase 4: Scale & Polish 📋
- [ ] Enterprise features
- [ ] Integration APIs
- [ ] Advanced AI models
- [ ] User experience refinement

## 📞 Support

### Documentation
- [API Documentation](./docs/api.md)
- [User Guide](./docs/user-guide.md)
- [Admin Guide](./docs/admin-guide.md)

### Getting Help
- Create an issue for bugs or feature requests
- Check existing issues before creating new ones
- Use discussions for questions and general help

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Pinecone for vector database
- Material-UI for UI components
- NestJS and Next.js communities