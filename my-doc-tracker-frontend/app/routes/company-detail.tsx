import { CompanyPage } from "@app/pages/CompanyPage";
import type { Route } from "./+types/company-detail";

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

export default function CompanyDetail() {
  return <CompanyPage />;
}
