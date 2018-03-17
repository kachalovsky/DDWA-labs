'use strict';
import {VALIDATION_MESSAGES, VALID_DATE_FORMAT}  from '../constants.js';
import BaseEntity  from '../baseEntity.js';

// function validDateFormat() {
//   return (new Date()).toString(VALID_DATE_FORMAT);
// }

function generateSetTemplateFunction(propertyName) {
  return function (value) {
    this[propertyName] = value;
  }
}
function generateGetTemplateFunction(propertyName) {
  return function () {
    return this[propertyName];
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function tideString(str) {
  return str.replace(/([^a-z0-9]+)/gi, '');
}

//name, dateOfManufacture, shelfTime, description, price, weight
export default class Product extends BaseEntity {
  static get displayName(){
    return 'Другое';
  }

  get id() {
    return this._id;
  }
  set id(value) {
    this._id = value;
  }

  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }

  get dateOfManufacture() {
    return this._dateOfManufacture;
  }
  set dateOfManufacture(value) {
    this._dateOfManufacture = value;
  }

  get shelfTime() {
    return this._shelfTime;
  }
  set shelfTime(value) {
    this._shelfTime = value;
  }

  get description() {
    return this._description;
  }
  set description(value) {
    this._description = value;
  }

  get price() {
    return this._price;
  }
  set price(value) {
    this._price = value;
  }

  get weight() {
    return this._weight;
  }
  set weight(value) {
    this._weight = value;
  }

  toJSON() {
    return ({
      id: this.id,
      name: this.name,
      dateOfManufacture: this.dateOfManufacture,
      shelfTime: this.shelfTime,
      description: this.description,
      price: this.price,
      weight: this.weight,
      type: this.type
    })
  }

  constructor(initialValues) {
    super();
    initialValues = initialValues || {};
    this._id = initialValues.id;
    this._name = initialValues.name;
    this._dateOfManufacture = initialValues.dateOfManufacture;
    this._shelfTime = initialValues.shelfTime;
    this._description = initialValues.description;
    this._price = initialValues.price;
    this._weight = initialValues.weight;
    this.type = 'product';

    this.displayProperties = this.displayProperties.concat(['name', 'dateOfManufacture', 'shelfTime', 'description', 'price', 'weight']);

    this.addValidationCases({
      name: (value) => {
        value = tideString(value);
        if(!value || value === '') return VALIDATION_MESSAGES.PRODUCT.NAME_REQUIRED;
        if(value.lenght < 4) return VALIDATION_MESSAGES.PRODUCT.NAME_REQUIRED;

        return null;
      },
      dateOfManufacture: (value) => {
        if(!value || value === '') return VALIDATION_MESSAGES.PRODUCT.DATE_OF_MANUFACTURE_REQUIRED;
        if(new Date(value) === 'Invalid Date') return VALIDATION_MESSAGES.PRODUCT.DATE_OF_MANUFACTURE_INVALID;

        return null;
      },
      shelfTime: (value) => {
        if(!value || value === '') return VALIDATION_MESSAGES.PRODUCT.SHELF_TIME_REQUIRED;
        if(isNaN(Number(value)) || Number(value) < 0) return VALIDATION_MESSAGES.PRODUCT.SHELF_TIME_SHOULD_BE_NUMBER;
        if(Number(value) !== Math.ceil(value)) return VALIDATION_MESSAGES.PRODUCT.SHELF_TIME_SHOULD_BE_NUMBER;

        return null;
      },
      price: (value) => {
        if(!value || value === '') return VALIDATION_MESSAGES.PRODUCT.PRICE_REQUIRED;
        if(isNaN(Number(value)) || Number(value) < 0) return VALIDATION_MESSAGES.PRODUCT.PRICE_SHOULD_BE_NUMBER;

        return null;
      },
      weight: (value) => {
        if(!value || value === '') return null;
        if(isNaN(Number(value)) || Number(value) < 0) return VALIDATION_MESSAGES.PRODUCT.WEIGHT_SHOULD_BE_NUMBER;

        return null;
      }
    });
  }
}