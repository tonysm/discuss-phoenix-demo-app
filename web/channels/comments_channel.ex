defmodule Discuss.CommentsChannel do
  use Discuss.Web, :channel

  alias Discuss.{Topic, Comment}

  def join("comments:" <> topic_id, _auth_msg, socket) do
    topic = String.to_integer(topic_id)
    topic = Repo.get(Topic, topic_id)

    topic = Topic
      |> Repo.get(topic_id)
      |> Repo.preload(:comments)

    assign(socket, :topic, topic)

    {:ok, %{comments: topic.comments}, assign(socket, :topic, topic)}
  end

  def handle_in(name, %{"content" => content}, socket) do
    topic = socket.assigns.topic

    changeset = topic
      |> build_assoc(:comments)
      |> Comment.changeset(%{content: content})

    case Repo.insert(changeset) do
      {:ok, comment} ->
        broadcast!(socket, "comments:#{socket.assigns.topic.id}:new",
          %{comment: comment}
        )
        {:reply, :ok, socket}
      {:error, _reason} ->
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end
end
