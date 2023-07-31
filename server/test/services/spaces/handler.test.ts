// Define some mock data to be used in the tests.
const mockedItemId = "123";
const mockedItemLocation = "Paris";
const someItems = [
  {
    id: {
      S: mockedItemId,
    },
    location: {
      S: mockedItemLocation,
    },
  },
];

// Test suite for the "Spaces" handler function.
describe("Spaces handler test suite", () => {
  let mockedScanCommand: any;
  let mockedDdbClient: any;
  const originalDynamoDbTableName = process.env.TABLE_NAME;
  let mockedDynamoDbTableName: string = "DEMO_DB";
  let handler: any;

  // Setup: This block runs before all the tests in this suite.
  beforeAll(() => {
    // Temporarily set the TABLE_NAME environment variable to the mockedDynamoDbTableName for testing purposes.
    process.env.TABLE_NAME = mockedDynamoDbTableName;

    // Mock the AWS SDK DynamoDBClient and ScanCommand.
    jest.mock("@aws-sdk/client-dynamodb", () => {
      return {
        DynamoDBClient: jest.fn().mockImplementation(() => {
          return {
            send: jest.fn().mockImplementation(() => {
              return {
                Items: someItems,
              };
            }),
          };
        }),
        ScanCommand: jest.fn(),
      };
    });

    // Mock the AWS X-Ray library to return a mock subsegment.
    jest.mock("aws-xray-sdk-core", () => ({
      ...jest.requireActual("aws-xray-sdk-core"),
      getSegment: jest.fn().mockReturnValue({
        addNewSubsegment: jest.fn().mockReturnValue({
          close: jest.fn(),
        }),
      }),
      captureAWSv3Client: jest.fn().mockImplementation((client) => client),
    }));

    // Get references to the mocked DynamoDBClient and ScanCommand.
    mockedDdbClient = require("@aws-sdk/client-dynamodb").DynamoDBClient;
    mockedScanCommand = require("@aws-sdk/client-dynamodb").ScanCommand;

    // Require the handler function after the mocks have been set up.
    handler = require("../../../src/services/spaces/handler").handler;
  });

  // Test case: Returns spaces from DynamoDB.
  test("Returns spaces from DynamoDB", async () => {
    // Call the handler function with a mock HTTP event and context.
    const result = await handler(
      {
        httpMethod: "GET",
      } as any,
      {} as any
    );

    // Assert that the result statusCode is 200 and the response body matches the expected result.
    expect(result.statusCode).toBe(200);
    const expectedResult = [
      {
        id: mockedItemId,
        location: mockedItemLocation,
      },
    ];
    const parsedResultBody = JSON.parse(result.body);
    expect(parsedResultBody).toEqual(expectedResult);

    // Expect the DynamoDBClient and ScanCommand to have been called once each.
    expect(mockedDdbClient).toHaveBeenCalledTimes(1);
    expect(mockedScanCommand).toHaveBeenCalledTimes(1);
  });

  // Teardown: This block runs after all the tests in this suite to reset environment variables and clear and restore mocks.
  afterAll(() => {
    // Restore the original TABLE_NAME environment variable.
    process.env.TABLE_NAME = originalDynamoDbTableName;

    // Clear and restore all mocks to their original implementations.
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});
