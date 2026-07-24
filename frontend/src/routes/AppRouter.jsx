import { APP_ROUTES } from "./routeConfig";


function AppRouter({ path, chat, analytics }) {
    if (path === APP_ROUTES.chat) {
        return chat;
    }

    if (path === APP_ROUTES.analytics) {
        return analytics;
    }

    return (
        <main className="page-loading" role="status">
            <h1>Page not found</h1>
            <p>Use the conversation workspace to continue.</p>
        </main>
    );
}


export default AppRouter;
