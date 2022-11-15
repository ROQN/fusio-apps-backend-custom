import {Component, ElementRef, OnInit} from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'swagger-modal-dialog',
  templateUrl: 'swagger-modal.component.html',
})
export class SwaggerModalComponent implements OnInit {
  constructor(private elem: ElementRef) {
  }

  public ngOnInit() {
    this.initFormData();
    this.onTypeParameterChange();
    this.onDefaultValueChange();
  }

  private queryStringToJSON(qs: string) {
    qs = qs || location.search.slice(1);

    const pairs = qs.split('&');
    const result: any = {};

    pairs.forEach(function (p) {
      const pair = p.split('=');
      const key = pair[0];
      const value = decodeURIComponent(pair[1] || '');

      if (result[key]) {
        if (Object.prototype.toString.call(result[key]) === '[object Array]') {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    });

    return JSON.parse(JSON.stringify(result));
  }

  private initFormData() {
    const activeMethod = $('.modal-body form .tab-content .nav-tabs a.nav-link.active').text();
    const swaggerSettings = $(`.method-${activeMethod}-swagger-settings-js`).val();

    const defaultData = this.queryStringToJSON(decodeURI(<string>swaggerSettings));

    if (defaultData.tag) {
      $('.tag-js').val(defaultData.tag);
    }

    if (defaultData['name[]']) {
      const nameList = (typeof defaultData['name[]'] === 'string')
        ? [typeof defaultData['name[]']] : defaultData['name[]'];

      for (const i in nameList) {
        const name = nameList[i];
        const parameter = defaultData['parameter[]'][parseInt(i) + 1];
        const fieldType = defaultData['fieldType[]'][parseInt(i) + 1];
        const description = defaultData['description[]'][i];
        const defaultValue = defaultData['defaultValue[]'][i];

        $('.field-name-js:first').val(name);
        $(".type-parameter-js:first option[value=" + parameter + "]")
          .attr("selected", "selected")
          .trigger('change');

        $(".field-type-js:first option[value=" + fieldType + "]")
          .attr("selected", "selected")
          .trigger('change');

        $('.description-js:first').val(description);
        $('.default-value-js:first').val(defaultValue);
        $('.plus-js:first').trigger('click');
      }
    }
  }

  private onTypeParameterChange() {
    $('body').on('change', '.type-parameter-js', function () {
      const parameterType = $(this).val();
      if (parameterType !== 'header') {
        $(this).closest('.row-js').find('.field-type-js option').removeAttr('disabled');
      } else {
        $(this).closest('.row-js').find('.field-type-js option').each(function (item) {
          if ($(this).val() !== 'string') {
            $(this).prop('disabled', true);
          }
        });
      }
    });
  }

  private onDefaultValueChange() {
    const $this = this;
    $('body').on('change', '.default-value-js', function () {
      const nameValue = $(this).closest('.row-js').find('.field-name-js').val();
      const typeParameterValue = $(this).closest('.row-js').find('.type-parameter-js').val();

      const useDescription = $this.getUseDescription(typeParameterValue, nameValue, $(this).val());

      $(this).closest('.row-js').find('.help-use-js').attr('title', useDescription);
    });
  }

  addRowClick() {
    const rows = this.elem.nativeElement.querySelectorAll('.row-js');

    const row = rows[0];
    const nameValue = row.querySelector('.field-name-js').value;
    const typeParameterValue = row.querySelector('.type-parameter-js').value;
    const fieldTypedValue = row.querySelector('.field-type-js').value;
    const defaultValue = row.querySelector('.default-value-js').value;

    if (nameValue == '') {
      alert('Name is empty');
    } else {
      const $row = $(row.cloneNode(true));

      $row.find(".type-parameter-js option[value=" + typeParameterValue + "]").attr("selected", "selected");
      $row.find(".field-type-js option[value=" + fieldTypedValue + "]").attr("selected", "selected");
      $row.find('a.btn').remove();

      const useDescription = this.getUseDescription(typeParameterValue, nameValue, defaultValue);
      $row.append(`<button class="btn btn-outline-secondary help-use-js" type="button" title="${useDescription}"><i class="bi bi-question"></i></button>`);

      $(row).find('input').val('');
      $(row).find('select option:selected').removeAttr('selected');

      $('.row-js:last').after($row);
    }
  }

  saveClick() {
    const data = $('.swagger-settings-js input, .swagger-settings-js select').serialize();

    const activeMethod = $('.modal-body form .tab-content .nav-tabs a.nav-link.active').text();
    $(`.method-${activeMethod}-swagger-settings-js`).val(data);

    this.closeClick();
  }

  closeClick() {
    $('.d-block.modal.fade.show:last').trigger('click');
  }

  getUseDescription(typeParameterValue: string | number | string[] | undefined, nameValue: string | number | string[] | undefined, value?: string | number | string[] | undefined): string {
    const defaultValue = value ? `|${value}` : '';
    switch (typeParameterValue) {
      case 'header':
        return `{header_parameter:${nameValue}${defaultValue}`;
      case 'query':
        return `{url_parameter:${nameValue}${defaultValue}}`;
      case 'body':
        return `{body_parameter_form:${nameValue}${defaultValue}}`;
      default:
        return '';
    }
  }
}
