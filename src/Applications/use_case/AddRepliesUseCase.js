const AddComment = require('../../Domains/comments/entities/AddComment');

class AddRepliesUseCase {
  constructor({ threadRepository, commentRepository, repliesCommentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesCommentRepository = repliesCommentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadAvaibility(useCasePayload.thread_id);
    await this._commentRepository.verifyCommentAvailability(useCasePayload.parent_id);
    const addReply = new AddComment(useCasePayload);
    const addedReply = await this._repliesCommentRepository.repliesComment(addReply);

    return { addedReply };
  }
}

module.exports = AddRepliesUseCase;
