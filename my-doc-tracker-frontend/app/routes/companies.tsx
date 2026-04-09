import { CompaniesPage } from "@app/pages/CompaniesPage/CompaniesPage";
import type { Route } from "./+types/companies";

export function meta() {
  return [
    { title: "Компании | Dock Tracker" },
    {
      name: "description",
      content: "Список ваших компаний",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Companies() {
  return <CompaniesPage />;
}
