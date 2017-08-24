defmodule Discuss.TopicController do
  use Discuss.Web, :controller

  alias Discuss.Topic

  def index(conn, _params) do
    topics = Repo.all(Topic)
    render conn, "index.html", topics: topics
  end

  def new(conn, _params) do
    changeset = Topic.changeset(%Topic{})
    render conn, "new.html", changeset: changeset
  end

  def create(conn, %{"topic" => topic}) do
    changeset = Topic.changeset(%Topic{}, topic)

    case Repo.insert(changeset) do
      {:ok, _topic} ->
        conn
        |> put_flash(:info, "Topic created successfully")
        |> redirect(to: topic_path(conn, :index))
      {:error, changeset} ->
        render conn, "new.html", changeset: changeset
    end
  end

  def show(conn, %{"id" => id}) do
    topic = Repo.get(Topic, id)
    render conn, "show.html", topic: topic
  end

  def edit(conn, %{"id" => id}) do
    topic = Repo.get(Topic, id)
    changeset = Topic.changeset(topic)

    render conn, "edit.html", topic: topic, changeset: changeset
  end

  def update(conn, %{"id" => id, "topic" => params}) do
    topic = Repo.get(Topic, id)
    changeset = Topic.changeset(topic, params)

    case Repo.update(changeset) do
      {:ok, _topic} ->
        conn
        |> put_flash(:info, "Topic ##{id} updated successfully")
        |> redirect(to: topic_path(conn, :index))
      {:error, changeset} ->
        render conn, "edit.html", topic: topic, changeset: changeset
    end
  end

  def delete(conn, %{"id" => id}) do
    case Repo.get!(Topic, id) |> Repo.delete do
      {:ok, _topic} ->
        conn
        |> put_flash(:info, "Topic ##{id} destroyed successfully")
        |> redirect(to: topic_path(conn, :index))
      {:error, changeset} ->
        conn
        |> put_flash(:error, "An error occurred. Try again")
        |> redirect(to: topic_path(conn, :index))
    end
  end
end
