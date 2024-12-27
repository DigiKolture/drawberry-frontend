import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import * as Sentry from "@sentry/vue";
/* eslint-disable */
// @ts-ignore
import GAuth from "vue3-google-oauth2";

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://da239c46ae977d40628f438f2254dde4@o4506475697864704.ingest.sentry.io/4506475701272576",
  environment: process.env.VUE_APP_ENVIRONMENT,
  integrations: [
    new Sentry.BrowserTracing({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      tracePropagationTargets: ["localhost", process.env.VUE_APP_BASE_URL],
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});


const gAuthOptions = {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: "email",
  prompt: "consent",
  plugin_name: "chat"
};
app.use(GAuth, gAuthOptions).use(store).use(router).mount("#app");
