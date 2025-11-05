import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Trigger rebuild to reload environment variables
createRoot(document.getElementById("root")!).render(<App />);
