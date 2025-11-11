#!/bin/bash

# Movie Browser Setup Script
# This script sets up and runs the full-stack movie browser application

set -e

echo "🎬 Movie Browser Setup Script"
echo "================================"

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

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v16 or higher)"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if MongoDB is running
check_mongodb() {
    if command -v mongod &> /dev/null; then
        if pgrep mongod > /dev/null; then
            print_success "MongoDB is running"
        else
            print_warning "MongoDB is installed but not running"
            echo "You can start it with: mongod"
        fi
    else
        print_warning "MongoDB not found locally. Make sure you have:"
        echo "  1. MongoDB installed locally, or"
        echo "  2. MongoDB Atlas connection string in backend/.env"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies (concurrently)
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    print_success "All dependencies installed"
}

# Check environment files
check_env_files() {
    print_status "Checking environment configuration..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            print_warning "Backend .env file not found. Copying from .env.example"
            cp backend/.env.example backend/.env
            print_warning "Please update backend/.env with your actual values"
        else
            print_error "Backend .env.example not found"
        fi
    else
        print_success "Backend .env file exists"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            print_warning "Frontend .env file not found. Copying from .env.example"
            cp frontend/.env.example frontend/.env
            print_warning "Please update frontend/.env with your Firebase config"
        else
            print_error "Frontend .env.example not found"
        fi
    else
        print_success "Frontend .env file exists"
    fi
}

# Seed database
seed_database() {
    print_status "Seeding database with movie data..."
    cd backend
    if npm run seed; then
        print_success "Database seeded successfully"
    else
        print_warning "Database seeding failed. Check MongoDB connection and try again."
    fi
    cd ..
}

# Start the application
start_app() {
    print_status "Starting the application..."
    print_status "Backend will run on: http://localhost:5001"
    print_status "Frontend will run on: http://localhost:5173"
    echo ""
    print_status "Press Ctrl+C to stop both servers"
    echo ""
    
    # Start both frontend and backend
    npm run dev
}

# Main execution
main() {
    echo "🚀 Starting Movie Browser setup..."
    echo ""
    
    # Check prerequisites
    check_nodejs
    check_mongodb
    echo ""
    
    # Setup project
    install_dependencies
    echo ""
    
    check_env_files
    echo ""
    
    # Ask user if they want to seed the database
    echo "📚 Do you want to seed the database with movie data? (y/n)"
    read -r seed_choice
    if [[ $seed_choice =~ ^[Yy]$ ]]; then
        seed_database
        echo ""
    fi
    
    # Ask user if they want to start the app
    echo "🎬 Do you want to start the application now? (y/n)"
    read -r start_choice
    if [[ $start_choice =~ ^[Yy]$ ]]; then
        start_app
    else
        echo ""
        print_success "Setup complete! You can start the app later with:"
        echo "  npm run dev"
        echo ""
        print_status "Available commands:"
        echo "  npm run dev              - Start both frontend and backend in development"
        echo "  npm run backend:dev      - Start only backend"
        echo "  npm run frontend:dev     - Start only frontend"
        echo "  npm run backend:seed     - Seed database with movie data"
        echo "  npm run setup           - Install dependencies and seed database"
    fi
}

# Run main function
main