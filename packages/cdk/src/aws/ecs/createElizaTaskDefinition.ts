import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";

interface CharacterConfig {
    name: string;
    secrets: Record<string, ecs.Secret>;
    environment: Record<string, string>;
}

export const createElizaTaskDefinition = ({
    scope,
    taskRole,
    dockerAsset,
    characterConfig,
}: {
    scope: cdk.Stack;
    taskRole: iam.IRole;
    dockerAsset: ecr_assets.DockerImageAsset;
    characterConfig: CharacterConfig;
}) => {
    const { name, secrets, environment } = characterConfig;

    const taskDefinitionName = `${scope.stackName}-${name}-task-definition`;
    const taskDefinition = new ecs.FargateTaskDefinition(
        scope,
        taskDefinitionName,
        {
            taskRole,
            // runtimePlatform: {
            //     cpuArchitecture: ecs.CpuArchitecture.ARM64,
            // },
            cpu: 2048,
            memoryLimitMiB: 16384,
            ephemeralStorageGiB: 50,
        }
    );

    const containerName = `${scope.stackName}-${name}-container`;

    taskDefinition.addContainer(containerName, {
        containerName,
        image: ecs.ContainerImage.fromDockerImageAsset(dockerAsset),
        command: [
            "pnpm",
            "start",
            "--character",
            `/app/agent/characters/${name}.character.json`, // Use absolute path
        ],
        logging: ecs.LogDrivers.awsLogs({
            streamPrefix: containerName,
            logRetention: logs.RetentionDays.ONE_WEEK,
        }),
        portMappings: [
            {
                containerPort: 3000,
                protocol: ecs.Protocol.TCP,
            },
        ],
        // Configure health check
        healthCheck: {
            command: ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"],
            startPeriod: cdk.Duration.seconds(60),
        },
        environment,
        secrets,
    });

    return taskDefinition;
};
