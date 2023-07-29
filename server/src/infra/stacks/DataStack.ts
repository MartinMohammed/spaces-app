/**
 * Stack responsible for creating and managing the state resources, including S3 bucket and DynamoDB table.
 * This stack will contain the S3 bucket to store user-uploaded images and the DynamoDB table for space data storage.
 */
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../../Utils";
import {
  Bucket,
  HttpMethods,
  IBucket,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import { CfnOutputs } from "../../customTypes/infra";

export class DataStack extends Stack {
  // Make the DynamoDB table accessible to outside.
  public readonly spacesTable: ITable;
  public readonly photosBucket: IBucket;

  /**
   * Constructs a new DataStack instance.
   *
   * @param {Construct} scope - The scope in which this stack is created.
   * @param {string} id - The ID of the stack.
   * @param {StackProps} props - Optional stack properties.
   */
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    /**
     * Bucket where the user uploaded images will be statically stored.
     */
    this.photosBucket = new Bucket(this, "SpaceFinderPhotos", {
      bucketName: `space-finder-photos-${suffix}`,
      // Effectively making the bucket publicly accessible.
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      // The uploading account will own the object.
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      publicReadAccess: true,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
        },
      ],
    });

    new CfnOutput(this, CfnOutputs.SPACE_FINDER_PHOTOS_BUCKET_NAME, {
      value: this.photosBucket.bucketName,
    });

    // DynamoDB Table
    this.spacesTable = new Table(this, "SpacesTable", {
      tableName: `SpaceTable-${suffix}`,
      partitionKey: {
        type: AttributeType.STRING,
        name: "id",
      },
    });
  }
}
