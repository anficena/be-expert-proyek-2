const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadAvaibility(useCasePayload.thread_id);
    const addComment = new AddComment(useCasePayload);
    const addedComment = await this._commentRepository.addComment(addComment);

    return { addedComment };
  }
}

module.exports = AddCommentUseCase;
