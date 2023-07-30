import { HttpMethod } from "aws-cdk-lib/aws-lambda";
import { Context, SNSEvent } from "aws-lambda";

/**
 * Handles the SNS event triggered by AWS SNS when a CloudWatch alarm is triggered.
 * This function sends a text message to a Slack Webhook API with the details of the alarm.
 *
 * @param event - The event object received from AWS SNS. It contains the records of SNS messages.
 * @param context - The AWS Lambda context object.
 */
export async function handler(event: SNSEvent, context: Context) {
  /**
   * Iterate through each record in the event's Records array.
   * A record represents a message from AWS SNS.
   */
  for (const record of event.Records) {
    /**
     * Use the Fetch API to send a POST request to the Slack Webhook URL.
     * The message is sent to the Slack channel defined by the webhook.
     */
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: HttpMethod.POST,
      body: JSON.stringify({
        /**
         * Compose the message text to be sent to Slack.
         * In this case, the message will include the SNS message indicating the CloudWatch alarm event.
         * Modify the template string as per your requirement or customize the message format.
         */
        text: `Houston, we have a problem: ${record.Sns.Message}`,
      }),
    });
  }
}
