import { CfnOutput, Stack, StackProps, aws_s3_deployment } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../../Utils";
import { join } from "path";
import { existsSync } from "fs";
import { BucketDeployment } from "aws-cdk-lib/aws-s3-deployment";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CfnOutputs } from "../../customTypes/infra";

/**
 * Stack for Frontend Application Deployment
 *
 * This stack contains resources for deploying the frontend application of the CDK application.
 * It leverages AWS CloudFormation to create and manage the required resources.
 * The frontend application consists of static files that are hosted and served using AWS S3 and AWS CloudFront for improved performance and scalability.
 */
export class UIDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * contains the static files for our frontend application and is responsible for serving our app.
     */

    // Only deploy resources if the dist folder with the static build files exist.

    // Create an S3 bucket to store the static files of the frontend application.
    const deploymentBucket = new Bucket(this, "uiDeploymentBucket", {
      bucketName: `space-finder-frontend-${getSuffixFromStack(this)}`,
    });

    // Specify the directory where the frontend application's build files are located.
    const uiDir = join(__dirname, "..", "..", "..", "..", "client", "dist");

    // Check if the specified directory (uiDir) exists.
    if (!existsSync(uiDir)) {
      console.warn("UI directory not found: ", uiDir);
      return;
    }

    // Deploy the frontend application's build files to the S3 bucket.
    new BucketDeployment(this, "SpacesFinderDeployment", {
      destinationBucket: deploymentBucket,
      sources: [aws_s3_deployment.Source.asset(uiDir)],
    });

    // An origin access identity is a special CloudFront user that you can associate with Amazon S3 origins,
    //  so that you can secure all or just some of your Amazon S3 content. (enable it to read from the s3 bucket)
    const originIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    // Grant read permissions for this bucket and its contents to the CloudFront origin access identity.
    deploymentBucket.grantRead(originIdentity);

    // Create a CloudFront distribution to serve the frontend application from the S3 bucket.
    const distribution = new Distribution(this, "SpacesFinderDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        // Specify the origin for the CloudFront distribution, which is the S3 bucket.
        origin: new S3Origin(deploymentBucket, {
          // Associate the CloudFront distribution with the origin access identity to enhance security.
          originAccessIdentity: originIdentity,
        }),
      },
    });

    // Create a CloudFormation output to display the URL of the CloudFront distribution.
    new CfnOutput(this, CfnOutputs.SPACE_FINDER_URL, {
      value: distribution.distributionDomainName,
    });
  }
}
