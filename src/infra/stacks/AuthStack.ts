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
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import {
  Effect,
  FederatedPrincipal,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";
import { CfnOutputs } from "../../customTypes/infra";

export class AuthStack extends Stack {
  public userPool: UserPool;
  private userPoolClient: UserPoolClient;
  private identityPool: CfnIdentityPool;
  private authenticatedRole: Role;
  private unAuthenticatedRole: Role;
  private adminRole: Role;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create and configure the Amazon Cognito User Pool and User Pool Client.
    this.userPool = this.createUserPool();
    this.userPoolClient = this.createUserPoolClient();
    this.identityPool = this.createIdentityPool();

    const { authenticatedRole, unAuthenticatedRole, adminRole } =
      this.createRoles();
    this.authenticatedRole = authenticatedRole;
    this.unAuthenticatedRole = unAuthenticatedRole;
    this.adminRole = adminRole;
    this.attachRoles();
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

    new CfnOutput(this, CfnOutputs.SPACE_USER_POOL_ID, {
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

    new CfnOutput(this, CfnOutputs.SPACE_USER_POOL_CLIENT_ID, {
      value: userPoolClient.userPoolClientId,
    });
    return userPoolClient;
  }
  /**
   * Responsible for creating the admin group for fine-grained access control.
   * This function creates an Amazon Cognito User Pool group and associates it with an IAM role,
   * allowing you to manage permissions for users in the group collectively.
   */
  private createAdminsGroup() {
    // Create a new Amazon Cognito User Pool group named "SpaceAdmins".
    // The group will be associated with an IAM role to define the permissions granted to its users.
    new CfnUserPoolGroup(this, "SpaceAdmins", {
      // Specify the unique identifier (ID) of the Amazon Cognito User Pool to which the group belongs.
      userPoolId: this.userPool.userPoolId,
      // Define the name of the group being created as "admins".
      groupName: "admins",
      // Establish a connection between the User Pool group and the IAM role.
      // The IAM role represents the set of permissions granted to the users within this group.
      roleArn: this.adminRole.roleArn,
    });
  }

  /**
   * Creates an Amazon Cognito Identity Pool that allows unauthenticated
   * identities and configures it to use the specified Cognito User Pool as an
   * identity provider.
   *
   * The Identity Pool acts as a bridge between your application and various
   * identity providers, enabling users to authenticate using their existing
   * credentials from the Cognito User Pool.
   * By setting `allowUnauthenticatedIdentities` to true, the Identity Pool also
   * allows unauthenticated users to access your AWS resources with limited
   * permissions.
   *
   * @private
   * @returns {CfnIdentityPool} - The newly created Amazon Cognito Identity Pool.
   */

  private createIdentityPool() {
    // Create a new Amazon Cognito Identity Pool
    const identityPool = new CfnIdentityPool(this, "SpaceIdentityPool", {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          // Specify the Cognito User Pool Client ID and Provider Name
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // Output the Identity Pool ID to the AWS CloudFormation console
    new CfnOutput(this, CfnOutputs.SPACE_IDENTITY_POOL_ID, {
      value: identityPool.ref,
    });

    // Return the created Identity Pool
    return identityPool;
  }
  /**
   * Creates the roles needed for the AWS Cognito Identity Pool.
   * @returns An object containing the created roles: authenticatedRole, unAuthenticatedRole, and adminRole.
   */
  private createRoles(): {
    authenticatedRole: Role;
    unAuthenticatedRole: Role;
    adminRole: Role;
  } {
    // Create the authenticatedRole that allows authenticated users to assume the role.
    this.authenticatedRole = new Role(this, "CognitoDefaultAuthenticatedRole", {
      // federated identity provider (i.e. 'cognito-identity.amazonaws.com' for users authenticated through Cognito)
      assumedBy: new FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    // Create the unAuthenticatedRole that allows unauthenticated users to assume the role.
    this.unAuthenticatedRole = new Role(
      this,
      "CognitoDefaultUnauthenticatedRole",
      {
        assumedBy: new FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    // Create the adminRole that allows authenticated users to assume the role.
    this.adminRole = new Role(this, "CognitoAdminRole", {
      assumedBy: new FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    this.adminRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:ListAllMyBuckets"],
        resources: ["*"],
      })
    );

    // Return the created roles as an object.
    return {
      adminRole: this.adminRole,
      unAuthenticatedRole: this.unAuthenticatedRole,
      authenticatedRole: this.authenticatedRole,
    };
  }

  /**
   * Attaches the created roles to the AWS Cognito Identity Pool.
   */
  private attachRoles() {
    // Attach the roles to the Identity Pool using a CfnIdentityPoolRoleAttachment.
    new CfnIdentityPoolRoleAttachment(this, "RolesAttachment", {
      identityPoolId: this.identityPool.ref,
      roles: {
        /**
         * This role is automatically assigned to users who have successfully authenticated with the identity provider (e.g., Cognito User Pool, Facebook, Google, etc.).
         *  Users who provide valid credentials and pass the authentication process are considered authenticated and are assigned this role.
         */
        authenticated: this.authenticatedRole.roleArn,
        unauthenticated: this.unAuthenticatedRole.roleArn,
      },
      /**
       * In simple terms, the roleMappings property in the AWS Cognito Identity Pool configuration
       *  determines how AWS Cognito will infer or decide which role to assign to a user based on the token that is passed during authentication.
       */
      roleMappings: {
        adminsMapping: {
          type: "Token",
          // If the user has multiple roles in the toke
          ambiguousRoleResolution: "AuthenticatedRole",
          identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`,
        },
      },
    });
  }
}
