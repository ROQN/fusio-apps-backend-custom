import {Component} from '@angular/core';
import {Action_Index_Entry} from "fusio-sdk/dist/src/generated/backend/Action_Index_Entry";
import {Form_Container} from "fusio-sdk/dist/src/generated/backend/Form_Container";
import {Action} from "fusio-sdk/dist/src/generated/backend/Action";
import {AxiosResponse} from "axios";
import {Message} from "fusio-sdk/dist/src/generated/backend/Message";
import {Form_Query} from "fusio-sdk/dist/src/generated/backend/Form_Query";
import {HelpComponent, Modal} from "ngx-fusio-sdk";
import Client from "fusio-sdk/dist/src/generated/backend/Client";

@Component({
  selector: 'app-action-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent extends Modal<Client, Action> {

  actions?: Array<Action_Index_Entry>;
  form?: Form_Container;
  entityClass?: string;
  custom: boolean = false;

  override async ngOnInit(): Promise<void> {
    const action = await this.fusio.getClient().backendAction();
    const response = await action.getBackendActionList().backendActionActionGetIndex();
    this.actions = response.data.actions;

    if (this.entity.class) {
      this.loadConfig(this.entity.class);
    }
  }

  protected async create(entity: Action): Promise<AxiosResponse<Message>> {
    const group = await this.fusio.getClient().backendAction();
    return await group.getBackendAction().backendActionActionCreate(entity);
  }

  protected async update(entity: Action): Promise<AxiosResponse<Message>> {
    const group = await this.fusio.getClient().backendAction();
    return await group.getBackendActionByActionId('' + entity.id).backendActionActionUpdate(entity);
  }

  protected async delete(entity: Action): Promise<AxiosResponse<Message>> {
    const group = await this.fusio.getClient().backendAction();
    return await group.getBackendActionByActionId('' + entity.id).backendActionActionDelete();
  }

  protected newEntity(): Action {
    return {
      name: '',
      class: '',
      async: false,
      engine: 'Fusio\\Engine\\Factory\\Resolver\\PhpClass',
      config: {}
    };
  }

  async changeClass(classString?: string) {
    this.entity.config = {};
    this.loadConfig(classString);
  }

  async loadConfig(classString?: string) {
    if (!classString) {
      return;
    }

    const query: Form_Query = {
      class: classString
    };

    const action = await this.fusio.getClient().backendAction();
    const response = await action.getBackendActionForm().backendActionActionGetForm(query);
    this.form = response.data;

    const hasChanged = this.entityClass && this.entityClass !== this.entity.class;
    this.entityClass = this.entity.class;

    if (hasChanged) {
      this.entity.config = {};
    }
  }

  showHelp() {
    let className = this.entity.class;
    if (className) {
      let action = this.actions?.find((action) => {
        return action.class === className;
      })

      if (action && action.name) {
        const modalRef = this.modalService.open(HelpComponent, {
          size: 'lg'
        });
        modalRef.componentInstance.path = 'api/action/' + action.name.toLowerCase();
      }
    }
  }
}
