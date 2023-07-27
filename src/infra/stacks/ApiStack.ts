/** This stack will our ApiGateway (rest api) */
import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface ApiStackProps extends StackProps {
  spacesLambdaIntegration: LambdaIntegration;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, "SpacesApi");

    // Add a api ressource (path) by hand.
    const spacesResource = api.root.addResource("spaces");

    // One lambda for exact one resource.
    spacesResource.addMethod("GET", props.spacesLambdaIntegration);
    spacesResource.addMethod("POST", props.spacesLambdaIntegration);
    spacesResource.addMethod("DELETE", props.spacesLambdaIntegration);
    spacesResource.addMethod("PUT", props.spacesLambdaIntegration);
  }
}
