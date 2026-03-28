// Production server for React Router v7
import { createRequestHandler } from "@react-router/express";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR = path.join(__dirname, "build", "client");
const SERVER_BUILD_DIR = path.join(__dirname, "build", "server");

async function startServer() {
  const app = express();

  // Serve static assets from build/client
  app.use(express.static(BUILD_DIR, { immutable: true, maxAge: "1y" }));

  // Load server build dynamically
  const serverBuild = await import(path.join(SERVER_BUILD_DIR, "index.js"));

  // Handle all other requests with React Router
  app.all(
    "*",
    createRequestHandler({
      build: serverBuild,
      mode: "production",
    })
  );

  const port = parseInt(process.env.PORT || "5173");
  const host = process.env.HOST || "0.0.0.0";

  app.listen({ port, host }, () => {
    console.log(`React Router server ready on http://${host}:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
