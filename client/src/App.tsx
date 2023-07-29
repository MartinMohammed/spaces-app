/**
 * The root component of the application.
 * Handles routing and rendering of different pages.
 *
 * @returns {JSX.Element} - The JSX element representing the root component of the application.
 */
import './App.css';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import NavBar from './components/NavBar';
import { useState } from 'react';
import LoginComponent from './components/LoginComponent';
import { AuthService } from './services/AuthService';
import { DataService } from './services/DataService';
import CreateSpace from './components/spaces/CreateSpace';
import Spaces from './components/spaces/Spaces';

const authService = new AuthService();
const dataService = new DataService(authService);

function App() {
  const [userName, setUserName] = useState<string | undefined>(undefined);

  // Create the router configuration using createBrowserRouter.
  const router = createBrowserRouter([
    {
      element: (
        <>
          {/* Render the NavBar component with the current userName */}
          <NavBar userName={userName} />
          <Outlet />
        </>
      ),
      children: [
        {
          path: "/",
          element: <div>Hello world!</div>,
        },
        {
          path: "/login",
          // Render the LoginComponent with the authService and setUserNameCb props.
          element: <LoginComponent authService={authService} setUserNameCb={setUserName} />,
        },
        {
          path: "/profile",
          element: <div>Profile page</div>,
        },
        {
          path: "/createSpace",
          // Render the CreateSpace component with the dataService prop.
          element: <CreateSpace dataService={dataService} />,
        },
        {
          path: "/spaces",
          // Render the Spaces component with the dataService prop.
          element: <Spaces dataService={dataService} />,
        },
      ],
    },
  ]);

  return (
    <div className="wrapper">
      {/* Provide the router to the application */}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
