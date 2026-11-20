import os from "node:os";

const env = process.env;
export const has = (k: string) => Boolean(env[k] && env[k]!.trim());

function lanIp(): string | null {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list ?? []) if (i.family === "IPv4" && !i.internal) return i.address;
  }
  return null;
}

export const config = {
  port: Number(env.PORT || 4747),
  get baseUrl() {
    if (env.PUBLIC_BASE_URL) return env.PUBLIC_BASE_URL.replace(/\/$/, "");
    const ip = has("IMESSAGE_TO") ? lanIp() : null; // a phone needs the LAN address, not localhost
    return `http://${ip ?? "localhost"}:${this.port}`;
  },
  watchIntervalSec: Number(env.WATCH_INTERVAL_SEC || 60),
  userId: env.SD_USER_ID || os.userInfo().username,
  autoApproveUnder: Number(env.AUTO_APPROVE_UNDER || 5),
};
