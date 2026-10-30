import GitHubComment from './GiHubComment';

export default interface GitHubClient {
  repos: {
    createCommitStatus(payload: object): Promise<void>;
  };
  issues: {
    listComments(payload: object): Promise<{data: GitHubComment[]}>;
    createComment(payload: object): Promise<void>;
    updateComment(payload: object): Promise<void>;
    deleteComment(payload: object): Promise<void>;
  };
}
