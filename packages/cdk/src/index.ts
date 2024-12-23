import * as cdk from "aws-cdk-lib";
import { ElizaFleetStack } from "./stacks/ElizaFleetStack";
import { GitHubActionsStack } from "./stacks/GithubActionsStack";

// Initialize the CDK app
const app = new cdk.App();

const elizaFleetStackName = "eliza-fleet";
new ElizaFleetStack(app, elizaFleetStackName, {
    stackName: elizaFleetStackName,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});

const githubActionsStackName = "github-actions";
new GitHubActionsStack(app, githubActionsStackName, {
    stackName: githubActionsStackName,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
