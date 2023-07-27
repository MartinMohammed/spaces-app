/**
 * This function is responsible for updating the 'location' attribute of a 'space' resource using the PATCH method.
 *
 * The function expects an APIGatewayProxyEvent containing the 'spaceId' as a query parameter and the 'newSpaceLocation' as JSON data in the request body.
 *
 * If both 'spaceId' and 'newSpaceLocation' are provided, the function updates the 'location' attribute of the corresponding space item in the database.
 * Upon a successful update, it returns a 200 status code along with a JSON response containing the updated attributes of the space item.
 *
 * If either 'spaceId' or 'newSpaceLocation' is missing, the function returns a 400 status code with an error message indicating that both parameters are required for the update operation.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing details about the incoming API Gateway request.
 * @param {DynamoDBClient} dynamoDbClient - An instance of DynamoDBClient used to interact with the DynamoDB service.
 * @returns {Promise<APIGatewayProxyResult>} - A promise that resolves to the APIGatewayProxyResult indicating the success or failure of the update operation.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { constructResponseError, parseJSON } from "../shared/Utils";

export async function updateSpace(
  event: APIGatewayProxyEvent,
  dynamoDbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult;

  // Extract the 'spaceId' query parameter and 'newSpaceLocation' from the request body.
  const spaceId = event.queryStringParameters?.id;
  const newSpaceLocation = parseJSON(event.body!)?.location;

  if (spaceId && newSpaceLocation) {
    // Update the space item with the new location.
    const command = new UpdateItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: marshall({ id: spaceId }), // Use 'spaceId' as the key to identify the space item.
      UpdateExpression: "SET #location = :location", // Update the 'location' attribute.

      ExpressionAttributeNames: { "#location": "location" }, // Define the attribute name for 'location'.
      ExpressionAttributeValues: marshall({ ":location": newSpaceLocation }), // Set the new location value.

      ReturnValues: "UPDATED_NEW", // Specify that we want to receive the updated attributes in the response.
    });

    const updateResult = await dynamoDbClient.send(command);
    response = {
      statusCode: 200, // OK - Request was successful
      body: JSON.stringify(updateResult.Attributes), // Convert the updated attributes to JSON format.
    };
  } else {
    // Either 'spaceId' or 'newSpaceLocation' was not provided.
    response = {
      statusCode: 400, // Bad Request
      body: constructResponseError(
        400,
        "Both 'spaceId' and 'newSpaceLocation' must be provided for updating the space item."
      ),
    };
  }

  return response;
}
