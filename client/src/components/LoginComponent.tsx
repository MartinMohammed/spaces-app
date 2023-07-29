/**
 * React component representing the login form.
 * The login form allows users to log in to the application by providing their username and password.
 *
 * @param {LoginProps} props - Props object containing the authService and setUserNameCb to handle login functionality and update the username.
 * @returns {JSX.Element} - The JSX element representing the login form.
 */
import { SyntheticEvent, useState } from "react";
import { AuthService } from "../services/AuthService";
import { Navigate } from "react-router-dom";

type LoginProps = {
  authService: AuthService;
  setUserNameCb: (userName: string) => void;
};

export default function LoginComponent({ authService, setUserNameCb }: LoginProps) {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  /**
   * Handles the form submission when the user attempts to log in.
   *
   * @param {SyntheticEvent} event - The synthetic event representing the form submission.
   */
  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (userName && password) {
      // Call the login method from the authService to log in with the provided credentials.
      const loginResponse = await authService.login(userName, password);
      const userName2 = authService.getUserName();

      // Update the username using the setUserNameCb callback if available.
      if (userName2) {
        setUserNameCb(userName2);
      }

      if (loginResponse) {
        // If login is successful, set the loginSuccess state to true.
        setLoginSuccess(true);
      } else {
        // If login fails, set an error message to display to the user.
        setErrorMessage("Invalid credentials");
      }
    } else {
      setErrorMessage("UserName and password required!");
    }
  };

  /**
   * Renders the login result message if there is an error message.
   *
   * @returns {JSX.Element | undefined} - The JSX element representing the error message or undefined if there is no error.
   */
  function renderLoginResult() {
    if (errorMessage) {
      return <label>{errorMessage}</label>;
    }
  }

  return (
    <div role="main">
      {/* Redirect to the profile page if login is successful */}
      {loginSuccess && <Navigate to="/profile" replace={true} />}

      <h2>Please login</h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <label>User name</label>
        <input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <br />
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <br />
        <input type="submit" value="Login" />
      </form>
      <br />
      {/* Render the login result message */}
      {renderLoginResult()}
    </div>
  );
}
