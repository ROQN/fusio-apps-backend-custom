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
    this.onRequireChange();
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

    const defaultData = JSON.parse(<string>swaggerSettings);

    if (defaultData.tag) {
      $('.tag-js').val(defaultData.tag);
    }

    if (defaultData.type_json) {
      $('#type-json').attr('checked', 'checked');
    }

    if (defaultData.type_www_form) {
      $('#type-www-form').attr('checked', 'checked');
    }

    if (defaultData['names']) {
      const nameList = (typeof defaultData['names'] === 'string')
        ? [typeof defaultData['names']] : defaultData['names'];

      for (const i in nameList) {
        const name = nameList[i];
        const parameter = (typeof defaultData['parameters'] === 'string' ? defaultData['parameters'] : defaultData['parameters'][i]);
        const fieldType = (typeof defaultData['fieldTypes'] === 'string' ? defaultData['fieldTypes'] : defaultData['fieldTypes'][i]);
        const description = (typeof defaultData['descriptions'] === 'string' ? defaultData['descriptions'] : defaultData['descriptions'][i]);
        const defaultValue = (typeof defaultData['defaultValues'] === 'string' ? defaultData['defaultValues'] : defaultData['defaultValues'][i]);
        const require = defaultData['requires'] ? parseInt(typeof defaultData['requires'] === 'string' ? defaultData['requires'] : defaultData['requires'][i]) : 0;
        $('.field-name-js:first').val(name);
        $(".type-parameter-js:first option[value=" + parameter + "]")
          .attr("selected", "selected")
          .trigger('change');

        $(".field-type-js:first option[value=" + fieldType + "]")
          .attr("selected", "selected")
          .trigger('change');

        $('.description-js:first').val(description);
        $('.default-value-js:first').val(defaultValue);
        $('.require-js:first').prop('checked', !!require);

        $('.plus-js:first').trigger('click');
      }
    }

    $('body').on('click', '.minus-js', function () {
      $(this).closest('.row-js').remove();
    });
  }

  private onTypeParameterChange() {
    $('body').on('change', '.type-parameter-js', function () {
      const parameterType = $(this).val();
      if (parameterType !== 'header' && parameterType !== 'body_parameter_raw' && parameterType !== 'body_parameter_binary') {
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

  private onRequireChange() {
    $('body').on('change', '.require-js', function () {
      const requireValueField = $(this).closest('.require-block-js').find('.require-value-js');
      if ($(this).is(':checked')) {
        requireValueField.val(1);
      } else {
        requireValueField.val(0);
      }
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
      $row.find('.plus-js').closest('a').remove();
      $row.find('a.minus-js').show();

      const useDescription = this.getUseDescription(typeParameterValue, nameValue, defaultValue);
      $row.append(`<button class="btn btn-outline-secondary help-use-js" type="button" title="${useDescription}"><i class="bi bi-question"></i></button>`);

      const requireField = $row.find('.require-js');
      const requireValueField = requireField.closest('.require-block-js').find('.require-value-js');
      if (requireField.is(':checked')) {
        requireValueField.val(1);
      } else {
        requireValueField.val(0);
      }

      $(row).find('input').val('');
      $(row).find('select option:selected').removeAttr('selected');

      $('.row-js:last').after($row);
    }
  }

  saveClick() {
    const swaggerData = $('.swagger-settings-js');
    swaggerData.find('.row-js:first').remove();

    const data = swaggerData.find('input, select').serialize();

    const preparedData = JSON.stringify(this.queryStringToJSON(decodeURI(<string>data)));

    const activeMethod = $('.modal-body form .tab-content .nav-tabs a.nav-link.active').text();

    $(`.method-${activeMethod}-swagger-settings-js`).val(preparedData);

    this.closeClick();
  }

  closeClick() {
    $('.d-block.modal.fade.show:last').trigger('click');
  }

  getUseDescription(typeParameterValue: string | number | string[] | undefined, nameValue: string | number | string[] | undefined, value?: string | number | string[] | undefined): string {
    const defaultValue = value ? `|${value}` : '';
    switch (typeParameterValue) {
      case 'header':
        return `{header_parameter:${nameValue}${defaultValue}}`;
      case 'query':
        return `{url_parameter:${nameValue}${defaultValue}}`;
      case 'body-form':
        return `{body_parameter_form:${nameValue}${defaultValue}}`;
      case 'body-raw':
        return `{body_parameter_raw:${nameValue}${defaultValue}}`;
      case 'body-binary':
        return `{body_parameter_binary:${nameValue}${defaultValue}}`;
      default:
        return '';
    }
  }
}
