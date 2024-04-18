import { useState, useEffect, useRef } from 'react';
import { GameState } from '../Models/gameState';
import ShopPane from './ShopPane';
import { Grid } from 'semantic-ui-react';
import { checkUnlocks } from '../Scripts/checkUnlocks';
//import { Perk } from "../Models/perk";
//import { Building } from "../Models/building";
import { buildingPriceIncrease, collectorCombinationCost, initialCombinedBuildingPriceIncrease, initialEssencePerClick, ticksPerSecond, initialBuildings, initialFlags, moveSpeed, distanceToWall, TYPE_WALL, TYPE_COLLECTOR, TYPE_DEFENCE, initialPrestige} from '../Models/constants';

let tickCounter: number = 0;
let gameLoaded: boolean = false;

//const buildingDefinitions: Building[] | null = null;

function App() {
  const [gameState, setGameState] = useState<GameState>({
    essence: 0,
    totalEssenceCollected: 0,
    totalDamageDealt: 0,
    essencePerSecond: 0,
    damagePerSecond: 0,
    maxDamagePerSecond: 0,
    buildings: initialBuildings,
    wallHealth: 100,
    flags: initialFlags,
    combinedBuildingPriceIncrease: initialCombinedBuildingPriceIncrease,
    prestige: initialPrestige,
    essensePerClick: initialEssencePerClick,
    elementals: {
      ferocity: 100,
      progress: 0
    }
  });
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const logBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logMessages]);

  const loadGame = () => {
    let saveGame = localStorage.getItem("elementalDefenceSave");
    if (saveGame !== null && saveGame !== "") {
      let gameData: GameState = JSON.parse(saveGame);
      if (gameData !== null) {
        setGameState(gameData);
      }
    }
  };
  
  useEffect(() => {
    const loadGameAndSetup = () => {
      loadGame();
    };
    loadGameAndSetup();
  }, []);

  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    intervalRef.current = setInterval(gameLoop, 1000 / ticksPerSecond);
    
    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const mineEssence = () => {
    setGameState(prevState => ({
      ...prevState,
      essence: prevState.essence + initialEssencePerClick,
      totalEssenceCollected: prevState.totalEssenceCollected + initialEssencePerClick
    }));
  };

  const buyBuilding = (id: number) => {
    let selectedBuilding = gameStateRef.current.buildings.find(x => x.id === id);
    if (selectedBuilding == null) return;
    let updateDone: boolean = false; //Weird strict mode workaround
    let buildingEssenceCost: number = Math.ceil(selectedBuilding.currentCost)
    if (gameStateRef.current.essence >= buildingEssenceCost) {
      //addLogMessage("Buying building " + selectedBuilding.name);
      if (selectedBuilding.costsBuildingId != 0) {
        let consumedBuilding = gameStateRef.current.buildings.find(x => x.id === selectedBuilding.costsBuildingId);
        if (consumedBuilding == null) {
          console.log("Could not find building of id " + selectedBuilding.costsBuildingId);
          return;
        }
        if (consumedBuilding.amountOwned >= collectorCombinationCost) {
          setGameState(prevState => {
            const newEssence = prevState.essence - buildingEssenceCost; //Strict mode makes it execute twice so this makes sure the result is the same both times
            if (!updateDone) {

              selectedBuilding.amountOwned += 1;
              selectedBuilding.currentCost *= prevState.combinedBuildingPriceIncrease;
              consumedBuilding.amountOwned -= collectorCombinationCost;
              consumedBuilding.baseCost *= prevState.combinedBuildingPriceIncrease;
              consumedBuilding.currentCost = consumedBuilding.baseCost * Math.pow(buildingPriceIncrease, consumedBuilding.amountOwned);
              updateDone = true;
            }

            return {
              ...prevState,
              essence: newEssence,
            };
          });
        }
      } else { //No building consumed eg. Defence, Collector level 1
        let newWallHealth = gameState.wallHealth;
        setGameState(prevState => {
          const newEssence = prevState.essence - buildingEssenceCost; //Strict mode makes it execute twice so this makes sure the result is the same both times   
          if (!updateDone) {
            if (selectedBuilding.type === TYPE_WALL) {
              selectedBuilding.amountOwned *= 2;
              selectedBuilding.currentCost *= 2;
              newWallHealth = selectedBuilding.amountOwned * 100; //TODO: Make this percentage based so it doesn't heal.
            } else {
              selectedBuilding.amountOwned += 1;
              selectedBuilding.currentCost *= buildingPriceIncrease;
            }
            updateDone = true;
          }

          return {
            ...prevState,
            essence: newEssence,
            wallHealth: newWallHealth
          };
        });
      }
    }
  };

  const addLogMessage = (message: string) => {
    setLogMessages((prevMessages) => [...prevMessages, message]);
  };

  function gameLoop() {
    if (!gameLoaded) {
      loadGame();
      gameLoaded = true;
    }
    if (!gameStateRef.current.flags.dead) {
      let essenceCollected: number = 0;

      const collectorBuildings = gameStateRef.current.buildings.filter(building => building.type === TYPE_COLLECTOR);
      for (const building of collectorBuildings) {
        essenceCollected += building.amountOwned * building.speed / ticksPerSecond
      }

      //Make this an external function?
      let damageDealt: number = 0;
      let maxDamagePerSecond: number = 0;
      const defenceBuildings = gameStateRef.current.buildings.filter(building => building.type === TYPE_DEFENCE);
      for (const building of defenceBuildings) {
        maxDamagePerSecond += building.amountOwned * building.speed
      }
      if (gameStateRef.current.flags.elementalAttack) {
        damageDealt = maxDamagePerSecond / ticksPerSecond;

        //Calculate progress of elementals
        let elementalProgress: number = 0;
        let healthAdded: number = gameStateRef.current.elementals.ferocity / 100 / ticksPerSecond;
        let density: number = (healthAdded * moveSpeed) / distanceToWall; //health per distance unit
        let inverseDensity: number = distanceToWall / (healthAdded * moveSpeed);// distance unit pushed back per damage done
        elementalProgress = ((healthAdded - damageDealt) * inverseDensity) / ticksPerSecond;
        gameStateRef.current.elementals.progress += elementalProgress;
        if (gameStateRef.current.elementals.progress < 0) {
          const excessDamage = Math.abs(gameStateRef.current.elementals.progress) * density * ticksPerSecond;
          damageDealt -= excessDamage;
          gameStateRef.current.elementals.progress = 0;
        }
        if (gameStateRef.current.elementals.progress > 900) {
          gameStateRef.current.elementals.progress = 900;
          gameStateRef.current.wallHealth -= gameStateRef.current.elementals.ferocity / 100 / ticksPerSecond;
          if (gameStateRef.current.wallHealth <= 0) {
            gameStateRef.current.wallHealth = 0;
            gameStateRef.current.flags.dead = true;
            addLogMessage("You died. Prestige system coming soon, thank you for playing the development version! Delete your save to try again.");
          }
        }

        if (tickCounter % 10 === 0) {
          if (gameStateRef.current.elementals.ferocity < 500) {
            gameStateRef.current.elementals.ferocity += 1;
          } else if (gameStateRef.current.elementals.ferocity >= 500 && gameStateRef.current.elementals.ferocity < 1000) {
            gameStateRef.current.elementals.ferocity *= 1.003;
          } else {
            gameStateRef.current.elementals.ferocity *= 1.005;
          }

        }

      }
      //Conditional unlocks
      checkUnlocks({ gameStateRef, addLogMessage, gameLoaded});
      setGameState(prevState => ({
        ...prevState,
        essence: prevState.essence + essenceCollected,
        totalEssenceCollected: prevState.totalEssenceCollected + essenceCollected,
        totalDamageDealt: prevState.totalDamageDealt + damageDealt,
        essencePerSecond: essenceCollected * ticksPerSecond,
        damagePerSecond: damageDealt * ticksPerSecond,
        maxDamagePerSecond: maxDamagePerSecond
      }));

      tickCounter += 1;
      if (tickCounter === 600) {
        tickCounter = 0;
      }
    }
  }

  function saveGame() {
    localStorage.setItem("elementalDefenceSave", JSON.stringify(gameState));
    addLogMessage("Game Saved");
  }

  function deleteSave() {
    localStorage.setItem("elementalDefenceSave", "");
    addLogMessage("Game Deleted");
  }

  return (
    <Grid>
      <Grid.Column width={4}>
        <ShopPane gameState={gameState} buyBuilding={buyBuilding} />
      </Grid.Column>
      <Grid.Column width={8}>
        <Grid.Row>
          <h1>Elemental Defence Idle</h1>
          <p>Essence: {gameState.essence.toFixed(0)}</p>
          <p>Essence per second: {gameState.essencePerSecond.toFixed(1)}</p>
          <button onClick={mineEssence}>Mine Essence</button>
        </Grid.Row>
        <Grid.Row>
          <div ref={logBoxRef} className="log-box">
            {logMessages.map((message, index) => (
              <span key={index}>{" * "+message}<br /></span>
            ))}
          </div>
        </Grid.Row>
        <Grid.Row>
          <p>Wall Health: {gameState.wallHealth.toFixed(1)}</p>
          <p>Damage Per Second : {gameState.damagePerSecond.toFixed(1)} (Max {gameState.maxDamagePerSecond.toFixed(1)})</p>
          <p>Elemental Progress: {gameState.elementals.progress.toFixed(0)} / {distanceToWall}</p>
          <p>Elemental Ferocity: {gameState.elementals.ferocity.toFixed(2)}</p>
        </Grid.Row>
      </Grid.Column>
      <Grid.Column width={4}>
        <h1></h1>
        <button onClick={saveGame}>Save Game</button>
        <span> </span>
        <button onClick={deleteSave}>Delete Save</button>
        <p>Total essence collected: {gameState.totalEssenceCollected.toFixed(0)}</p>
        <p>Total damage dealt: {gameState.totalDamageDealt.toFixed(0)}</p>
      </Grid.Column>
    </Grid>
  );
}

export default App;