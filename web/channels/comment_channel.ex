defmodule Discuss.CommentChannel do
  use Phoenix.Channel

  alias Discuss.Comment

  def join("comment:all", _message, socket) do
    {:ok, socket}
  end

  def join("comment:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_comment", %{"body" => body}, socket) do
    changeset =
      socket.assigns.user
      |> build_assoc(user, :comments)
      |> Comment.changeset(%Comment{content: body})

    broadcast! socket, "new_comment", %{body: body}
    {:noreply, socket}
  end

  def handle_out("new_comment", payload, socket) do
    push socket, "new_comment", payload
    {:noreply, socket}
  end
end
