import { GameState } from '../Models/gameState';

interface Props {
    gameStateRef: React.MutableRefObject<GameState>,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    addLogMessage: (message: string) => void
}

export function checkUnlocks({ gameStateRef, setGameState, addLogMessage }: Props) {
    if(gameStateRef.current.flags.initialMessage === false && !gameStateRef.current.flags.initialMessage) {
        gameStateRef.current.flags.initialMessage = true;
        addLogMessage("You are in your base, surrounded by cliffs and a crude wall. You can hear elementals roaring in the distance, you should gather up something to protect yourself.");
    }
    if(gameStateRef.current.buildings[0].amountOwned >= 8 && !gameStateRef.current.flags.unlockedLevel2Collector) {
        gameStateRef.current.buildings[1].available = true;
        gameStateRef.current.flags.unlockedLevel2Collector = true;
        addLogMessage("You realise how you could combine ten collectors into a much better one");
    }
    if(gameStateRef.current.totalEssenceCollected >= 1200 && !gameStateRef.current.flags.unlockedDefences) {
        gameStateRef.current.buildings[2].available = true;
        gameStateRef.current.buildings[3].available = true;
        gameStateRef.current.buildings[4].available = true;
        gameStateRef.current.flags.unlockedDefences = true;
        addLogMessage("The elementals are getting closer. You need some defences.");
    }
    if(gameStateRef.current.totalEssenceCollected >= 2500 && !gameStateRef.current.flags.elementalAttack) {
        addLogMessage("The elementals are here.");
        gameStateRef.current.flags.elementalAttack = true;
    }
}