import * as cdk from "aws-cdk-lib";
import { ElizaFleetStack } from "./stacks/ElizaFleetStack";
import { GitHubActionsStack } from "./stacks/GithubActionsStack";

// Initialize the CDK app
const app = new cdk.App();

new ElizaFleetStack(app, "ElizaFleetStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});

new GitHubActionsStack(app, "GitHubActionsStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
