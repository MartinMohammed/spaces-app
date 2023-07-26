/** This stack will contain our state (s3 and databases) */
import { Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../../Utils";

export class DataStack extends Stack {
  // Make the DynamoDB table accessible to outside.
  public readonly spacesTable: ITable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

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
