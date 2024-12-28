
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

/**
 * Creates an IAM role for Eliza Fargate tasks.
 *
 * Features:
 * - Assumed by ECS tasks
 * - Grants necessary permissions for task execution
 *
 * @param scope - The CDK Stack scope to create the role in
 * @returns The created IAM role
 */
export const createElizaTaskRole = (
    {
        scope,
    }: {
        scope: cdk.Stack;
    }
) => {
    const roleName = `${scope.stackName}-role`;
    const taskRole = new iam.Role(scope, roleName, {
        roleName,
        assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Add ECR pull permissions
    taskRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            'ecr:GetAuthorizationToken',
            'ecr:BatchCheckLayerAvailability',
            'ecr:GetDownloadUrlForLayer',
            'ecr:BatchGetImage'
        ],
        resources: ['*']
    }));

    // Add secrets manager policy
    taskRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: ['*']
    }));

    // Add execution role policy
    taskRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
    );

    return taskRole;
};