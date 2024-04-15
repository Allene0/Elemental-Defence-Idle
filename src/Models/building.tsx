export interface Building {
    id: number;
    name: string;
    description: string;
    available: boolean;
    amountOwned: number; //Also health for the wall
    speed: number;
    initialCost: number;
    baseCost: number;
    currentCost: number;
    costsBuildingId: number; //ID for what building combines into this one, 0 if none.
    costsBuildingName: string; //Blank if none
    type: number; //Collector or Defense
}