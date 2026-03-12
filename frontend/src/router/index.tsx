import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProtectedRoute } from '../components/router/ProtectedRoute';
import { PublicRoute } from '../components/router/PublicRoute';

// Placeholder empty dashboard component
const DashboardPlaceholder = () => (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Bienvenido al CRM Cloud. (MVP en construcción)</p>
    </div>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        element: <PublicRoute />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/register',
                element: <RegisterPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/dashboard',
                element: <DashboardPlaceholder />
            }
        ],
    },
]);
