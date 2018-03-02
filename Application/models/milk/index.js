import Product from '../product/index.js'
import {VALIDATION_MESSAGES} from "../constants.js"

export default class Milk extends Product {

  get percentOfFat() {
    return this._percentOfFat;
  }
  set percentOfFat(value) {
    this._percentOfFat = value;
  }

  get volume() {
    return this._volume;
  }
  set volume(value) {
    this._volume = value;
  }

  static get displayName() {
    return 'Молоко';
  }

  toJSON() {
    return Object.assign(super.toJSON(),{
      percentOfFat: this.percentOfFat,
      volume: this.volume
    })
  }

  constructor(initialValues) {
    super(initialValues);
    initialValues = initialValues || {};
    this._percentOfFat = initialValues.percentOfFat;
    this._volume = initialValues.volume;

    this.displayProperties = this.displayProperties.concat(['percentOfFat', 'volume']);

    this.type = 'milk';

    this.addValidationCases({
      percentOfFat: function (value) {
        if(!value || value === '') return VALIDATION_MESSAGES.MILK.PERCENT_OF_FAT_REQUIRED;
        if(isNaN(Number(value))) return VALIDATION_MESSAGES.MILK.PERCENT_OF_FAT_SHOULD_BE_NUMBER;

        return null;
      },
      volume: function (value) {
        if(!value || value === '') return null;
        if(isNaN(Number(value))) return VALIDATION_MESSAGES.MILK.VOLUME_SHOULD_BE_NUMBER;

        return null;
      }
    });
  }

}