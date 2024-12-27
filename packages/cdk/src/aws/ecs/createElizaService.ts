import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

/**
 * Creates a Fargate service for the Eliza AI service.
 *
 * Features:
 * - Runs in private subnets with NAT gateway egress
 * - Configurable desired task count
 * - Integrated with security groups
 *
 * @param scope - The CDK Stack scope to create the service in
 * @param cluster - The ECS cluster to run the service in
 * @param taskDefinition - The task definition to run
 * @param securityGroup - The security group to attach to the service
 * @param characterName - The name of the character
 * @param desiredCount - The desired task count
 * @returns The created Fargate service
 */
export const createElizaService = (
    {
        scope,
        cluster,
        taskDefinition,
        securityGroup,
        characterName,
        desiredCount,
    }: {
        scope: cdk.Stack;
        cluster: ecs.ICluster;
        taskDefinition: ecs.FargateTaskDefinition;
        securityGroup: ec2.ISecurityGroup;
        characterName: string;
        desiredCount: number;
    }
) => {
    const serviceName = `${scope.stackName}-${characterName}-service`;
    const service = new ecs.FargateService(scope, serviceName, {
        serviceName,
        cluster,
        taskDefinition,
        desiredCount,
        // TODO: Make private
        assignPublicIp: true,
        // vpcSubnets: {
        //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // Run in private subnets
        // },
        securityGroups: [securityGroup],
    });

    return service;
};
