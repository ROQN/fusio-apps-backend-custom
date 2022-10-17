import {Component} from '@angular/core';
import {List} from "ngx-fusio-sdk";
import Client from "fusio-sdk/dist/src/generated/backend/Client";
import {Rate} from "fusio-sdk/dist/src/generated/backend/Rate";
import {Collection_Category_Query} from "fusio-sdk/dist/src/generated/backend/Collection_Category_Query";
import {AxiosResponse} from "axios";
import {Collection} from "fusio-sdk/dist/src/generated/backend/Collection";
import {ModalComponent} from "../modal/modal.component";

@Component({
  selector: 'app-rate-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent extends List<Client, Rate> {

  protected async getAll(query: Collection_Category_Query): Promise<AxiosResponse<Collection<Rate>>> {
    const group = await this.fusio.getClient().backendRate();
    return await group.getBackendRate().backendActionRateGetAll(query);
  }

  protected async get(id: string): Promise<AxiosResponse<Rate>> {
    const group = await this.fusio.getClient().backendRate();
    return await group.getBackendRateByRateId(id).backendActionRateGet();
  }

  protected getDetailComponent(): any {
    return ModalComponent;
  }

  protected getRoute(): any {
    return '/rate';
  }

}
