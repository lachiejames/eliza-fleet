import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";

export class ElizaAIStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create VPC
        const vpc = new ec2.Vpc(this, "ElizaVPC", {
            maxAzs: 2,
            natGateways: 1, // Reduce costs by using only one NAT gateway
        });

        // Create ECR repository for our Docker images
        const repository = new ecr.Repository(this, "ElizaRepository", {
            repositoryName: "eliza-ai",
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For development; change for production
        });

        // Create ECS Cluster
        const cluster = new ecs.Cluster(this, "ElizaCluster", {
            vpc,
        });

        // Create Fargate Task Role
        const taskRole = new iam.Role(this, "ElizaTaskRole", {
            assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        });

        // Create Fargate Task Definition
        const taskDefinition = new ecs.FargateTaskDefinition(
            this,
            "ElizaTaskDef",
            {
                memoryLimitMiB: 512, // Minimum memory for cost efficiency
                cpu: 256, // 0.25 vCPU
                taskRole,
            }
        );

        // Add container to task definition
        taskDefinition.addContainer("ElizaContainer", {
            image: ecs.ContainerImage.fromEcrRepository(repository),
            memoryLimitMiB: 512,
            logging: ecs.LogDrivers.awsLogs({ streamPrefix: "eliza-ai" }),
            environment: {
                NODE_ENV: "production",
                // TODO: Replace in-memory database with PostgreSQL configuration
                DATABASE_TYPE: "memory",
            },
            portMappings: [{ containerPort: 3000 }],
        });

        // Create Fargate Service
        const service = new ecs.FargateService(this, "ElizaService", {
            cluster,
            taskDefinition,
            desiredCount: 1, // Start with one instance
            assignPublicIp: true, // Required for pulling images and other external communications
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        });

        // Add security group rules
        const securityGroup = new ec2.SecurityGroup(
            this,
            "ElizaSecurityGroup",
            {
                vpc,
                description: "Security group for Eliza AI service",
                allowAllOutbound: true,
            }
        );

        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(3000),
            "Allow inbound HTTP traffic"
        );

        service.connections.addSecurityGroup(securityGroup);

        // Output the repository URI
        new cdk.CfnOutput(this, "RepositoryUri", {
            value: repository.repositoryUri,
            description: "ECR Repository URI",
        });
    }
}

// Initialize the CDK app
const app = new cdk.App();
new ElizaAIStack(app, "ElizaAIStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
