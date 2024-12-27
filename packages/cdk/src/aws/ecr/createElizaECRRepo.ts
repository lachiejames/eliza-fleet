
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as cdk from "aws-cdk-lib";

/**
 * Creates an ECR repository for storing Eliza AI service Docker images.
 *
 * Features:
 * - Repository name: eliza-ai
 * - Development mode: DESTROY removal policy
 * - Note: Should be changed to RETAIN in production
 *
 * @param scope - The CDK Stack scope to create the repository in
 * @returns The created ECR repository
 */
export const createElizaECRRepo = (
    {
        scope,
    }: {
        scope: cdk.Stack;
    }
) => {
    const repositoryName = `${scope.stackName}-repo`;
    return new ecr.Repository(scope, repositoryName, {
        repositoryName,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // Development setting
    });
};
