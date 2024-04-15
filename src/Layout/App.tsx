import { useState, useEffect, useRef } from 'react';
import { GameState } from '../Models/gameState';
import { Building } from '../Models/building';
import { GameFlags } from '../Models/gameFlags'
import ShopPane from './ShopPane';
import { Grid } from 'semantic-ui-react';
import { checkUnlocks } from '../Scripts/checkUnlocks';

//const collectorSpeedLvl1: number = 0.2;
//const collectorSpeedLvl2: number = 10;
//const collectorSpeedLvl3: number = 1000;
//const collectorSpeedLvl4: number = 100000;
//const initialCollectorCostLvl1: number = 10;
//const initialCollectorCostLvl2: number = 100;
const TYPE_COLLECTOR = 0;
const TYPE_DEFENSE = 1;
const WALL_ID = 100;
const initialEssencePerClick: number = 1;
const buildingPriceIncrease: number = 1.15; //15%
const buildingPriceIncreaseEnhanced: number = 2; //Doubles
const ticksPerSecond: number = 10;
const collectorCombinationCost: number = 10;

const initialBuildings: Building[] = [{
  id: 1,
  name: "Collector",
  description: "A magical collector to gather essence for you",
  available: true,
  amountOwned: 0,
  speed: 0.4,
  initialCost: 10,
  baseCost: 10,
  currentCost: 10,
  costsBuildingId: 0,
  costsBuildingName: "",
  type: TYPE_COLLECTOR
}, {
  id: 2,
  name: "Great Collector",
  description: "An upgraded collector that gathers even faster",
  available: false,
  amountOwned: 0,
  speed: 10,
  initialCost: 100,
  baseCost: 100,
  currentCost: 100,
  costsBuildingId: 1,
  costsBuildingName: "Collector",
  type: TYPE_COLLECTOR
}, {
  id: 100,
  name: "Wall",
  description: "A wall to keep the elementals out",
  available: false,
  amountOwned: 1,
  speed: 0,
  initialCost: 100,
  baseCost: 100,
  currentCost: 100,
  costsBuildingId: 0,
  costsBuildingName: "",
  type: TYPE_DEFENSE
}, {
  id: 101,
  name: "Sniper Rifle",
  description: "Nothing is holding it. It's just aiming and shooting by itself",
  available: false,
  amountOwned: 0,
  speed: 0.2,
  initialCost: 100,
  baseCost: 100,
  currentCost: 100,
  costsBuildingId: 0,
  costsBuildingName: "",
  type: TYPE_DEFENSE
}
];
const initialFlags: GameFlags = {
 initialMessage: false,
 unlockedLevel2Collector: false,
 unlockedDefenses: false
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    essence: 500,
    totalEssenceCollected: 0,
    essencePerSecond: 0,
    buildings: initialBuildings,
    health: 500,
    flags: initialFlags
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
              selectedBuilding.currentCost *= buildingPriceIncreaseEnhanced;
              consumedBuilding.amountOwned -= collectorCombinationCost;
              consumedBuilding.baseCost *= buildingPriceIncreaseEnhanced;
              consumedBuilding.currentCost = consumedBuilding.baseCost * Math.pow(buildingPriceIncrease, consumedBuilding.amountOwned);
              updateDone = true;
            }

            return {
              ...prevState,
              essence: newEssence,
            };
          });
        }
      } else {
        setGameState(prevState => {
          const newEssence = prevState.essence - buildingEssenceCost; //Strict mode makes it execute twice so this makes sure the result is the same both times
          if (!updateDone) {
            if (selectedBuilding.id === WALL_ID) {
              selectedBuilding.amountOwned *= 2;
              selectedBuilding.currentCost *= 2;
            } else {
              selectedBuilding.amountOwned += 1;
              selectedBuilding.currentCost *= buildingPriceIncrease;
            }
            updateDone = true;
          }

          return {
            ...prevState,
            essence: newEssence,
          };
        });
      }
    }
  };

  const addLogMessage = (message: string) => {
    setLogMessages((prevMessages) => [...prevMessages, message]);
  };

  function gameLoop() {
    let essenceCollected: number = 0;
    //TODO: Make this a loop
    essenceCollected += gameStateRef.current.buildings[0].amountOwned * gameStateRef.current.buildings[0].speed / ticksPerSecond;
    essenceCollected += gameStateRef.current.buildings[1].amountOwned * gameStateRef.current.buildings[1].speed / ticksPerSecond;
    //Conditional unlocks
    checkUnlocks({gameStateRef, setGameState, addLogMessage});
    setGameState(prevState => ({
      ...prevState,
      essence: prevState.essence + essenceCollected,
      totalEssenceCollected: prevState.totalEssenceCollected + essenceCollected,
      essencePerSecond: essenceCollected * ticksPerSecond
    }));
  }

  return (
    <Grid>
      <Grid.Column width={4} padded="true">
        <ShopPane gameState={gameState} buyBuilding={buyBuilding} />
      </Grid.Column>
      <Grid.Column width={12}>
        <Grid.Row>
          <h1>Elemental Defense Idle</h1>
          <p>Essence: {gameState.essence.toFixed(1)}</p>
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
          <p>This will be the graphical area</p>
        </Grid.Row>
      </Grid.Column>
    </Grid>
  );
}

export default App;