
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

/**
 * Creates an ECS cluster for the Eliza AI service.
 *
 * Features:
 * - Placed in the specified VPC
 * - Enables internal networking and security controls
 *
 * @param scope - The CDK Stack scope to create the cluster in
 * @param vpc - The VPC to place the cluster in
 * @returns The created ECS cluster
 */
export const createElizaCluster = (scope: cdk.Stack, vpc: ec2.IVpc) => {
    const clusterName = `${scope.stackName}-cluster`;
    return new ecs.Cluster(scope, clusterName, {
        clusterName,
        vpc,
    });
};
