import {Component} from '@angular/core';
import {List} from "ngx-fusio-sdk";
import Client from "fusio-sdk/dist/src/generated/backend/Client";
import {Cronjob} from "fusio-sdk/dist/src/generated/backend/Cronjob";
import {Collection_Category_Query} from "fusio-sdk/dist/src/generated/backend/Collection_Category_Query";
import {AxiosResponse} from "axios";
import {Collection} from "fusio-sdk/dist/src/generated/backend/Collection";
import {ModalComponent} from "../modal/modal.component";

@Component({
  selector: 'app-cronjob-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent extends List<Client, Cronjob> {

  protected async getAll(query: Collection_Category_Query): Promise<AxiosResponse<Collection<Cronjob>>> {
    const group = await this.fusio.getClient().backendCronjob();
    return await group.getBackendCronjob().backendActionCronjobGetAll(query);
  }

  protected async get(id: string): Promise<AxiosResponse<Cronjob>> {
    const group = await this.fusio.getClient().backendCronjob();
    return await group.getBackendCronjobByCronjobId(id).backendActionCronjobGet();
  }

  protected getDetailComponent(): any {
    return ModalComponent;
  }

  protected getRoute(): any {
    return '/cronjob';
  }

}
