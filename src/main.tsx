import ReactDOM from "react-dom/client";
import "@mimesis/styles/tokens.css";
import App from "./App";
import "../style.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing root element");
}

ReactDOM.createRoot(rootElement).render(<App />);
