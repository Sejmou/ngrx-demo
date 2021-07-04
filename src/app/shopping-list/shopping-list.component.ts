import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './shopping-list.service';
import { LoggingService } from '../logging.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit {
  ingredients: Observable<{ ingredients: Ingredient[] }>;

  // not needed anymore when using store!
  // private subscription: Subscription;

  constructor(
    private slService: ShoppingListService,
    private loggingService: LoggingService,
    private store: Store<{ shoppingList: { ingredients: Ingredient[] } }>
  ) { }

  ngOnInit() {
    //store's selector gives us an observable for the part of the store we are interested in
    this.ingredients = this.store.select('shoppingList');

    // we can get rid of those lines of code:
    // this.ingredients = this.slService.getIngredients();
    // this.subscription = this.slService.ingredientsChanged.subscribe(
    //   (ingredients: Ingredient[]) => {
    //     this.ingredients = ingredients;
    //   }
    // );

    this.loggingService.printLog('Hello from ShoppingListComponent ngOnInit!');
  }

  onEditItem(index: number) {
    this.slService.startedEditing.next(index);
  }

  // we get rid of that too, Angular/ngRx unsubscribe from store's select() automatically :)
  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }
}
