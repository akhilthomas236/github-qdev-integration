# Amazon Q Code Review Action

A GitHub Action that integrates with Amazon Q Developer to provide automated code reviews and improvement suggestions for pull requests.

## Features

- 🔍 Automated code reviews using Amazon Q Developer
- 💡 Code improvement suggestions
- 🤖 Responds to PR comments with commands:
  - `/review` - Performs a code review
  - `/improve` - Suggests code improvements
- ✅ Adds reactions to acknowledge commands.
- 🔐 Secure AWS authentication integration

## Setup

### Prerequisites

1. AWS Account with Amazon Q Developer access
2. GitHub repository with pull requests enabled
3. AWS IAM Role with appropriate permissions

### AWS Configuration

1. Create an IAM Role with the following permissions:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "bedrock:InvokeModel"
               ],
               "Resource": "*"
           }
       ]
   }
   ```

2. Configure OIDC authentication between GitHub and AWS:
   - Set up GitHub OIDC provider in AWS
   - Create an IAM Role that trusts the GitHub OIDC provider
   - Note the Role ARN for configuration

### Workflow Configuration

1. Add the following secrets to your GitHub repository:
   - `AWS_ROLE_ARN`: The ARN of the IAM role created above
   - (Optional) `AWS_REGION`: The AWS region where Amazon Q is configured (defaults to us-east-1)

2. Create a workflow file (`.github/workflows/q-review.yml`):
   ```yaml
   name: Amazon Q Code Review

   on:
     issue_comment:
       types: [created]

   env:
     AWS_REGION: 'us-east-1'
     AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}

   jobs:
     process-comment:
       runs-on: ubuntu-latest
       if: ${{ github.event.issue.pull_request && (contains(github.event.comment.body, '/review') || contains(github.event.comment.body, '/improve')) }}
       
       permissions:
         pull-requests: write
         contents: read
         issues: write
         id-token: write

       steps:
         - uses: actions/checkout@v4
         - uses: aws-actions/configure-aws-credentials@v4
           with:
             role-to-assume: ${{ env.AWS_ROLE_ARN }}
             aws-region: ${{ env.AWS_REGION }}
         - uses: ./
           with:
             github-token: ${{ secrets.GITHUB_TOKEN }}
   ```

## Usage

Once installed and configured, the action responds to the following commands in pull request comments:

### Code Review
To request a code review, comment on a pull request:
\`\`\`
/review
\`\`\`

The action will:
1. Add a 👍 reaction to acknowledge the command
2. Analyze the pull request changes using Amazon Q
3. Post a detailed review comment

### Code Improvements
To request code improvement suggestions, comment:
\`\`\`
/improve
\`\`\`

The action will:
1. Add a 👍 reaction to acknowledge the command
2. Analyze the changed files using Amazon Q
3. Post suggestions for improvements

## Development

### Local Setup

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd amazon-q-review-action
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Build the action:
   \`\`\`bash
   npm run build
   \`\`\`

### Testing

Run tests:
\`\`\`bash
npm test
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Notes

- Amazon Q Developer integration is currently in development. The action includes mock implementations that will be updated when the service is generally available.
- Make sure to handle the GitHub token and AWS credentials securely.
- The action requires appropriate permissions to comment on pull requests and access AWS services.

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify AWS role ARN is correctly configured
   - Check OIDC setup between GitHub and AWS
   - Ensure proper permissions are set in the workflow

2. **Command Not Responding**
   - Verify the workflow file is properly configured
   - Check if the comment is on a pull request (not an issue)
   - Review GitHub Actions logs for errors

3. **Amazon Q Integration Issues**
   - Ensure AWS region is properly configured
   - Verify Amazon Q Developer access is enabled
   - Check AWS credentials and permissions

For more issues, please check the GitHub Issues section of the repository.
