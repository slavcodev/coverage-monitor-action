import GitHubComment from './GiHubComment';

export default interface GitHubClient {
  repos: {
    createCommitStatus(payload: {}): Promise<void>;
  };
  issues: {
    listComments(payload: {}): Promise<{data: GitHubComment[]}>;
    createComment(payload: {}): Promise<void>;
    updateComment(payload: {}): Promise<void>;
    deleteComment(payload: {}): Promise<void>;
  };
}
