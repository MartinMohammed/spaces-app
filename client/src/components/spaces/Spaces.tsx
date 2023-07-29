/**
 * React component responsible for rendering the Spaces page.
 * This component displays a list of space entries and allows users to reserve spaces.
 *
 * @param {SpacesProps} props - Props object containing the DataService instance to interact with space data.
 * @returns {JSX.Element} - The JSX element representing the Spaces page component.
 */
import { useState, useEffect } from "react";
import SpaceComponent from "./SpaceComponent";
import { DataService } from "../../services/DataService";
import { NavLink } from "react-router-dom";
import { SpaceEntry } from "../model/model";

interface SpacesProps {
  dataService: DataService;
}

export default function Spaces(props: SpacesProps) {
  const [spaces, setSpaces] = useState<SpaceEntry[]>();
  const [reservationText, setReservationText] = useState<string>();

  /**
   * Fetches the list of spaces and updates the state with the retrieved data.
   * This function is executed once when the component is mounted.
   */
  useEffect(() => {
    const getSpaces = async () => {
      console.log("getting spaces....");
      const spaces = await props.dataService.getSpaces();
      setSpaces(spaces);
    };
    getSpaces();
  }, []);

  /**
   * Reserves a space by calling the data service and updates the reservation text.
   *
   * @param {string} spaceId - The ID of the space to reserve.
   * @param {string} spaceName - The name of the space to reserve.
   */
  async function reserveSpace(spaceId: string, spaceName: string) {
    const reservationResult = await props.dataService.reserveSpace(spaceId);
    setReservationText(`You reserved ${spaceName}, reservation id: ${reservationResult}`);
  }

  /**
   * Renders the list of space components.
   * If the user is not authorized, it displays a link to the login page.
   *
   * @returns {JSX.Element} - The JSX element representing the list of space components.
   */
  function renderSpaces() {
    if (!props.dataService.isAuthorized()) {
      return <NavLink to={"/login"}>Please login</NavLink>;
    }
    const rows: any[] = [];
    if (spaces) {
      for (const spaceEntry of spaces) {
        rows.push(
          <SpaceComponent
            key={spaceEntry.id}
            id={spaceEntry.id}
            location={spaceEntry.location}
            name={spaceEntry.name}
            photoUrl={spaceEntry.photoUrl}
            reserveSpace={reserveSpace}
          />
        );
      }
    }

    return rows;
  }

  return (
    <div>
      <h2>Welcome to the Spaces page!</h2>
      {reservationText ? <h2>{reservationText}</h2> : undefined}
      {renderSpaces()}
    </div>
  );
}
