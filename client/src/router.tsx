// In your router configuration file (e.g., App.jsx or router.jsx)
import { createBrowserRouter } from "react-router-dom";
import Layout from './Layout';
import { CharacterProfile } from './pages/CharacterProfile';
import { PlatformCredentials } from './pages/PlatformCredentials';
import { AgentDashboard } from './pages/AgentDashboard';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <AgentDashboard />,
            },
            {
                path: '/character',
                element: <CharacterProfile />,
            },
            {
                path: '/credentials',
                element: <PlatformCredentials />,
            },
        ],
    },
]);
