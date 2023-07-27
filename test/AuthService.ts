import { CognitoUser } from "@aws-amplify/auth";
import { Amplify, Auth } from "aws-amplify";

const awsRegion = "eu-central-1";
const userPoolId = "eu-central-1_MP9tzxhWy";
const userPoolClientId = "607ussviukn4r94e9su4ror4o7";
/**
 * Configures the AWS Amplify library for authentication with the specified AWS Cognito User Pool.
 * Amplify is a JavaScript library provided by AWS that simplifies working with AWS services, including Cognito for user authentication.
 *
 * @param {string} awsRegion - The AWS region where the User Pool is located.
 * @param {string} userPoolId - The unique identifier of the Cognito User Pool.
 * @param {string} userPoolClientId - The client ID associated with the User Pool, representing the application or client.
 */
Amplify.configure({
  Auth: {
    region: awsRegion,
    userPoolId,
    userPoolWebClientId: userPoolClientId,
    authenticationFlowType: "USER_PASSWORD_AUTH",
  },
});

/**
 * Service class responsible for handling user authentication using AWS Cognito.
 * This class provides methods for user login and interacts with AWS Amplify for authentication.
 */
export class AuthService {
  /**
   * Simulates the client login for now, as the frontend is not built yet.
   * This method sends the provided username and password to AWS Cognito for authentication.
   *
   * @param {string} username - The username or email of the user attempting to log in.
   * @param {string} password - The password associated with the user's account.
   * @returns {Promise<CognitoUser>} - A promise that resolves to the CognitoUser object upon successful login.
   */
  public async login(username: string, password: string): Promise<CognitoUser> {
    try {
      // Use AWS Amplify's Auth.signIn method to perform user authentication.
      const result = (await Auth.signIn(username, password)) as CognitoUser;
      return result;
    } catch (error) {
      // Handle any authentication errors here.
      // For example, if the user credentials are incorrect, an error will be thrown.
      // You can handle and display appropriate error messages to the user.
      throw error;
    }
  }
}
