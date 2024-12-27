import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

/**
 * Creates a VPC for the Eliza AI service with high availability and cost optimization.
 *
 * Features:
 * - 2 Availability Zones for high availability
 * - Single NAT Gateway for cost optimization
 *
 * @param scope - The CDK Stack scope to create the VPC in
 * @returns The created VPC instance
 */
export const createElizaVPC = (
    {
        scope,
    }: {
        scope: cdk.Stack;
    }
) => {
    const vpcName = `${scope.stackName}-vpc`;
    return new ec2.Vpc(scope, vpcName, {
        vpcName,
        maxAzs: 2,
        natGateways: 1, // Cost optimization: Using single NAT gateway instead of one per AZ
    });
};
