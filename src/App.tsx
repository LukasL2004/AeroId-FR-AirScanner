import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Presentation from "./Pages/PresentationPage/Presentation";

function App() {
  const router = createBrowserRouter([
    { path: "/", loader: () => redirect("/PresentaionPage") },
    { path: "/PresentaionPage", element: <Presentation /> },
  ]);

  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
