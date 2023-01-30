/* eslint-disable no-unused-vars */ // disable because acbstrac class
class LikeRepository {
  async addOrDeleteLike(commentId, ownerId) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getTotalLike(commentId) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = LikeRepository;
