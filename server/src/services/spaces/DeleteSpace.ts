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
import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { constructResponseError, isAdminGroupMember } from "../shared/Utils";

export async function deleteSpace(
  event: APIGatewayProxyEvent,
  dynamoDbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult;

  // Only cognito users that are member of the admin group should be able to delete items
  const isAuthorized = isAdminGroupMember(event);
  if (!isAuthorized) {
    const response: APIGatewayProxyResult = {
      statusCode: 401,
      body: constructResponseError(401, "Unauthorized!"),
    };
    return response;
  }

  // Check if the 'id' query parameter is provided to fetch a specific item.
  const spaceId = event.queryStringParameters?.id;
  if (spaceId) {
    const command = new DeleteItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: marshall({ id: spaceId }),
    });
    await dynamoDbClient.send(command);
    response = {
      statusCode: 204,
      body: JSON.stringify({}), // empty body
    };
  } else {
    response = {
      statusCode: 400,
      body: constructResponseError(
        400,
        "For the delete method the space Id must be provided as query parameter."
      ),
    };
  }

  return response;
}
