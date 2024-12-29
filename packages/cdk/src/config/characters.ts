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
            // AWS S3 Configuration Settings for File Upload
            AWS_S3_BUCKET: imageBucket.bucketName,
            AWS_S3_UPLOAD_PATH: `trump/`,

            // Cache Configs
            CACHE_STORE: "redis", // Defaults to database. Other available cache store: redis and filesystem
            REDIS_URL: `redis://${redisInstance.attrRedisEndpointAddress}:${redisInstance.attrRedisEndpointPort}`, // Redis URL - could be a local redis instance or cloud hosted redis. Also support rediss:// urls

            // Feature Flags
            IMAGE_GEN: "true", // Set to TRUE to enable image generation

            // General Configuration
            NODE_ENV: "production",

            // Server Configuration
            SERVER_PORT: "3000",

            // Twitter/X Configuration
            ACTION_INTERVAL: "300", // Interval in milliseconds between action processing runs (5 minutes)
            ENABLE_ACTION_PROCESSING: "true", // Set to true to enable the action processing loop
            TWITTER_DRY_RUN: "false",
            TWITTER_POLL_INTERVAL: "120", // How often (in seconds) the bot should check for interactions
            TWITTER_SEARCH_ENABLE: "true", // Enable timeline search, WARNING this greatly increases your chance of getting banned
        },
        secrets: {
            // OpenAI Configuration
            OPENAI_API_KEY: getECSSecret({
                scope,
                secretName: "OPENAI_API_KEY", // OpenAI API key, starting with sk-
            }),

            // Database Configuration
            POSTGRES_CREDENTIALS: getECSSecret({
                scope,
                secretName: rdsInstance.secret.secretName, // Points to the database secret created by the CDK stack
            }),

            // Twitter/X Configuration
            TWITTER_EMAIL: getECSSecret({
                scope,
                secretName: "TRUMP_TWITTER_EMAIL", // Account email
            }),
            TWITTER_USERNAME: getECSSecret({
                scope,
                secretName: "TRUMP_TWITTER_USERNAME", // Account username
            }),
            TWITTER_PASSWORD: getECSSecret({
                scope,
                secretName: "TRUMP_TWITTER_PASSWORD", // Account password
            }),
        },
    },
    // Add more character configurations as needed
];
