#!/bin/bash

# 🚀 AIImage Quick Deployment Script for Ubuntu Server
# Usage: ./quick-deploy.sh user@server-ip

if [ $# -eq 0 ]; then
    echo "❌ Usage: ./quick-deploy.sh user@server-ip"
    echo "Example: ./quick-deploy.sh ubuntu@192.168.1.100"
    exit 1
fi

SERVER=$1
APP_DIR="/opt/aiimage"
PACKAGE="aiimage-deployment.tar.gz"

echo "🚀 Starting AIImage deployment to $SERVER"
echo "📦 Package: $PACKAGE"
echo "📁 Target: $APP_DIR"

# Check if package exists
if [ ! -f "$PACKAGE" ]; then
    echo "❌ Package $PACKAGE not found!"
    echo "Run: tar -czf $PACKAGE --exclude=node_modules --exclude=.git --exclude=uploads --exclude='*.log' --exclude=.env backend image-processing-api frontend docker-compose.yml DEPLOYMENT_GUIDE.md"
    exit 1
fi

echo "📤 Uploading package to server..."
scp $PACKAGE $SERVER:/tmp/

echo "🔧 Running deployment commands on server..."
ssh $SERVER << 'EOF'
set -e

echo "📁 Creating app directory..."
sudo mkdir -p /opt/aiimage
sudo chown $USER:$USER /opt/aiimage

echo "📦 Extracting package..."
cd /opt/aiimage
tar -xzf /tmp/aiimage-deployment.tar.gz
rm /tmp/aiimage-deployment.tar.gz

echo "📋 Installing dependencies..."
cd backend && npm install --production && cd ..
cd image-processing-api && npm install --production && cd ..
cd frontend && npm install --production && npm run build && cd ..

echo "🐳 Starting database services..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️ Running database migrations..."
cd backend && npm run migrate && cd ..

echo "📝 Creating environment files..."
echo "⚠️  Please configure .env files manually:"
echo "   - backend/.env"
echo "   - image-processing-api/.env" 
echo "   - frontend/.env"

echo "🚀 Installing PM2..."
sudo npm install -g pm2 serve

echo "📊 Creating logs directory..."
mkdir -p logs

echo "✅ Deployment completed!"
echo "📋 Next steps:"
echo "1. Configure .env files"
echo "2. Run: pm2 start ecosystem.config.js"
echo "3. Run: pm2 save && pm2 startup"
echo "4. Check: pm2 status"

EOF

echo "🎉 Deployment script completed!"
echo "📖 See DEPLOYMENT_GUIDE.md for detailed configuration"

