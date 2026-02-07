import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { ShowcaseFragment } from "./ShowcaseFragment";
import { LoginPage } from "./components/LoginPage";

function App() {
  return (
    <>
      <AuthenticatedTemplate>
        <ShowcaseFragment />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginPage />
      </UnauthenticatedTemplate>
    </>
  );
}

export default App;
