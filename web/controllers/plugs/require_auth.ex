defmodule Discuss.Plugs.RequireAuth do
  @moduledoc """
    Plug to require auth before enter in controller action
  """

  import Plug.Conn
  import Phoenix.Controller

  alias Discuss.Router.Helpers

  def init(_params) do
  end

  def call(conn, _params) do
    if conn.assigns[:user] do
      conn
    else
      conn
      |> put_flash(:error, "You should be logged in to perform this")
      |> redirect(to: Helpers.topic_path(conn, :index))
      |> halt
    end
  end
end
