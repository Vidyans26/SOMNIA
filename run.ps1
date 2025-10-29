#!/usr/bin/env pwsh
<#
.SYNOPSIS
    SOMNIA - Sleep Health Monitoring System Launcher (Windows PowerShell)

.DESCRIPTION
    Launches the complete SOMNIA application stack with ML models enabled.
    Supports development and production modes.

.PARAMETER Mode
    Deployment mode: 'dev' for development or 'prod' for production (default: dev)

.PARAMETER BuildOnly
    Only build the Docker images without starting services

.PARAMETER Stop
    Stop all running services

.PARAMETER Clean
    Stop services and remove all containers, volumes, and images

.EXAMPLE
    .\run.ps1
    Starts SOMNIA in development mode

.EXAMPLE
    .\run.ps1 -Mode prod
    Starts SOMNIA in production mode

.EXAMPLE
    .\run.ps1 -Stop
    Stops all SOMNIA services

.EXAMPLE
    .\run.ps1 -Clean
    Complete cleanup of all SOMNIA containers and data
#>

param(
    [ValidateSet('dev', 'prod')]
    [string]$Mode = 'dev',
    
    [switch]$BuildOnly,
    [switch]$Stop,
    [switch]$Clean
)

$ErrorActionPreference = 'Stop'

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = 'White'
    )
    Write-Host $Message -ForegroundColor $Color
}

# ASCII Art Banner
function Show-Banner {
    Write-ColorOutput @"
    
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███████╗ ██████╗ ███╗   ███╗███╗   ██╗██╗ █████╗      ║
║   ██╔════╝██╔═══██╗████╗ ████║████╗  ██║██║██╔══██╗     ║
║   ███████╗██║   ██║██╔████╔██║██╔██╗ ██║██║███████║     ║
║   ╚════██║██║   ██║██║╚██╔╝██║██║╚██╗██║██║██╔══██║     ║
║   ███████║╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║██║  ██║     ║
║   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝     ║
║                                                           ║
║          Sleep Health Monitoring System v1.0             ║
║                  Powered by ML Models                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -Color Cyan
}

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-ColorOutput "❌ Docker is not running. Please start Docker Desktop." -Color Red
        return $false
    }
}

# Stop services
function Stop-Services {
    Write-ColorOutput "`n🛑 Stopping SOMNIA services..." -Color Yellow
    docker compose down
    Write-ColorOutput "✅ Services stopped successfully.`n" -Color Green
}

# Clean everything
function Clean-All {
    Write-ColorOutput "`n🧹 Cleaning all SOMNIA containers, volumes, and images..." -Color Yellow
    docker compose down -v --rmi all
    Write-ColorOutput "✅ Cleanup completed.`n" -Color Green
}

# Main execution
Show-Banner

if (-not (Test-DockerRunning)) {
    exit 1
}

# Handle stop flag
if ($Stop) {
    Stop-Services
    exit 0
}

# Handle clean flag
if ($Clean) {
    Clean-All
    exit 0
}

# Validate .env file
if (-not (Test-Path ".env")) {
    Write-ColorOutput "⚠️  No .env file found. Creating from template..." -Color Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-ColorOutput "✅ .env file created. Please review and update if needed." -Color Green
    } else {
        Write-ColorOutput @"
⚠️  Creating default .env file...
Please review backend/config.py for all available options.
"@ -Color Yellow
        
        @"
# SOMNIA Environment Configuration
DEBUG=true
ENVIRONMENT=$Mode
HOST=0.0.0.0
PORT=8000

# ML Model Configuration
ENABLE_ML_MODELS=true
USE_MOCK=false
ENABLE_SNORING=true
ENABLE_VIDEO_POSE=false

# Model Paths (relative to project root)
SPO2_MODEL_PATH=backend/models/SpO2_weights.hdf5
ECG_MODEL_PATH=backend/models/ecg_weights.hdf5
"@ | Out-File -FilePath ".env" -Encoding utf8
        
        Write-ColorOutput "✅ Default .env file created." -Color Green
    }
}

# Check model files
Write-ColorOutput "`n🔍 Checking ML model files..." -Color Cyan
$missingModels = @()

if (-not (Test-Path "backend/models/SpO2_weights.hdf5")) {
    $missingModels += "SpO2_weights.hdf5"
}
if (-not (Test-Path "backend/models/ecg_weights.hdf5")) {
    $missingModels += "ecg_weights.hdf5"
}

if ($missingModels.Count -gt 0) {
    Write-ColorOutput "⚠️  Missing model files: $($missingModels -join ', ')" -Color Yellow
    Write-ColorOutput "   The application will use mock data until models are available." -Color Yellow
} else {
    Write-ColorOutput "✅ All ML model files found." -Color Green
}

# Build and start services
Write-ColorOutput "`n🚀 Starting SOMNIA in $Mode mode..." -Color Cyan

if ($BuildOnly) {
    Write-ColorOutput "🔨 Building Docker images..." -Color Yellow
    docker compose build --no-cache
    Write-ColorOutput "✅ Build completed.`n" -Color Green
} else {
    Write-ColorOutput "🔨 Building and starting services..." -Color Yellow
    docker compose up --build -d
    
    # Wait for services to be healthy
    Write-ColorOutput "`n⏳ Waiting for services to be ready..." -Color Yellow
    Start-Sleep -Seconds 5
    
    # Check service status
    $backendStatus = docker compose ps backend --format json | ConvertFrom-Json
    
    if ($backendStatus.State -eq "running") {
        Write-ColorOutput "`n✅ SOMNIA Backend is running!" -Color Green
        Write-ColorOutput @"

📊 Service Endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 Backend API:      http://localhost:8000
🔹 API Documentation: http://localhost:8000/docs
🔹 Health Check:     http://localhost:8000/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 Mobile App Instructions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Open a new terminal
2. Navigate to: somnia-app/SOMNIA app/Somnia
3. Run: npm install (if not done already)
4. Run: npx expo start
5. Scan QR code with Expo Go app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️  Useful Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View logs:          docker compose logs -f backend
Stop services:      .\run.ps1 -Stop
Rebuild:            .\run.ps1 -Mode $Mode
Clean all:          .\run.ps1 -Clean
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"@ -Color White
    } else {
        Write-ColorOutput "`n❌ Backend failed to start. Check logs with: docker compose logs backend" -Color Red
        exit 1
    }
}

Write-ColorOutput "🎉 SOMNIA is ready! Happy monitoring!`n" -Color Green
