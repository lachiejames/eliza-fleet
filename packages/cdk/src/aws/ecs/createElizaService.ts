import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

/**
 * Creates a Fargate service for the Eliza AI service.
 *
 * Features:
 * - Private mode: Runs in private subnets with NAT gateway egress
 * - Public mode: Runs in public subnets with direct internet access
 * - Configurable desired task count
 * - Integrated with security groups
 *
 * @param scope - The CDK Stack scope to create the service in
 * @param cluster - The ECS cluster to run the service in
 * @param taskDefinition - The task definition to run
 * @param securityGroup - The security group to attach to the service
 * @param characterName - The name of the character
 * @param desiredCount - The desired task count
 * @param isPrivate - Whether to use private networking
 * @returns The created Fargate service
 */
export const createElizaService = ({
    scope,
    cluster,
    taskDefinition,
    securityGroup,
    characterName,
    desiredCount,
    isPrivate,
}: {
    scope: cdk.Stack;
    cluster: ecs.ICluster;
    taskDefinition: ecs.FargateTaskDefinition;
    securityGroup: ec2.ISecurityGroup;
    characterName: string;
    desiredCount: number;
    isPrivate: boolean;
}) => {
    const serviceName = `${scope.stackName}-${characterName}-service`;
    const service = new ecs.FargateService(scope, serviceName, {
        serviceName,
        cluster,
        taskDefinition,
        desiredCount,
        assignPublicIp: !isPrivate,
        vpcSubnets: {
            subnetType: isPrivate
                ? ec2.SubnetType.PRIVATE_WITH_EGRESS
                : ec2.SubnetType.PUBLIC,
        },
        securityGroups: [securityGroup],
    });

    return service;
};
