import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const GameSetup = () => {
  const [numHoles, setNumHoles] = useState(9);
  const [players, setPlayers] = useState<string[]>(['']);
  const navigate = useNavigate();
  const { toast } = useToast();

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, '']);
    } else {
      toast({
        title: "Maximum players reached",
        description: "You can only have up to 6 players",
        variant: "destructive",
      });
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    const filledPlayers = players.filter(name => name.trim() !== '');
    if (filledPlayers.length < 1) {
      toast({
        title: "Invalid setup",
        description: "Please add at least one player",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('gameState', JSON.stringify({
      numHoles,
      players: filledPlayers,
      currentHole: 1,
      scores: filledPlayers.map(player => Array(numHoles).fill(0)),
      gameStarted: new Date().toISOString()
    }));

    navigate('/play');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Disc Golf Scorecard</h1>
          <p className="text-muted-foreground">Set up your game</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Number of Holes</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNumHoles(prev => Math.max(1, prev - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold min-w-[3ch] text-center">
                {numHoles}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNumHoles(prev => Math.min(18, prev + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Players</Label>
            {players.map((player, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Player ${index + 1}`}
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removePlayer(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={addPlayer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={startGame}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;