/**
 * TypeScript Declaration File for Custom Environment Variables.
 *
 * This declaration file extends the 'ProcessEnv' interface in the 'NodeJS' namespace
 * to include custom environment variables used in the application. These variables are
 * typically defined and provided by the underlying environment (e.g., operating system)
 * or set explicitly by the developer before running the Node.js application.
 *
 * The extended 'ProcessEnv' interface includes the following custom environment variables:
 *
 * - MY_VARIABLE: A string representing a custom environment variable used in the application.
 * - COGNITO_TEST_USERNAME: A string representing the test username for Cognito authentication.
 * - COGNITO_TEST_PASSWORD: A string representing the test password for Cognito authentication.
 * - AWS_REGION: A string representing the AWS region where resources are located or accessed.
 * - COGNITO_USER_POOL_ID: A string representing the unique identifier of the Cognito User Pool.
 * - COGNITO_USER_POOL_CLIENT_ID: A string representing the client ID associated with the Cognito User Pool.
 * - COGNITO_IDENTITY_POOL_ID: A string representing the unique identifier of the Cognito Identity Pool.
 *
 * Usage:
 * - After including this 'custom.d.ts' file in your TypeScript project, the TypeScript compiler
 *   will recognize and provide type information for the custom environment variables defined here.
 * - Ensure to set the actual values for these environment variables either manually or through
 *   configuration management tools before running the Node.js application.
 * - The custom environment variables are accessible via 'process.env' in the application code.
 *
 * Example Usage:
 * ```typescript
 * // Access the custom environment variables
 * const cognitoUsername: string = process.env.COGNITO_TEST_USERNAME;
 * const cognitoPassword: string = process.env.COGNITO_TEST_PASSWORD;
 * const awsRegion: string = process.env.AWS_REGION;
 * const userPoolId: string = process.env.COGNITO_USER_POOL_ID;
 * const userPoolClientId: string = process.env.COGNITO_USER_POOL_CLIENT_ID;
 * const identityPoolId: string = process.env.COGNITO_IDENTITY_POOL_ID;
 * ```
 */

// TypeScript Declaration File for Custom Environment Variables.
declare namespace NodeJS {
  interface ProcessEnv {
    COGNITO_TEST_USERNAME: string;
    COGNITO_TEST_PASSWORD: string;
    AWS_REGION: string;
    COGNITO_USER_POOL_ID: string;
    COGNITO_USER_POOL_CLIENT_ID: string;
    COGNITO_IDENTITY_POOL_ID: string;
  }
}
