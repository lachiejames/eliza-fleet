import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { createElizaVPC } from "../aws/vpc/createElizaVPC";
import { createElizaECRRepo } from "../aws/ecr/createElizaECRRepo";
import { createElizaCluster } from "../aws/ecs/createElizaCluster";
import { createElizaTaskRole } from "../aws/iam/createElizaTaskRole";
import { createElizaTaskDefinition } from "../aws/ecs/createElizaTaskDefinition";
import { createRDSSecurityGroup } from "../aws/ec2/createRDSSecurityGroup";
import { createElizaService } from "../aws/ecs/createElizaService";
import { createElizaRDSInstance } from "../aws/rds/createElizaRDSInstance";
import { createECSSecurityGroup } from "../aws/ec2/createECSSecurityGroup";
import { buildCharacterConfig } from "../config/characters";

/**
 * AWS CDK Stack that sets up the core infrastructure for the Eliza AI service.
 * This stack creates a containerized deployment environment using AWS ECS Fargate.
 *
 * Infrastructure components:
 * 1. VPC with 2 Availability Zones and 1 NAT Gateway
 * 2. ECR Repository for Docker images
 * 3. ECS Cluster for container orchestration
 * 4. Fargate Task Definition and Service
 * 5. Security Groups for network access control
 *
 * The stack is designed for cost-efficiency in development while maintaining
 * high availability through multi-AZ deployment.
 */
export class ElizaFleetStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create shared infrastructure
        const vpc = createElizaVPC({ scope: this });
        const repository = createElizaECRRepo({ scope: this });
        const cluster = createElizaCluster({ scope: this, vpc });
        const taskRole = createElizaTaskRole({ scope: this });
        const rdsSecurityGroup = createRDSSecurityGroup({ scope: this, vpc });
        const ecsSecurityGroup = createECSSecurityGroup({ scope: this, vpc });

        // Add inbound rule to allow PostgreSQL access from ECS
        rdsSecurityGroup.addIngressRule(
            ec2.Peer.securityGroupId(ecsSecurityGroup.securityGroupId),
            ec2.Port.tcp(5432),
            "Allow PostgreSQL access from ECS"
        );

        const rdsInstance = createElizaRDSInstance({
            scope: this,
            vpc,
            securityGroup: rdsSecurityGroup,
        });

        const characters = buildCharacterConfig(rdsInstance);
        // Create services for each character
        characters.forEach((characterConfig) => {
            const taskDefinition = createElizaTaskDefinition({
                scope: this,
                taskRole,
                repository,
                characterConfig,
            });

            // createElizaService({
            //     scope: this,
            //     cluster,
            //     taskDefinition,
            //     securityGroup: ecsSecurityGroup,
            //     characterName: characterConfig.name,
            //     desiredCount: characterConfig.desiredCount,
            // });
        });
    }
}
