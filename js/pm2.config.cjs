require('dotenv').config({ path: './.env' })

module.exports = {
  apps: [
    {
      cwd: "./",
      name: "heredot",
      script: "app.js",
      instances: "1",
      exec_mode: "cluster",
      watch: ["app.js", "database", "util", "modules"],
      ignore_watch: ["node_modules", "public", "images", "logs", "log",],
      max_memory_restart: "1G",
      log_file: "logs/heredot/heredot.log",
      error_file: "logs/heredot/heredot-error.log",
      out_file: "logs/heredot/heredot-out.log",
      merge_logs: true,
      // log_date_format : "YYYY-MM-DD HH:mm:ss Z",
    }
  ]
}