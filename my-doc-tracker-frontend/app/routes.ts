import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/auth.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
