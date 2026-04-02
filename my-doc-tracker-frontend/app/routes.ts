import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/auth.tsx"),
  route("profile", "routes/profile.tsx"),
  route("documents", "routes/documents.tsx"),
  route("documents/:id", "routes/document.tsx"),
  route("company", "routes/company.tsx"),
] satisfies RouteConfig;
