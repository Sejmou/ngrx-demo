import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import * as AuthActions from './auth.actions';

// was originally in AuthService
export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable()// providedIn root is NOT what we need here -> will never be injected itself, but things need to be injected into it -> works only with decorator!
export class AuthEffects {
    // this is an example of an effect (kind of an "action handler")
    // required to make ngrx understand that this is an effect that can be handled and subcribed to etc.
    @Effect()// TODO: replace deprecated decorator with createEffect()!
    authLogin = this.actions$.pipe(// don't subscribe, this will be done automatically!
        // ONLY continue in this observable chain if action received is ofType AuthActions.LOGIN_START
        // all other actions will not trigger this effect (note that we can also provide multiple actions)
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            // return a new observable using httpClient to send login request -> copy code from authService!
            return this.http
                .post<AuthResponseData>(
                    'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=' + environment.firebaseAPIKey,
                    {
                        email: authData.payload.email,
                        password: authData.payload.password,
                        returnSecureToken: true
                    }
                ).pipe(
                    map(resData => {
                        const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
                        // make map return an Observable for Login action (will be dispatched automatically)
                        return new AuthActions.Login({
                            email: resData.email,
                            userId: resData.localId,
                            token: resData.idToken,
                            expirationDate
                        });
                    }),
                    // important: we have to handle errors on this inner observable!
                    catchError(errorRes => {
                        // here we have to return a non-error Observable so that our Observable stream doesn't die!
                        // this way switchMap returns a non-error Observable to the outer Observable
                        // simply return an Observable of some Action here (will be dispatched automatically)

                        // error message extraction copied from auth.service
                        let errorMessage = 'An unknown error occurred!';
                        if (!errorRes.error || !errorRes.error.error) {
                            // return throwError(errorMessage);// must not throw error here, instead return non-error observable
                            of(new AuthActions.LoginFail(errorMessage));
                        }
                        switch (errorRes.error.error.message) {
                            case 'EMAIL_EXISTS':
                                errorMessage = 'This email exists already';
                                break;
                            case 'EMAIL_NOT_FOUND':
                                errorMessage = 'This email does not exist.';
                                break;
                            case 'INVALID_PASSWORD':
                                errorMessage = 'This password is not correct.';
                                break;
                        }
                        // return throwError(errorMessage);
                        return of(new AuthActions.LoginFail(errorMessage));// of is a utility function for creating a new non-error Observable
                    })
                );
        }),
        // normally for simple http requests we could use catchError operator to handle errors (on next try new Observable would be created)
        // catchError(doSomething) -> doing something like this is not enough as Observable would die, this must NOT happen in ngrx!
    );

    @Effect({ dispatch: false })//this effect will not dispatch an action
    authSuccess = this.actions$.pipe(
        ofType(AuthActions.LOGIN),
        tap(() => this.router.navigate(['/']))
    )

    /**
     * 
     * @param actions$ can be thought of as a stream of dispatched actions (e.g. action to send HTTP request followed by action to handle success or action to handle failures )
     */
    constructor(private actions$: Actions, private http: HttpClient, private router: Router) { }
}