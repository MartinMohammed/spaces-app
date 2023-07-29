/** This stack will our ApiGateway (rest api) */
import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  MethodOptions,
  ResourceOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { HttpMethod } from "aws-cdk-lib/aws-lambda";

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

    const methodOptionsWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.authorizerId,
      },
    };

    const resourceOptionsWithCors: ResourceOptions = {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    };

    // Add a api ressource (path) by hand.
    const spacesResource = api.root.addResource(
      "spaces",
      resourceOptionsWithCors
    );

    // One lambda for exact one resource.
    spacesResource.addMethod(
      HttpMethod.GET,
      props.spacesLambdaIntegration,
      methodOptionsWithAuth
    );
    spacesResource.addMethod(
      HttpMethod.POST,
      props.spacesLambdaIntegration,
      methodOptionsWithAuth
    );
    spacesResource.addMethod(
      HttpMethod.DELETE,
      props.spacesLambdaIntegration,
      methodOptionsWithAuth
    );
    spacesResource.addMethod(
      HttpMethod.PUT,
      props.spacesLambdaIntegration,
      methodOptionsWithAuth
    );
  }
}
