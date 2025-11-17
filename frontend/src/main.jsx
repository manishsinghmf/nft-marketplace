// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Web3Providers } from "./providers/wagmiProvider";
import router from "./routes"; // 👈 your new router.jsx
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Web3Providers>
      <RouterProvider router={router} />
    </Web3Providers>
  </React.StrictMode>
);
