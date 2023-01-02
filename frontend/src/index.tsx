import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { App } from "./App";

import "@elastic/eui/dist/eui_theme_light.css";
import "@elastic/charts/dist/theme_light.css";

import { EuiProvider } from "@elastic/eui";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './utils/auth';
import { supabase } from './utils/supabase';
// Using react-query for the components that interact with Supabase's Postgres API
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <AuthProvider supabase={supabase}>
    <QueryClientProvider client={queryClient}>
      <EuiProvider colorMode="light">
        <App />
      </EuiProvider>
    </QueryClientProvider>
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
