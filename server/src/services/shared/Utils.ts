import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
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

/**
 * Checks if the user making the request is a member of the "admin" group.
 * This function assumes that the user is already authenticated and authorized by Cognito.
 * The Cognito authorizer adds additional information about the request and the user to the event object in the integration request.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing details about the incoming API Gateway request.
 * @returns {boolean} - True if the user is a member of the "admin" group, false otherwise.
 */
export function isAdminGroupMember(event: APIGatewayProxyEvent): boolean {
  // Check if the 'cognito:groups' claim exists in the event object's authorizer.
  const groups: Array<string> =
    event.requestContext.authorizer?.claims["cognito:groups"];

  // If the 'cognito:groups' claim exists, check if the "admin" group is included.
  if (groups) {
    return groups.includes("admin");
  }

  // If the 'cognito:groups' claim is not present or empty, return false.
  return false;
}

/**
 * Adds CORS (Cross-Origin Resource Sharing) header to the given API Gateway proxy result object.
 * CORS headers allow browsers to make cross-origin requests and are necessary to enable communication
 * between frontend applications and APIs hosted on different domains.
 *
 * @param {APIGatewayProxyResult} arg - The API Gateway proxy result object to which the CORS header will be added.
 * @returns {APIGatewayProxyResult} - The modified API Gateway proxy result object with the added CORS header.
 */
export function addCorsHeader(arg: APIGatewayProxyResult) {
  // If the "headers" property does not exist in the API Gateway proxy result object, create it and set the "Access-Control-Allow-Origin" header to "*".
  if (arg.headers === undefined) {
    arg.headers = {};
  }

  // If the "headers" property already exists, set the "Access-Control-Allow-Origin" header to "*".
  arg.headers["Access-Control-Allow-Origin"] = "*";
  arg.headers["Access-Control-Allow-Methods"] = "*";
}
