// Import necessary constructs and classes from AWS CDK library.
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Alarm, Metric, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import path from "path";

// Define a custom stack named "MonitorStack" that extends the Stack class from AWS CDK.
export class MonitorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    // Call the constructor of the base class (Stack) with the provided scope, id, and props.
    super(scope, id, props);

    // Invoked by SNS when CloudWatch Alarm is triggered and sends the alarm message to Slack Webhook
    const webhookLambda = new NodejsFunction(this, "WebhookLambda", {
      runtime: Runtime.NODEJS_18_X,
      environment: {
        SLACK_WEBHOOK_URL:
          "https://hooks.slack.com/services/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",
      },
      handler: "handler",
      entry: path.join(
        __dirname,
        "..",
        "..",
        "services",
        "monitor",
        "handler.ts"
      ),
    });

    // Create SNS topic - where events are published to and subscribed from.
    const alarmTopic = new Topic(this, "AlarmTopic", {
      displayName: "AlarmTopic",
      topicName: "AlarmTopic", // The name of the SNS topic instead of auto-generated physical id.
    });

    // Subscribe the Lambda function (webhookLambda) to the SNS topic (alarmTopic)
    alarmTopic.addSubscription(new LambdaSubscription(webhookLambda));

    // Create a CloudWatch alarm to monitor 4XX errors in the AWS API Gateway.

    // Specify the configuration for the alarm by creating a new instance of the Alarm class.
    const spacesApi4xxAlarm = new Alarm(this, "spacesAPI4xxAlarm", {
      // The metric for the alarm is a custom metric representing the count of 4XX errors.
      metric: new Metric({
        metricName: "4XXError", // The name of the metric to monitor.
        namespace: "AWS/ApiGateway", // The namespace where the metric resides (API Gateway in this case).
        period: Duration.minutes(1), // The time period for the metric data (1 minute).
        statistic: "Sum", // The statistical method to apply to the data (Sum).
        unit: Unit.COUNT, // The unit of the metric (Count).
        dimensionsMap: {
          ApiName: "SpacesApi", // The dimension representing the specific API (named "SpacesApi").
        },
      }),
      evaluationPeriods: 1, // The number of periods over which the alarm condition should be evaluated (1).
      threshold: 5, // The threshold value that triggers the alarm when exceeded (5).
      alarmName: "spacesAPI4xxAlarm", // The name (physical id) of the alarm.
    });

    // Create SNS action for the alarm to send messages to the topic.
    const topicAction = new SnsAction(alarmTopic);

    // Trigger the SNS action if the alarm fires.
    spacesApi4xxAlarm.addAlarmAction(topicAction);

    // Trigger the SNS action if the alarm returns from the breaching state into the OK state.
    spacesApi4xxAlarm.addOkAction(topicAction);
  }
}
