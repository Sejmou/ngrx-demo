import { Action } from '@ngrx/store';

import { Ingredient } from '../../shared/ingredient.model';
//import actions this reducer may react to
import * as ShoppingListActions from './shopping-list.actions';

const initialState = {
  ingredients: [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10),
  ]
};

//func will be called w/ init state only on first call to reducer
export function shoppingListReducer(state = initialState, action: ShoppingListActions.ShoppingListActions) {
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
      const ingredient = state.ingredients[action.payload.index];
      const updateIngredient = {
        ...ingredient, // copy old data
        ...action.payload.ingredient // overwrite with new data
      };
      const updatedIngredients = [...state.ingredients]; // copy array of ingredients
      updatedIngredients[action.payload.index] = updateIngredient; //replace updated ingredient
      return {
        ...state,
        ingredients: updatedIngredients
      };

    case ShoppingListActions.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((ig, i) => i !== action.payload)
      };
  }

  //fallback, should only be reached on store init in practice
  return state;
}
