export default interface GitHubWebhook {
  repo?: Record<string, unknown>;
  payload?: {
    pull_request: {
      number: number;
      html_url: string;
      head: {
        sha: string;
      };
    };
  };
}
