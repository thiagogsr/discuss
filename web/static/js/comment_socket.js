import {Socket} from "phoenix"
import {_} from "underscore"

var CommentSocket = (function(global) {
  function CommentSocket() {
    this.socket = new Socket("/socket", { params: { token: global.userToken } })
    this.channel = this.socket.channel("comment:all", {})
    this.commentField = document.querySelector("#add-comment")
    this.submitComment = document.querySelector("#submit-comment")
    this.comments = document.querySelector("#comments")
  }

  var fn = CommentSocket.prototype

  fn.init = function() {
    if (!this.commentField) {
      return
    }
    this.socket.connect()
    this._bindAll()
    this._joinChannel()
    this._loadComments()
  }

  fn._bindAll = function() {
    this.commentField.addEventListener("keypress", _.bind(this._submitComment, this))
    this.submitComment.addEventListener("click", _.bind(this._addComment, this))
    this.channel.on("load_comments", _.bind(this._renderComments, this))
    this.channel.on("new_comment", _.bind(this._prependComment, this))
  }

  fn._joinChannel = function() {
    this.channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })
  }

  fn._loadComments = function() {
    this.channel.push("load_comments", { topic_id: this._topicId() })
  }

  fn._submitComment = function(event) {
    if(event.keyCode === 13) {
      this._addComment()
    }
  }

  fn._topicId = function() {
    return global.location.pathname.split('/')[1]
  }

  fn._addComment = function() {
    if (this.commentField.value === "") {
      return
    }

    var body = {
      content: this.commentField.value,
      topic_id: this._topicId()
    }

    this.channel.push("new_comment", body)
    this.commentField.value = ""
  }

  fn._appendComment = function(payload) {
    var comment = this._buildComment(payload)
    this.comments.insertAdjacentHTML('beforeend', comment)
  }

  fn._prependComment = function(payload) {
    var comment = this._buildComment(payload)
    this.comments.insertAdjacentHTML('afterbegin', comment)
  }

  fn._buildComment = function(payload) {
    var markup = [
      '<div class="comment">',
      '<%- comment.content %>',
      '<div class="author">',
      'by <%- comment.user_email %> at <%- comment.inserted_at %>',
      '</div>',
      '</div>'
    ].join("\n");

    var template = _.template(markup)
    return template({ comment: payload })
  }

  fn._renderComments = function(payload) {
    var comments = payload.comments
    for (var index in comments) {
      this._appendComment(comments[index])
    }
  }

  return CommentSocket
})(window);

export default CommentSocket
