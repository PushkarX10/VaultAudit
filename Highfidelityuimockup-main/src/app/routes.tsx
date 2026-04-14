import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/app-layout";
import { Dashboard } from "./components/dashboard";
import { AuditorFeed } from "./components/auditor-feed";
import { OcrIngestion } from "./components/ocr-ingestion";
import { VaultSettings } from "./components/vault-settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "audits", Component: AuditorFeed },
      { path: "ingest", Component: OcrIngestion },
      { path: "settings", Component: VaultSettings },
      { path: "*", Component: Dashboard },
    ],
  },
]);
