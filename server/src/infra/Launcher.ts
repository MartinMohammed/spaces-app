/**
 * Serves as the entry point of the AWS CDK application.
 * This file instantiates the CDK app and imports the necessary stacks to be deployed.
 * Each stack represents a different set of cloud resources with specific functionality.
 *
 * The application is composed of the following stacks:
 * 1. DataStack: Contains resources for data storage, such as DynamoDB tables.
 * 2. LambdaStack: Includes AWS Lambda functions that perform business logic, integrated with resources from DataStack.
 * 3. ApiStack: Defines API Gateway resources and integrates them with Lambda functions from LambdaStack.
 * 4. AuthStack: Manages user authentication and authorization using Amazon Cognito.
 *
 * The application leverages AWS CDK constructs to define and deploy the cloud infrastructure.
 * Each stack is created using the corresponding class that extends the AWS CDK Stack class.
 *
 * @requires {App} - The root construct representing the AWS CDK app.
 */

import { App } from "aws-cdk-lib";
import { DataStack } from "./stacks/DataStack";
import { LambdaStack } from "./stacks/LambdaStack";
import { ApiStack } from "./stacks/ApiStack";
import { AuthStack } from "./stacks/AuthStack";
import { Stacks } from "../customTypes/infra";
import { UIDeploymentStack } from "./stacks/UIDeploymentStack";
import { MonitorStack } from "./stacks/MonitorStack";

// Create the AWS CDK app.
const app = new App();

// Instantiate the DataStack to define data storage resources.
const dataStack = new DataStack(app, Stacks.DATA);

// Instantiate the LambdaStack with a reference to the Spaces DynamoDB table from DataStack.
const lambdaStack = new LambdaStack(app, Stacks.LAMBDA, {
  spacesTable: dataStack.spacesTable,
});

// Instantiate the AuthStack to manage user authentication and authorization using Amazon Cognito.
const authStack = new AuthStack(app, Stacks.AUTH, {
  photosBucket: dataStack.photosBucket,
});

// Instantiate the ApiStack and integrate it with the Spaces Lambda function from LambdaStack.
new ApiStack(app, Stacks.API, {
  spacesLambdaIntegration: lambdaStack.spacesLambdaIntegration,
  userPool: authStack.userPool,
});

// Instantiate the UIStack that is responsible for deploying frontend application and distributing it with CloudFront
new UIDeploymentStack(app, Stacks.UI_DEPLOYMENT);

// Instantiate the MonitorStack which is responsible for collecting metrics and setting up CW Alarms and invoke a lambda function through AWS SNS
new MonitorStack(app, Stacks.MONITOR);
