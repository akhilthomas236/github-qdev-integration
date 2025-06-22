import * as core from '@actions/core'
import * as github from '@actions/github'
import { BedrockClient } from '@aws-sdk/client-bedrock'

interface PullRequestContext {
  owner: string
  repo: string
  pullNumber: number
  commentId: number
  command: 'review' | 'improve'
}

class AmazonQDeveloper {
  private bedrock: BedrockClient
  private octokit: ReturnType<typeof github.getOctokit>

  constructor(token: string) {
    this.bedrock = new BedrockClient({
      region: process.env.AWS_REGION || 'us-east-1'
    })
    this.octokit = github.getOctokit(token)
  }

  async addReaction(context: PullRequestContext): Promise<void> {
    await this.octokit.rest.reactions.createForIssueComment({
      owner: context.owner,
      repo: context.repo,
      comment_id: context.commentId,
      content: '+1'
    })
  }

  async getPullRequestDiff(context: PullRequestContext): Promise<string> {
    const { data } = await this.octokit.rest.pulls.get({
      owner: context.owner,
      repo: context.repo,
      pull_number: context.pullNumber,
      mediaType: {
        format: 'diff'
      }
    })
    return data
  }

  async getChangedFiles(context: PullRequestContext) {
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner: context.owner,
      repo: context.repo,
      pull_number: context.pullNumber
    })
    return data
  }

  async reviewCode(context: PullRequestContext): Promise<string> {
    try {
      const diff = await this.getPullRequestDiff(context)
      
      // This is a mock implementation. Replace with actual Amazon Q API calls
      // const response = await this.bedrock.invokeModel({
      //   modelId: 'amazon.q-developer',
      //   body: JSON.stringify({
      //     type: 'code-review',
      //     content: diff
      //   })
      // })

      return "🤖 Code Review Analysis (Mock):\n\n" +
             "* The code looks generally well-structured\n" +
             "* Consider adding more unit tests\n" +
             "* Documentation could be improved"
    } catch (error) {
      core.error('Error during code review:')
      core.error(error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  async suggestImprovements(context: PullRequestContext): Promise<string> {
    try {
      const files = await this.getChangedFiles(context)
      
      // This is a mock implementation. Replace with actual Amazon Q API calls
      // const response = await this.bedrock.invokeModel({
      //   modelId: 'amazon.q-developer',
      //   body: JSON.stringify({
      //     type: 'code-improvement',
      //     files: files
      //   })
      // })

      return "🤖 Code Improvement Suggestions (Mock):\n\n" +
             "* Suggested improvements will appear here\n" +
             "* Code examples and fixes will be provided"
    } catch (error) {
      core.error('Error during improvement suggestion:')
      core.error(error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  async postComment(context: PullRequestContext, body: string): Promise<void> {
    await this.octokit.rest.issues.createComment({
      owner: context.owner,
      repo: context.repo,
      issue_number: context.pullNumber,
      body
    })
  }
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true })
    const context = github.context

    // Only process pull request comments
    if (!context.payload.issue?.pull_request) {
      core.info('This action only works on pull request comments')
      return
    }

    const commentBody = context.payload.comment?.body || ''
    let command: 'review' | 'improve' | null = null

    if (commentBody.includes('/review')) {
      command = 'review'
    } else if (commentBody.includes('/improve')) {
      command = 'improve'
    }

    if (!command) {
      core.info('No valid command found in comment')
      return
    }

    const prContext: PullRequestContext = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      pullNumber: context.issue.number,
      commentId: context.payload.comment.id,
      command
    }

    const amazonQ = new AmazonQDeveloper(token)
    
    // Add initial reaction
    await amazonQ.addReaction(prContext)

    // Process command
    let response: string
    if (command === 'review') {
      response = await amazonQ.reviewCode(prContext)
    } else {
      response = await amazonQ.suggestImprovements(prContext)
    }

    // Post response
    await amazonQ.postComment(prContext, response)

  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

run()
