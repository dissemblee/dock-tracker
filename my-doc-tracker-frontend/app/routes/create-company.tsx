import { CompaniesPage } from "~/pages/CompaniesPage/CompaniesPage";
import type { Route } from "../+types/root";

export function meta() {
  return [
    { title: "Создать компанию | Dock Tracker" },
    {
      name: "description",
      content: "Создание новой компании",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function CreateCompany() {
  return <CompaniesPage />;
}
