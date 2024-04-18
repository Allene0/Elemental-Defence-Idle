import { Building } from "./building";
import { Elementals } from "./elementals";
import { GameFlags } from "./gameFlags";
import { Prestige } from "./prestige";

export interface GameState {
    essence: number;
    totalEssenceCollected: number;
    totalDamageDealt: number;
    essencePerSecond: number;
    damagePerSecond: number;
    maxDamagePerSecond: number;
    wallHealth: number;
    buildings: Building[];
    flags: GameFlags;
    elementals: Elementals;
    prestige: Prestige;
    combinedBuildingPriceIncrease: number;
    essensePerClick: number;
}