import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export class GitHubActionsStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Define the OIDC provider
        const oidcProvider = new iam.OpenIdConnectProvider(
            this,
            "GitHubOIDCProvider",
            {
                url: "https://token.actions.githubusercontent.com",
                clientIds: ["sts.amazonaws.com"],
            }
        );

        // Define the IAM role
        const githubActionsRole = new iam.Role(this, "GitHubActionsRole", {
            assumedBy: new iam.WebIdentityPrincipal(
                oidcProvider.openIdConnectProviderArn,
                {
                    StringEquals: {
                        "token.actions.githubusercontent.com:aud":
                            "sts.amazonaws.com",
                    },
                }
            ),
            description: "Role for GitHub Actions to access AWS resources",
        });

        // Attach necessary policies
        githubActionsRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ["ecr:GetAuthorizationToken"],
                resources: ["*"],
            })
        );
    }
}
