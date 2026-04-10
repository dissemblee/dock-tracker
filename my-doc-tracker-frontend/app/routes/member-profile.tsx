import type { Route } from "../+types/root";
import { MemberProfilePage } from "~/pages/MemberProfilePage/MemberProfilePage";

export function meta() {
  return [
    { title: "Профиль участника | Dock Tracker" },
    {
      name: "description",
      content: "Профиль участника компании",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function MemberProfile() {
  return <MemberProfilePage />;
}
