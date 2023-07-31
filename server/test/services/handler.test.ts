// Import necessary modules and the lambda handler function.
import { SNSEvent } from "aws-lambda";
import { handler } from "../../src/services/monitor/handler";

// Test suite for the Monitor Lambda function.
describe("Monitor lambda test: ", () => {
  // Define a Jest mock function to track the fetch method used for making HTTP requests.
  let fetchSpy: jest.Mock;

  // Save the original SLACK_WEBHOOK_URL environment variable.
  const originalSlackWebhookUrlEnv = process.env.SLACK_WEBHOOK_URL;
  let mockSlackWebhookUrlEnv: string;

  // Setup: This block runs before all the tests in this suite.
  beforeAll(() => {
    // Mock the fetch method so that it returns an empty object for all requests.
    fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve({} as any)) as jest.Mock;

    // Set a mock SLACK_WEBHOOK_URL environment variable for testing purposes.
    mockSlackWebhookUrlEnv = "https://demo.com";
    process.env.SLACK_WEBHOOK_URL = mockSlackWebhookUrlEnv;
  });

  // Define a mock SNS event that simulates a CloudWatch alarm trigger.
  // For testing purposes, we create a single SNS message with the content "This is a test."
  const mockSnsEvent: SNSEvent = {
    Records: [
      {
        Sns: {
          Message: "This is a test.",
        },
      },
    ],
  } as any;

  // Test case: makes requests to webhook URL for records in SNS Events.
  test("makes requests to webhook URL for records in SnsEvents ", async () => {
    // Call the Lambda handler with the mock SNS event.
    await handler(mockSnsEvent, {} as any);

    // For each record in the mock SNS event, expect the fetch method to be called with the mockSlackWebhookUrlEnv
    // and with a specific POST request body containing the message from the SNS event.
    // Also, expect the fetch method to be called exactly mockSnsEvent.Records.length times.
    for (const record of mockSnsEvent.Records) {
      expect(fetchSpy).toHaveBeenCalledWith(mockSlackWebhookUrlEnv, {
        method: "POST",
        body: JSON.stringify({
          text: `Houston, we have a problem: ${record.Sns.Message}`,
        }),
      });
      expect(fetchSpy).toHaveBeenCalledTimes(mockSnsEvent.Records.length);
    }
  });

  // Test case: No SNS records, no post requests.
  test("No SNS records, no post requests. ", async () => {
    // Call the Lambda handler with an empty SNS event (no records).
    await handler({ Records: [] }, {} as any);

    // Expect the fetch method not to be called with the mockSlackWebhookUrlEnv and the POST request body,
    // as there are no SNS records in the event.
    // Also, expect the fetch method not to be called at all (0 times).
    expect(fetchSpy).not.toHaveBeenCalledWith(mockSlackWebhookUrlEnv, {
      method: "POST",
      body: JSON.stringify({
        text: `Houston, we have a problem: ${mockSnsEvent.Records[0].Sns.Message}`,
      }),
    });
    expect(fetchSpy).toHaveBeenCalledTimes(0);
  });

  // Teardown: This block runs after each test in this suite to clear all mocks.
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teardown: This block runs after all the tests in this suite to clear all mocks and restore all mocked methods.
  afterAll(() => {
    // Restore the original SLACK_WEBHOOK_URL environment variable.
    process.env.SLACK_WEBHOOK_URL = originalSlackWebhookUrlEnv;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});
