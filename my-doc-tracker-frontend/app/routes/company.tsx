import { CompanyPage } from "@app/pages/CompanyPage";
import type { Route } from "./+types/company";

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
  return <CompanyPage />;
}
