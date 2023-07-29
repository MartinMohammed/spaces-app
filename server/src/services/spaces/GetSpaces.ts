/**
 * Retrieves items from the table based on the provided query parameters and returns them in the response body.
 *
 * If the 'id' query parameter is provided, a single item is retrieved based on its ID.
 * Otherwise, all items inside the table are scanned and returned.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing details about the incoming API Gateway request.
 * @param {DynamoDBClient} dynamoDbClient - An instance of DynamoDBClient used to interact with the DynamoDB service.
 * @returns {Promise<APIGatewayProxyResult>} - A promise that resolves to the APIGatewayProxyResult containing the retrieved items in the response body.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { constructResponseError } from "../shared/Utils";

export async function getSpaces(
  event: APIGatewayProxyEvent,
  dynamoDbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  let command;
  let items;

  // Check if the 'id' query parameter is provided to fetch a specific item.
  const spaceId = event.queryStringParameters?.id;
  if (spaceId) {
    // Retrieve a single item based on its ID.
    command = new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: marshall({ id: spaceId }),
    });
    const getItemResponse = await dynamoDbClient.send(command);
    if (getItemResponse.Item === undefined) {
      const notFoundResponse: APIGatewayProxyResult = {
        statusCode: 404, // OK - Request was successful
        body: constructResponseError(
          404,
          `Item with id ${spaceId} was not found!`
        ),
      };
      return notFoundResponse;
    }
    items = [getItemResponse.Item];
  } else {
    // Read all items inside the table.
    command = new ScanCommand({
      TableName: process.env.TABLE_NAME,
    });
    const scanItemsResponse = await dynamoDbClient.send(command);

    // Reformat the items to remove DynamoDB-specific data types.
    items = scanItemsResponse.Items;
  }

  const unmarshalledItems = items?.map((item) => unmarshall(item));
  const response: APIGatewayProxyResult = {
    statusCode: 200, // OK - Request was successful
    body: JSON.stringify(unmarshalledItems),
  };
  return response;
}
