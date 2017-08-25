defmodule Discuss.AuthController do
  use Discuss.Web, :controller
  plug Ueberauth

  alias Discuss.User

  def callback(%{assigns: %{ueberauth_auth: auth}} = conn,
               %{"provider" => provider}) do

    user = %{provider: provider,
             email: auth.info.email,
             token: auth.credentials.token}

    User.changeset(%User{}, user)
    |> insert_or_update_user
    |> save_cookie(conn)
  end

  def signout(conn, _params) do
    conn
    |> put_flash(:info, "Signed out successfully")
    |> configure_session(drop: true)
    |> redirect(to: topic_path(conn, :index))
  end

  defp save_cookie(result, conn) do
    case result do
      {:ok, user} ->
        conn
        |> put_flash(:info, "Welcome #{user.email}!")
        |> put_session(:user_id, user.id)
        |> redirect(to: topic_path(conn, :index))
      {:error, _reason} ->
        conn
        |> put_flash(:error, "An error occurred. Try again")
        |> redirect(to: topic_path(conn, :index))
    end
  end

  defp insert_or_update_user(changeset) do
    case Repo.get_by(User, email: changeset.changes.email) do
      nil ->
        Repo.insert(changeset)
      user ->
        {:ok, user}
    end
  end
end
