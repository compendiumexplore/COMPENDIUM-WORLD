import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css"; // This loads your tailwind styles
import App from "./App"; // This loads your brain logic

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
