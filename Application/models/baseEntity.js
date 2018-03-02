export default class BaseEntity {

  constructor() {
    this.validationProperties = {};
    this.displayProperties = [];
  }


  validate(field) {
    if (field) {
      const validator = this.validationProperties[field];
      const result = validator && validator(this[field]);
      return ({isValid: !result, cause: result, propertyName: field})
    }

    return Object.keys(this.validationProperties).reduce((validationResult, validationField) => {
      const result = this.validationProperties[validationField](this[validationField]);
      if (!!result) validationResult.isValid = false;

      validationResult.results.push({isValid: !result, cause: result, propertyName: validationField});
      return validationResult;
    }, {results: [], isValid: true});
  };

  addValidationCases(cases) {
    this.validationProperties = Object.assign(this.validationProperties, cases);
  }

}