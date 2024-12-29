import * as cdk from "aws-cdk-lib";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * Creates a Docker image asset for the Eliza AI service.
 * This asset is built and pushed to ECR during CDK deployment.
 *
 * Features:
 * - Automatic Docker image building during deployment
 * - Automatic pushing to ECR
 * - Caching of layers for faster builds
 * - Integration with CDK's asset management
 * - Uses project's .dockerignore for optimized context
 *
 * The Docker image is built from the root directory using the main Dockerfile,
 * which includes the full monorepo build process. This matches the original
 * GitHub Actions workflow but handles it all within CDK.
 *
 * @param scope - The CDK Stack scope to create the asset in
 * @returns The created Docker image asset that can be used in ECS task definitions
 */
export const createElizaDockerAsset = ({ scope }: { scope: cdk.Stack }) => {
    // Get the current file's directory path in ES modules
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);

    // Navigate to the project root
    const projectRoot = path.join(currentDir, "..", "..", "..");

    const assetName = `${scope.stackName}-docker-image`;
    return new ecr_assets.DockerImageAsset(scope, assetName, {
        platform: ecr_assets.Platform.LINUX_ARM64,
        assetName,
        directory: projectRoot,
        ignoreMode: cdk.IgnoreMode.DOCKER, // Exclude files based on .dockerignore rules
        // Optimal caching for GitHub Actions https://benlimmer.com/2024/04/08/caching-cdk-dockerimageasset-github-actions/
        outputs: ["type=docker"],
        cacheTo: { type: "gha" },
        cacheFrom: [{ type: "gha" }],
        // Not using max mode because it's causing out-of-disk-space errors in GitHub Actions
        // cacheFrom: [{ type: "gha", params: { mode: "max" } }],
    });
};
