// Import required modules and libraries
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { postSpaces } from "./PostSpaces";
import { getSpaces } from "./GetSpaces";
import { updateSpace } from "./UpdateSpace";
import { deleteSpace } from "./DeleteSpace";
import { JSONError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader, constructResponseError } from "../shared/Utils";
import { HttpMethod } from "aws-cdk-lib/aws-lambda";

import { Segment, captureAWSv3Client, getSegment } from "aws-xray-sdk-core";

// // Initialize S3 client outside of the lambda function to enable lambda to cache the initialization and re-use it in subsequent calls.
// // The S3 client needs the appropriate IAM policies to send this command.
// const s3Client = new S3Client({});

/* Any code outside the actual lambda function is considered context and can be reused for subsequent calls,
 * such as DynamoDB database connections and more.
 */
const dynamoDbClient = captureAWSv3Client(new DynamoDBClient({}));

/**
 * Lambda function that will be called by API Gateway for the 'spaces' resource.
 * @param event - The event data passed to the Lambda function by API Gateway.
 * @param context - The context object representing the execution environment.
 * @returns - The response to the API call.
 */
async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  // ------------------------ BEFORE LECTURE 36 ------------------------
  // // Create a ListBucketsCommand to retrieve the list of S3 buckets
  // const command = new ListBucketsCommand({});
  // let response: APIGatewayProxyResult;
  // try {
  //   // Send the ListBucketsCommand to the S3 service and await the response
  //   const listBucketsResult = (await s3Client.send(command)).Buckets;
  //   // Create a successful response with a status code of 200 and the list of S3 buckets in the response body
  //   response = {
  //     statusCode: 200,
  //     body: `Hello from Lambda! Here are your buckets: ${JSON.stringify(
  //       listBucketsResult
  //     )}`,
  //   };
  //   // Log the incoming event data for debugging purposes
  //   console.log(event);
  // } catch (error) {
  //   // If an error occurs while executing the ListBucketsCommand, create an error response with a status code of 500
  //   // and an error message in the response body
  //   console.error("List bucket command failed: ", (error as Error).message);
  //   response = {
  //     statusCode: 500,
  //     body: JSON.stringify({
  //       error: {
  //         statusCode: 500,
  //         message: (error as Error).message,
  //       },
  //     }),
  //   };
  // }
  // // Return the response to API Gateway
  // return response;
  // ------------------------ BEFORE LECTURE 36 ------------------------
  // Lambda architecture in which one lambda function is responsible for exact one resource.
  // let message: string;

  let response: APIGatewayProxyResult;

  try {
    // Switch statement to handle different HTTP methods (GET, POST, PUT, DELETE)
    switch (event.httpMethod) {
      case HttpMethod.GET:
        // Create a new subsegment for tracing the 'getSpaces' operation
        const getSpacesSubSegment = getSegment()?.addNewSubsegment("getSpaces");
        // Call the 'getSpaces' function to retrieve a list of spaces
        response = await getSpaces(event, dynamoDbClient);
        // Close the subsegment for 'getSpaces' operation
        getSpacesSubSegment?.close();
        break;
      case HttpMethod.POST:
        // Create a new subsegment for tracing the 'postSpaces' operation
        const postSpacesSubSegment =
          getSegment()?.addNewSubsegment("postSpaces");
        // Call the 'postSpaces' function to create a new space
        response = await postSpaces(event, dynamoDbClient);
        // Close the subsegment for 'postSpaces' operation
        postSpacesSubSegment?.close();
        break;
      case HttpMethod.PUT:
        // Create a new subsegment for tracing the 'updateSpace' operation
        const putSpaceSubSegment = getSegment()?.addNewSubsegment("putSpace");
        // Call the 'updateSpace' function to update an existing space
        response = await updateSpace(event, dynamoDbClient);
        // Close the subsegment for 'updateSpace' operation
        putSpaceSubSegment?.close();
        break;
      case HttpMethod.DELETE:
        // Create a new subsegment for tracing the 'deleteSpace' operation
        const deleteSpaceSubSegment =
          getSegment()?.addNewSubsegment("deleteSpace");
        // Call the 'deleteSpace' function to remove a space
        response = await deleteSpace(event, dynamoDbClient);
        // Close the subsegment for 'deleteSpace' operation
        deleteSpaceSubSegment?.close();
        break;
      default:
        // If the HTTP method is not supported, return a 500 status code with an error message
        response = {
          statusCode: 500,
          body: constructResponseError(
            500,
            `${event.httpMethod} is not supported.`
          ),
        };
        break;
    }
  } catch (error) {
    // Error handling for specific error types (MissingFieldError, JSONError)
    if (error instanceof MissingFieldError || error instanceof JSONError) {
      response = {
        statusCode: 400,
        body: constructResponseError(400, error.message),
      };
    } else {
      // General error handling for other unexpected errors
      response = {
        statusCode: 500,
        body: constructResponseError(500, (error as Error).message),
      };
    }
  }

  // Before sending a response back to the client, add CORS headers for all methods and origins.
  addCorsHeader(response);
  return response;
}

// Export the Lambda function for API Gateway to use
export { handler };
