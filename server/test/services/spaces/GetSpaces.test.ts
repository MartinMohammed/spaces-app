// Import necessary modules and functions.
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { getSpaces } from "../../../src/services/spaces/GetSpaces";
import { constructResponseError } from "../../../src/services/shared/Utils";

// Define some mock data to be used in the tests.
const someItems = {
  Items: [
    {
      id: {
        S: "123",
      },
      location: {
        S: "Paris",
      },
    },
  ],
};

const someItem = {
  Item: {
    id: {
      S: "123",
    },
    location: {
      S: "Paris",
    },
  },
};

// Test suite for the GetSpaces function.
describe("GetSpaces test suite", () => {
  // Initialize a mock DDB client.
  let ddbClientMock: any;

  // Setup: This block runs before each test in this suite.
  beforeEach(() => {
    // Mock the DDB client to use the jest.fn() implementation for the `send` method.
    ddbClientMock = {
      send: jest.fn(),
    };
  });

  // Teardown: This block runs after each test in this suite to clear all mocks.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case: should return spaces if no queryStringParameters.
  test("should return spaces if no queryStringParameters", async () => {
    // Mock the DDB client to resolve the send method with `someItems`.
    ddbClientMock.send.mockResolvedValueOnce(someItems);

    // Call the getSpaces function with an empty request object and the mock DDB client.
    const getResult = await getSpaces({} as any, ddbClientMock as any);

    // Define the expected result based on the provided `someItems` data.
    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify([
        {
          id: "123",
          location: "Paris",
        },
      ]),
    };

    // Expect the result to match the expected result.
    expect(getResult).toEqual(expectedResult);
  });

  // Test case: should perform a scan command if no id was provided in queryStringParameters.
  test("should perform a scan command if no id was provided", async () => {
    // Mock the DDB client to resolve the send method with `someItems`.
    ddbClientMock.send.mockResolvedValueOnce(someItems);

    // Call the getSpaces function with a request object containing `queryStringParameters` with `notId`.
    const getResult = await getSpaces(
      {
        queryStringParameters: {
          notId: "123",
        },
      } as any,
      ddbClientMock as any
    );

    // Define the expected result based on the provided `someItems` data.
    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify([
        {
          id: "123",
          location: "Paris",
        },
      ]),
    };

    // Expect the result to match the expected result.
    expect(getResult).toEqual(expectedResult);
  });

  // Test case: should return 404 if no id in queryStringParameters.
  test("should return 404 if no id in queryStringParameters", async () => {
    // Mock the DDB client to resolve the send method with an empty object (indicating no item found).
    ddbClientMock.send.mockResolvedValueOnce({});

    // Define the mocked item ID for testing purposes.
    const mockedItemId = "123";

    // Call the getSpaces function with a request object containing `queryStringParameters` with `id`.
    const getResult = await getSpaces(
      {
        queryStringParameters: {
          id: mockedItemId,
        },
      } as any,
      ddbClientMock as any
    );

    // Define the expected result with the appropriate response error.
    const expectedResult = {
      statusCode: 404,
      body: constructResponseError(
        404,
        `Space Item with id ${mockedItemId} was not found!`
      ),
    };

    // Expect the result to match the expected result.
    expect(getResult).toEqual(expectedResult);
  });

  // Test case: should return 200 if queryStringParameters with found id.
  test("should return 200 if queryStringParameters with found id", async () => {
    // Mock the DDB client to resolve the send method with `someItem`.
    ddbClientMock.send.mockResolvedValueOnce(someItem);

    // Define the mocked item ID for testing purposes.
    const mockedItemId = "123";

    // Call the getSpaces function with a request object containing `queryStringParameters` with `id`.
    const getResult = await getSpaces(
      {
        queryStringParameters: {
          id: mockedItemId,
        },
      } as any,
      ddbClientMock as any
    );

    // Wait for the next tick of the event loop to allow promises to resolve.
    await new Promise(process.nextTick);

    // Define the expected result based on the provided `someItem` data.
    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify([
        {
          id: mockedItemId,
          location: "Paris",
        },
      ]),
    };

    // Expect the result to match the expected result.
    expect(getResult).toEqual(expectedResult);

    // Expect the DDB client to be called with an instance of GetItemCommand.
    expect(ddbClientMock.send).toBeCalledWith(expect.any(GetItemCommand));

    // Extract the input from the first call to the DDB client's send method.
    const getItemCommandInput = (
      ddbClientMock.send.mock.calls[0][0] as GetItemCommand
    ).input;

    // Expect that the TableName is undefined in the GetItemCommand input.
    expect(getItemCommandInput.TableName).toBeUndefined();

    // Expect that the Key property in the GetItemCommand input matches the mocked item ID.
    expect(getItemCommandInput.Key).toEqual({
      id: {
        S: mockedItemId,
      },
    });
  });
});
