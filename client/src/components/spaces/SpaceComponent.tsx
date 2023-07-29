/**
 * React component responsible for rendering individual space entries.
 * This component displays the space's image, name, location, and a reserve button.
 *
 * @param {SpaceComponentProps} props - Props object containing the SpaceEntry details and the reserveSpace function.
 * @returns {JSX.Element} - The JSX element representing the SpaceComponent.
 */
import genericImage from "../../assets/generic-photo.jpg";
import { SpaceEntry } from "../model/model";
import "./SpaceComponent.css";

interface SpaceComponentProps extends SpaceEntry {
  /**
   * Function to reserve the space with the given space ID and name.
   *
   * @param {string} spaceId - The ID of the space to reserve.
   * @param {string} spaceName - The name of the space to reserve.
   */
  reserveSpace: (spaceId: string, spaceName: string) => void;
}

export default function SpaceComponent(props: SpaceComponentProps) {
  /**
   * Renders the space's image, either using the provided photoUrl or a generic image.
   *
   * @returns {JSX.Element} - The JSX element representing the space's image.
   */
  function renderImage() {
    if (props.photoUrl) {
      return <img src={props.photoUrl} alt={props.name} />;
    } else {
      return <img src={genericImage} alt="Generic Space" />;
    }
  }

  return (
    <div className="spaceComponent">
      {renderImage()}
      <label className="name">{props.name}</label>
      <br />
      <label className="location">{props.location}</label>
      <br />
      <button onClick={() => props.reserveSpace(props.id, props.name)}>Reserve</button>
    </div>
  );
}
