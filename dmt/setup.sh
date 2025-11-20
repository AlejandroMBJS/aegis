#!/bin/bash

##############################################################################
# DMT System Setup Script
#
# This script automatically sets up and starts the entire DMT system using Docker
#
# Usage:
#   ./setup.sh              # Start the system
#   ./setup.sh --rebuild    # Rebuild images and start
#   ./setup.sh --stop       # Stop the system
#   ./setup.sh --clean      # Stop and remove all containers and volumes
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NGINX_PORT=80
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo -e "${CYAN}"
    echo "═══════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is installed"
}

check_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port $port is already in use by another process"
        print_info "This may be a previously running $service container or another application"
        print_info "Attempting to continue anyway..."
        return 1
    else
        print_success "Port $port is available"
        return 0
    fi
}

wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo -n "Waiting for $service_name to start"

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo ""
            print_success "$service_name is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done

    echo ""
    print_warning "$service_name did not start within expected time"
    print_info "Check logs with: docker-compose logs $service_name"
    return 1
}

print_access_info() {
    print_header "DMT System is Running!"

    # Get server IP address
    SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-server-ip")

    echo -e "${MAGENTA}DMT Application Access:${NC}"
    echo -e "  ${GREEN}➜${NC} Local:   http://localhost"
    echo -e "  ${GREEN}➜${NC} Network: http://$SERVER_IP"
    echo ""

    echo -e "${MAGENTA}Backend API:${NC}"
    echo -e "  ${GREEN}➜${NC} http://localhost/api/"
    echo ""

    echo -e "${MAGENTA}API Documentation:${NC}"
    echo -e "  ${GREEN}➜${NC} http://localhost/api/docs (Interactive Swagger UI)"
    echo -e "  ${GREEN}➜${NC} http://localhost/api/redoc (ReDoc Documentation)"
    echo ""

    echo -e "${MAGENTA}Default Credentials:${NC}"
    echo -e "  Admin:      ${CYAN}ADM001${NC} / ${CYAN}employee123${NC}"
    echo -e "  Inspector:  ${CYAN}INS001-INS011${NC} / ${CYAN}employee123${NC}"
    echo -e "  Operator:   ${CYAN}OPR001-OPR062${NC} / ${CYAN}employee123${NC}"
    echo ""

    echo -e "${CYAN}─────────────────────────────────────────────────────────────────${NC}"
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo -e "  View logs:          ${CYAN}docker-compose logs -f${NC}"
    echo -e "  Stop system:        ${CYAN}./setup.sh --stop${NC}"
    echo -e "  Restart system:     ${CYAN}docker-compose restart${NC}"
    echo -e "  Access backend:     ${CYAN}docker exec -it dmt_backend bash${NC}"
    echo -e "  Access frontend:    ${CYAN}docker exec -it dmt_frontend bash${NC}"
    echo -e "  Reseed database:    ${CYAN}docker exec dmt_backend python seed_database.py${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

##############################################################################
# Main Functions
##############################################################################

start_system() {
    local rebuild=$1

    print_header "DMT System Setup"

    # Step 1: Check prerequisites
    print_info "Step 1: Checking prerequisites..."
    check_docker
    check_docker_compose
    echo ""

    # Step 2: Check ports
    print_info "Step 2: Checking port availability..."
    check_port $NGINX_PORT "nginx"
    echo ""

    # Step 3: Navigate to project directory
    print_info "Step 3: Navigating to project directory..."
    cd "$PROJECT_DIR"
    print_success "Current directory: $PROJECT_DIR"
    echo ""

    # Step 4: Build/rebuild images if needed
    if [ "$rebuild" = true ]; then
        print_info "Step 4: Rebuilding Docker images..."
        docker-compose build --no-cache
        print_success "Docker images rebuilt"
    else
        print_info "Step 4: Building Docker images (if needed)..."
        docker-compose build
        print_success "Docker images ready"
    fi
    echo ""

    # Step 5: Start services
    print_info "Step 5: Starting Docker containers..."
    docker-compose up -d
    print_success "Docker containers started"
    echo ""

    # Step 6: Wait for services to be ready
    print_info "Step 6: Waiting for services to be ready..."

    # Wait for nginx to be ready
    wait_for_service "http://localhost:$NGINX_PORT/health" "nginx"

    # Wait for backend API through nginx
    sleep 2
    if curl -f -s "http://localhost:$NGINX_PORT/api/" > /dev/null 2>&1; then
        print_success "Backend API is ready!"
    else
        print_warning "Backend API may still be starting up"
    fi
    echo ""

    # Step 7: Seed database with production data
    print_info "Step 7: Seeding database with production data..."
    if docker exec dmt_backend python seed_database.py > /dev/null 2>&1; then
        print_success "Database seeded successfully"
        print_info "  - 74 users (1 Admin, 11 Inspectors, 62 Operators)"
        print_info "  - 151 part numbers"
        print_info "  - 15 work centers"
        print_info "  - 6 customers"
    else
        print_warning "Database seeding failed or already seeded"
    fi
    echo ""

    # Step 8: Show access information
    print_access_info
}

stop_system() {
    print_header "Stopping DMT System"

    cd "$PROJECT_DIR"
    docker-compose down

    print_success "All containers stopped"
    echo ""
}

clean_system() {
    print_header "Cleaning DMT System"

    print_warning "This will remove all containers, networks, and volumes"
    print_warning "Database data will be lost!"
    echo ""

    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        print_info "Cleanup cancelled"
        exit 0
    fi

    cd "$PROJECT_DIR"
    docker-compose down -v

    print_success "All containers, networks, and volumes removed"
    print_info "Run './setup.sh' to start fresh"
    echo ""
}

show_help() {
    echo "DMT System Setup Script"
    echo ""
    echo "Usage:"
    echo "  ./setup.sh              Start the system"
    echo "  ./setup.sh --rebuild    Rebuild images and start"
    echo "  ./setup.sh --stop       Stop the system"
    echo "  ./setup.sh --clean      Stop and remove everything (including data)"
    echo "  ./setup.sh --help       Show this help message"
    echo ""
}

##############################################################################
# Main Script
##############################################################################

main() {
    case "${1:-}" in
        --rebuild)
            start_system true
            ;;
        --stop)
            stop_system
            ;;
        --clean)
            clean_system
            ;;
        --help)
            show_help
            ;;
        "")
            start_system false
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
