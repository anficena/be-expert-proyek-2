/* eslint-disable camelcase */
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const responseFormater = require('../../../../../utils/responseFormater');
const DetailThreadUseCase = require('../../../../Applications/use_case/DetailThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AddRepliesUseCase = require('../../../../Applications/use_case/AddRepliesUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const AddLikeCommentUseCase = require('../../../../Applications/use_case/AddLikeCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
    this.postRepliesCommentHandler = this.postRepliesCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { title, body } = request.payload;
    const payload = {
      owner,
      title,
      body,
    };

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(payload);

    return responseFormater.successWithData(h, {
      status: 'success',
      data: addedThread,
      code: 201,
    });
  }

  async getThreadHandler(request, h) {
    const params = { thread_id: request.params.threadId };
    const detailThreadUseCase = this._container.getInstance(DetailThreadUseCase.name);
    const detailThread = await detailThreadUseCase.execute(params);

    return responseFormater.successWithData(h, {
      status: 'success',
      data: detailThread,
    });
  }

  async postCommentHandler(request, h) {
    const { content } = request.payload;
    const { threadId: thread_id } = request.params;
    const { id: owner } = request.auth.credentials;
    const payload = {
      content,
      thread_id,
      owner,
    };

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(payload);

    return responseFormater.successWithData(h, {
      status: 'success',
      data: addedComment,
      code: 201,
    });
  }

  async putLikeCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;

    const payload = {
      threadId,
      commentId,
      owner,
    };

    const addLikeCommentUseCase = this._container.getInstance(AddLikeCommentUseCase.name);
    const addLikeComment = await addLikeCommentUseCase.execute(payload);

    return responseFormater.successWithoutData(h, {
      status: addLikeComment.status,
      code: 200,
    });
  }

  async postRepliesCommentHandler(request, h) {
    const { content } = request.payload;
    const { threadId: thread_id, commentId: parent_id } = request.params;
    const { id: owner } = request.auth.credentials;
    const payload = {
      thread_id,
      content,
      parent_id,
      owner,
    };

    const addRepliesUseCase = this._container.getInstance(AddRepliesUseCase.name);
    const repliesComment = await addRepliesUseCase.execute(payload);

    return responseFormater.successWithData(h, {
      status: 'success',
      data: repliesComment,
      code: 201,
    });
  }

  async deleteCommentHandler(request, h) {
    const { threadId: thread_id, commentId: comment_id } = request.params;
    const { id: owner_id } = request.auth.credentials;
    const payload = {
      thread_id,
      comment_id,
      owner_id,
    };

    const deleteCommentuseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const deleteComment = await deleteCommentuseCase.execute(payload);

    return responseFormater.successWithoutData(h, {
      status: deleteComment.status,
      message: 'Koementar berhasil dihapus',
    });
  }

  async deleteReplyCommentHandler(request, h) {
    const { threadId: thread_id, commentId: comment_id, replyId: reply_id } = request.params;
    const { id: owner_id } = request.auth.credentials;
    const payload = {
      thread_id,
      comment_id,
      reply_id,
      owner_id,
    };

    const deleteCommentuseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const deleteComment = await deleteCommentuseCase.execute(payload);

    return responseFormater.successWithoutData(h, {
      status: deleteComment.status,
      message: 'Koementar berhasil dihapus',
    });
  }
}

module.exports = ThreadsHandler;
