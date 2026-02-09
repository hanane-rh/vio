import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { Dashboard } from "./pages/dashboard";
import { FutureSelfDialogue } from "./pages/future-self-dialogue";
import { Constellation } from "./pages/constellation";
import { AdaptiveChallenges } from "./pages/adaptive-challenges";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "future-self", Component: FutureSelfDialogue },
      { path: "constellation", Component: Constellation },
      { path: "challenges", Component: AdaptiveChallenges },
    ],
  },
]);