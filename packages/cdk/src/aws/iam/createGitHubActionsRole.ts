import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

/**
 * Creates an IAM role that GitHub Actions can assume using OIDC authentication.
 * This role grants necessary permissions for GitHub Actions to deploy and manage AWS resources.
 *
 * @see {@link https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services GitHub OIDC Documentation}
 *
 * The role is granted the following permissions:
 * - EC2: Describe, list, and manage security groups
 * - CloudFormation: Full access for stack deployments
 * - ECR: Full access for container image management
 * - ECS: Cluster, task, and service management
 * - IAM: Limited permissions for ElizaTaskRole management
 * - CloudWatch Logs: Create and manage log groups/streams
 *
 * @param scope - The CDK Stack scope to create the role in
 * @param oidcProviderArn - The ARN of the GitHub OIDC provider
 * @returns The created IAM role
 */
export const createGitHubActionsRole = (
    {
        scope,
        oidcProviderArn,
    }: {
        scope: cdk.Stack;
        oidcProviderArn: string;
    }
) => {
    const { GITHUB_REPOSITORY } = process.env;
    if (!GITHUB_REPOSITORY) {
        throw new Error("GITHUB_REPOSITORY is not set");
    }

    const roleName = `${scope.stackName}-role`;
    const role = new iam.Role(scope, roleName, {
        roleName,
        assumedBy: new iam.WebIdentityPrincipal(oidcProviderArn, {
            StringEquals: {
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            },
            StringLike: {
                "token.actions.githubusercontent.com:sub": `repo:${GITHUB_REPOSITORY}:*`,
            },
        }),
        description: "Role for GitHub Actions to access AWS resources",
    });

    // EC2 permissions for managing security groups and viewing instance information
    role.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "ec2:Describe*",
                "ec2:List*",
                "ec2:CreateSecurityGroup",
                "ec2:Authorize*",
                "ec2:Revoke*",
            ],
            resources: ["*"],
        })
    );

    // CloudFormation permissions for stack deployments
    // ECR permissions for container image management
    role.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["cloudformation:*", "ecr:*"],
            resources: ["*"],
        })
    );

    // ECS permissions for managing containers, tasks, and services
    role.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "ecs:CreateCluster",
                "ecs:DeleteCluster",
                "ecs:RegisterTaskDefinition",
                "ecs:DeregisterTaskDefinition",
                "ecs:CreateService",
                "ecs:UpdateService",
                "ecs:DeleteService",
                "ecs:List*",
                "ecs:Describe*",
                "ecs:StartTask",
                "ecs:StopTask",
            ],
            resources: ["*"],
        })
    );

    // IAM permissions specifically scoped to managing the ElizaTaskRole
    role.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:PassRole",
            ],
            resources: [`*`],
        })
    );

    // CloudWatch Logs permissions for managing application logs
    role.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
            ],
            resources: ["*"],
        })
    );

    // Add CDK-specific role permissions
    role.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["sts:AssumeRole", "ssm:GetParameter"],
            resources: [
                `arn:aws:iam::${scope.account}:role/cdk-*`,
                `arn:aws:ssm:${scope.region}:${scope.account}:parameter/cdk-bootstrap/*`,
            ],
        })
    );

    // Add Secrets Manager permissions
    role.addToPolicy(
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "secretsmanager:CreateSecret",
                "secretsmanager:DeleteSecret",
                "secretsmanager:Describe*",
                "secretsmanager:List*",
                "secretsmanager:Get*",
                "secretsmanager:Tag*",
            ],
            // Scope to secrets with the 'eliza/' prefix
            resources: [
                `arn:aws:secretsmanager:${scope.region}:${scope.account}:secret:*`,
            ],
        })
    );

    return role;
};
