/**
 * General Types for CDK Application
 *
 * This file defines general types related to the entire CDK (AWS Cloud Development Kit) application.
 * It includes an enum representing common HTTP methods used in the application's API endpoints.
 */

/** Enum for Common HTTP Methods */
export enum HTTPMethods {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
}

/**
 * HTTPMethods Enum:
 *
 * - GET: Represents the HTTP GET method used for retrieving data from the server.
 * - POST: Represents the HTTP POST method used for creating new resources on the server.
 * - DELETE: Represents the HTTP DELETE method used for removing resources from the server.
 * - PUT: Represents the HTTP PUT method used for updating existing resources on the server.
 *
 * Usage:
 * - This enum provides a standardized representation of common HTTP methods used in the CDK application's API endpoints.
 * - It is helpful for maintaining consistency and readability in API endpoint definitions and interactions.
 * - Developers can use these values to indicate the intended action of API requests and responses throughout the application.
 * - For example, when defining API Gateway resources, this enum can be used to specify the corresponding HTTP method.
 */
