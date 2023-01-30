const AddLikeComment = require('../../Domains/comments/entities/AddLikeComment');

class AddLikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {}
}

module.exports = AddLikeCommentUseCase;
