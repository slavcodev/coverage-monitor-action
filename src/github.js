const createStatus = async ({
  client,
  context,
  sha,
  status,
}) => client.repos.createCommitStatus({
  ...context.repo,
  sha,
  ...status,
});

const listComments = async ({
  client,
  context,
  prNumber,
  commentHeader,
}) => {
  const { data: existingComments } = await client.issues.listComments({
    ...context.repo,
    issue_number: prNumber,
  });

  return existingComments.filter(({ body }) => body.startsWith(commentHeader));
};

const insertComment = async ({
  client,
  context,
  prNumber,
  body,
}) => client.issues.createComment({
  ...context.repo,
  issue_number: prNumber,
  body,
});

const updateComment = async ({
  client,
  context,
  body,
  commentId,
}) => client.issues.updateComment({
  ...context.repo,
  comment_id: commentId,
  body,
});

const deleteComments = async ({
  client,
  context,
  comments,
}) => Promise.all(
  comments.map(({ id }) => client.issues.deleteComment({
    ...context.repo,
    comment_id: id,
  })),
);

const upsertComment = async ({
  client,
  context,
  prNumber,
  body,
  existingComments,
}) => {
  const last = existingComments.pop();

  await deleteComments({
    client,
    context,
    comments: existingComments,
  });

  return last
    ? updateComment({
      client,
      context,
      body,
      commentId: last.id,
    })
    : insertComment({
      client,
      context,
      prNumber,
      body,
    });
};

const replaceComment = async ({
  client,
  context,
  prNumber,
  body,
  existingComments,
}) => {
  await deleteComments({
    client,
    context,
    comments: existingComments,
  });

  return insertComment({
    client,
    context,
    prNumber,
    body,
  });
};

function parseWebhook(request) {
  const {
    payload: {
      pull_request: {
        number: prNumber,
        html_url: prUrl,
        head: { sha } = {},
      } = {},
    } = {},
  } = request || {};

  if (!prNumber || !prUrl || !sha) {
    throw new Error('Action supports only pull_request event');
  }

  return {
    prNumber,
    prUrl,
    sha,
  };
}

module.exports = {
  createStatus,
  listComments,
  insertComment,
  updateComment,
  deleteComments,
  upsertComment,
  replaceComment,
  parseWebhook,
};
