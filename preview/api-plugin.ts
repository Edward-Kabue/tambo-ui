// @ts-nocheck — This file runs in Vite's Node.js server context, not in the browser.
/**
 * Vite dev-server plugin that exposes REST endpoints for reading/writing
 * prompt files (system_creative.txt, few_shot_examples.json) so the
 * Prompt Studio UI can edit them without touching the CLI or filesystem.
 */
import type { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMPTS_DIR = path.resolve(__dirname, "../tambo_agent/prompts");
const SYSTEM_FILE = path.join(PROMPTS_DIR, "system_creative.txt");
const EXAMPLES_FILE = path.join(PROMPTS_DIR, "few_shot_examples.json");
const CAPTURES_DIR = path.resolve(__dirname, "public/captures");

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: string) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function promptApiPlugin(): Plugin {
  return {
    name: "prompt-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // --- System prompt ---
        if (req.url === "/api/prompts/system" && req.method === "GET") {
          try {
            const content = fs.readFileSync(SYSTEM_FILE, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ content }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.url === "/api/prompts/system" && req.method === "PUT") {
          try {
            const body = JSON.parse(await readBody(req));
            fs.writeFileSync(SYSTEM_FILE, body.content, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // --- Few-shot examples ---
        if (req.url === "/api/prompts/examples" && req.method === "GET") {
          try {
            const content = fs.readFileSync(EXAMPLES_FILE, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(content);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.url === "/api/prompts/examples" && req.method === "PUT") {
          try {
            const body = await readBody(req);
            // Validate JSON before writing
            JSON.parse(body);
            fs.writeFileSync(EXAMPLES_FILE, body, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (err: any) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // --- Image captures ---

        // List all captured images
        if (req.url === "/api/captures" && req.method === "GET") {
          try {
            if (!fs.existsSync(CAPTURES_DIR)) {
              fs.mkdirSync(CAPTURES_DIR, { recursive: true });
            }
            const files = fs.readdirSync(CAPTURES_DIR)
              .filter((f: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f))
              .map((f: string) => {
                const stat = fs.statSync(path.join(CAPTURES_DIR, f));
                return {
                  name: f,
                  url: `/captures/${f}`,
                  size: stat.size,
                  createdAt: stat.birthtime.toISOString(),
                };
              })
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(files));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // Upload an image (base64 JSON body)
        if (req.url === "/api/captures" && req.method === "POST") {
          try {
            if (!fs.existsSync(CAPTURES_DIR)) {
              fs.mkdirSync(CAPTURES_DIR, { recursive: true });
            }
            const body = JSON.parse(await readBody(req));
            const { data, filename } = body;
            // data is base64 with optional data-url prefix
            const base64 = data.replace(/^data:image\/\w+;base64,/, "");
            const ext = (filename || "capture.png").split(".").pop() || "png";
            const name = `capture-${Date.now()}.${ext}`;
            fs.writeFileSync(path.join(CAPTURES_DIR, name), Buffer.from(base64, "base64"));
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, name, url: `/captures/${name}` }));
          } catch (err: any) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // Delete a captured image
        if (req.url?.startsWith("/api/captures/") && req.method === "DELETE") {
          try {
            const name = decodeURIComponent(req.url.replace("/api/captures/", ""));
            const filePath = path.join(CAPTURES_DIR, name);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "File not found" }));
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        next();
      });
    },
  };
}
