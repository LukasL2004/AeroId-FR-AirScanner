import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Presentation from "./Pages/PresentationPage/Presentation";
import Scanner from "./Pages/ScannerPage/Scanner";
import Results from "./Pages/ResultsPage/Results";

function App() {
  const router = createBrowserRouter([
    { path: "/", loader: () => redirect("/PresentaionPage") },
    { path: "/PresentaionPage", element: <Presentation /> },
    { path: "/Scanner", element: <Scanner /> },
    { path: "/Results", element: <Results /> },
  ]);

  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
