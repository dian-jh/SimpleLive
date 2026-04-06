import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Auth } from "./components/Auth";
import { Profile } from "./components/Profile";
import { StartStreamSelection } from "./components/StartStreamSelection";
import { StreamSetup } from "./components/StreamSetup";
import { LiveRoom } from "./components/LiveRoom";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "auth", Component: Auth },
      { path: "profile", Component: Profile },
      { path: "stream/select", Component: StartStreamSelection },
      { path: "stream/setup", Component: StreamSetup },
      { path: "room/:id", Component: LiveRoom },
    ],
  },
]);
