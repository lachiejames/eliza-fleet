
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
export const createElizaTaskRole = (scope: cdk.Stack) => {
    const roleName = `${scope.stackName}-role`;
    return new iam.Role(scope, roleName, {
        roleName,
        assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
};
