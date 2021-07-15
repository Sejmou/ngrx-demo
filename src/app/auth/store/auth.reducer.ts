import { Action } from "@ngrx/store";
import { User } from "../user.model";
import * as AuthActions from './auth.actions';

export interface State {
    user: User
}

const initialState = {
    user: null
}

export function authReducer(state = initialState, action: AuthActions.AuthActions) {
    // console.log(state);// comment this out to see that the authReducer is essentially called on EVERY action that is dispatched on the store
    //an implication of the fact that every reducer is called if some arbitrary action is dispatched on the store is that actions have to be unique across the whole app!
    // dispatching an action with a non-unique name would trigger many reducers simultaneously (one for each duplication of the action's name) 
    switch (action.type) {
        case AuthActions.LOGIN:
            const user = new User(
                action.payload.email,
                action.payload.userId,
                action.payload.token,
                action.payload.expirationDate
            );
            return {
                ...state,
                user
            }
        case AuthActions.LOGOUT:
            return {
                ...state,
                user: null
            }
    }

    return state;//note that this is reached as 
}