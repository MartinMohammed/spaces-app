/**
 * Handles the POST method for creating a new 'space' resource.
 *
 * This function receives an APIGatewayProxyEvent containing the new space details as JSON data in the request body.
 * It generates a random ID for the partition key of the new item, adds it to the item data, and stores it in the DynamoDB table.
 * If the creation is successful, it returns a 201 status code with the newly generated space ID in the response body.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing details about the incoming API Gateway request.
 * @param {DynamoDBClient} dynamoDbClient - An instance of DynamoDBClient used to interact with the DynamoDB service.
 * @returns {Promise<APIGatewayProxyResult>} - A promise that resolves to the APIGatewayProxyResult indicating the success or failure of the creation operation.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { validateAsSpaceEntry } from "../shared/Validator";
import { createRandomId, parseJSON } from "../shared/Utils";

export async function postSpaces(
  event: APIGatewayProxyEvent,
  dynamoDbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  // Generate a random ID for the partition key of the new item.
  const randomId = createRandomId();

  // Extract the space data from the request body and add the generated ID.
  const spaceData: {
    id: string;
    location: string;
  } = { ...parseJSON(event.body!), id: randomId };

  validateAsSpaceEntry(spaceData);

  const command = new PutItemCommand({
    // The DynamoDB table name is injected as an environment variable when initializing the DynamoDB database table.
    TableName: process.env.TABLE_NAME,
    Item: marshall(spaceData),
  });

  // Save the new space item to the DynamoDB table.
  await dynamoDbClient.send(command);
  const response = {
    statusCode: 201, // Created - Request was successful, and a new resource was created
    body: JSON.stringify({
      id: randomId,
    }),
  };
  return response;
}
