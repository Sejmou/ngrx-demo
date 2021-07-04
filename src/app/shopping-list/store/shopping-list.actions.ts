import { Action } from '@ngrx/store';

import { Ingredient } from 'src/app/shared/ingredient.model';

//avoid stupid typos by exporting action name (import it wherever action is needed (reducer?))
export const ADD_INGREDIENT = 'ADD_INGREDIENT';

export class AddIngredient implements Action {
    readonly type = ADD_INGREDIENT;

    //the payload is simply the ingredient to add
    payload: Ingredient;
}