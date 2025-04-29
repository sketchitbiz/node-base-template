require('dotenv').config({ path: './.env' })

module.exports = {
  apps: [
    {
      cwd: "./",
      error_file: "logs/heredot/heredot-error.log",
      exec_mode: "cluster",
      ignore_watch: ["node_modules", "public", "images", "logs", "log",],
      instances: "1",
      log_file: "logs/heredot/heredot.log",
      max_memory_restart: "1G",
      merge_logs: true,
      name: "heredot",
      out_file: "logs/heredot/heredot-out.log",
      script: "app.js",
      watch: ["app.js", "database", "util", "modules"],
      // log_date_format : "YYYY-MM-DD HH:mm:ss Z",
    }
  ]
}