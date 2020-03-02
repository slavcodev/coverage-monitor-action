const createStatus = ({
  client,
  context,
  sha,
  status,
}) => {
  client.repos.createStatus({
    ...context.repo,
    sha,
    ...status,
  });
};

const listComments = async ({
  client,
  context,
  prNumber,
}) => {
  const { data: existingComments } = await client.issues.listComments({
    ...context.repo,
    issue_number: prNumber,
  });

  return existingComments;
};

const insertComment = ({
  client,
  context,
  prNumber,
  body,
}) => {
  client.issues.createComment({
    ...context.repo,
    issue_number: prNumber,
    body,
  });
};

const updateComment = ({
  client,
  context,
  body,
  commentId,
}) => {
  client.issues.updateComment({
    ...context.repo,
    comment_id: commentId,
    body,
  });
};

const deleteComments = ({
  client,
  context,
  comments,
}) => {
  comments.forEach(({ id }) => {
    client.issues.deleteComment({
      ...context.repo,
      comment_id: id,
    });
  });
};

const upsertComment = ({
  client,
  context,
  prNumber,
  body,
  existingComments,
}) => {
  const last = existingComments.pop();

  deleteComments({
    client,
    context,
    comments: existingComments,
  });

  if (last) {
    updateComment({
      client,
      context,
      body,
      commentId: last.id,
    });
  } else {
    insertComment({
      client,
      context,
      prNumber,
      body,
    });
  }
};

const replaceComment = ({
  client,
  context,
  prNumber,
  body,
  existingComments,
}) => {
  deleteComments({
    client,
    context,
    comments: existingComments,
  });

  insertComment({
    client,
    context,
    prNumber,
    body,
  });
};

module.exports = {
  createStatus,
  listComments,
  insertComment,
  updateComment,
  deleteComments,
  upsertComment,
  replaceComment,
};
