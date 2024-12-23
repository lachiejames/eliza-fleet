# Eliza 🤖

For detailed documentation and examples, please visit the [original repository](https://github.com/ai16z/eliza).

## Setting Up Your Own Agents

This guide will walk you through the process of setting up your own agents by forking this repository, configuring necessary credentials, and deploying the AWS OIDC setup.

### Step 1: Fork this Repository

1. Go to the [eliza-fleet repository](https://github.com/lachiejames/eliza-fleet).
2. Click on the "Fork" button in the top-right corner to create your own copy of the repository.

### Step 2: Configure GitHub Environment and Secrets

1. Navigate to your forked repository on GitHub.
2. Go to "Settings" > "Environments" and create a new environment called `eliza-fleet`.
3. Set branch protection rules to ensure only authorized changes are made to the main branch.
4. Within the `eliza-fleet` environment, add the following secrets:
    - `AWS_ACCOUNT_ID`: Your AWS account ID.
    - `AWS_REGION`: The AWS region you are using (e.g., `us-east-1`).
    - `AWS_ROLE_NAME`: The name of the IAM role for GitHub Actions.

### Step 3: Deploy AWS OIDC Setup Locally

1. Clone your forked repository to your local machine:

    ```bash
    git clone https://github.com/YOUR_USERNAME/eliza.git
    cd eliza
    ```

2. Install Node.js using `nvm`:

    ```bash
    nvm install
    nvm use
    ```

3. Install `pnpm` globally:

    ```bash
    npm install -g pnpm
    ```

4. Install project dependencies:

    ```bash
    pnpm install
    ```

5. Deploy the CDK stack to set up the OIDC provider and IAM roles:

    ```bash
    pnpm cdk deploy GitHubActionsStack
    ```

    This will create the necessary AWS resources for GitHub Actions to authenticate using OIDC.

### Step 4: Manually Trigger the Deploy Workflow

1. Go to the "Actions" tab in your GitHub repository.
2. Select the "Deploy" workflow.
3. Click on "Run workflow" to manually trigger the deployment.

### Step 5: Verify Deployment on ECS

1. Once the workflow completes, verify that your agents are deployed on ECS.
2. Check the AWS Management Console to ensure the ECS cluster, services, and tasks are correctly set up.

### Additional Resources

- For more information on configuring OIDC with GitHub Actions, refer to the [GitHub documentation](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services).
- For AWS CDK setup, refer to the [AWS CDK documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html).

By following these steps, you can securely set up and deploy your own agents using this repository on Amazon ECS.
