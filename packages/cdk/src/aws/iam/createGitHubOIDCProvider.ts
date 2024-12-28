
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

/**
 * Creates an OpenID Connect (OIDC) Identity Provider for GitHub Actions in AWS.
 * This allows GitHub Actions workflows to authenticate with AWS without storing long-lived credentials.
 *
 * @see {@link https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services GitHub OIDC Documentation}
 *
 * The OIDC provider is configured with:
 * - URL: token.actions.githubusercontent.com (GitHub's OIDC provider URL)
 * - Client ID: sts.amazonaws.com (AWS's security token service)
 *
 * @param scope - The CDK Stack scope to create the provider in
 * @returns The created OIDC provider instance
 */
export const createGitHubOIDCProvider = (
    {
        scope,
    }: {
        scope: cdk.Stack;
    }
) => {
    const providerName = `${scope.stackName}-provider`;
    return new iam.OpenIdConnectProvider(scope, providerName, {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
    });
};
