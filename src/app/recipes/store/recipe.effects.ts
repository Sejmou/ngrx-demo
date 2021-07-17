import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, switchMap, withLatestFrom } from "rxjs/operators";
import { Recipe } from "../recipe.model";

import * as RecipeActions from '../store/recipe.actions';
import * as fromApp from 'src/app/store/app.reducer';

@Injectable()
export class RecipeEffects {
    @Effect()
    fetchRecipes = this.actions$.pipe(
        ofType(RecipeActions.FETCH_RECIPES),
        switchMap(() => {
            return this.http
                .get<Recipe[]>(
                    'https://example-recipe-app-default-rtdb.europe-west1.firebasedatabase.app/recipes.json'
                )
                .pipe(
                    map(recipes => {
                        return recipes.map(recipe => {
                            return {
                                ...recipe,
                                ingredients: recipe.ingredients ? recipe.ingredients : []
                            };
                        });
                    }),
                    map(recipes => new RecipeActions.SetRecipes(recipes))
                );
        })
    );

    @Effect({ dispatch: false })
    storeRecipes = this.actions$.pipe(
        ofType(RecipeActions.STORE_RECIPES),

        //this operator allows us to merge a value from another Observable into this ObersvableStream
        withLatestFrom(this.store.select('recipes')),
        switchMap(([actionData, recipesState]) => {
            return this.http
                .put(
                    'https://example-recipe-app-default-rtdb.europe-west1.firebasedatabase.app/recipes.json',
                    recipesState.recipes
                )
        })
    );

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<fromApp.AppState>
    ) { }
}