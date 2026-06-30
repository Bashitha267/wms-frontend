import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import NewSupply from "./pages/NewSupply";
import Loading from "./pages/Loading";
import Shops from "./pages/Shops";
import Resources from "./pages/Resources";
import Invoices from "./pages/Invoices";
import Returns from "./pages/Returns";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "suppliers",
        element: <Suppliers />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "new-supply",
        element: <NewSupply />,
      },
      {
        path: "loading",
        element: <Loading />,
      },
      {
        path: "resources",
        element: <Resources />,
      },
      {
        path: "shops",
        element: <Shops />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "supply-invoices",
        element: <Invoices />,
      },
      {
        path: "returns",
        element: <Returns />,
      },
      {
        path: "sales",
        element: <Sales />,
      },
      {
        path: "",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
