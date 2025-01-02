import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flag, Plus, Minus } from "lucide-react";
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
    
    const parsedState = JSON.parse(savedState);
    // Initialize scores with default value of 3 if they don't exist
    if (!parsedState.scores || parsedState.scores.length === 0) {
      parsedState.scores = parsedState.players.map(() => 
        new Array(parsedState.numHoles).fill(3)
      );
    }
    setGameState(parsedState);
  }, [navigate]);

  if (!gameState) return null;

  const updateScore = (playerIndex: number, increment: boolean) => {
    const newScores = [...gameState.scores];
    const currentScore = newScores[playerIndex][gameState.currentHole - 1];
    const newScore = increment ? currentScore + 1 : currentScore - 1;
    
    // Prevent negative scores
    if (newScore < 1) return;
    
    newScores[playerIndex][gameState.currentHole - 1] = newScore;
    
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
              <div className="flex items-center justify-between gap-4 rounded-md border p-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateScore(playerIndex, false)}
                  disabled={gameState.scores[playerIndex][gameState.currentHole - 1] <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold">
                  {gameState.scores[playerIndex][gameState.currentHole - 1]}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateScore(playerIndex, true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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