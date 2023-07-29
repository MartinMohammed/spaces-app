/**
 * Represents the structure of a space entry in the application.
 */
export interface ISpaceEntry {
  id: string; // The unique identifier for the space entry.
  location: string; // The location of the space.
  name: string; // The name of the space.
  photoUrl?: string; // An optional URL for the space's photo.
}
