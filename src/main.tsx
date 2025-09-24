import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ErrorBoundary definition
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    console.log("[main] ErrorBoundary.getDerivedStateFromError", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  componentDidMount() {
    console.log("[main] ErrorBoundary mounted");
    console.log("[main] VITE_API_URL (runtime) =", import.meta.env.VITE_API_URL);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="mb-4 text-muted-foreground">
              An unexpected error occurred while rendering the app.
            </p>
            <pre className="text-xs p-2 bg-muted rounded text-left overflow-auto">
              {String(this.state.error)}
              {this.state.error?.stack ? `\n\n${this.state.error.stack}` : ""}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              Check the console for more details.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}

// explicit startup log
console.log("[main] executing main.tsx");
console.info("VITE_API_URL =", import.meta.env.VITE_API_URL);

// global runtime handlers to avoid silent white screen
window.addEventListener("error", (e) => {
  console.error("[main] Global error event:", e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[main] Unhandled rejection event:", e);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
