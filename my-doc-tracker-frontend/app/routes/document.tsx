import { DocumentPage } from "@app/pages/DocumentPage";
import type { Route } from "./+types/document";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Документ ${params.id} | Dock Tracker` },
    {
      name: "description",
      content: "Просмотр документа",
    },
  ];
}

export function loader({ request, params }: Route.LoaderArgs) {
  return null;
}

export default function Document() {
  return <DocumentPage />;
}
