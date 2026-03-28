import { AuthPage } from "../pages/AuthPage";
import type { Route } from "./+types/auth";

export function meta() {
  return [
    { title: "Авторизация | Dock Tracker" },
    {
      name: "description",
      content: "Войдите в свой аккаунт или зарегистрируйтесь",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Auth() {
  return <AuthPage />;
}
