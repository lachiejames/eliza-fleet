import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { createElizaVPC } from "../aws/vpc/createElizaVPC";
import { createElizaCluster } from "../aws/ecs/createElizaCluster";
import { createElizaTaskRole } from "../aws/iam/createElizaTaskRole";
import { createElizaTaskDefinition } from "../aws/ecs/createElizaTaskDefinition";
import { createRDSSecurityGroup } from "../aws/ec2/createRDSSecurityGroup";
import { createRedisSecurityGroup } from "../aws/ec2/createRedisSecurityGroup";
import { createElizaService } from "../aws/ecs/createElizaService";
import { createElizaRDSInstance } from "../aws/rds/createElizaRDSInstance";
import { createElizaRedisInstance } from "../aws/elasticache/createElizaRedisInstance";
import { createECSSecurityGroup } from "../aws/ec2/createECSSecurityGroup";
import { buildCharacterConfig } from "../config/characters";
import { createElizaDockerAsset } from "../aws/ecr/createElizaDockerAsset";
import { createElizaImageBucket } from "../aws/s3/createElizaImageBucket";

export interface ElizaFleetStackProps extends cdk.StackProps {
    isPrivate: boolean;
}

/**
 * AWS CDK Stack that sets up the core infrastructure for the Eliza AI service.
 * This stack creates a containerized deployment environment using AWS ECS Fargate.
 *
 * Infrastructure components:
 * 1. VPC with configurable networking:
 *    - Private mode: 2 AZs with NAT Gateway for secure deployment
 *    - Public mode: Default VPC for cost optimization
 * 2. ECR Repository for Docker images
 * 3. ECS Cluster for container orchestration
 * 4. Fargate Task Definition and Service
 * 5. Security Groups for network access control
 * 6. S3 Bucket for storing Eliza-related images
 *
 * The stack supports two deployment modes:
 * - Private (isPrivate: true): More secure with private subnets and NAT Gateway
 * - Public (isPrivate: false): More cost-effective using public subnets
 */
export class ElizaFleetStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: ElizaFleetStackProps) {
        super(scope, id, props);

        const { isPrivate } = props;

        // Create shared infrastructure
        const vpc = createElizaVPC({ scope: this, isPrivate });
        const cluster = createElizaCluster({ scope: this, vpc });
        const taskRole = createElizaTaskRole({ scope: this });
        const rdsSecurityGroup = createRDSSecurityGroup({ scope: this, vpc });
        const redisSecurityGroup = createRedisSecurityGroup({
            scope: this,
            vpc,
        });
        const imageBucket = createElizaImageBucket({ scope: this });
        const ecsSecurityGroup = createECSSecurityGroup({ scope: this, vpc });

        rdsSecurityGroup.addIngressRule(
            isPrivate
                ? // Add inbound rule to allow PostgreSQL access from ECS
                  ec2.Peer.securityGroupId(ecsSecurityGroup.securityGroupId)
                : // Public mode allows access from any IP (useful for debugging)
                  ec2.Peer.anyIpv4(),
            ec2.Port.tcp(5432),
            "Allow PostgreSQL access from ECS"
        );

        redisSecurityGroup.addIngressRule(
            isPrivate
                ? ec2.Peer.securityGroupId(ecsSecurityGroup.securityGroupId)
                : ec2.Peer.anyIpv4(),
            ec2.Port.tcp(6379),
            "Allow Redis access from ECS"
        );

        const rdsInstance = createElizaRDSInstance({
            scope: this,
            vpc,
            securityGroup: rdsSecurityGroup,
            isPrivate,
        });

        const redisInstance = createElizaRedisInstance({
            scope: this,
            vpc,
            securityGroup: redisSecurityGroup,
            isPrivate,
        });

        const dockerAsset = createElizaDockerAsset({ scope: this });
        const characters = buildCharacterConfig({
            scope: this,
            rdsInstance,
            redisInstance,
            imageBucket,
        });

        // Create services for each character
        characters.forEach((characterConfig) => {
            const taskDefinition = createElizaTaskDefinition({
                scope: this,
                taskRole,
                dockerAsset,
                characterConfig,
            });

            createElizaService({
                scope: this,
                cluster,
                taskDefinition,
                securityGroup: ecsSecurityGroup,
                characterName: characterConfig.name,
                desiredCount: characterConfig.desiredCount,
                isPrivate,
            });
        });
    }
}
