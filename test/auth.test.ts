import { AuthService } from "./AuthService";

/**
 * Mock username for testing authentication.
 */
const mockUsername = "Martin";

/**
 * Mock password for testing authentication.
 */
const mockPassword = "q0E43%R3N3Nz";

/**
 * Test the authentication functionality of the AuthService class.
 * It creates an instance of the AuthService, performs a login operation using the mock username and password,
 * and prints the JWT token obtained from the successful login result.
 *
 * Note: The AuthService class is used for handling user authentication, and the testAuth() function demonstrates how
 * to use it for testing purposes.
 */
async function testAuth() {
  // Create an instance of the AuthService class.
  const service = new AuthService();

  // Perform a login operation using the mock username and password.
  const loginResult = await service.login(mockUsername, mockPassword);

  // Get the JWT token from the successful login result and print it.
  console.log(loginResult.getSignInUserSession()?.getIdToken().getJwtToken());
}

// Call the testAuth() function to test the authentication functionality.
testAuth();
