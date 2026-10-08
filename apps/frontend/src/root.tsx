import { component$, $, useOnDocument } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

export default component$(() => {
  useOnDocument(
    "load",
    $(async () => {
      if (!import.meta.env.PROD) return;
      const { registerSW } = await import("virtual:pwa-register");
      registerSW({ immediate: true });
    }),
  );

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
