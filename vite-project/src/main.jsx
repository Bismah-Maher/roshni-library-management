import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { LibraryProvider } from "./context/LibraryContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LibraryProvider>
      <App />
    </LibraryProvider>
  </React.StrictMode>
);