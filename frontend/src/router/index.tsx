import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ClientsPage } from "../pages/clients/ClientsPage";
import { CreateClientPage } from "../pages/clients/CreateClientPage";
import { ClientDetailPage } from "../pages/clients/ClientDetailPage";
import { EditClientPage } from "../pages/clients/EditClientPage";
import { ProtectedRoute } from "../components/router/ProtectedRoute";
import { PublicRoute } from "../components/router/PublicRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/clients",
        element: <ClientsPage />,
      },
      {
        path: "/clients/new",
        element: <CreateClientPage />,
      },
      {
        path: "/clients/:id",
        element: <ClientDetailPage />,
      },
      {
        path: "/clients/:id/edit",
        element: <EditClientPage />,
      },
    ],
  },
]);
