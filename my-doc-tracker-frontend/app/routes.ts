import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/auth.tsx"),
  route("profile", "routes/profile-layout.tsx", [
    index("routes/profile.tsx"),
    route("documents", "routes/profile-documents.tsx"),
    route("settings", "routes/profile-settings.tsx"),
    route("password", "routes/profile-password.tsx"),
  ]),
  route("documents/:id", "routes/document.tsx"),
  route("company", "routes/company.tsx"),
] satisfies RouteConfig;
