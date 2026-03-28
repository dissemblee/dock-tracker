import { ProfilePage } from "../pages/ProfilePage";
import type { Route } from "./+types/profile";

export function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Profile() {
  return <ProfilePage />;
}
