/**
 * React component responsible for creating a new space entry.
 * This component provides a form for users to enter the space's name, location, and an optional photo.
 *
 * @param {CreateSpaceProps} props - Props object containing the dataService to handle space creation.
 * @returns {JSX.Element} - The JSX element representing the CreateSpace component.
 */
import { SyntheticEvent, useState } from "react";
import { NavLink } from "react-router-dom";
import { DataService } from "../../services/DataService";

type CreateSpaceProps = {
  dataService: DataService;
};

type CustomEvent = {
  target: HTMLInputElement;
};

export default function CreateSpace({ dataService }: CreateSpaceProps) {
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [actionResult, setActionResult] = useState<string>("");

  /**
   * Handles the form submission to create a new space entry.
   *
   * @param {SyntheticEvent} event - The form submission event.
   */
  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (name && location) {
      const id = await dataService.createSpace(name, location, photo);
      setActionResult(`Created space with id ${id}`);
      setName("");
      setLocation("");
    } else {
      setActionResult("Please provide a name and a location!");
    }
  };

  /**
   * Sets the selected photo file to the component state.
   *
   * @param {CustomEvent} event - The file input change event.
   */
  function setPhotoUrl(event: CustomEvent) {
    if (event.target.files && event.target.files[0]) {
      setPhoto(event.target.files[0]);
    }
  }

  /**
   * Renders the selected photo preview.
   *
   * @returns {JSX.Element} - The JSX element representing the photo preview.
   */
  function renderPhoto() {
    if (photo) {
      const localPhotoURL = URL.createObjectURL(photo);
      return <img alt='' src={localPhotoURL} style={{ maxWidth: "200px" }} />;
    }
  }

  /**
   * Renders the space creation form.
   *
   * @returns {JSX.Element} - The JSX element representing the space creation form.
   */
  function renderForm() {
    if (!dataService.isAuthorized()) {
      return <NavLink to={"/login"}>Please login</NavLink>;
    }
    return (
      <form onSubmit={(e) => handleSubmit(e)}>
        <label>Name:</label>
        <br />
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <br />
        <label>Location:</label>
        <br />
        <input value={location} onChange={(e) => setLocation(e.target.value)} />
        <br />
        <label>Photo:</label>
        <br />
        <input type="file" onChange={(e) => setPhotoUrl(e)} />
        <br />
        {renderPhoto()}
        <br />
        <input type="submit" value="Create space" />
      </form>
    );
  }

  return (
    <div>
      {renderForm()}
      {actionResult ? <h3>{actionResult}</h3> : undefined}
    </div>
  );
}
