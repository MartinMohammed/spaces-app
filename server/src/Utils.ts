import { Fn, Stack } from "aws-cdk-lib";

/**
 *  Receives a stack, in which the last part of the stackId is extracted as suffix
 *  Example StackId: arn:aws:cloudformation:eu-central-1:591362524514:stack/ApiStack/d60e79b0-2bb2-11ee-9558-0aec439e3386
 *  And we extract the last part of a stack id: 0aec439e3386
 * */
export function getSuffixFromStack(stack: Stack): string {
  const shortStackid = Fn.select(2, Fn.split("/", stack.stackId));
  const suffix = Fn.select(4, Fn.split("-", shortStackid));
  return suffix;
}
