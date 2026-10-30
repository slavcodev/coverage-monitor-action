import GitHubComment from './GiHubComment';
import StatusState from '../StatusState';

export default interface GitHubClient {
  repos: {
    createCommitStatus(payload: {
      owner: string;
      repo: string;
      sha: string;
      state: StatusState;
      description: string;
      context: string;
      target_url: string;
    }): Promise<unknown>;
  };
  issues: {
    listComments(payload: {owner: string; repo: string; issue_number: number}): Promise<{data: GitHubComment[]}>;
    createComment(payload: {owner: string; repo: string; issue_number: number; body: string}): Promise<unknown>;
    updateComment(payload: {owner: string; repo: string; comment_id: number; body: string}): Promise<unknown>;
    deleteComment(payload: {owner: string; repo: string; comment_id: number}): Promise<unknown>;
  };
}
