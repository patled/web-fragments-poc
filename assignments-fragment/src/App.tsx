import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { FragmentRouter } from "./FragmentRouter";
import AssignmentsRoutes from "./AssignmentsRoutes";
import { LoginPage } from "./components/LoginPage";

function App() {
  return (
    <>
      <AuthenticatedTemplate>
        <FragmentRouter
          fragmentId="project-assignments"
          basePath="/assignments"
        >
          <AssignmentsRoutes />
        </FragmentRouter>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </>
  );
}

export default App;
