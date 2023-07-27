/**
 * This AWS CDK stack is responsible for creating and configuring the necessary
 * components for user authentication and authorization using Amazon Cognito.
 * It includes the creation of an Amazon Cognito User Pool and a User Pool Client.
 * The User Pool allows managing user accounts, while the User Pool Client represents
 * an application or client that interacts with the User Pool for user authentication.
 *
 * The User Pool acts as a user directory where users can sign up, sign in, and manage
 * their profiles. It supports various authentication flows, such as username/password,
 * social identity providers (e.g., Google, Facebook), and federation with SAML and OIDC
 * identity providers.
 *
 * The User Pool Client, on the other hand, represents an application or client
 * (e.g., a web app, mobile app, or backend service) that wants to authenticate users
 * through the User Pool. It receives tokens from the User Pool, which can be used to
 * access AWS services and resources.
 *
 * The Cognito AuthStack extends the AWS CDK Stack class and contains methods to create
 * and configure the User Pool and User Pool Client.
 *
 * @param {Construct} scope - The construct representing the root of the AWS CDK app.
 * @param {string} id - A logical ID that uniquely identifies the stack within
 * the AWS CDK app.
 * @param {StackProps} props - Optional properties for configuring the stack, if needed.
 */

import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { CfnUserGroup } from "aws-cdk-lib/aws-elasticache";

export class AuthStack extends Stack {
  public userPool: UserPool;
  private userPoolClient: UserPoolClient;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create and configure the Amazon Cognito User Pool and User Pool Client.
    this.userPool = this.createUserPool();
    this.userPoolClient = this.createUserPoolClient();
    this.createAdminsGroup();
  }

  /**
   * Creates an Amazon Cognito User Pool to manage user accounts, authentication, and authorization.
   * The User Pool acts as a user directory, allowing users to sign up, sign in, and manage their profiles.
   * Various authentication flows are supported, such as username/password, social identity providers (e.g., Google, Facebook),
   * and federation with SAML and OIDC identity providers.
   * The User Pool will be used to authenticate users and issue tokens for accessing AWS services and resources.
   * @private
   */
  private createUserPool(): UserPool {
    const userPool = new UserPool(this, "SpaceUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
    });

    new CfnOutput(this, "SpaceUserPoolId", {
      value: userPool.userPoolId,
    });
    return userPool;
  }

  /**
   * Creates a User Pool Client, which represents an application or client that wants to authenticate users through the User Pool.
   * The User Pool Client will receive tokens from the User Pool, which can be used to access AWS services and resources.
   * @private
   */
  private createUserPoolClient(): UserPoolClient {
    const userPoolClient = this.userPool.addClient("SpaceUserPoolClient", {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    });

    new CfnOutput(this, "SpaceUserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    return userPoolClient;
  }

  /** Responsible for creating the admin group for fine-grained access control */
  private createAdminsGroup() {
    new CfnUserPoolGroup(this, "SpaceAdmins", {
      userPoolId: this.userPool.userPoolId,
      groupName: "admins",
    });
  }
}
