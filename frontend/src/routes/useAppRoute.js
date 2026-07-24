import { useEffect, useState } from "react";

export default function useAppRoute() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const syncRoute = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function navigate(nextPath) {
    if (nextPath === window.location.pathname) {
      return;
    }

    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }

  return { path, navigate };
}
