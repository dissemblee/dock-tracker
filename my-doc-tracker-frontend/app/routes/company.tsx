import { CompaniesPage } from "~/pages/CompaniesPage/CompaniesPage";
import type { Route } from "../+types/root";

export function meta() {
  return [
    { title: "Компания | Dock Tracker" },
    {
      name: "description",
      content: "Управление компанией и сотрудниками",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Company() {
  return <CompaniesPage />;
}
