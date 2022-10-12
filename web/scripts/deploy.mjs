import os from "os";
import { $ } from "zx/core";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

const ENV = {
  local_site_path: "/var/www/html/dareordesign/web",
  remote_site_path: "/home/ubuntu/dareordesign/",
};

const servers = [
  {
    username: process.env.SERVER_USER,
    hostname: process.env.SERVER_HOST,
    ssh: {
      key_location: os.homedir() + "/.ssh/id_rsa_redoxbird",
    },
  },
];

try {
  (async () => {
    for (const index in servers) {
      const server = servers[index];
      await $`rsync -avr --exclude-from='.rsyncignore' -e "ssh -i ${server.ssh.key_location}" ${ENV.local_site_path} ${server.username}@${server.hostname}:${ENV.remote_site_path}`;
      const commands = [
        `cd ${ENV.remote_site_path}/${path.basename(ENV.local_site_path)}`,
        `npm install`,
        `npm run build`,
        `npm run build`,
        `pm2 startOrReload pm2.config.js`,
      ];

      await $`ssh ${server.username}@${server.hostname} ${commands.join("; ")}`;
    }
  })();
} catch (error) {
  console.error(error);
}
