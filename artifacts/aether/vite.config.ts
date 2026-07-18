import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

function extractPublicRoutes(): string[] {
  try {
    const appSrc = fs.readFileSync(
      path.resolve(import.meta.dirname, "src/App.tsx"),
      "utf-8",
    );
    const matches = [...appSrc.matchAll(/path="(\/[^"*?]*)"/g)];
    return matches
      .map((m) => m[1])
      .filter((p) => p !== "/sign-in" && p !== "/sign-up")
      .filter((p, i, arr) => arr.indexOf(p) === i);
  } catch {
    return ["/"];
  }
}

function buildSitemapXml(origin: string, routes: string[]): string {
  const today = new Date().toISOString().split("T")[0];
  const urls = routes
    .map(
      (r) =>
        `  <url><loc>${origin}${r}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function buildRobotsTxt(origin: string): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: anthropic-ai",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

function sitemapPlugin(): Plugin {
  const routes = extractPublicRoutes();

  return {
    name: "aether-sitemap-robots",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/sitemap.xml" && url !== "/robots.txt") {
          return next();
        }
        const proto =
          (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
        const host = req.headers.host ?? "localhost";
        const origin = `${proto}://${host}`;
        if (url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(buildSitemapXml(origin, routes));
        } else {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(buildRobotsTxt(origin));
        }
      });
    },

    generateBundle() {
      const origin =
        process.env.VITE_CANONICAL_ORIGIN?.replace(/\/$/, "") ??
        "https://your-production-domain.com";
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: buildSitemapXml(origin, routes),
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: buildRobotsTxt(origin),
      });
    },
  };
}

function prerenderPlugin(): Plugin {
  const KEY_ROUTES = [
    "/",
    "/glossary",
    "/research",
    "/aether-why",
    "/knowledge-map",
    "/learning-layers",
    "/aether-childrens-realm",
    "/computer-brains",
    "/calm-company",
    "/clcs-architecture",
    "/aether-dashboard",
    "/aether-foundations",
    "/awakening-timeline",
    "/divine-timing",
    "/quantum-ammeter",
    "/sparkle-text",
    "/aether-health",
    "/aether-metaphysics",
    "/aether-doctrine",
  ];

  interface RouteMeta {
    title: string;
    description: string;
  }

  const SITE_NAME = "AETHER Knowledge System";
  const DEFAULT_DESC =
    "AETHER synthesizes and discovers knowledge through a Knowledge Graph & Coherence System inspired by the Crystallization Model of Intelligence.";

  const META: Record<string, RouteMeta> = {
    "/": { title: SITE_NAME, description: DEFAULT_DESC },
    "/glossary": { title: `Glossary · ${SITE_NAME}`, description: "A–Z vocabulary of AETHER across 11 categories — search by word, definition, or etymology." },
    "/coherence-atlas": { title: `Coherence Atlas · ${SITE_NAME}`, description: "Unified visual index of AETHER's recent threads — knots, bio-photonic emitters, tunnels, the coherence field, and regulation & cosmos, each linking to its source page." },
    "/research": { title: `Research · ${SITE_NAME}`, description: "Explore research synthesis, scientific papers, and coherence analysis within the AETHER knowledge system." },
    "/aether-why": { title: `AETHER · The Why · ${SITE_NAME}`, description: "The founder's letter outlining AETHER's vision — why a coherence-based knowledge system matters." },
    "/knowledge-map": { title: `Knowledge Map · ${SITE_NAME}`, description: "Client-side engine for ingesting and organizing 3000+ image/video files with intelligent categorization." },
    "/learning-layers": { title: `Learning in Layers · ${SITE_NAME}`, description: "AETHER Seasons educational media brand framework — 5 pillars, 5-book series, and Year 1 roadmap." },
    "/aether-childrens-realm": { title: `AETHER Children's Realm · ${SITE_NAME}`, description: "Children's library — interactive books including Computer Brains, Boho Bloom, and more." },
    "/computer-brains": { title: `Computer Brains · ${SITE_NAME}`, description: "Interactive 9-page children's picture book about Chip the CPU — explore how computers think." },
    "/calm-company": { title: `Calm Company OS · ${SITE_NAME}`, description: "Content engine with 18 story buckets, 1,314 stories/year, and deterministic 2-post/day rotation." },
    "/clcs-architecture": { title: `CLCS Architecture · ${SITE_NAME}`, description: "L1→L5 Coherent Layered Coherence Stack diagram with pseudocode and math chips." },
    "/aether-dashboard": { title: `AETHER Dashboard · ${SITE_NAME}`, description: "Multi-agent control panel with EIE, Memory, Integrations, Prompt Modes, and Trigger Table." },
    "/aether-foundations": { title: `AETHER Foundations · ${SITE_NAME}`, description: "Source material gallery and foundational concepts for the Crystallization Model of Intelligence." },
    "/awakening-timeline": { title: `Awakening Timeline · ${SITE_NAME}`, description: "Personal awakening atlas with astrological and self-development tracking across time." },
    "/divine-timing": { title: `Divine Timing · ${SITE_NAME}`, description: "Eris-in-Pisces transit map — 5 windows, 8 field-of-numbers principles, and the 11/11 letter." },
    "/quantum-ammeter": { title: `Quantum Ammeter · ${SITE_NAME}`, description: "Live solar-powered ammeter prototype — photovoltaic simulation with Poisson-sampled electron counts." },
    "/sparkle-text": { title: `Sparkle Studio · ${SITE_NAME}`, description: "Customizable sparkly text generator — 10 textures, gradient text, sparkle particles, and PNG/WebM export." },
    "/aether-health": { title: `AETHER Health · ${SITE_NAME}`, description: "Health coherence framework — biological rhythms, substrate synthesis, and living nutrition." },
    "/aether-metaphysics": { title: `AETHER Metaphysics · ${SITE_NAME}`, description: "Metaphysical dimensions of AETHER — consciousness, fields, and the architecture of knowing." },
    "/aether-doctrine": { title: `AETHER Doctrine · ${SITE_NAME}`, description: "The principles and doctrine underlying the AETHER knowledge system." },
  };

  return {
    name: "aether-prerender",
    apply: "build",

    generateBundle(_, bundle) {
      const indexAsset = bundle["index.html"];
      if (!indexAsset || indexAsset.type !== "asset") return;

      const indexSource = indexAsset.source as string;
      const origin =
        process.env.VITE_CANONICAL_ORIGIN?.replace(/\/$/, "") ??
        "https://your-production-domain.com";
      const ogImage = `${origin}/opengraph.jpg`;

      for (const route of KEY_ROUTES) {
        if (route === "/") continue;
        const m = META[route] ?? { title: SITE_NAME, description: DEFAULT_DESC };
        const url = `${origin}${route}`;

        const injected = `
  <title>${m.title}</title>
  <meta name="description" content="${m.description}" />
  <meta property="og:title" content="${m.title}" />
  <meta property="og:description" content="${m.description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${m.title}" />
  <meta name="twitter:description" content="${m.description}" />
  <meta name="twitter:image" content="${ogImage}" />
  <link rel="canonical" href="${url}" />`;

        const routeHtml = indexSource
          .replace(/<title>[^<]*<\/title>/, "")
          .replace(/<link rel="canonical"[^>]*\/>/, "")
          .replace("</head>", `${injected}\n</head>`);

        const fileName = route.slice(1) + "/index.html";
        this.emitFile({
          type: "asset",
          fileName,
          source: routeHtml,
        });
      }
    },
  };
}

export default defineConfig({
  base: basePath,
  define: {
    // Baked-in at every build/publish — gives every deployment a unique clock stamp
    __AETHER_BUILD__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
    runtimeErrorOverlay(),
    sitemapPlugin(),
    prerenderPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("@clerk/")) return "clerk";

          if (
            id.includes("three") ||
            id.includes("@react-three") ||
            id.includes("@threlte")
          )
            return "three";

          if (
            id.includes("recharts") ||
            id.includes("d3-") ||
            id.includes("victory")
          )
            return "charts";

          if (
            id.includes("framer-motion") ||
            id.includes("popmotion") ||
            id.includes("style-value-types")
          )
            return "motion";

          if (
            id.includes("pdfjs-dist") ||
            id.includes("pdf.worker")
          )
            return "pdf";

          if (
            id.includes("katex") ||
            id.includes("react-katex")
          )
            return "katex";

          if (
            id.includes("@tanstack/react-query") ||
            id.includes("react-hook-form") ||
            id.includes("@hookform")
          )
            return "data";

          if (
            id.includes("@radix-ui/") ||
            id.includes("cmdk") ||
            id.includes("vaul") ||
            id.includes("sonner")
          )
            return "ui";

          if (
            id.includes("lucide-react") ||
            id.includes("react-icons")
          )
            return "icons";

          if (
            id.includes("react-force-graph") ||
            id.includes("force-graph")
          )
            return "graph";

          return "vendor";
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
      allow: [
        path.resolve(import.meta.dirname),
        path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
        path.resolve(import.meta.dirname, "..", "..", "node_modules"),
      ],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
