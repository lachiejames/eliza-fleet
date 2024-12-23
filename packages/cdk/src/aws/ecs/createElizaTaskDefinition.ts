
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

/**
 * Creates a Fargate task definition for the Eliza AI service.
 *
 * Features:
 * - Minimum viable memory allocation (512 MiB)
 * - 0.25 vCPU for development workloads
 * - CloudWatch logs integration
 * - Environment configuration
 *
 * @param scope - The CDK Stack scope to create the task definition in
 * @param taskRole - The IAM role for the task
 * @param repository - The ECR repository containing the Docker image
 * @returns The created Fargate task definition
 */
export const createElizaTaskDefinition = (
    scope: cdk.Stack,
    taskRole: iam.IRole,
    repository: ecr.IRepository
) => {
    const taskDefinitionName = `${scope.stackName}-task-def`;
    const taskDefinition = new ecs.FargateTaskDefinition(
        scope,
        taskDefinitionName,
        {
            memoryLimitMiB: 512, // Minimum viable memory allocation
            cpu: 256, // 0.25 vCPU - suitable for development workloads
            taskRole,
        }
    );

    // Add container to task definition
    taskDefinition.addContainer("ElizaContainer", {
        image: ecs.ContainerImage.fromEcrRepository(
            repository,
            process.env.GIT_COMMIT_SHA
        ),
        memoryLimitMiB: 512,
        logging: ecs.LogDrivers.awsLogs({ streamPrefix: "eliza-ai" }), // CloudWatch logs integration
        environment: {
            NODE_ENV: "production",
            // TODO: Replace in-memory database with PostgreSQL configuration
            DATABASE_TYPE: "memory",
        },
    });

    return taskDefinition;
};
