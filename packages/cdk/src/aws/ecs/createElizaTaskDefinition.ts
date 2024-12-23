import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsManager from "aws-cdk-lib/aws-secretsmanager";
import * as cdk from "aws-cdk-lib";

/**
 * Helper function to create a secret reference for ECS
 * @param scope The CDK Stack scope
 * @param secretName The name of the secret in Secrets Manager
 * @returns An ECS Secret reference
 */
const createSecretReference = (
    scope: cdk.Stack,
    secretName: string
): ecs.Secret => {
    return ecs.Secret.fromSecretsManager(
        secretsManager.Secret.fromSecretNameV2(scope, secretName, secretName)
    );
};

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
        secrets: {
            OPENAI_API_KEY: createSecretReference(scope, "OPENAI_API_KEY"),
            TWITTER_EMAIL: createSecretReference(scope, "TWITTER_EMAIL"),
            TWITTER_USERNAME: createSecretReference(scope, "TWITTER_USERNAME"),
            TWITTER_PASSWORD: createSecretReference(scope, "TWITTER_PASSWORD"),
        },
    });

    return taskDefinition;
};
