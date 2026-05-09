import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = parseInt(process.env.PORT || "9000", 10);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || "/scripts/deploy.sh";
const LOG_DIR = process.env.DEPLOY_LOG_DIR || join(process.env.HOME || "/root", "deploy-logs");

mkdirSync(LOG_DIR, { recursive: true });

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
}

function verifySignature(rawBody, sigHeader) {
  if (!sigHeader) return false;
  const expected = `sha256=${createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex")}`;
  try {
    return timingSafeEqual(Buffer.from(sigHeader), Buffer.from(expected));
  } catch {
    return false;
  }
}

function runDeploy() {
  const logFile = join(LOG_DIR, `${new Date().toISOString().replace(/[:.]/g, "-")}.log`);
  const out = createWriteStream(logFile, { flags: "a" });
  log(`Spawning deploy script: ${DEPLOY_SCRIPT} → ${logFile}`);

  const child = spawn("bash", [DEPLOY_SCRIPT], {
    detached: true,
    stdio: ["ignore", out, out],
  });

  child.on("error", (err) => {
    log(`Deploy script error: ${err.message}`);
  });

  child.on("exit", (code) => {
    log(`Deploy script exited with code ${code}`);
  });

  child.unref();
}

const server = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/deploy") {
    res.writeHead(404).end("Not Found");
    return;
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const rawBody = Buffer.concat(chunks);
    const sigHeader = req.headers["x-hub-signature-256"] || "";
    const event = req.headers["x-github-event"] || "";

    const valid = verifySignature(rawBody, sigHeader);
    log(`event=${event} signature=${valid ? "valid" : "invalid"}`);

    if (!valid) {
      res.writeHead(401).end("Unauthorized");
      return;
    }

    res.writeHead(200).end("OK");

    if (event !== "push") return;

    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      log("Failed to parse payload JSON");
      return;
    }

    if (payload.ref !== "refs/heads/main") {
      log(`Ignoring push to ${payload.ref}`);
      return;
    }

    log(`Push to main by ${payload.pusher?.name || "unknown"} — triggering deploy`);
    runDeploy();
  });
});

server.listen(PORT, () => {
  log(`Webhook server listening on port ${PORT}`);
});
