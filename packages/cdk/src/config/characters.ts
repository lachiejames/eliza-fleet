import * as rds from "aws-cdk-lib/aws-rds";

export interface CharacterStackConfig {
    name: string;
    secrets: Record<string, string>;
    environment: Record<string, string>;
    desiredCount: number;
}

export const buildCharacterConfig = (
    database: rds.DatabaseInstance
): CharacterStackConfig[] => [
    {
        name: "trump",
        secrets: {
            OPENAI_API_KEY: "OPENAI_API_KEY",
            TWITTER_EMAIL: "TRUMP_TWITTER_EMAIL",
            TWITTER_USERNAME: "TRUMP_TWITTER_USERNAME",
            TWITTER_PASSWORD: "TRUMP_TWITTER_PASSWORD",
        },
        environment: {
            CACHE_STORE: "database",
            NODE_ENV: "production",
            SERVER_PORT: "3000",
            TWITTER_DRY_RUN: "false",
        },
        desiredCount: 1,
    },
    // Add more character configurations as needed
];
