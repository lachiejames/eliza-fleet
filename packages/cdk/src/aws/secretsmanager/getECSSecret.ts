import * as ecs from "aws-cdk-lib/aws-ecs";
import * as secretsManager from "aws-cdk-lib/aws-secretsmanager";
import * as cdk from "aws-cdk-lib";

/**
 * Creates an ECS secret reference from AWS Secrets Manager
 *
 * @param scope - The CDK Stack scope
 * @param secretKey - The environment variable name to use in the container
 * @param secretName - The name of the secret in AWS Secrets Manager
 * @returns An ECS Secret reference
 */
export const getECSSecret = (
    scope: cdk.Stack,
    secretKey: string,
    secretName: string
): ecs.Secret => {
    return ecs.Secret.fromSecretsManager(
        secretsManager.Secret.fromSecretNameV2(
            scope,
            `${secretKey}-${secretName}`, // Unique construct ID
            secretName
        )
    );
};

/**
 * Creates multiple ECS secret references from a map of secret configurations
 *
 * @param scope - The CDK Stack scope
 * @param secrets - Record of environment variable names to secret names
 * @returns Record of environment variable names to ECS Secret references
 */
export const getECSSecrets = (
    {
        scope,
        secrets,
    }: {
        scope: cdk.Stack;
        secrets: Record<string, string>;
    }
): Record<string, ecs.Secret> => {
    const ecsSecrets: Record<string, ecs.Secret> = {};

    for (const [key, secretName] of Object.entries(secrets)) {
        ecsSecrets[key] = getECSSecret(scope, key, secretName);
    }

    return ecsSecrets;
};
