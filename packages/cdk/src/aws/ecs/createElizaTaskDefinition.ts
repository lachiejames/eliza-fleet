import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import { getECSSecrets } from "../secretsmanager/getECSSecret";

interface CharacterConfig {
    name: string;
    secrets: Record<string, string>;
    environment: Record<string, string>;
}

export const createElizaTaskDefinition = (
    {
        scope,
        taskRole,
        repository,
        characterConfig,
    }: {
        scope: cdk.Stack;
        taskRole: iam.IRole;
        repository: ecr.IRepository;
        characterConfig: CharacterConfig;
    }
) => {
    const { name, secrets, environment } = characterConfig;

    const taskDefinitionName = `${scope.stackName}-${characterConfig.name}-task-definition`;
    const taskDefinition = new ecs.FargateTaskDefinition(
        scope,
        taskDefinitionName,
        {
            taskRole,
            cpu: 2048,
            memoryLimitMiB: 16384,
            ephemeralStorageGiB: 50,
        }
    );

    const containerName = `${scope.stackName}-${characterConfig.name}-container`;

    taskDefinition.addContainer(containerName, {
        containerName,
        image: ecs.ContainerImage.fromEcrRepository(
            repository,
            process.env.GIT_COMMIT_SHA
        ),
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
        healthCheck: {
            command: ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"],
            startPeriod: cdk.Duration.seconds(60),
        },
        environment,
        secrets: getECSSecrets({ scope, secrets }),
    });

    return taskDefinition;
};
