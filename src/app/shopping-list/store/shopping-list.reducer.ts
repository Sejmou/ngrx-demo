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
export function shoppingListReducer(state = initialState, action: ShoppingListActions.AddIngredient) {
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
  }
}
