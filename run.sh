#!/bin/bash
################################################################################
# SOMNIA - Sleep Health Monitoring System Launcher (Unix/Mac)
#
# Usage:
#   ./run.sh                  - Start in development mode
#   ./run.sh prod             - Start in production mode
#   ./run.sh --stop           - Stop all services
#   ./run.sh --clean          - Clean all containers and volumes
#   ./run.sh --build-only     - Only build images
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Default mode
MODE="dev"
BUILD_ONLY=false
STOP=false
CLEAN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        prod|production)
            MODE="prod"
            shift
            ;;
        dev|development)
            MODE="dev"
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --stop)
            STOP=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [dev|prod] [--build-only] [--stop] [--clean]"
            exit 1
            ;;
    esac
done

# ASCII Art Banner
show_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    
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

EOF
    echo -e "${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
}

# Stop services
stop_services() {
    echo -e "\n${YELLOW}🛑 Stopping SOMNIA services...${NC}"
    docker compose down
    echo -e "${GREEN}✅ Services stopped successfully.${NC}\n"
}

# Clean everything
clean_all() {
    echo -e "\n${YELLOW}🧹 Cleaning all SOMNIA containers, volumes, and images...${NC}"
    docker compose down -v --rmi all
    echo -e "${GREEN}✅ Cleanup completed.${NC}\n"
}

# Main execution
show_banner
check_docker

# Handle stop flag
if [ "$STOP" = true ]; then
    stop_services
    exit 0
fi

# Handle clean flag
if [ "$CLEAN" = true ]; then
    clean_all
    exit 0
fi

# Validate .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created. Please review and update if needed.${NC}"
    else
        echo -e "${YELLOW}⚠️  Creating default .env file...${NC}"
        cat > .env << EOF
# SOMNIA Environment Configuration
DEBUG=true
ENVIRONMENT=$MODE
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
EOF
        echo -e "${GREEN}✅ Default .env file created.${NC}"
    fi
fi

# Check model files
echo -e "\n${CYAN}🔍 Checking ML model files...${NC}"
MISSING_MODELS=()

if [ ! -f "backend/models/SpO2_weights.hdf5" ]; then
    MISSING_MODELS+=("SpO2_weights.hdf5")
fi
if [ ! -f "backend/models/ecg_weights.hdf5" ]; then
    MISSING_MODELS+=("ecg_weights.hdf5")
fi

if [ ${#MISSING_MODELS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing model files: ${MISSING_MODELS[*]}${NC}"
    echo -e "${YELLOW}   The application will use mock data until models are available.${NC}"
else
    echo -e "${GREEN}✅ All ML model files found.${NC}"
fi

# Build and start services
echo -e "\n${CYAN}🚀 Starting SOMNIA in $MODE mode...${NC}"

if [ "$BUILD_ONLY" = true ]; then
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
    docker compose build --no-cache
    echo -e "${GREEN}✅ Build completed.${NC}\n"
else
    echo -e "${YELLOW}🔨 Building and starting services...${NC}"
    docker compose up --build -d
    
    # Wait for services to be ready
    echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 5
    
    # Check service status
    if docker compose ps backend | grep -q "Up"; then
        echo -e "\n${GREEN}✅ SOMNIA Backend is running!${NC}"
        cat << EOF

${WHITE}📊 Service Endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 Backend API:       http://localhost:8000
🔹 API Documentation: http://localhost:8000/docs
🔹 Health Check:      http://localhost:8000/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 Mobile App Instructions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Open a new terminal
2. Navigate to: somnia-app/SOMNIA\ app/Somnia
3. Run: npm install (if not done already)
4. Run: npx expo start
5. Install Expo Go SDK 51 on your phone:
   - Android: https://expo.dev/go?sdkVersion=51&platform=android&device=true
   - ⚠️ DO NOT use Play Store (has SDK 54, incompatible!)
   - iOS: Download from App Store
6. Scan QR code with Expo Go SDK 51 app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️  Useful Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View logs:          docker compose logs -f backend
Stop services:      ./run.sh --stop
Rebuild:            ./run.sh $MODE
Clean all:          ./run.sh --clean
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${NC}

EOF
    else
        echo -e "\n${RED}❌ Backend failed to start. Check logs with: docker compose logs backend${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🎉 SOMNIA is ready! Happy monitoring!${NC}\n"
