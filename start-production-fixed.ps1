# Production startup script for MovieDB MERN Application
# This script starts both frontend and backend servers for production use with kartavyayadav.in domain

Write-Host "Starting MovieDB MERN Application in Production Mode" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host ""

# Function to handle cleanup on exit
function Cleanup {
    Write-Host ""
    Write-Host "Shutting down servers..." -ForegroundColor Red
    try {
        Get-Job | Stop-Job -ErrorAction SilentlyContinue
        Get-Job | Remove-Job -ErrorAction SilentlyContinue
    } catch {
        # Ignore cleanup errors
    }
    Write-Host "Cleanup completed" -ForegroundColor Green
}

# Set up Ctrl+C handler
try {
    Register-EngineEvent PowerShell.Exiting -Action { Cleanup } | Out-Null
} catch {
    # Ignore if already registered
}

# Check if MongoDB is running
Write-Host "Checking MongoDB status..." -ForegroundColor Cyan
try {
    $mongoStatus = mongosh --eval "db.adminCommand('ismaster')" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
        Write-Host "   Run: mongod" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "[WARNING] Could not check MongoDB status. Assuming it is running..." -ForegroundColor Yellow
}

# Check if ports are available
Write-Host ""
Write-Host "Checking if ports 5001 and 5173 are available..." -ForegroundColor Cyan

try {
    $port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    $port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

    if ($port5001) {
        Write-Host "[WARNING] Port 5001 is already in use. Please stop the existing process." -ForegroundColor Yellow
        try {
            Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Format-Table Name, Id, CPU
        } catch {
            Write-Host "   Unable to identify process using port 5001" -ForegroundColor Yellow
        }
    }

    if ($port5173) {
        Write-Host "[WARNING] Port 5173 is already in use. Please stop the existing process." -ForegroundColor Yellow
        try {
            Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Format-Table Name, Id, CPU
        } catch {
            Write-Host "   Unable to identify process using port 5173" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "[WARNING] Could not check port status. Continuing..." -ForegroundColor Yellow
}

# Set environment variables for production
$env:NODE_ENV = "production"

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Green
Write-Host "Backend API: http://localhost:5001 (proxied via kartavyayadav.in/api)" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:5173 (proxied via kartavyayadav.in)" -ForegroundColor Blue
Write-Host "Production URL: https://kartavyayadav.in" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

try {
    # Start backend server in background
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    $backendJob = Start-Job -Name "Backend" -ScriptBlock {
        Set-Location "c:\Users\MainFrame\Desktop\MovieDB-MERN\backend"
        npm start
    }

    # Wait a moment for backend to start
    Start-Sleep -Seconds 3

    # Check if backend started successfully
    if ($backendJob.State -eq "Running") {
        Write-Host "[OK] Backend server started successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Backend server failed to start" -ForegroundColor Red
        Receive-Job $backendJob
        Cleanup
        exit 1
    }

    # Start frontend server
    Write-Host "Starting frontend server..." -ForegroundColor Cyan
    Set-Location "c:\Users\MainFrame\Desktop\MovieDB-MERN\frontend"
    
    # Start frontend and keep it in foreground so we can see logs
    npm run dev

} catch {
    Write-Host "[ERROR] Error starting servers: $($_.Exception.Message)" -ForegroundColor Red
    Cleanup
    exit 1
}

# If we reach here, the frontend has stopped, so cleanup
Cleanup