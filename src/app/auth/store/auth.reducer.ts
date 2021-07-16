import { Action } from "@ngrx/store";
import { User } from "../user.model";
import * as AuthActions from './auth.actions';

export interface State {
    user: User,
    authError: string,
    loading: boolean
}

const initialState: State = {
    user: null,
    authError: null,
    loading: false
}

export function authReducer(state = initialState, action: AuthActions.AuthActions): State {
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
                user,
                authError: null,
                loading: false
            }
        case AuthActions.LOGOUT:
            return {
                ...state,
                user: null
            }
        case AuthActions.LOGIN_START:
            return {
                ...state,
                authError: null,
                loading: true
            }
        case AuthActions.LOGIN_FAIL:
            return {
                ...state,
                user: null,
                authError: action.payload,
                loading: false
            }
    }

    return state;//note that this is reached on every dispatch of some action (even if it's not an AuthAction at all!)
}