import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import * as Sentry from "@sentry/vue";
import VueGtag from "vue-gtag";
/* eslint-disable */
// @ts-ignore
import GAuth from "vue3-google-oauth2";

const app = createApp(App);

// @ts-ignore
const VUE_APP_BASE_URL: string = process.env.VUE_APP_BASE_URL

Sentry.init({
  app,
  dsn: process.env.VUE_APP_SENTRY_DSN,
  environment: process.env.VUE_APP_ENVIRONMENT,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", VUE_APP_BASE_URL],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const MEASUREMENT_ID = process.env.VUE_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID;
if (MEASUREMENT_ID){
  app.use(VueGtag, {
    appName:  `DB Frontend ${process.env.VUE_APP_ENVIRONMENT}`,
    pageTrackerScreenviewEnabled: true,
    config: { id: MEASUREMENT_ID }
  }, router)
}

const gAuthOptions = {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: "email",
  prompt: "consent",
  plugin_name: "chat"
};
app.use(GAuth, gAuthOptions).use(store).use(router).mount("#app");


