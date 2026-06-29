import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { Button } from "@/components/ui/button";

function GameListPage({ session }) {
  const [games, setGames] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  async function handleSignOut() {
    await supabase.auth.signOut();
  }
  function nextStatus(current) {
    if (current === "unplayed") return "playing";
    if (current === "playing") return "cleared";
    return "unplayed";
  }
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
  async function updateStatus(id, status) {
    await supabase.from("games").update({ status }).eq("id", id);
    fetchGames();
  }
  useEffect(() => {
    fetchGames();
  }, []);
  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ツミゲ</h1>
        <Button variant="outline" onClick={handleSignOut}>
          ログアウト
        </Button>
      </div>
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
          <div key={game.id} className="flex flex-col gap-2 p-3 border rounded">
            <div className="flex items-center gap-2">
              <span className="font-medium flex-1">{game.title}</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(game.id, nextStatus(game.status))}
                  className={
                    game.status === "playing"
                      ? "border-blue-500 text-blue-500"
                      : game.status === "cleared"
                        ? "border-green-600 text-green-600"
                        : "text-gray-500"
                  }
                >
                  {game.status === "unplayed"
                    ? "未プレイ"
                    : game.status === "playing"
                      ? "プレイ中"
                      : "クリア済み"}
                </Button>
                <div className="flex gap-1">
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">タイトルを編集</h2>
            <input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingId(null)}>
                キャンセル
              </Button>
              <Button onClick={() => updateGame(editingId)}>確定</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameListPage;
