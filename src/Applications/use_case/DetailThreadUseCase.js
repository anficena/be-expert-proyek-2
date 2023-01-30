const Comment = require('../../Domains/comments/entities/Comment');
const ReplyComment = require('../../Domains/comments/entities/ReplyComment');

class DetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    likeCommentRepository,
    repliesCommentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeCommentRepository = likeCommentRepository;
    this._repliesCommentRepository = repliesCommentRepository;
  }

  async execute(params) {
    const { thread_id: threadId } = params;
    const detailThread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentByThreadId(threadId);

    detailThread.comments = await Promise.all(comments.map(async (comment) => {
      const commentItem = comment;
      const likes = await this._likeCommentRepository.getTotalLike(comment.id);
      commentItem.likeCount = parseInt(likes.total_like, 10);
      const replies = await this._repliesCommentRepository
        .getRepliesByCommentId(threadId, comment.id);
      const commentReplies = replies.map((reply) => new ReplyComment(reply));
      return new Comment(commentItem, commentReplies);
    }));

    return {
      thread: detailThread,
    };
  }
}

module.exports = DetailThreadUseCase;
