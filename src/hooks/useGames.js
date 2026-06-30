import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export function useGames(session) {
  const [games, setGames] = useState([]);

  async function fetchGames() {
    const { data } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true });
    setGames(data ?? []);
  }

  async function addGame({ title, platform }) {
    await supabase.from("games").insert({
      title,
      user_id: session.user.id,
      status: "unplayed",
      platform: platform || null,
    });
    fetchGames();
  }

  async function deleteGame(id) {
    await supabase.from("games").delete().eq("id", id);
    fetchGames();
  }
  async function updateGame(id, title) {
    await supabase.from("games").update({ title }).eq("id", id);
    fetchGames();
  }
  async function updateStatus(id, status) {
    await supabase.from("games").update({ status }).eq("id", id);
    fetchGames();
  }
  useEffect(() => {
    fetchGames();
  }, []);
  return { games, addGame, deleteGame, updateGame, updateStatus };
}
