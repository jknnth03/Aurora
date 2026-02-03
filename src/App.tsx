/// <reference types="vite-plugin-svgr/client" />

import { RouterProvider } from "react-router";
import "./App.scss";
import Providers from "./providers";
import { router } from "./router/router";
import { displayAsciiArt } from "./utils/ascii";

if (["development", "production", "local"].includes(import.meta.env.MODE)) {
  displayAsciiArt();
}
function App() {
  return (
    <>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </>
  );
}

export default App;
