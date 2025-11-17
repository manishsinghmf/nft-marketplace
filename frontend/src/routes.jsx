import { createBrowserRouter } from "react-router-dom";
import App from "./components/App/App";
import Buy from "./components/Buy/Buy";
import MyCollection from "./components/MyCollection/MyCollection";
import Error from "./components/Error/Error";
import Home from "./components/Home/Home";
import Mint from "./components/Mint/Mint";
import Sell from "./components/Sell/Sell";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                path: "/",
                element: <Home />,
            },
            {
                path: "/my-collection",
                element: <MyCollection />,
            },
            {
                path: "/mint",
                element: <Mint />,
            },
            {
                path: "/sell",
                element: <Sell />,
            },
            {
                path: "/buy",
                element: <Buy />,
            },
        ],
        errorElement: <Error />,
    },

]);

export default router;