import { JSONError } from "./Validator";
import { randomUUID } from "crypto";
/**
 * Generates a random ID using the v4 function from a third-party library or module.
 * The generated ID follows the UUID (Universally Unique Identifier) format.
 * @returns {string} - A randomly generated UUID.
 */

export function createRandomId() {
  return randomUUID();
}

/**
 * Parses a JSON-formatted string into a JavaScript object.
 * @param arg - The JSON-formatted string to be parsed.
 * @throws {JSONError} - If there is an error while parsing the JSON string, it throws a custom JSONError.
 * @returns {any} - The parsed JavaScript object if the JSON string is valid.
 */
export function parseJSON(arg: string) {
  try {
    return JSON.parse(arg);
  } catch (error) {
    throw new JSONError((error as Error).message);
  }
}

/**
 * Constructs a JSON string representing an error response with the specified status code and message.
 * @param statusCode - The HTTP status code to be included in the error response.
 * @param message - The error message to be included in the error response.
 * @returns A JSON string representing the error response with the provided status code and message.
 */
export function constructResponseError(statusCode: number, message: string) {
  return JSON.stringify({
    error: {
      message,
      statusCode,
    },
  });
}
