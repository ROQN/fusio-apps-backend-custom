import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Scope_Category} from "fusio-sdk/dist/src/generated/backend/Scope_Category";
import {Scope_Category_Scope} from "fusio-sdk/dist/src/generated/backend/Scope_Category_Scope";
import {FusioService} from "../../fusio.service";

@Component({
  selector: 'app-scope-categories',
  templateUrl: './scope-categories.component.html',
  styleUrls: ['./scope-categories.component.css']
})
export class ScopeCategoriesComponent implements OnInit {

  @Input() scopes?: Array<string>;
  @Output() dataChange = new EventEmitter<any>();

  categories?: Array<Scope_Category>;
  selected: Array<string> = [];
  selectedCategory: number = 1;
  toggleScope: boolean = true;

  constructor(protected fusio: FusioService) {
  }

  async ngOnInit(): Promise<void> {
    const scope = await this.fusio.getClient().backendScope();
    const response = await scope.getBackendScopeCategories().backendActionScopeGetCategories();
    this.categories = response.data.categories;
    if (this.scopes) {
      this.selected = this.scopes;
    }
  }

  scopeSelect(event: any, scope?: string) {
    const selected = event.target.checked;
    if (!scope) {
      return;
    }

    if (selected) {
      this.addScope(scope);
    } else {
      this.removeScope(scope);
    }

    this.dataChange.emit(this.selected)
  }

  toggleScopes(scopes?: Array<Scope_Category_Scope>) {
    if (!scopes) {
      return;
    }

    scopes.forEach((scope) => {
      if (!scope.name) {
        return;
      }
      if (this.toggleScope) {
        this.addScope(scope.name);
      } else {
        this.removeScope(scope.name);
      }
    });

    this.dataChange.emit(this.selected)
    this.toggleScope = !this.toggleScope;
  }

  private addScope(scope: string) {
    this.selected.push(scope)
  }

  private removeScope(scope: string) {
    this.selected = this.selected.filter((value) => {
      return value !== scope;
    });
  }
}
