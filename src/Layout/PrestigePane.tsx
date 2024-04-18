import { Button, Grid} from 'semantic-ui-react';
import { GameState } from '../Models/gameState';
import {TYPE_COLLECTOR, collectorCombinationCost, TYPE_DEFENCE, TYPE_WALL} from "../Models/constants";

interface Props {
    gameState: GameState;
    buyPerk: (id: number) => void;
}

export default function NavBar({ gameState, buyPerk }: Props) {
    return (
        <Grid padded celled="internally" className="prestige-menu">
            {gameState.prestige.perks.map((prestige) => {
                return ( //Second return is needed because consumedBuilding had to be looked up
                    <Grid.Row key={prestige.id} className="collector-item">

                    </Grid.Row>
                );
            })}
        </Grid>
    )
}