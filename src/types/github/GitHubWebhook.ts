import GitHubRepository from './GitHubRepository';

export default interface GitHubWebhook {
  repo: GitHubRepository;
  payload?: {
    pull_request?: {
      number: number;
      html_url?: string;
      head?: {
        sha?: string;
      };
    };
  };
}
