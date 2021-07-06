import { Action } from '@ngrx/store';

import { Ingredient } from '../../shared/ingredient.model';
//import actions this reducer may react to
import * as ShoppingListActions from './shopping-list.actions';

export interface AppState {
  shoppingList: State
}

export interface State {
  ingredients: Ingredient[],
  editedIngredient: Ingredient,
  editedIngredientIndex: number
}

const initialState: State = {
  ingredients: [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10),
  ],
  editedIngredient: null,
  editedIngredientIndex: -1
};

//func will be called w/ init state only on first call to reducer
export function shoppingListReducer(state: State = initialState, action: ShoppingListActions.ShoppingListActions): State {
  switch (action.type) {
    //why the switch statement, if we only accept AddIngredient action?!?!?!?!
    case ShoppingListActions.ADD_INGREDIENT:
      //don't mutate existing state, return NEW one (copy) w/ changes applied
      return {
        //copy old state...
        ...state,
        ingredients: [
          //copy old state
          ...state.ingredients,
          //add new ingredient stored in payload
          action.payload
        ]
      };

    case ShoppingListActions.ADD_INGREDIENTS:
      return {
        ...state,
        ingredients: [
          ...state.ingredients,
          ...action.payload
        ]
      };

    case ShoppingListActions.UPDATE_INGREDIENT:
      const ingredient = state.ingredients[state.editedIngredientIndex];
      const updateIngredient = {
        ...ingredient, // copy old data
        ...action.payload // overwrite with new data
      };
      const updatedIngredients = [...state.ingredients]; // copy array of ingredients
      updatedIngredients[state.editedIngredientIndex] = updateIngredient; //replace updated ingredient
      return {
        ...state,
        ingredients: updatedIngredients,
        //if update finished reset editedIngredient (+ index)
        editedIngredientIndex: -1,
        editedIngredient: null
      };

    case ShoppingListActions.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((ig, i) => i !== state.editedIngredientIndex),
        //if delete finished reset editedIngredient (+ index)
        editedIngredientIndex: -1,
        editedIngredient: null
      };

    case ShoppingListActions.START_EDIT:
      return {
        ...state,
        editedIngredientIndex: action.payload,
        //important: COPY edited ingredient
        editedIngredient: { ...state.ingredients[action.payload] }
      };

    case ShoppingListActions.STOP_EDIT:
      return {
        ...state,
        //reset to initial values
        editedIngredient: null,
        editedIngredientIndex: -1
      };
  }

  //fallback, should only be reached on store init in practice
  return state;
}
