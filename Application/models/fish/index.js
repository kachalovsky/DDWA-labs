import Product from '../product/index.js';
import {VALIDATION_MESSAGES} from "../constants.js";


export default class Fish extends Product{

  static get displayName() {
    return 'Рыба';
  }

  get variety() {
    return this._variety;
  }
  set variety(value) {
    this._variety = value;
  }

  get country() {
    return this._country;
  }
  set country(value) {
    this._country = value;
  }

  toJSON() {
    return Object.assign(super.toJSON(),{
      variety: this.variety,
      country: this.country
    })
  }

  constructor(initialValues) {
    initialValues = initialValues || {};
    super(initialValues);

    this._variety = initialValues.variety;
    this._country = initialValues.country;

    this.displayProperties = this.displayProperties.concat(['variety', 'country']);

    this.type = 'fish';

    this.addValidationCases({
      variety: function (value) {
        if(!value || value === '') return VALIDATION_MESSAGES.FISH.VARIETY_REQUIRED;
        if(value.length < 4) return VALIDATION_MESSAGES.FISH.VARIETY_LENGTH;

        return null;
      },
      country: function (value) {
        if(!value || value === '') return VALIDATION_MESSAGES.FISH.COUNTRY_REQUIRED;
        if(value.length < 4) return VALIDATION_MESSAGES.FISH.COUNTRY_LENGTH;

        return null;
      }
    });
  }
}