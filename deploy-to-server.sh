#!/bin/bash

# Deploy script for production server
echo "🚀 Starting deployment to production server..."

# SSH to server and run deployment commands
ssh root@printzy << 'EOF'
    echo "📁 Navigating to project directory..."
    cd /opt/AiImage
    
    echo "📥 Pulling latest code from Git..."
    git pull origin main
    
    echo "📦 Installing/updating dependencies..."
    cd backend
    npm install
    
    echo "🗄️ Updating database schema..."
    npx prisma generate
    npx prisma db push
    
    echo "🔨 Building production..."
    npm run build
    
    echo "🔄 Restarting services..."
    pm2 restart all
    
    echo "✅ Deployment completed successfully!"
    echo "🌐 Server should be running on port 3001"
    
    # Show status
    pm2 status
EOF

echo "🎉 Deployment script completed!"
