import { Building } from "./building";
import { Elementals } from "./elementals";
import { GameFlags } from "./gameFlags";

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
    combinedBuildingPriceIncrease: number;
}