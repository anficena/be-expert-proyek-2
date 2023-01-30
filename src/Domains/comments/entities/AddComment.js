class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      content,
      thread_id: threadId,
      parent_id: parentId,
      owner,
    } = payload;

    this.thread_id = threadId;
    this.parent_id = parentId;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ content }) {
    if (!content) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
