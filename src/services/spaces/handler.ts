// Import required modules and libraries
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { postSpaces } from "./PostSpaces";
import { getSpaces } from "./GetSpaces";
import { error } from "console";
import { updateSpace } from "./UpdateSpace";
import { deleteSpace } from "./DeleteSpace";
import { JSONError, MissingFieldError } from "../shared/Validator";
import { constructResponseError } from "../shared/Utils";
import { HTTPMethods } from "../../customTypes";

// Initialize S3 client outside of the lambda function to enable lambda to cache the initialization and re-use it in subsequent calls.
// The S3 client needs the appropriate IAM policies to send this command.
const s3Client = new S3Client({});

/* Any code outside the actual lambda function is considered context and can be reused for subsequent calls,
 * such as DynamoDB database connections and more.
 */
const dynamoDbClient = new DynamoDBClient({});

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
    switch (event.httpMethod) {
      case HTTPMethods.GET:
        response = await getSpaces(event, dynamoDbClient);
        break;
      case HTTPMethods.POST:
        response = await postSpaces(event, dynamoDbClient);
        break;
      case HTTPMethods.PUT:
        response = await updateSpace(event, dynamoDbClient);
        break;
      case HTTPMethods.DELETE:
        response = await deleteSpace(event, dynamoDbClient);
        break;
      default:
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
    if (error instanceof MissingFieldError || error instanceof JSONError) {
      response = {
        statusCode: 400,
        body: constructResponseError(400, error.message),
      };
    } else {
      response = {
        statusCode: 500,
        body: constructResponseError(500, (error as Error).message),
      };
    }
  }
  return response;
}

// Export the Lambda function for API Gateway to use
export { handler };
