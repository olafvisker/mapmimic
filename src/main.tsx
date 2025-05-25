import "./global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { MapProvider } from "react-map-gl/maplibre";

document.documentElement.classList.add("dark");
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapProvider>
      <App />
    </MapProvider>
  </StrictMode>
);
