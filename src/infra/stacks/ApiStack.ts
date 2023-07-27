/** This stack will our ApiGateway (rest api) */
import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { IUserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

interface ApiStackProps extends StackProps {
  spacesLambdaIntegration: LambdaIntegration;
  userPool: IUserPool;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, "SpacesApi");

    /**
     * Creates a Cognito User Pools Authorizer for API Gateway to handle authentication using Amazon Cognito User Pools.
     *
     * @param {Construct} scope - The construct representing the AWS CDK app.
     * @param {string} id - A logical ID that uniquely identifies the authorizer within the AWS CDK app.
     * @param {CognitoUserPoolsAuthorizerProps} props - Properties to configure the Cognito User Pools Authorizer.
     * @returns {CognitoUserPoolsAuthorizer} - An instance of the CognitoUserPoolsAuthorizer class representing the API Gateway authorizer.
     */
    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "SpacesApiAuthorizer",
      {
        cognitoUserPools: [props.userPool],

        // Specifies the source of the JWT token in the API Gateway request header.
        identitySource: "method.request.header.Authorization",
      }
    );

    // Attach the Cognito User Pools Authorizer to the API Gateway.
    authorizer._attachToApi(api);

    const optionsWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.authorizerId,
      },
    };

    // Add a api ressource (path) by hand.
    const spacesResource = api.root.addResource("spaces");

    // One lambda for exact one resource.
    spacesResource.addMethod(
      "GET",
      props.spacesLambdaIntegration,
      optionsWithAuth
    );
    spacesResource.addMethod(
      "POST",
      props.spacesLambdaIntegration,
      optionsWithAuth
    );
    spacesResource.addMethod(
      "DELETE",
      props.spacesLambdaIntegration,
      optionsWithAuth
    );
    spacesResource.addMethod(
      "PUT",
      props.spacesLambdaIntegration,
      optionsWithAuth
    );
  }
}
