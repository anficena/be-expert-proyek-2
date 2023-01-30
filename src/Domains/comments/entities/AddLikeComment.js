class AddLikeComment {
  constructor({ threadId, commentId, owner }) {
    this._verifyPayload({ threadId, commentId, owner });

    this.thread_id = threadId;
    this.comment_id = commentId;
    this.owner = owner;
  }

  _verifyPayload({ threadId, commentId, owner }) {
    if (!threadId || !commentId || !owner) {
      throw new Error('ADD_LIKE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_LIKE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddLikeComment;
