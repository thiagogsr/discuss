defmodule Discuss.CommentChannel do
  use Phoenix.Channel

  alias Discuss.Repo
  alias Discuss.Comment
  alias Discuss.Topic

  intercept ["new_comment"]

  def join("comment:all", _message, socket) do
    {:ok, socket}
  end

  def join("comment:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_comment", %{"content" => content} = payload, socket) do
    topic = Repo.get!(Topic, payload["topic_id"])

    changeset =
      socket.assigns.user
      |> Ecto.build_assoc(:comments, topic_id: topic.id)
      |> Comment.changeset(%{content: content})

    comment =
      Repo.insert!(changeset)
      |> Repo.preload(:user)

    broadcast! socket, "new_comment", comment_to_map(comment)
    {:noreply, socket}
  end

  defp comment_to_map(comment) do
    %{
      content: comment.content,
      inserted_at: Date.to_string(comment.inserted_at),
      user_email: comment.user.email
    }
  end

  def handle_out("new_comment", payload, socket) do
    push socket, "new_comment", payload
    {:noreply, socket}
  end
end
