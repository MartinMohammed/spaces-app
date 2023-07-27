// Import required modules and AWS CDK constructs
import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";

// Define the properties required for the LambdaStack
interface LambdaStackProps extends StackProps {
  spacesTable: ITable;
}

// Define the LambdaStack class which extends from Stack
export class LambdaStack extends Stack {
  // ------------------------ BEFORE LECTURE 36 ------------------------

  // // Declare a public property to make the lambda function integration accessible as a prop to ApiStack
  // public readonly helloLambdaIntegration: LambdaIntegration;
  // ------------------------ BEFORE LECTURE 36 ------------------------
  public readonly spacesLambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    // Call the base class constructor with the provided scope, id, and props
    super(scope, id, props);

    // ------------------------ BEFORE LECTURE 36 ------------------------

    // // Create a Node.js Lambda function named 'HelloLambda'
    // const helloLambda = new NodejsFunction(this, "HelloLambda", {
    //   runtime: Runtime.NODEJS_16_X,
    //   handler: "handler",

    //   // Path to the directory containing the Lambda function code
    //   // '..' moves up one level from the current directory, then moves to 'services/hello.ts'
    //   entry: path.join(
    //     __dirname,
    //     "..",
    //     "..",
    //     "services",
    //     "spaces",
    //     "handler.ts"
    //   ),

    //   // Pass the table name as an environment variable to the Lambda function
    //   // The Lambda function can access this environment variable to know about the table name
    //   environment: {
    //     TABLE_NAME: props.spacesTable.tableName,
    //   },
    // });

    // // In order to enable the Lambda function to execute ListBucketCommand
    // // Add IAM policy statements to the Lambda function's role
    // helloLambda.addToRolePolicy(
    //   new PolicyStatement({
    //     effect: Effect.ALLOW,
    //     actions: ["s3:ListAllMyBuckets", "s3:ListBucket"],
    //     resources: ["*"], // Access to every bucket -- a bad practice. Should be more restrictive.
    //   })
    // );

    // // Create a LambdaIntegration that allows API Gateway to invoke the helloLambda function
    // // The LambdaIntegration provides an integration point between API Gateway and the Lambda function
    // this.helloLambdaIntegration = new LambdaIntegration(helloLambda);
    // ------------------------ BEFORE LECTURE 36 ------------------------

    const spacesLambda = new NodejsFunction(this, "SpacesLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(
        __dirname,
        "..",
        "..",
        "services",
        "spaces",
        "handler.ts"
      ),
      environment: {
        TABLE_NAME: props.spacesTable.tableName,
      },
    });

    // Enable the lambda function to put an Item into the db.
    spacesLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,

        // Restrict access to the spaces table in dynamo db.
        resources: [props.spacesTable.tableArn],
        actions: [
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
      })
    );

    this.spacesLambdaIntegration = new LambdaIntegration(spacesLambda);
  }
}
