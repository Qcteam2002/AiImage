#!/bin/bash

# Server Compatibility Check Script
# Usage: ./check-server.sh [server_ip]

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

# Parse arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <server_ip>${NC}"
    echo "Example: $0 192.168.1.100"
    exit 1
fi

SERVER_IP=$1

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

echo -e "${BLUE}🔍 Checking server compatibility for multi-app deployment...${NC}"
echo "Server: $SERVER_IP"
echo "================================================"

# Check 1: Server connection
echo -e "\n${YELLOW}1. Testing server connection...${NC}"
if ssh -o ConnectTimeout=10 -o BatchMode=yes $SSH_USER@$SERVER_IP exit 2>/dev/null; then
    print_status "SSH connection successful"
else
    print_error "Cannot connect to server $SERVER_IP"
    print_warning "Make sure SSH key is configured: ssh-copy-id $SSH_USER@$SERVER_IP"
    exit 1
fi

# Check 2: Operating System
echo -e "\n${YELLOW}2. Checking operating system...${NC}"
OS_INFO=$(ssh $SSH_USER@$SERVER_IP "cat /etc/os-release | grep PRETTY_NAME")
echo "OS: $OS_INFO"

if ssh $SSH_USER@$SERVER_IP "grep -q 'Ubuntu' /etc/os-release"; then
    print_status "Ubuntu detected - compatible"
else
    print_warning "Non-Ubuntu system detected - may need adjustments"
fi

# Check 3: Node.js installation
echo -e "\n${YELLOW}3. Checking Node.js...${NC}"
if ssh $SSH_USER@$SERVER_IP "command -v node >/dev/null 2>&1"; then
    NODE_VERSION=$(ssh $SSH_USER@$SERVER_IP "node --version")
    print_status "Node.js installed: $NODE_VERSION"
    
    # Check if version is 18+
    if ssh $SSH_USER@$SERVER_IP "node --version | grep -q 'v1[8-9]\|v[2-9][0-9]'"; then
        print_status "Node.js version is compatible (18+)"
    else
        print_warning "Node.js version may be too old - consider upgrading"
    fi
else
    print_warning "Node.js not installed - will be installed during deployment"
fi

# Check 4: Nginx installation
echo -e "\n${YELLOW}4. Checking Nginx...${NC}"
if ssh $SSH_USER@$SERVER_IP "command -v nginx >/dev/null 2>&1"; then
    NGINX_VERSION=$(ssh $SSH_USER@$SERVER_IP "nginx -v 2>&1")
    print_status "Nginx installed: $NGINX_VERSION"
else
    print_warning "Nginx not installed - will be installed during deployment"
fi

# Check 5: PM2 installation
echo -e "\n${YELLOW}5. Checking PM2...${NC}"
if ssh $SSH_USER@$SERVER_IP "command -v pm2 >/dev/null 2>&1"; then
    PM2_VERSION=$(ssh $SSH_USER@$SERVER_IP "pm2 --version")
    print_status "PM2 installed: $PM2_VERSION"
else
    print_warning "PM2 not installed - will be installed during deployment"
fi

# Check 6: Existing Nginx configuration
echo -e "\n${YELLOW}6. Checking existing Nginx configuration...${NC}"
EXISTING_SITES=$(ssh $SSH_USER@$SERVER_IP "sudo ls /etc/nginx/sites-enabled/ 2>/dev/null | grep -v default || true")
if [ ! -z "$EXISTING_SITES" ]; then
    print_info "Found existing sites:"
    echo "$EXISTING_SITES" | while read site; do
        echo "  - $site"
    done
    print_warning "We will add new configuration without affecting existing ones"
else
    print_status "No existing custom sites found"
fi

# Check 7: Port usage
echo -e "\n${YELLOW}7. Checking port usage...${NC}"
USED_PORTS=$(ssh $SSH_USER@$SERVER_IP "sudo netstat -tlnp 2>/dev/null | grep -E ':(80|443|3001|3000)' | awk '{print \$4}' | cut -d: -f2 | sort -u || true")
if [ ! -z "$USED_PORTS" ]; then
    print_info "Currently used ports:"
    echo "$USED_PORTS" | while read port; do
        echo "  - Port $port"
    done
    
    if echo "$USED_PORTS" | grep -q "80\|443"; then
        print_warning "Ports 80/443 are in use - this is expected for existing app"
    fi
    
    if echo "$USED_PORTS" | grep -q "3001"; then
        print_warning "Port 3001 is in use - may conflict with AI Image backend"
    else
        print_status "Port 3001 is available for AI Image backend"
    fi
else
    print_status "No conflicting ports found"
fi

# Check 8: Disk space
echo -e "\n${YELLOW}8. Checking disk space...${NC}"
DISK_USAGE=$(ssh $SSH_USER@$SERVER_IP "df -h / | tail -1 | awk '{print \$5}' | sed 's/%//'")
if [ "$DISK_USAGE" -lt 80 ]; then
    print_status "Disk usage: ${DISK_USAGE}% - sufficient space available"
else
    print_warning "Disk usage: ${DISK_USAGE}% - consider freeing up space"
fi

# Check 9: Memory
echo -e "\n${YELLOW}9. Checking memory...${NC}"
MEMORY_INFO=$(ssh $SSH_USER@$SERVER_IP "free -h | grep Mem")
echo "Memory: $MEMORY_INFO"

# Check 10: Firewall status
echo -e "\n${YELLOW}10. Checking firewall...${NC}"
if ssh $SSH_USER@$SERVER_IP "command -v ufw >/dev/null 2>&1"; then
    UFW_STATUS=$(ssh $SSH_USER@$SERVER_IP "sudo ufw status | head -1")
    print_info "UFW status: $UFW_STATUS"
else
    print_warning "UFW not found - firewall may need manual configuration"
fi

# Check 11: SSL certificates
echo -e "\n${YELLOW}11. Checking SSL certificates...${NC}"
if ssh $SSH_USER@$SERVER_IP "command -v certbot >/dev/null 2>&1"; then
    print_status "Certbot is available for SSL setup"
    EXISTING_CERTS=$(ssh $SSH_USER@$SERVER_IP "sudo certbot certificates 2>/dev/null | grep 'Certificate Name' || true")
    if [ ! -z "$EXISTING_CERTS" ]; then
        print_info "Existing SSL certificates found:"
        echo "$EXISTING_CERTS" | while read cert; do
            echo "  - $cert"
        done
    fi
else
    print_warning "Certbot not installed - will be installed during deployment"
fi

# Check 12: Git
echo -e "\n${YELLOW}12. Checking Git...${NC}"
if ssh $SSH_USER@$SERVER_IP "command -v git >/dev/null 2>&1"; then
    GIT_VERSION=$(ssh $SSH_USER@$SERVER_IP "git --version")
    print_status "Git installed: $GIT_VERSION"
else
    print_warning "Git not installed - will be installed during deployment"
fi

# Summary
echo -e "\n${BLUE}📋 Summary${NC}"
echo "=========="

# Count issues
ISSUES=0
if ! ssh $SSH_USER@$SERVER_IP "command -v node >/dev/null 2>&1"; then
    ((ISSUES++))
fi
if ! ssh $SSH_USER@$SERVER_IP "command -v nginx >/dev/null 2>&1"; then
    ((ISSUES++))
fi
if ! ssh $SSH_USER@$SERVER_IP "command -v pm2 >/dev/null 2>&1"; then
    ((ISSUES++))
fi
if ! ssh $SSH_USER@$SERVER_IP "command -v git >/dev/null 2>&1"; then
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    print_status "Server is ready for deployment!"
    echo -e "\n${GREEN}✅ All required components are installed${NC}"
    echo -e "${GREEN}✅ No major conflicts detected${NC}"
    echo -e "${GREEN}✅ Ready to deploy AI Image App alongside existing app${NC}"
else
    print_warning "Server needs some components installed ($ISSUES missing)"
    echo -e "\n${YELLOW}⚠️  Missing components will be installed during deployment${NC}"
    echo -e "${YELLOW}⚠️  This is normal for a fresh server${NC}"
fi

echo -e "\n${BLUE}🚀 Ready to deploy! Run:${NC}"
echo "./deploy-multi-apps.sh $SERVER_IP tikminer.info"
