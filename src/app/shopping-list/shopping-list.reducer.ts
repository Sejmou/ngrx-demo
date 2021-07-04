import { Action } from '@ngrx/store';

import { Ingredient } from '../shared/ingredient.model';

const initialState = {
  ingredients: [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10),
  ]
};

//func will be called w/ init state only on first call to reducer
export function shoppingListReducer(state = initialState, action: Action) {
  switch (action.type) {
    //convention for type: CAPS w/ underline
    case 'ADD_INGREDIENT':
      //don't mutate existing state, return NEW one (copy) w/ changes applied
      return {
        //copy old state...
        ...state,
        ingredients: [
          //copy old state
          ...state.ingredients,
          //we will handle this better soon...
          action
        ]
      };
  }
}
