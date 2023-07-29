/**
 * Service class responsible for handling user authentication using AWS Cognito.
 * This class provides methods for user login, retrieving temporary credentials, and checking user authorization.
 * It is configured to use AWS Amplify for authentication with the specified AWS Cognito User Pool and Identity Pool.
 */
import { type CognitoUser } from "@aws-amplify/auth";
import { Amplify, Auth } from "aws-amplify";
import { AuthStack } from "../../../server/outputs.json";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const awsRegion = "eu-central-1";

/**
 * Configure the AWS Amplify library for authentication with the specified AWS Cognito User Pool and Identity Pool.
 * Amplify is a JavaScript library provided by AWS that simplifies working with AWS services, including Cognito for user authentication.
 */
Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: awsRegion,
    userPoolId: AuthStack.SpaceUserPoolId,
    userPoolWebClientId: AuthStack.SpaceUserPoolClientId,
    identityPoolId: AuthStack.SpaceIdentityPoolId,
    authenticationFlowType: "USER_PASSWORD_AUTH",
  },
});

export class AuthService {
  private user: CognitoUser | undefined;
  public jwtToken: string | undefined;
  private temporaryCredentials: object | undefined;

  /**
   * Check if the user is authorized and logged in.
   *
   * @returns {boolean} - True if the user is authorized (logged in), otherwise false.
   */
  public isAuthorized() {
    return !!this.user;
  }

  /**
   * Authenticate the user with the provided username and password.
   *
   * @param {string} userName - The username or email of the user attempting to log in.
   * @param {string} password - The password associated with the user's account.
   * @returns {Promise<Object | undefined>} - A promise that resolves to the CognitoUser object upon successful login, or undefined if login fails.
   */
  public async login(
    userName: string,
    password: string
  ): Promise<Object | undefined> {
    try {
      // Use AWS Amplify's Auth.signIn method to perform user authentication.
      this.user = (await Auth.signIn(userName, password)) as CognitoUser;
      this.jwtToken = this.user
        ?.getSignInUserSession()
        ?.getIdToken()
        .getJwtToken();
      return this.user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  /**
   * Get the username of the authenticated user.
   *
   * @returns {string | undefined} - The username of the authenticated user, or undefined if the user is not logged in.
   */
  public getUserName(): string | undefined {
    return this.user?.getUsername();
  }

  /**
   * Generate temporary credentials for the authenticated user using the Cognito Identity Pool.
   *
   * @returns {Promise<object>} - A promise that resolves to the temporary credentials object for the authenticated user.
   */
  private async generateTemporaryCredentials(): Promise<object> {
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.SpaceUserPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        clientConfig: {
          region: awsRegion,
        },
        identityPoolId: AuthStack.SpaceIdentityPoolId,
        logins: {
          [cognitoIdentityPool]: this.jwtToken!,
        },
      }),
    });
    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
  }

  /**
   * Retrieve temporary credentials for the authenticated user from the Cognito Identity Pool.
   *
   * @returns {Promise<object>} - A promise that resolves to the temporary credentials object for the authenticated user.
   */
  public async getTemporaryCredentials(): Promise<object> {
    if (this.temporaryCredentials) {
      return this.temporaryCredentials;
    }
    this.temporaryCredentials = await this.generateTemporaryCredentials();
    return this.temporaryCredentials;
  }
}
