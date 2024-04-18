import { Button, Grid} from 'semantic-ui-react';
import { GameState } from '../Models/gameState';
//import { Building } from '../Models/building';
import {TYPE_COLLECTOR, collectorCombinationCost, TYPE_DEFENCE, TYPE_WALL} from "../Models/constants";

interface Props {
    gameState: GameState;
    buyBuilding: (id: number) => void;
}

export default function NavBar({ gameState, buyBuilding }: Props) {
    return (
        <Grid padded celled="internally" className="collector-menu">
            {gameState.buildings.filter((building) => building.available).map((building) => {
                //Need to look up what building is consumed if any
                const consumedBuilding = gameState.buildings.find(x => x.id === building.costsBuildingId);
                return ( //Second return is needed because consumedBuilding had to be looked up
                    <Grid.Row key={building.id} className="collector-item">
                        <Grid.Column width="16">
                            <div className="collector-header">{building.name}</div>
                            <div className="collector-description">{building.description}</div>
    
                            {building.type === TYPE_DEFENCE && (
                                <div className="collector-description">
                                    Deals {building.speed} damage per second
                                </div>
                            )}
    
                            {building.type === TYPE_COLLECTOR && (
                                <div className="collector-description">
                                    Collects {building.speed} essence per second
                                </div>
                            )}

                            {building.type === TYPE_WALL ? (
                                <div className="collector-description">Health: {building.amountOwned * 100}</div>
                            ) : (
                                <div className="collector-description">Owned: {building.amountOwned}</div>
                            )}
    
                            {/* Conditional rendering for building cost */}
                            {building.costsBuildingId === 0 ? (
                                <div className="collector-description">
                                    Cost: {Math.ceil(building.currentCost)} essence
                                </div>
                            ) : (
                                <div className="collector-description">
                                    Cost: {Math.ceil(building.currentCost)} essence, {collectorCombinationCost} Collectors
                                </div>
                            )}
    
                            {/* Conditional rendering for the buy button */}
                            <div className="collector-menu-button">
                                {building.costsBuildingId === 0 ? (
                                    <Button
                                        onClick={() => buyBuilding(building.id)}
                                        content="Buy"
                                        color={gameState.essence >= building.currentCost ? 'blue' : 'grey'}
                                        disabled={gameState.essence < building.currentCost}
                                    />
                                ) : (
                                    <Button
                                        onClick={() => buyBuilding(building.id)}
                                        content="Buy"
                                        color={
                                            gameState.essence >= building.currentCost &&
                                            consumedBuilding &&
                                            consumedBuilding.amountOwned >= collectorCombinationCost ? 'blue' : 'grey'
                                        }
                                        disabled={
                                            gameState.essence < building.currentCost || !consumedBuilding || consumedBuilding.amountOwned < collectorCombinationCost
                                        }
                                    />
                                )}
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                );
            })}
        </Grid>
    );
}