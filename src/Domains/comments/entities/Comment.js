class Comment {
  constructor({
    id,
    username,
    date,
    content,
    deleted_at: deletedAt,
    likeCount,
  }, replies) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.replies = replies;
    this.content = deletedAt ? '**komentar telah dihapus**' : content;
    this.likeCount = likeCount;
  }
}

module.exports = Comment;
