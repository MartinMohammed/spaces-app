import { ISpaceEntry } from "../model/Model";

/**
 * Custom Error class for representing the scenario where a required field is missing.
 */
export class MissingFieldError extends Error {
  /**
   * Creates a new MissingFieldError instance with a message indicating the missing field.
   * @param missingField - The name of the missing field.
   */
  constructor(missingField: string) {
    super(`Value for '${missingField}' expected.`);
  }
}

/**
 * Custom Error class for representing the scenario where parsing JSON string fails.
 */
export class JSONError extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}

/**
 * Responsible for validating the structure of the incoming spaceEntry object.
 * @param arg - The object to be validated as a spaceEntry.
 * @throws {MissingFieldError} - If any required field (id, location, or name) is missing.
 */
export function validateAsSpaceEntry(arg: any) {
  // Use type assertion (arg as ISpaceEntry) to check for the presence of required fields.
  if ((arg as ISpaceEntry).location === undefined) {
    throw new MissingFieldError("location");
  }
  if ((arg as ISpaceEntry).name === undefined) {
    throw new MissingFieldError("name");
  }
  if ((arg as ISpaceEntry).id === undefined) {
    throw new MissingFieldError("id");
  }
}
