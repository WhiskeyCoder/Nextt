module.exports = {
  apps: [
    {
      name: "backend",
      script: "server/index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "200M",
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_file: "./logs/backend-combined.log",
      time: true
    },
    {
      name: "frontend",
      script: "npx",
      args: "serve frontend -l 3000",
      watch: false,
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "100M",
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      log_file: "./logs/frontend-combined.log",
      time: true,
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
};
