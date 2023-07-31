import { App } from "aws-cdk-lib";
import { MonitorStack } from "../../src/infra/stacks/MonitorStack";
import { Stacks } from "../../src/customTypes/infra";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";

/**
 * Automated Tests for the Monitor Stack's Constructs
 *
 * This test suite checks the properties of the constructs defined within the Monitor Stack.
 * The Monitor Stack is a part of the infrastructure and contains resources like AWS Lambda function and SNS topic.
 * These tests ensure that the expected properties of the Lambda function and SNS topic are correctly configured
 * and created within the stack.
 */

// Create a test suite named "Check the construct within the Monitor Stack"
describe("Check the construct within the Monitor Stack", () => {
  // Define a variable to store the CloudFormation template of the Monitor Stack
  let monitorStackTemplate: Template;

  // Before running any tests, set up the necessary environment
  beforeAll(() => {
    // Create a new App instance for testing with the specified output directory
    const testApp = new App({
      outdir: "cdk.out",
    });

    // Instantiate the MonitorStack using the App and the stack identifier from the Stacks enum
    const monitorStack = new MonitorStack(testApp, Stacks.MONITOR);

    // Retrieve the CloudFormation template of the Monitor Stack
    // This method allows you to inspect the generated CloudFormation template as it would be deployed to AWS without actually deploying it.
    monitorStackTemplate = Template.fromStack(monitorStack);
  });

  // Test: Lambda properties
  test("Lambda properties: ", () => {
    /**
     * Check if the Lambda Construct was created within the stack with the expected properties.
     * The Lambda function is expected to have a specific 'Handler' and 'Runtime' configuration.
     */

    monitorStackTemplate.hasResourceProperties("AWS::Lambda::Function", {
      // The properties expected for the Lambda function construct
      Handler: "index.handler", // The entry point (handler) of the Lambda function
      Runtime: "nodejs18.x", // The runtime environment for the Lambda function
    });
  });

  // Test: SNS properties
  test("SNS properties: ", () => {
    /**
     * Check if the SNS Construct was created within the stack with the expected properties.
     * The SNS topic is expected to have a specific 'DisplayName' and 'TopicName'.
     */
    monitorStackTemplate.hasResourceProperties("AWS::SNS::Topic", {
      // The properties expected for the SNS topic construct
      DisplayName: "AlarmTopic", // The display name of the SNS topic
      TopicName: "AlarmTopic", // The name of the SNS topic
    });
  });
  // Test: SNS properties
  test("SNS subscription properties - with matchers: ", () => {
    // Assert that a resource of the given type and properties exists in the CloudFormation template
    monitorStackTemplate.hasResourceProperties(
      "AWS::SNS::Subscription",

      // The keys and their values (or matchers) must match exactly with the target.
      Match.objectEquals({
        Protocol: "lambda",
        TopicArn: {
          // contains
          Ref: Match.stringLikeRegexp("AlarmTopic"),
        },
        Endpoint: {
          "Fn::GetAtt": [Match.stringLikeRegexp("WebhookLambda"), "Arn"],
        },
      })
    );
  });
  // Test: SNS properties with exact values using AWS test matchers
  test("SNS subscription properties - with exact values: ", () => {
    // Get the set of matching resources of a given type and properties in the CloudFormation template.
    const snsTopicMatches =
      monitorStackTemplate.findResources("AWS::SNS::Topic");
    const snsTopicName = Object.keys(snsTopicMatches)[0];

    const lambdaMatches = monitorStackTemplate.findResources(
      "AWS::Lambda::Function"
    );
    const lambdaName = Object.keys(lambdaMatches)[0];

    // The keys and their values (or matchers) must match exactly with the target.
    Match.objectEquals({
      Protocol: "lambda",
      TopicArn: {
        // contains
        Ref: snsTopicName,
      },
      // The subscriber of the SNS topic.
      Endpoint: {
        "Fn::GetAtt": [lambdaName, "Arn"],
      },
    });
  });

  // Test case for "Alarm Actions" using CDK test captors
  test("Alarm Actions", () => {
    // Create a new instance of the Capture class to store the captured data
    const alarmActionsCapture = new Capture();

    // Populate alarmActionsCapture with the value of the AlarmActions entry.
    // Assuming monitorStackTemplate is an object representing the CloudFormation stack template,
    // the hasResourceProperties method is likely a custom utility to check if the template has the specified resource properties.
    monitorStackTemplate.hasResourceProperties("AWS::CloudWatch::Alarm", {
      AlarmActions: alarmActionsCapture,
    });

    // Use normal Jest API to test the object.
    // The expect function is used to perform assertions.
    // It calls the asArray method on alarmActionsCapture to get the captured values as an array.
    // The toEqual matcher is used to compare the captured array to the expected array provided in the test case.
    // The expected array contains an object with a single property "Ref" whose value is expected to match the regular expression /^AlarmTopic/.
    expect(alarmActionsCapture.asArray()).toEqual([
      {
        Ref: expect.stringMatching(/^AlarmTopic/),
      },
    ]);
  });

  /**
   * The problem with snapshot testing related to CDK is
   * that there are a lot of things that are auto-generated by the CDK.
   * So the test would not be resistant to changes, that is why we are trying to
   * test more specific resources instead of the entire template.
   */

  // CDK snapshot testing for the Monitor stack template
  test("Monitor stack snapshot", () => {
    // This test ensures that the CDK-generated template matches the most recent snapshot.
    // The `toJSON` method converts the CloudFormation stack template to a JSON representation.
    // Jest will create a snapshot of the template, and subsequent runs will compare the template against this snapshot.
    expect(monitorStackTemplate.toJSON()).toMatchSnapshot();
  });

  // CDK snapshot testing for Lambdas
  test("Lambdas snapshot testing", () => {
    // Find all resources in the Monitor stack template that are of type "AWS::Lambda::Function".
    const lambdaMatches = monitorStackTemplate.findResources(
      "AWS::Lambda::Function"
    );

    // This test ensures that the list of Lambda resources found in the template matches the most recent snapshot.
    // Jest will create a snapshot of the Lambda resources, and subsequent runs will compare them against this snapshot.
    expect(lambdaMatches).toMatchSnapshot();
  });

  // CDK snapshot testing for SNS Topics
  test("SNSTopic snapshot testing", () => {
    // Find all resources in the Monitor stack template that are of type "AWS::SNS::Topic".
    const snsTopicMatches =
      monitorStackTemplate.findResources("AWS::SNS::Topic");

    // This test ensures that the list of SNS Topics found in the template matches the most recent snapshot.
    // Jest will create a snapshot of the SNS Topics, and subsequent runs will compare them against this snapshot.
    expect(snsTopicMatches).toMatchSnapshot();
  });
});
