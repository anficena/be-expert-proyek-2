const AddLikeComment = require('../../Domains/comments/entities/AddLikeComment');

class AddLikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const addLike = new AddLikeComment(useCasePayload);
    await this._threadRepository.verifyThreadAvaibility(addLike.thread_id);
    await this._commentRepository.verifyCommentAvailability(addLike.comment_id);
    await this._likeRepository.addOrDeleteLike(addLike);

    return {
      status: 'success',
    };
  }
}

module.exports = AddLikeCommentUseCase;
