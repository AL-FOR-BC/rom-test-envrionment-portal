import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./store/storeSetup.ts";
import Layout from "./Components/Layouts/Layout.tsx";
import { ToastContainer } from "react-toastify";
import { MsalProvider } from "@azure/msal-react";
import {
  PublicClientApplication,
  EventType,
  LogLevel,
} from "@azure/msal-browser";
import { AuthenticationResult } from "@azure/msal-browser";
import { environmentType } from "./configs/navigation.config/app.config.ts";
import { IdleTimerContainer } from "./Components/ui/Model/IdleTimerContainer.tsx";
import { initializeTheme } from "./utils/themeUtils";

const pca = new PublicClientApplication({
  auth: {
    // HRP_CLIENT_ID
    // clientId: "2d426493-7077-4eff-bace-cadbbed558bd",

    // ROM_CLIENT_ID
    clientId:
      environmentType === "HRP"
        ? "2d426493-7077-4eff-bace-cadbbed558bd"
        : "421c7fd5-2b20-45df-9b69-fcfca41d6ce2",

    // HRP_TENANT
    // authority: "https://login.microsoftonline.com/df78e20f-3ca1-4018-9157-8bedb2673da2",

    // ROM_TENANT
    authority:
      environmentType === "HRP"
        ? "https://login.microsoftonline.com/df78e20f-3ca1-4018-9157-8bedb2673da2"
        : "https://login.microsoftonline.com/24528e89-fa53-4fc5-9847-429bb50802ff",

    redirectUri:
      environmentType === "HRP"
        ? window.location.origin + "/"
        : window.location.origin + "/rom/",
    postLogoutRedirectUri:
      environmentType === "HRP"
        ? window.location.origin + "/single-sign-on/"
        : window.location.origin + "/rom/single-sign-on/",
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    allowNativeBroker: false,
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    loggerOptions: {
      loggerCallback: (message) => {
        console.log(message);
      },
      logLevel: LogLevel.Error,
    },
  },
});

pca.initialize().catch((error) => {
  console.error("MSAL Initialization Error:", error);
  localStorage.clear();
  sessionStorage.clear();
});

pca.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    if (payload.account) {
      pca.setActiveAccount(payload.account);
    }
  }
});

function App() {
  // Initialize theme on app startup
  React.useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <Provider store={store}>
      <MsalProvider instance={pca}>
        <BrowserRouter basename={environmentType === "HRP" ? "/" : "/rom"}>
          <IdleTimerContainer />
          <ToastContainer theme="colored" />
          <Layout />
        </BrowserRouter>
      </MsalProvider>
    </Provider>
  );
}

export default App;
