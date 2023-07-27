/** The point where we call the lambda */

// Import the 'handler' function from the 'spaces' service.
import { handler } from "../src/services/spaces/handler";

// Mock the event object for different HTTP methods (POST, GET, PUT, DELETE).

// Example event for the 'POST' method, used for creating a new space with location as "London".
const mockEventForPost = {
  httpMethod: "POST",
  body: JSON.stringify({
    location: "London",
  }),
};

// Example event for the 'GET' method, used for retrieving a space with the given 'id'.
const mockEventForGet = {
  httpMethod: "GET",
  queryStringParameters: {
    id: "cf28b80c-449f-434c-85a8-c792e673d365", // Replace this with the actual 'id' you want to retrieve.
  },
};

// Example event for the 'PUT' method, used for updating the location of an existing space.
const mockEventForPut = {
  httpMethod: "PUT",
  queryStringParameters: {
    id: "cf28b80c-449f-434c-85a8-c792e673d365", // Replace this with the actual 'id' you want to update.
  },
  body: JSON.stringify({
    location: "Berlin", // Set the new location here (e.g., "Berlin").
  }),
};

// Example event for the 'DELETE' method, used for deleting a space with the given 'id'.
const mockEventForDelete = {
  httpMethod: "DELETE",
  queryStringParameters: {
    id: "cf28b80c-449f-434c-85a8-c792e673d365", // Replace this with the actual 'id' you want to delete.
  },
};

// Choose the mock event you want to test with (e.g., 'mockEventForPost', 'mockEventForGet', 'mockEventForPut', 'mockEventForDelete').
const mockEvent = mockEventForPost;

// Call the 'handler' function with the chosen mock event and empty objects as the second argument (no 'context' or 'callback' needed for testing).
handler(mockEvent as any, {} as any);

/**
 * Explanation:
1. The script is calling the `handler` function from the "spaces" service, which is assumed to contain the logic for handling different API Gateway events related to space resources.
2. Four example event objects (`mockEventForPost`, `mockEventForGet`, `mockEventForPut`, and `mockEventForDelete`) are created to simulate different HTTP methods (POST, GET, PUT, and DELETE) and their corresponding data.
3. The chosen mock event (in this case, `mockEventForDelete`) is assigned to the variable `mockEvent`.
4. The `handler` function is then called with the selected `mockEvent` as the first argument and empty objects as the second argument. In a real environment, the second argument could include 'context' and 'callback' parameters, which are not needed in this test scenario.
 */
