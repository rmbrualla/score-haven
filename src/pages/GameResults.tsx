import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, RotateCcw } from "lucide-react";

interface GameState {
  numHoles: number;
  players: string[];
  scores: number[][];
  gameStarted: string;
}

interface PlayerStats {
  name: string;
  total: number;
  minHole: number;
  maxHole: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
}

const GameResults = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (!savedState) {
      navigate('/');
      return;
    }
    const parsedState = JSON.parse(savedState);
    setGameState(parsedState);

    // Calculate stats for each player
    const playerStats = parsedState.players.map((player: string, index: number) => {
      const scores = parsedState.scores[index].filter((s: number) => s !== 0);
      const total = scores.reduce((sum: number, score: number) => sum + score, 0);
      
      return {
        name: player,
        total,
        minHole: Math.min(...scores.filter((s: number) => s > 0)),
        maxHole: Math.max(...scores.filter((s: number) => s > 0)),
        birdies: scores.filter((s: number) => s === 2).length,
        pars: scores.filter((s: number) => s === 3).length,
        bogeys: scores.filter((s: number) => s === 4).length,
        doubleBogeys: scores.filter((s: number) => s === 5).length,
      };
    });

    // Sort by total score and group by position
    playerStats.sort((a, b) => a.total - b.total);
    setStats(playerStats);
  }, [navigate]);

  const startNewGame = () => {
    localStorage.removeItem('gameState');
    navigate('/');
  };

  if (!gameState || !stats.length) return null;

  // Group players by their scores to handle ties
  const podiumPositions = stats.reduce((acc: { [key: number]: PlayerStats[] }, player) => {
    if (!acc[player.total]) {
      acc[player.total] = [];
    }
    acc[player.total].push(player);
    return acc;
  }, {});

  // Convert grouped scores to positions (1st, 2nd, 3rd)
  const positions: PlayerStats[][] = [[], [], []]; // gold, silver, bronze
  let currentPosition = 0;
  
  Object.values(podiumPositions).forEach((players) => {
    if (currentPosition < 3) {
      positions[currentPosition] = players;
      currentPosition += 1;
    }
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Game Results</h1>
          <p className="text-muted-foreground">
            Game completed with {gameState.players.length} players
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {positions.map((players, positionIndex) => 
            players.map((player, playerIndex) => (
              <div
                key={player.name}
                className="bg-card p-6 rounded-lg text-center space-y-2"
                style={{
                  gridColumn: players.length > 1 ? "span 3" : "auto",
                  order: positionIndex === 0 ? 2 : positionIndex === 1 ? 1 : 3
                }}
              >
                <Trophy
                  className={`mx-auto h-8 w-8 ${
                    positionIndex === 0
                      ? "text-yellow-500"
                      : positionIndex === 1
                      ? "text-gray-400"
                      : "text-amber-600"
                  }`}
                />
                <h3 className="font-bold">{player.name}</h3>
                <p className="text-2xl font-semibold">{player.total}</p>
                <p className="text-muted-foreground">
                  {positionIndex === 0 ? "Gold" : positionIndex === 1 ? "Silver" : "Bronze"}
                  {players.length > 1 ? ` (Tied with ${players.length - 1} other${players.length > 2 ? 's' : ''})` : ''}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Best Hole</TableHead>
                <TableHead className="text-right">Worst Hole</TableHead>
                <TableHead className="text-right">Birdies</TableHead>
                <TableHead className="text-right">Pars</TableHead>
                <TableHead className="text-right">Bogeys</TableHead>
                <TableHead className="text-right">Double Bogeys</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((player) => (
                <TableRow key={player.name}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-right">{player.total}</TableCell>
                  <TableCell className="text-right">{player.minHole}</TableCell>
                  <TableCell className="text-right">{player.maxHole}</TableCell>
                  <TableCell className="text-right">{player.birdies}</TableCell>
                  <TableCell className="text-right">{player.pars}</TableCell>
                  <TableCell className="text-right">{player.bogeys}</TableCell>
                  <TableCell className="text-right">{player.doubleBogeys}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button
          className="w-full"
          onClick={startNewGame}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Game
        </Button>
      </div>
    </div>
  );
};

export default GameResults;