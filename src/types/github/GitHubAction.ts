import GitHubClient from './GitHubClient';
import GitHubWebhook from './GitHubWebhook';

export default interface GitHubAction {
  context: GitHubWebhook;
  getOctokit(authToken: string, options?: unknown): {rest: GitHubClient};
}
