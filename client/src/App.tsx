import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Progress from "./pages/Progress";
import History from "./pages/History";
import AdminImport from "./pages/AdminImport";
import AdminEdit from "./pages/AdminEdit";
import AdminCertifications from "./pages/AdminCertifications";
import AdminAddQuestion from "./pages/AdminAddQuestion";
import SessionDetail from "./pages/SessionDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/practice"} component={Practice} />
      <Route path={"/progress"} component={Progress} />
      <Route path={"/history"} component={History} />
      <Route path={"/session/:sessionId"} component={SessionDetail} />
      <Route path={"/admin/import"} component={AdminImport} />
      <Route path={"/admin/edit"} component={AdminEdit} />
      <Route path={"/admin/certifications"} component={AdminCertifications} />
      <Route path={"/admin/add-question"} component={AdminAddQuestion} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
