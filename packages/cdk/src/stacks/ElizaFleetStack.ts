import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createElizaVPC } from "../aws/vpc/createElizaVPC";
import { createElizaECRRepo } from "../aws/ecr/createElizaECRRepo";
import { createElizaCluster } from "../aws/ecs/createElizaCluster";
import { createElizaTaskRole } from "../aws/iam/createElizaTaskRole";
import { createElizaTaskDefinition } from "../aws/ecs/createElizaTaskDefinition";
import { createElizaSecurityGroup } from "../aws/ec2/createElizaSecurityGroup";
import { createElizaService } from "../aws/ecs/createElizaService";

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

        // Create core infrastructure components
        const vpc = createElizaVPC(this);
        const repository = createElizaECRRepo(this);
        const cluster = createElizaCluster(this, vpc);
        const taskRole = createElizaTaskRole(this);
        const taskDefinition = createElizaTaskDefinition(
            this,
            taskRole,
            repository
        );
        const securityGroup = createElizaSecurityGroup(this, vpc);

        // Create Fargate Service
        const service = createElizaService(
            this,
            cluster,
            taskDefinition,
            securityGroup
        );
    }
}
