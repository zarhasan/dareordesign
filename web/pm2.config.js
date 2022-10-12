module.exports = {
  apps: [
    {
      name: "dareordesign",
      script: "npm",
      args: "start",
      cwd: "./",
      max_restarts: 10,
      env_production: {
        NODE_ENV: "production",
        PORT: 3012,
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
