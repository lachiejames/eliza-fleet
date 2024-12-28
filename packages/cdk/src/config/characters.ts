import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import { getECSSecret } from "../aws/secretsmanager/getECSSecret";

export interface CharacterStackConfig {
    name: string;
    secrets: Record<string, ecs.Secret>;
    environment: Record<string, string>;
    desiredCount: number;
}

export const buildCharacterConfig = ({
    scope,
    rdsInstance,
    redisInstance,
}: {
    scope: cdk.Stack;
    rdsInstance: rds.DatabaseInstance;
    redisInstance: elasticache.CfnCacheCluster;
}): CharacterStackConfig[] => [
    {
        name: "trump",
        desiredCount: 1,
        environment: {
            CACHE_STORE: "redis",
            NODE_ENV: "production",
            SERVER_PORT: "3000",
            TWITTER_DRY_RUN: "false",
            REDIS_URL: `redis://${redisInstance.attrRedisEndpointAddress}:${redisInstance.attrRedisEndpointPort}`,
        },
        secrets: {
            OPENAI_API_KEY: getECSSecret({
                scope,
                secretName: "OPENAI_API_KEY",
            }),
            TWITTER_EMAIL: getECSSecret({
                scope,
                secretName: "TRUMP_TWITTER_EMAIL",
            }),
            TWITTER_USERNAME: getECSSecret({
                scope,
                secretName: "TRUMP_TWITTER_USERNAME",
            }),
            TWITTER_PASSWORD: getECSSecret({
                scope,
                secretName: "TRUMP_TWITTER_PASSWORD",
            }),
            POSTGRES_CREDENTIALS: getECSSecret({
                scope,
                // Points to the database secret created by the CDK stack
                secretName: rdsInstance.secret.secretName,
            }),
        },
    },
    // Add more character configurations as needed
];
