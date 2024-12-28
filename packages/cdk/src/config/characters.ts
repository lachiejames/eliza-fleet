import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
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
    imageBucket,
}: {
    scope: cdk.Stack;
    rdsInstance: rds.DatabaseInstance;
    redisInstance: elasticache.CfnCacheCluster;
    imageBucket: s3.Bucket;
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
            AWS_S3_BUCKET: imageBucket.bucketName,
            AWS_S3_UPLOAD_PATH: `trump/`,
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
