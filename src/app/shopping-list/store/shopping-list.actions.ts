import { Action } from '@ngrx/store';

import { Ingredient } from 'src/app/shared/ingredient.model';

//avoid stupid typos by exporting action name (import it wherever action is needed (reducer?))
//also, add prefix to avoid naming clashes (action names have to be unique globally!)
export const ADD_INGREDIENT = '[Shopping List] Add Ingredient';
export const ADD_INGREDIENTS = '[Shopping List] Add Ingredients';
export const UPDATE_INGREDIENT = '[Shopping List] Update Ingredient';
export const DELETE_INGREDIENT = '[Shopping List] Delete Ingredient';
export const START_EDIT = '[Shopping List] Start Edit';
export const STOP_EDIT = '[Shopping List] Stop Edit';

export class AddIngredient implements Action {
    readonly type = ADD_INGREDIENT;

    //the payload is simply the ingredient to add
    constructor(public payload: Ingredient) { };
}

export class AddIngredients implements Action {
    readonly type = ADD_INGREDIENTS;

    constructor(public payload: Ingredient[]) { };
}

export class UpdateIngredient implements Action {
    readonly type = UPDATE_INGREDIENT;

    constructor(public payload: Ingredient) { }
}

export class DeleteIngredient implements Action {
    readonly type = DELETE_INGREDIENT;
}

export class StartEdit implements Action {
    readonly type = START_EDIT;

    /**
     * 
     * @param payload index of ingredient to edit
     */
    constructor(public payload: number) { }
}

export class StopEdit implements Action {
    readonly type = STOP_EDIT;
}

export type ShoppingListActions = AddIngredient
    | AddIngredients 
    | UpdateIngredient 
    | DeleteIngredient 
    | StartEdit 
    | StopEdit;