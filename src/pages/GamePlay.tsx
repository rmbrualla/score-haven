import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GameState {
  numHoles: number;
  players: string[];
  currentHole: number;
  scores: number[][];
  gameStarted: string;
}

const GamePlay = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (!savedState) {
      navigate('/');
      return;
    }
    setGameState(JSON.parse(savedState));
  }, [navigate]);

  if (!gameState) return null;

  const updateScore = (playerIndex: number, score: string) => {
    const numScore = parseInt(score) || 0;
    const newScores = [...gameState.scores];
    newScores[playerIndex][gameState.currentHole - 1] = numScore;
    
    const newState = {
      ...gameState,
      scores: newScores
    };
    
    setGameState(newState);
    localStorage.setItem('gameState', JSON.stringify(newState));
  };

  const getPlayerTotal = (playerIndex: number) => {
    return gameState.scores[playerIndex].reduce((sum, score) => sum + score, 0);
  };

  const navigateHole = (direction: 'prev' | 'next') => {
    const newHole = direction === 'next' 
      ? gameState.currentHole + 1 
      : gameState.currentHole - 1;

    if (newHole < 1 || newHole > gameState.numHoles) return;

    const newState = {
      ...gameState,
      currentHole: newHole
    };
    
    setGameState(newState);
    localStorage.setItem('gameState', JSON.stringify(newState));
  };

  const endGame = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Hole {gameState.currentHole}</h1>
          <p className="text-muted-foreground">
            of {gameState.numHoles}
          </p>
        </div>

        <div className="space-y-6">
          {gameState.players.map((player, playerIndex) => (
            <div key={player} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-medium">{player}</label>
                <span className="text-muted-foreground">
                  Total: {getPlayerTotal(playerIndex)}
                </span>
              </div>
              <Input
                type="number"
                value={gameState.scores[playerIndex][gameState.currentHole - 1] || ''}
                onChange={(e) => updateScore(playerIndex, e.target.value)}
                min={1}
                placeholder="Enter score"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => navigateHole('prev')}
            disabled={gameState.currentHole === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {gameState.currentHole === gameState.numHoles ? (
            <Button onClick={endGame}>
              <Flag className="h-4 w-4 mr-2" />
              End Game
            </Button>
          ) : (
            <Button
              onClick={() => navigateHole('next')}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={endGame}
        >
          End Game Early
        </Button>
      </div>
    </div>
  );
};

export default GamePlay;