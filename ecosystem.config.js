module.exports = {
  apps: [
    {
      name: 'aiimage-backend',
      script: './backend/src/server.ts',
      cwd: '/opt/aiimage',
      interpreter: 'node_modules/.bin/ts-node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs']
    },
    {
      name: 'aiimage-image-api',
      script: './image-processing-api/src/server.ts',
      cwd: '/opt/aiimage',
      interpreter: 'node_modules/.bin/ts-node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/image-api-error.log',
      out_file: './logs/image-api-out.log',
      log_file: './logs/image-api-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs']
    },
    {
      name: 'aiimage-frontend',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      cwd: '/opt/aiimage',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs']
    }
  ]
};

