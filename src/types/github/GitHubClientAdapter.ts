import CommentMode from '../CommentMode';
import GitHubClient from './GitHubClient';
import GitHubComment from './GiHubComment';
import GitHubPullRequest from './GitHubPullRequest';
import GitHubWebhook from './GitHubWebhook';
import Report from '../Report';

export default class GitHubClientAdapter {
  readonly #client: GitHubClient;
  readonly #context: GitHubWebhook;
  readonly #pr: GitHubPullRequest | undefined;

  constructor(client: GitHubClient, context: GitHubWebhook, pr: GitHubPullRequest | undefined) {
    this.#client = client;
    this.#context = context;
    this.#pr = pr;
  }

  async createStatus(context: string, report: Report): Promise<void> {
    if (!this.#pr) {
      return;
    }

    await this.#client.repos.createCommitStatus({
      ...this.#context.repo,
      sha: this.#pr.sha,
      ...report.toStatus(context, this.#pr.url),
    });
  }

  async commentReport(mode: CommentMode, context: string, report: Report): Promise<void> {
    if (!this.#pr) {
      return;
    }

    const comment = report.toComment(context);

    switch (mode) {
      case CommentMode.Insert:
        return this.#insertComment({
          prNumber: this.#pr.number,
          body: comment.generateTable(),
        });
      case CommentMode.Update:
        return this.#upsertComment({
          prNumber: this.#pr.number,
          body: comment.generateTable(),
          commentHeader: comment.generateCommentHeader(),
        });
      case CommentMode.Replace:
      default:
        return this.#replaceComment({
          prNumber: this.#pr.number,
          body: comment.generateTable(),
          commentHeader: comment.generateCommentHeader(),
        });
    }
  }

  async #listComments({prNumber, commentHeader}: {prNumber: number; commentHeader: string}): Promise<GitHubComment[]> {
    const {data: existingComments} = await this.#client.issues.listComments({
      ...this.#context.repo,
      issue_number: prNumber,
    });

    return existingComments.filter(({body}) => body.startsWith(commentHeader));
  }

  async #insertComment({prNumber, body}: {prNumber: number; body: string}): Promise<void> {
    await this.#client.issues.createComment({...this.#context.repo, issue_number: prNumber, body});
  }

  async #updateComment({body, commentId}: {body: string; commentId: string}): Promise<void> {
    await this.#client.issues.updateComment({...this.#context.repo, comment_id: commentId, body});
  }

  async #deleteComments({comments}: {comments: {id: string}[]}): Promise<void> {
    await Promise.all(
      comments.map(async ({id}) => this.#client.issues.deleteComment({...this.#context.repo, comment_id: id})),
    );
  }

  async #upsertComment({
    prNumber,
    body,
    commentHeader,
  }: {
    prNumber: number;
    body: string;
    commentHeader: string;
  }): Promise<void> {
    const existingComments = await this.#listComments({prNumber, commentHeader});
    const last = existingComments.pop();

    await Promise.all([
      this.#deleteComments({comments: existingComments}),
      last ? this.#updateComment({body, commentId: last.id}) : this.#insertComment({prNumber, body}),
    ]);
  }

  async #replaceComment({
    prNumber,
    body,
    commentHeader,
  }: {
    prNumber: number;
    body: string;
    commentHeader: string;
  }): Promise<void> {
    const existingComments = await this.#listComments({prNumber, commentHeader});

    await Promise.all([this.#deleteComments({comments: existingComments}), this.#insertComment({prNumber, body})]);
  }
}
