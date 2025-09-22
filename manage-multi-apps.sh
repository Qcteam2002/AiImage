#!/bin/bash

# Multi-Apps Management Script
# Usage: ./manage-multi-apps.sh [server_ip] [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SERVER_IP=""
SSH_USER="root"
COMMAND="status"

# Parse arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <server_ip> [command]${NC}"
    echo "Commands:"
    echo "  status     - Show status of all apps"
    echo "  logs       - Show logs for AI Image app"
    echo "  restart    - Restart AI Image app"
    echo "  stop       - Stop AI Image app"
    echo "  start      - Start AI Image app"
    echo "  nginx      - Test Nginx configuration"
    echo "  domains    - List all configured domains"
    echo "  ports      - Show used ports"
    echo "  ssl        - Check SSL certificates"
    echo "  backup     - Backup current configuration"
    echo "  restore    - Restore from backup"
    echo ""
    echo "Example: $0 192.168.1.100 status"
    exit 1
fi

SERVER_IP=$1
if [ $# -ge 2 ]; then
    COMMAND=$2
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check server connection
check_connection() {
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SSH_USER@$SERVER_IP exit 2>/dev/null; then
        print_error "Cannot connect to server $SERVER_IP"
        exit 1
    fi
}

# Show status of all apps
show_status() {
    echo -e "${BLUE}📊 Application Status${NC}"
    echo "===================="
    
    # PM2 status
    echo -e "\n${YELLOW}PM2 Processes:${NC}"
    ssh $SSH_USER@$SERVER_IP "pm2 list"
    
    # Nginx status
    echo -e "\n${YELLOW}Nginx Status:${NC}"
    ssh $SSH_USER@$SERVER_IP "sudo systemctl is-active nginx"
    
    # Port usage
    echo -e "\n${YELLOW}Port Usage:${NC}"
    ssh $SSH_USER@$SERVER_IP "sudo netstat -tlnp | grep -E ':(80|443|3001|3000)' | head -10"
    
    # Disk usage
    echo -e "\n${YELLOW}Disk Usage:${NC}"
    ssh $SSH_USER@$SERVER_IP "df -h | grep -E '(Filesystem|/dev/)'"
    
    # Memory usage
    echo -e "\n${YELLOW}Memory Usage:${NC}"
    ssh $SSH_USER@$SERVER_IP "free -h"
}

# Show logs
show_logs() {
    echo -e "${BLUE}📋 AI Image App Logs${NC}"
    echo "====================="
    ssh $SSH_USER@$SERVER_IP "pm2 logs ai-image-backend --lines 50"
}

# Restart AI Image app
restart_app() {
    echo -e "${BLUE}🔄 Restarting AI Image App...${NC}"
    ssh $SSH_USER@$SERVER_IP "pm2 restart ai-image-backend"
    print_status "AI Image App restarted"
}

# Stop AI Image app
stop_app() {
    echo -e "${BLUE}⏹️  Stopping AI Image App...${NC}"
    ssh $SSH_USER@$SERVER_IP "pm2 stop ai-image-backend"
    print_status "AI Image App stopped"
}

# Start AI Image app
start_app() {
    echo -e "${BLUE}▶️  Starting AI Image App...${NC}"
    ssh $SSH_USER@$SERVER_IP "pm2 start ai-image-backend"
    print_status "AI Image App started"
}

# Test Nginx configuration
test_nginx() {
    echo -e "${BLUE}🧪 Testing Nginx Configuration...${NC}"
    if ssh $SSH_USER@$SERVER_IP "sudo nginx -t"; then
        print_status "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
        exit 1
    fi
}

# List all configured domains
list_domains() {
    echo -e "${BLUE}🌐 Configured Domains${NC}"
    echo "===================="
    
    # Nginx sites
    echo -e "\n${YELLOW}Nginx Sites:${NC}"
    ssh $SSH_USER@$SERVER_IP "sudo ls -la /etc/nginx/sites-enabled/ | grep -v default"
    
    # Server blocks
    echo -e "\n${YELLOW}Server Blocks:${NC}"
    ssh $SSH_USER@$SERVER_IP "sudo nginx -T 2>/dev/null | grep 'server_name' | grep -v '#' | sort | uniq"
    
    # SSL certificates
    echo -e "\n${YELLOW}SSL Certificates:${NC}"
    ssh $SSH_USER@$SERVER_IP "sudo certbot certificates 2>/dev/null | grep 'Certificate Name' || echo 'No SSL certificates found'"
}

# Show used ports
show_ports() {
    echo -e "${BLUE}🔌 Port Usage${NC}"
    echo "============="
    ssh $SSH_USER@$SERVER_IP "sudo netstat -tlnp | grep -E ':(80|443|3001|3000|8080|8443)' | sort"
}

# Check SSL certificates
check_ssl() {
    echo -e "${BLUE}🔒 SSL Certificates${NC}"
    echo "==================="
    
    # List certificates
    ssh $SSH_USER@$SERVER_IP "sudo certbot certificates 2>/dev/null || echo 'No certificates found'"
    
    # Check certificate expiry
    echo -e "\n${YELLOW}Certificate Expiry:${NC}"
    ssh $SSH_USER@$SERVER_IP "sudo certbot certificates 2>/dev/null | grep -E '(Certificate Name|Expiry Date)' || echo 'No certificates to check'"
}

# Backup configuration
backup_config() {
    echo -e "${BLUE}💾 Backing up configuration...${NC}"
    
    BACKUP_DIR="/home/app/backups/$(date +%Y%m%d_%H%M%S)"
    
    ssh $SSH_USER@$SERVER_IP "mkdir -p $BACKUP_DIR"
    
    # Backup Nginx configs
    ssh $SSH_USER@$SERVER_IP "sudo cp -r /etc/nginx/sites-available $BACKUP_DIR/"
    ssh $SSH_USER@$SERVER_IP "sudo cp -r /etc/nginx/sites-enabled $BACKUP_DIR/"
    
    # Backup PM2 configs
    ssh $SSH_USER@$SERVER_IP "pm2 save && cp ~/.pm2/dump.pm2 $BACKUP_DIR/"
    
    # Backup app data
    ssh $SSH_USER@$SERVER_IP "cp -r /home/app/ai-image/uploads $BACKUP_DIR/ 2>/dev/null || true"
    ssh $SSH_USER@$SERVER_IP "cp /home/app/ai-image/backend/prisma/prod.db $BACKUP_DIR/ 2>/dev/null || true"
    
    print_status "Backup created at: $BACKUP_DIR"
}

# Restore from backup
restore_config() {
    echo -e "${BLUE}🔄 Restoring from backup...${NC}"
    
    # List available backups
    echo -e "\n${YELLOW}Available backups:${NC}"
    ssh $SSH_USER@$SERVER_IP "ls -la /home/app/backups/ 2>/dev/null || echo 'No backups found'"
    
    echo -e "\n${YELLOW}Enter backup directory name:${NC}"
    read -p "Backup dir: " BACKUP_DIR
    
    if [ -z "$BACKUP_DIR" ]; then
        print_error "Backup directory not specified"
        exit 1
    fi
    
    # Restore Nginx configs
    ssh $SSH_USER@$SERVER_IP "sudo cp -r $BACKUP_DIR/sites-available/* /etc/nginx/sites-available/ 2>/dev/null || true"
    ssh $SSH_USER@$SERVER_IP "sudo cp -r $BACKUP_DIR/sites-enabled/* /etc/nginx/sites-enabled/ 2>/dev/null || true"
    
    # Restore PM2 configs
    ssh $SSH_USER@$SERVER_IP "cp $BACKUP_DIR/dump.pm2 ~/.pm2/ 2>/dev/null && pm2 resurrect || true"
    
    # Restore app data
    ssh $SSH_USER@$SERVER_IP "cp -r $BACKUP_DIR/uploads/* /home/app/ai-image/uploads/ 2>/dev/null || true"
    ssh $SSH_USER@$SERVER_IP "cp $BACKUP_DIR/prod.db /home/app/ai-image/backend/prisma/ 2>/dev/null || true"
    
    print_status "Configuration restored from: $BACKUP_DIR"
}

# Main execution
check_connection

case $COMMAND in
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "restart")
        restart_app
        ;;
    "stop")
        stop_app
        ;;
    "start")
        start_app
        ;;
    "nginx")
        test_nginx
        ;;
    "domains")
        list_domains
        ;;
    "ports")
        show_ports
        ;;
    "ssl")
        check_ssl
        ;;
    "backup")
        backup_config
        ;;
    "restore")
        restore_config
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo "Available commands: status, logs, restart, stop, start, nginx, domains, ports, ssl, backup, restore"
        exit 1
        ;;
esac
