import { CompanyPage } from "@app/pages/CompanyPage";
import type { Route } from "./+types/create-company";

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
  return <CompanyPage />;
}
