/* eslint-disable camelcase */
class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({
    thread_id,
    comment_id,
    reply_id,
    owner_id,
  }) {
    await this._threadRepository.verifyThreadAvaibility(thread_id);
    await this._commentRepository.verifyCommentAvailability(comment_id);

    if (reply_id) {
      await this._commentRepository.verifyCommentAvailability(reply_id);
      await this._commentRepository.verifyOwner(reply_id, owner_id);
    } else {
      await this._commentRepository.verifyOwner(comment_id, owner_id);
    }

    const deleteComment = await this._commentRepository.deleteComment(reply_id || comment_id);
    const status = deleteComment.id ? 'success' : 'fail';

    return { status };
  }
}

module.exports = DeleteCommentUseCase;
