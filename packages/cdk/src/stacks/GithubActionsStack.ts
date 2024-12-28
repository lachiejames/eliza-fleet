import * as cdk from "aws-cdk-lib";
import { createGitHubOIDCProvider } from "../aws/iam/createGitHubOIDCProvider";
import { createGitHubActionsRole } from "../aws/iam/createGitHubActionsRole";

/**
 * AWS CDK Stack that sets up GitHub Actions OIDC authentication with AWS.
 * This stack creates the necessary infrastructure for secure, keyless authentication
 * between GitHub Actions and AWS using OpenID Connect (OIDC).
 *
 * @see {@link https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services GitHub OIDC Documentation}
 *
 * The stack creates:
 * 1. An OIDC Provider that trusts GitHub's token service
 * 2. An IAM Role that can be assumed by GitHub Actions workflows
 *
 * This eliminates the need for storing long-lived AWS credentials in GitHub Secrets
 * and provides a more secure authentication method for CI/CD workflows.
 */
export class GitHubActionsStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const oidcProvider = createGitHubOIDCProvider({ scope: this });
        createGitHubActionsRole({ scope: this, oidcProviderArn: oidcProvider.openIdConnectProviderArn });
    }
}
