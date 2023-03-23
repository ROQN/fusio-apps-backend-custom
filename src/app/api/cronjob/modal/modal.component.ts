import {Component} from '@angular/core';
import {Action} from "fusio-sdk/dist/src/generated/backend/Action";
import {Cronjob as CronjobBase} from "fusio-sdk/dist/src/generated/backend/Cronjob";
import {AxiosResponse} from "axios";
import {Message} from "fusio-sdk/dist/src/generated/backend/Message";
import {Modal} from "ngx-fusio-sdk";
import Client from "fusio-sdk/dist/src/generated/backend/Client";
import {Cronjob_Error} from "fusio-sdk/dist/src/generated/backend/Cronjob_Error";
import * as $ from "jquery";

class Cronjob implements CronjobBase {
  id?: number;
  name?: string;
  cron?: string;
  action?: string;
  executeDate?: string;
  exitCode?: number;
  errors?: Array<Cronjob_Error>;

  targetSystemEndpoint?: string;
  targetSystemMethod?: string;
  targetSystemType?: string;
  targetSystemAuth?: string;
  targetSystemAuthUsername?: string;
  targetSystemAuthPassword?: string;
  targetSystemFormat?: string;
  sourceSystemMethod?: string;
  sourceSystemEndpoint?: string;

  sourceSystemAuthUsername?: string;

  sourceSystemAuthPassword?: string;
  sourceSystemFields?: string;
  active?: number;
  loggerLevel?: number;
}

@Component({
  selector: 'app-cronjob-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent extends Modal<Client, Cronjob> {

  actions?: Array<Action>;

  override async ngOnInit(): Promise<void> {
    const action = await this.fusio.getClient().backendAction();
    const response = await action.getBackendAction().backendActionActionGetAll({count: 1024});
    this.actions = response.data.entry;

    this.initFormData();
  }

  private initFormData() {
    const sourceSystemFields = $('#source-system-fields').val();

    const defaultData = JSON.parse(<string>sourceSystemFields);

    if (defaultData?.data?.length) {
      for (const fieldItem of defaultData?.data) {
        $('.field-name-js:first').val(fieldItem.fieldName);
        $('.field-data-js:first').val(fieldItem.fieldData);
        $('.plus-js:first').trigger('click');
      }
    }

    $('body').on('click', '.minus-js', function () {
      $(this).closest('.source-system-field-row-js').remove();
    });
  }

  protected async create(entity: Cronjob): Promise<AxiosResponse<Message>> {
    this.initSourceSystemFields(entity);
    const group = await this.fusio.getClient().backendCronjob();
    return await group.getBackendCronjob().backendActionCronjobCreate(entity);
  }

  protected async update(entity: Cronjob): Promise<AxiosResponse<Message>> {
    this.initSourceSystemFields(entity);
    const group = await this.fusio.getClient().backendCronjob();
    return await group.getBackendCronjobByCronjobId('' + entity.id).backendActionCronjobUpdate(entity);
  }

  private initSourceSystemFields(entity: Cronjob) {
    const sourceSystemFields = $('#source-system-fields').val();

    Object.assign(entity, {sourceSystemFields})
  }

  protected async delete(entity: Cronjob): Promise<AxiosResponse<Message>> {
    const group = await this.fusio.getClient().backendCronjob();
    return await group.getBackendCronjobByCronjobId('' + entity.id).backendActionCronjobDelete();
  }

  protected newEntity(): Cronjob {
    return {
      name: '',
      cron: '',
      action: ''
    };
  }

  addSourceSystemFieldClick() {
    const row = $('.source-system-field-row-js:first');

    const nameValue = row.find('.field-name-js').val();

    if (nameValue == '') {
      alert('Name is empty');
    } else {
      const $row = row.clone();

      $row.find('.plus-js').closest('a').remove();
      $row.find('a.minus-js').show();

      $(row).find('input').val('');
      $('.source-system-field-row-js:last').after($row);
    }
  }

  saveClick() {
    const fieldsWrapperData = $('.source-system-field-rows-js').clone();

    fieldsWrapperData.find('.source-system-field-row-js:first').remove();

    const fieldsData = {data: <any>[]};
    fieldsWrapperData.find('.source-system-field-row-js').each(function () {
      fieldsData.data.push({fieldName: $(this).find('.field-name-js').val(), fieldData: $(this).find('.field-data-js').val()})
    });

    const preparedData = JSON.stringify(fieldsData);

    $('#source-system-fields').val(preparedData);

    this.submit().then(r => {});
  }
}
