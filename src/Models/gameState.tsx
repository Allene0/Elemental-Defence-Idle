import { Building } from "./building";
import { GameFlags } from "./gameFlags";

export interface GameState {
    essence: number;
    totalEssenceCollected: number;
    essencePerSecond: number;
    health: number;
    buildings: Building[];
    flags: GameFlags;
}