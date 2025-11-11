#!/bin/bash

# Movie Browser Backend Setup & Run Script
# This script handles backend setup, dependency installation, and server startup

set -e  # Exit on any error

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

print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "  Movie Browser Backend Setup"
    echo "=================================="
    echo -e "${NC}"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
        print_error "Please run this script from the project root directory (where package.json and backend/ folder exist)"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v16 or higher) and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please install Node.js v16 or higher."
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if MongoDB is running (optional, as user might use Atlas)
check_mongodb() {
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB is running locally"
        else
            print_warning "MongoDB is installed but not running. Starting it..."
            # Try to start MongoDB in background
            mongod --fork --logpath /tmp/mongod.log --dbpath /tmp/mongodb-data || {
                print_warning "Could not start MongoDB. Please start it manually or use MongoDB Atlas"
            }
        fi
    else
        print_warning "MongoDB not found locally. Make sure to configure MongoDB Atlas in .env"
    fi
}

# Install backend dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "Backend package.json not found!"
        exit 1
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ..
}

# Setup environment file
setup_environment() {
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            print_status "Creating .env file from .env.example..."
            cp backend/.env.example backend/.env
            print_warning "Please edit backend/.env file with your MongoDB URI and Firebase credentials"
        else
            print_error "backend/.env.example file not found!"
            exit 1
        fi
    else
        print_success "Environment file already exists"
    fi
}

# Check if environment is configured
check_environment() {
    if grep -q "your-firebase-project-id" backend/.env 2>/dev/null; then
        print_warning "Environment file contains placeholder values."
        print_warning "Please edit backend/.env with your actual Firebase credentials before running the server."
        echo ""
        echo -e "${YELLOW}Required environment variables:${NC}"
        echo "  - MONGODB_URI (MongoDB connection string)"
        echo "  - FIREBASE_PROJECT_ID"
        echo "  - FIREBASE_CLIENT_EMAIL"
        echo "  - FIREBASE_PRIVATE_KEY"
        echo ""
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Exiting. Please configure the environment first."
            exit 1
        fi
    fi
}

# Seed database
seed_database() {
    print_status "Checking if database seeding is needed..."
    cd backend
    
    # Ask user if they want to seed the database
    echo ""
    read -p "Do you want to seed the database with movie data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Seeding database with movie data..."
        npm run seed
        
        if [ $? -eq 0 ]; then
            print_success "Database seeded successfully"
        else
            print_warning "Database seeding failed. Server will still start."
        fi
    else
        print_status "Skipping database seeding"
    fi
    
    cd ..
}

# Start the backend server
start_server() {
    print_status "Starting backend server..."
    cd backend
    
    echo ""
    echo -e "${GREEN}🚀 Backend server starting...${NC}"
    echo -e "${BLUE}📡 API will be available at: http://localhost:5001${NC}"
    echo -e "${BLUE}📋 Health check: http://localhost:5001/api/health${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    
    # Start server with npm run dev (nodemon for auto-restart)
    npm run dev
}

# Main execution
main() {
    print_header
    
    print_status "Starting backend setup process..."
    
    # Run all checks and setup steps
    check_directory
    check_node
    check_mongodb
    install_dependencies
    setup_environment
    check_environment
    seed_database
    
    echo ""
    print_success "Backend setup completed successfully!"
    echo ""
    
    # Start the server
    start_server
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}Script interrupted. Cleaning up...${NC}"; exit 1' INT

# Run main function
main