import { Building } from "./building";
import { GameFlags } from "./gameFlags";

export const TYPE_COLLECTOR = 0;
export const TYPE_DEFENCE = 1;
export const TYPE_WALL = 2;
export const initialEssencePerClick: number = 1;
export const buildingPriceIncrease: number = 1.15; //15% price increase
export const initialCombinedBuildingPriceIncrease: number = 2; //Doubles in price, could be reduced by upgrades in the future
export const ticksPerSecond: number = 10;
export const collectorCombinationCost: number = 10;
export const moveSpeed = 30;
export const distanceToWall = 900;

export const initialBuildings: Building[] = [{
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
    type: TYPE_WALL
  }, {
    id: 101,
    name: "Sniper Rifle",
    description: "Nothing is holding it. It's just aiming and shooting by itself",
    available: false,
    amountOwned: 0,
    speed: 0.2,
    initialCost: 150,
    baseCost: 150,
    currentCost: 150,
    costsBuildingId: 0,
    costsBuildingName: "",
    type: TYPE_DEFENCE
  }, {
    id: 102,
    name: "Rocket Launcher",
    description: "Killing one at a time is inefficient",
    available: false,
    amountOwned: 0,
    speed: 1,
    initialCost: 750,
    baseCost: 750,
    currentCost: 750,
    costsBuildingId: 0,
    costsBuildingName: "",
    type: TYPE_DEFENCE
  }
  ];

  export const initialFlags: GameFlags = {
   initialMessage: false,
   unlockedLevel2Collector: false,
   unlockedDefences: false,
   elementalAttack: false,
   dead: false
  }