/**
 * React component representing the navigation bar.
 * The navigation bar displays links to different pages of the application and the login/logout link based on the user's login status.
 *
 * @param {NavBarProps} props - Props object containing the userName to display on the navigation bar.
 * @returns {JSX.Element} - The JSX element representing the navigation bar.
 */
import { NavLink } from "react-router-dom";

type NavBarProps = {
  userName: string | undefined;
};

export default function NavBar({ userName }: NavBarProps) {
  /**
   * Renders the login/logout link based on the user's login status.
   *
   * @returns {JSX.Element} - The JSX element representing the login/logout link.
   */
  function renderLoginLogout() {
    if (userName) {
      return (
        <NavLink to="/logout" style={{ float: "right" }}>
          {userName}
        </NavLink>
      );
    } else {
      return (
        <NavLink to="/login" style={{ float: "right" }}>
          Login
        </NavLink>
      );
    }
  }

  return (
    <div className="navbar">
      {/* Navigation links */}
      <NavLink to={"/"}>Home</NavLink>
      <NavLink to={"/profile"}>Profile</NavLink>
      <NavLink to={"/spaces"}>Spaces</NavLink>
      <NavLink to={"/createSpace"}>Create space</NavLink>

      {/* Render login/logout link */}
      {renderLoginLogout()}
    </div>
  );
}
