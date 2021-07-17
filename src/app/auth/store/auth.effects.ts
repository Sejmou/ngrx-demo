import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import * as AuthActions from './auth.actions';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

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

const handleAuthentication = (resData: AuthResponseData) => {
    const { email, localId: userId, idToken: token, expiresIn } = resData;

    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);

    localStorage.setItem('userData', JSON.stringify(new User(email, userId, token, expirationDate)));

    return new AuthActions.AuthenticateSuccess({
        email: resData.email,
        userId: resData.localId,
        token: resData.idToken,
        expirationDate
    });
}

const handleError = errorRes => {
    // adapted from auth.service
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
        // must not throw error here, instead return non-error observable
        // of() is a utility function for creating a new non-error Observable
        of(new AuthActions.AuthenticateFail(errorMessage));
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
    return of(new AuthActions.AuthenticateFail(errorMessage));
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
                    tap(resData => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
                    map(handleAuthentication),
                    // important: we have to handle errors on this inner observable!
                    catchError(handleError)
                );
        }),
        // normally for simple http requests we could use catchError operator to handle errors (on next try new Observable would be created)
        // catchError(doSomething) -> doing something like this is not enough as Observable would die, this must NOT happen in ngrx!
    );

    @Effect({ dispatch: false })//this effect will not dispatch an action
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap(() => this.router.navigate(['/']))
    );

    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            // copied and adapted from auth.service.ts
            return this.http
                .post<AuthResponseData>(
                    'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=' + environment.firebaseAPIKey,
                    {
                        email: signupAction.payload.email,
                        password: signupAction.payload.password,
                        returnSecureToken: true
                    }
                ).pipe(
                    tap(resData => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
                    map(handleAuthentication),
                    catchError(handleError)
                );
        })
    );

    @Effect()
    autoLogin = this.actions$.pipe(
        ofType(AuthActions.AUTO_LOGIN),
        map(() => {
            // copied and adapted from auth.service
            const userData: {
                email: string;
                id: string;
                _token: string;
                _tokenExpirationDate: string;
            } = JSON.parse(localStorage.getItem('userData'));
            if (!userData) {
                return { type: 'DUMMY ACTION' };
            }

            const loadedUser = new User(
                userData.email,
                userData.id,
                userData._token,
                new Date(userData._tokenExpirationDate)
            );

            if (loadedUser.token) {
                const expirationDuration =
                    new Date(userData._tokenExpirationDate).getTime() -
                    new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration);

                // we simply return the desired action, don't have to dispatch it ourselves
                return new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpirationDate)
                });
            }
            else return { type: 'DUMMY ACTION' };
        })
    );

    @Effect({ dispatch: false })
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        })
    );

    /**
     * 
     * @param actions$ can be thought of as a stream of dispatched actions (e.g. action to send HTTP request followed by action to handle success or action to handle failures )
     */
    constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) { }
}