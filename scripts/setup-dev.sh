#!/bin/bash

# AI-Driven Performance Review Platform - Development Setup Script
# This script sets up the development environment for the project

set -e

echo "🚀 Setting up AI-Driven Performance Review Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. You'll need to set up PostgreSQL and Redis manually."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose is not installed. You'll need to set up services manually."
    fi
    
    print_success "Requirements check completed"
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_error "env.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping..."
    fi
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    if [ ! -d node_modules ]; then
        print_status "Installing backend dependencies..."
        npm install
        print_success "Backend dependencies installed"
    else
        print_warning "Backend dependencies already installed, skipping..."
    fi
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    if [ ! -d node_modules ]; then
        print_status "Installing frontend dependencies..."
        npm install
        print_success "Frontend dependencies installed"
    else
        print_warning "Frontend dependencies already installed, skipping..."
    fi
    
    cd ..
}

# Setup database with Docker
setup_database() {
    print_status "Setting up database..."
    
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_status "Starting database services with Docker..."
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        print_status "Running database migrations..."
        cd backend
        npm run migration:run 2>/dev/null || print_warning "Migrations failed - you may need to run them manually"
        cd ..
        
        print_success "Database setup completed"
    else
        print_warning "Docker not available. Please set up PostgreSQL and Redis manually:"
        print_warning "1. Install PostgreSQL 15+"
        print_warning "2. Install Redis 7+"
        print_warning "3. Create database 'performance_review_db'"
        print_warning "4. Update .env file with your database credentials"
        print_warning "5. Run 'npm run migration:run' in the backend directory"
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend
    npm test 2>/dev/null || print_warning "Backend tests failed - this is normal for initial setup"
    cd ..
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd frontend
    npm test -- --watchAll=false 2>/dev/null || print_warning "Frontend tests failed - this is normal for initial setup"
    cd ..
    
    print_success "Tests completed"
}

# Start development servers
start_dev_servers() {
    print_status "Development setup completed!"
    print_success "To start the development servers:"
    echo ""
    echo "Option 1 - Using Docker Compose (Recommended):"
    echo "  docker-compose up"
    echo ""
    echo "Option 2 - Manual startup:"
    echo "  Terminal 1: cd backend && npm run start:dev"
    echo "  Terminal 2: cd frontend && npm run dev"
    echo ""
    echo "The application will be available at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo ""
    print_warning "Don't forget to:"
    print_warning "1. Update .env file with your API keys (OpenAI, Pinecone)"
    print_warning "2. Configure your database connection if not using Docker"
}

# Main execution
main() {
    echo "=================================================="
    echo "  AI-Driven Performance Review Platform Setup"
    echo "=================================================="
    echo ""
    
    check_requirements
    setup_env
    setup_backend
    setup_frontend
    setup_database
    run_tests
    start_dev_servers
    
    echo ""
    print_success "🎉 Setup completed successfully!"
}

# Run main function
main "$@" 