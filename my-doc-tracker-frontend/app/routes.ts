import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/auth.tsx"),
  route("profile", "routes/profile-layout.tsx", [
    index("routes/profile.tsx"),
    route("documents", "routes/profile-documents.tsx"),
    route("settings", "routes/profile-settings.tsx"),
    route("password", "routes/profile-password.tsx"),
    route("company", "routes/companies.tsx"),

    route("company/:companyId/member/:userId", "routes/member-profile.tsx"),

    route("documents/:id", "routes/document.tsx"),
  ]),
] satisfies RouteConfig;
