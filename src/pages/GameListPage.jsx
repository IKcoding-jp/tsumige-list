import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { Button } from "@/components/ui/button";

function GameListPage({ session }) {
  const [games, setGames] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  async function fetchGames() {
    const { data } = await supabase.from("games").select("*");
    setGames(data ?? []);
  }
  async function addGame(e) {
    e.preventDefault();
    if (!title) return;
    await supabase.from("games").insert({
      title,
      user_id: session.user.id,
      status: "unplayed",
    });
    setTitle("");
    fetchGames();
  }
  async function deleteGame(id) {
    await supabase.from("games").delete().eq("id", id);
    fetchGames();
  }
  async function updateGame(id) {
    await supabase.from("games").update({ title: editingTitle }).eq("id", id);
    setEditingId(null);
    fetchGames();
  }
  useEffect(() => {
    fetchGames();
  }, []);
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">積みゲー一覧</h1>
      <form onSubmit={addGame} className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ゲームタイトル"
          className="border rounded px-3 py-2 flex-1"
        />
        <Button type="submit">追加</Button>
      </form>
      <div className="space-y-2">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex items-center gap-2 p-3 border rounded"
          >
            {editingId === game.id ? (
              <>
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="border rounded px-2 py-1 flex-1"
                />
                <Button onClick={() => updateGame(game.id)}>確定</Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  キャンセル
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1">{game.title}</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(game.id);
                    setEditingTitle(game.title);
                  }}
                >
                  編集
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteGame(game.id)}
                >
                  削除
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameListPage;
