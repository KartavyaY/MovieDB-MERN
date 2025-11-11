#!/bin/bash

# Quick run script for Movie Browser
# Use this when everything is already set up

echo "🎬 Starting Movie Browser..."
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both frontend and backend concurrently
npm run dev