module.exports = {
  apps: [
    {
      name: 'ai-image-backend',
      script: 'dist/server.js',
      cwd: '/opt/AiImage/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        DATABASE_URL: 'file:/opt/AiImage/backend/prisma/prod.db'
      },
      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // Logging
      log_file: '/opt/AiImage/logs/ai-image-backend.log',
      out_file: '/opt/AiImage/logs/ai-image-backend-out.log',
      error_file: '/opt/AiImage/logs/ai-image-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Health check
      health_check_grace_period: 3000,
      
      // Advanced features
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Environment specific
      node_args: '--max-old-space-size=1024'
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'root',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/opt/AiImage',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install && npx prisma generate && npx prisma db push && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
