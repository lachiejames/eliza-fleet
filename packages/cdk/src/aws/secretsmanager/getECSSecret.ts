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
export const getECSSecret = ({
    scope,
    secretName,
}: {
    scope: cdk.Stack;
    secretName: string;
}): ecs.Secret => {
    return ecs.Secret.fromSecretsManager(
        secretsManager.Secret.fromSecretNameV2(
            scope,
            `${scope.stackName}-secret-${secretName}`, // Unique construct ID
            secretName
        )
    );
};
