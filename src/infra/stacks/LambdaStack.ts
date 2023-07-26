/** This stack will contain our lambda functions. */
import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "path";

interface LambdaStackProps extends StackProps {
  spacesTable: ITable;
}

export class LambdaStack extends Stack {
  // Export the lambda function to make it accessible as prop to ApiStack
  public readonly helloLambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const helloLambda = new LambdaFunction(this, "HelloLambda", {
      runtime: Runtime.NODEJS_16_X,
      handler: "hello.main",

      //   Path to our code
      code: Code.fromAsset(path.join(__dirname, "..", "..", "services")),

      // Know lambda knows about table name.
      environment: {
        TABLE_NAME: props.spacesTable.tableName,
      },
    });
    this.helloLambdaIntegration = new LambdaIntegration(helloLambda);
  }
}
