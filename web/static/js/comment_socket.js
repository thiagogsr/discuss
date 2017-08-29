import {Socket} from 'phoenix'
import {_} from 'underscore'

var CommentSocket = (function (global) {
  function CommentSocket () {
    this.socket = new Socket('/socket', { params: { token: global.userToken } })
    this.channel = this.socket.channel('comment:all', {})
    this.commentField = document.querySelector('#add-comment')
    this.submitComment = document.querySelector('#submit-comment')
    this.comments = document.querySelector('#comments')
  }

  var fn = CommentSocket.prototype

  fn.init = function () {
    if (!this.commentField) {
      return
    }
    this.socket.connect()
    this._bindAll()
    this._joinChannel()
    this._loadComments()
  }

  fn._bindAll = function () {
    _.bindAll(this, '_submitComment', '_addComment', '_renderComments',
      '_prependComment', '_removeComment')

    this.commentField.addEventListener('keypress', this._submitComment)
    this.submitComment.addEventListener('click', this._addComment)
    this.channel.on('load_comments', this._renderComments)
    this.channel.on('new_comment', this._prependComment)
    this.channel.on('remove_comment', this._removeCommentOfDOM)
  }

  fn._bindComments = function () {
    var self = this
    document.querySelectorAll('.remove').forEach(function (el) {
      el.addEventListener('click', self._removeComment)
    })
  }

  fn._joinChannel = function () {
    this.channel.join()
      .receive('ok', resp => { console.log('Joined successfully', resp) })
      .receive('error', resp => { console.log('Unable to join', resp) })
  }

  fn._loadComments = function () {
    this.channel.push('load_comments', { topic_id: this._topicId() })
  }

  fn._submitComment = function (event) {
    if (event.keyCode === 13) {
      this._addComment()
    }
  }

  fn._topicId = function () {
    return global.location.pathname.split('/')[1]
  }

  fn._addComment = function () {
    if (this.commentField.value === '') {
      return
    }

    var body = {
      content: this.commentField.value,
      topic_id: this._topicId()
    }

    this.channel.push('new_comment', body)
    this.commentField.value = ''
  }

  fn._appendComment = function (payload) {
    var comment = this._buildComment(payload)
    this.comments.insertAdjacentHTML('beforeend', comment)
    this._bindComments()
  }

  fn._prependComment = function (payload) {
    var comment = this._buildComment(payload)
    this.comments.insertAdjacentHTML('afterbegin', comment)
    this._bindComments()
  }

  fn._buildComment = function (payload) {
    var markup = [
      '<div class="comment">',
      '<%- comment.content %>',
      '<% if(comment.can_remove) { %>',
      '<a href="#" class="remove" data-id="<%- comment.id %>">&times;</a>',
      '<% } %>',
      '<div class="author">',
      'by <%- comment.user_email %> at <%- comment.inserted_at %>',
      '</div>',
      '</div>'
    ].join('\n')

    var template = _.template(markup)
    return template({ comment: payload })
  }

  fn._renderComments = function (payload) {
    var comments = payload.comments
    for (var index in comments) {
      this._appendComment(comments[index])
    }
  }

  fn._removeComment = function (event) {
    var commentId = event.target.dataset.id
    this.channel.push('remove_comment', { comment_id: commentId })
    return false
  }

  fn._removeCommentOfDOM = function (payload) {
    var commentId = payload.comment_id
    var comment = document.querySelector('[data-id="' + commentId + '"]')

    comment.parentNode.remove()
  }

  return CommentSocket
})(window)

export default CommentSocket
