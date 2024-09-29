import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { NextUIProvider } from "@nextui-org/react"
import React from "react"
import AppProvider from "./contexts/AppContext.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NextUIProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </NextUIProvider>
  </React.StrictMode>
)
