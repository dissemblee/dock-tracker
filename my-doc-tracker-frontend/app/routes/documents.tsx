import { DocumentsPage } from "@app/pages/DocumentsPage";
import type { Route } from "./+types/documents";

export function meta() {
  return [
    { title: "Документы | Dock Tracker" },
    {
      name: "description",
      content: "Управление документами",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  return null;
}

export default function Documents() {
  return <DocumentsPage />;
}
