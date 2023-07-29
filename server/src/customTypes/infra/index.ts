/**
 * Types for CDK Application Infrastructure
 *
 * This file defines various types related to the CDK (AWS Cloud Development Kit) application and its infrastructure.
 * It includes enums for different stacks and CfnOutputs used within the application to reference AWS CloudFormation resources.
 */

/** Enum for Stacks Provided by the CDK Application */
export enum Stacks {
  DATA = "DataStack",
  LAMBDA = "LambdaStack",
  AUTH = "AuthStack",
  API = "ApiStack",
  UI_DEPLOYMENT = "UIDeploymentStack",
}

/** Enum for CfnOutputs Defined in the CDK Application */
export enum CfnOutputs {
  SPACE_USER_POOL_ID = "SpaceUserPoolId",
  SPACE_USER_POOL_CLIENT_ID = "SpaceUserPoolClientId",
  SPACE_IDENTITY_POOL_ID = "SpaceIdentityPoolId",
  SPACE_FINDER_URL = "SpaceFinderUrl",
  SPACE_FINDER_PHOTOS_BUCKET_NAME = "SpaceFinderPhotosBucketName",
}

/**
 * Stacks Enum:
 *
 * - DATA: Represents the Data Stack, which contains resources related to data storage and databases.
 * - LAMBDA: Represents the Lambda Stack, which contains AWS Lambda functions and related resources.
 * - AUTH: Represents the Auth Stack, responsible for configuring AWS Cognito User Pool and Identity Pool for user authentication.
 * - API: Represents the API Stack, which contains resources related to AWS API Gateway and API deployment.
 * - UI_DEPLOYMENT: Represents the API Stack, which contains resources related to Deploying the User interface (frontend)
 *
 * CfnOutputs Enum:
 *
 * - SPACE_USER_POOL_ID: Represents the CloudFormation Output key for the Cognito User Pool ID.
 * - SPACE_USER_POOL_CLIENT_ID: Represents the CloudFormation Output key for the Cognito User Pool Client ID.
 * - SPACE_IDENTITY_POOL_ID: Represents the CloudFormation Output key for the Cognito Identity Pool ID.
 *
 * Usage:
 * - These enums provide convenient and consistent references to the various stacks and CloudFormation outputs
 *   used within the CDK application's infrastructure code.
 * - They are used for identifying, fetching, or passing around resource names and IDs during the CDK application's deployment process.
 */
