import { Button } from "@/components/ui/button";

function GameCard({ game, onEdit, onDelete, onStatusChange }) {
  function nextStatus(current) {
    if (current === "unplayed") return "playing";
    if (current === "playing") return "cleared";
    return "unplayed";
  }
  return (
    <div className="flex items-center gap-2 p-3 border rounded">
      <span className="font-medium flex-1">{game.title}</span>
      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
        {game.platform ?? "未設定"}
      </span>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(game.id, nextStatus(game.status))}
          className={
            "w-20 " +
            (game.status === "playing"
              ? "border-blue-500 text-blue-500"
              : game.status === "cleared"
                ? "border-green-600 text-green-600"
                : "text-gray-500")
          }
        >
          {game.status === "unplayed"
            ? "未プレイ"
            : game.status === "playing"
              ? "プレイ中"
              : "クリア済み"}
        </Button>
        <Button variant="outline" onClick={() => onEdit(game)}>
          編集
        </Button>
        <Button variant="destructive" onClick={() => onDelete(game.id)}>
          削除
        </Button>
      </div>
    </div>
  );
}

export default GameCard;
