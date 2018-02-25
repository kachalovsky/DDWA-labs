"use strict";

var CONSTANTS = {
  VALID_DATE_FORMAT: "dd/MM/yyyy"
};

var VALIDATION_MESSAGES = {
  PRODUCT: {
    NAME_REQUIRED: "Наименование - обязательное поле",
    NAME_LENGTH: "Наименование должно быть длиннее 3 символов",
    DATE_OF_MANUFACTURE_REQUIRED: "Дата изготовления - обязательное поле",
    DATE_OF_MANUFACTURE_INVALID: "Дата изготовления имеет неверный формат. Пример: " + validDateFormat(),
    SHELF_TIME_REQUIRED: "Срок хранения - обязательное поле",
    SHELF_TIME_SHOULD_BE_NUMBER: "Срок хранения должна быть целым числом",
    PRICE_REQUIRED: "Цена - обязательное поле",
    PRICE_SHOULD_BE_NUMBER: "Цена должна быть числом",
    WEIGHT_SHOULD_BE_NUMBER: "Вес должен быть числом"
  },
  MILK: {
    PERCENT_OF_FAT_REQUIRED: "Процент жирности - обязательное поле",
    PERCENT_OF_FAT_SHOULD_BE_NUMBER: "Процент жирности должен быть числом числом",
    VOLUME_SHOULD_BE_NUMBER: "Объем должен быть числом"
  },
  FISH: {
    VARIETY_REQUIRED: "Вид рыбы - обязательное поле",
    VARIETY_LENGTH: "Вид рыбы должен быть длиннее чем 3 символа",
    COUNTRY_REQUIRED: "Страна - обязательное поле",
    COUNTRY_LENGTH: "Страна должена иметь длину более 3 символов"
  }

};

function validDateFormat() {
  return (new Date()).toString(CONSTANTS.VALID_DATE_FORMAT);
}

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

function generateDefaultProperties(externalContext) {
  Object.keys(externalContext).forEach(function (propertyKey) {
    var capitalizedKey = capitalizeFirstLetter(propertyKey);
    var setPropertyKey = "set" + capitalizedKey;
    var getPropertyKey = "get" + capitalizedKey;
    externalContext[setPropertyKey] = externalContext[setPropertyKey] || generateSetTemplateFunction(propertyKey);
    externalContext[getPropertyKey] = externalContext[getPropertyKey] || generateGetTemplateFunction(propertyKey);
  })
}

function assign(objects) {
  return objects.reduce(function (r, o) {
    Object.keys(o).forEach(function (k) {
      r[k] = o[k];
    });
    return r;
  }, {});
}

function BaseEntity() {
  generateDefaultProperties(this);

  this.validationProperties = {};
  this.displayProperties = [];

  var self = this;

  this.validate = function(field) {
    if (field) {
      var validator = self.validationProperties[field];
      var result = validator && validator(self[field]);
      return ({isValid: !result, cause: result, propertyName: field})
    }

    return Object.keys(this.validationProperties).reduce(function(validationResult, validationField) {
      var result = self.validationProperties[validationField](self[validationField]);
      if (!!result) validationResult.isValid = false;

      validationResult.results.push({isValid: !result, cause: result, propertyName: validationField});
      return validationResult;
    }, {results: [], isValid: true});
  };

  this.addValidationCases = function(cases) {
    self.validationProperties = assign([self.validationProperties, cases]);
  }

}

//name, dateOfManufacture, shelfTime, description, price, weight
function Product(initialValues) {
  initialValues = initialValues || {};
  this.id = initialValues.id;
  this.name = initialValues.name;
  this.dateOfManufacture = initialValues.dateOfManufacture;
  this.shelfTime = initialValues.shelfTime;
  this.description = initialValues.description;
  this.price = initialValues.price;
  this.weight = initialValues.weight;
  this.type = "product";
  BaseEntity.call(this);

  this.displayProperties = this.displayProperties.concat(["name", "dateOfManufacture", "shelfTime", "description", "price", "weight"]);

  this.addValidationCases({
    name: function (value) {
      if(!value || value === "") return VALIDATION_MESSAGES.PRODUCT.NAME_REQUIRED;
      if(value.lenght < 4) return VALIDATION_MESSAGES.PRODUCT.NAME_REQUIRED;

      return null;
    },
    dateOfManufacture: function (value) {
      if(!value || value === "") return VALIDATION_MESSAGES.PRODUCT.DATE_OF_MANUFACTURE_REQUIRED;
      if(new Date(value) == "Invalid Date") return VALIDATION_MESSAGES.PRODUCT.DATE_OF_MANUFACTURE_INVALID;

      return null;
    },
    shelfTime: function (value) {
      if(!value || value === "") return VALIDATION_MESSAGES.PRODUCT.SHELF_TIME_REQUIRED;
      if(isNaN(Number(value))) return VALIDATION_MESSAGES.PRODUCT.SHELF_TIME_SHOULD_BE_NUMBER;
      if(Number(value) !== Math.ceil(value)) return VALIDATION_MESSAGES.PRODUCT.SHELF_TIME_SHOULD_BE_NUMBER;

      return null;
    },
    price: function (value) {
      if(!value || value === "") return VALIDATION_MESSAGES.PRODUCT.PRICE_REQUIRED;
      if(isNaN(Number(value))) return VALIDATION_MESSAGES.PRODUCT.PRICE_SHOULD_BE_NUMBER;

      return null;
    },
    weight: function (value) {
      if(!value || value === "") return null;
      if(isNaN(Number(value))) return VALIDATION_MESSAGES.PRODUCT.WEIGHT_SHOULD_BE_NUMBER;

      return null;
    }
  });
}
Product.displayName = "Другое";

function Milk(initialValues) {
  initialValues = initialValues || {};
  this.percentOfFat = initialValues.percentOfFat;
  this.volume = initialValues.volume;

  Product.call(this, initialValues);

  this.displayProperties = this.displayProperties.concat(["percentOfFat", "volume"]);

  this.type = "milk";

  this.addValidationCases({
    percentOfFat: function (value) {
      if(!value || value === "") return VALIDATION_MESSAGES.MILK.PERCENT_OF_FAT_REQUIRED;
      if(isNaN(Number(value))) return VALIDATION_MESSAGES.MILK.PERCENT_OF_FAT_SHOULD_BE_NUMBER;

      return null;
    },
    volume: function (value) {
      if(!value || value === "") return null;
      if(isNaN(Number(value))) return VALIDATION_MESSAGES.MILK.VOLUME_SHOULD_BE_NUMBER;

      return null;
    }
  });
}
Milk.displayName = "Молоко";

function Fish(initialValues) {
  initialValues = initialValues || {};
  this.variety = initialValues.variety;
  this.country = initialValues.country;

  Product.call(this, initialValues);

  this.displayProperties = this.displayProperties.concat(["variety", "country"]);

  this.type = "fish";

  this.addValidationCases({
    variety: function (value) {
      if(!value || value === "") return VALIDATION_MESSAGES.FISH.VARIETY_REQUIRED;
      if(value.length < 4) return VALIDATION_MESSAGES.FISH.VARIETY_LENGTH;

      return null;
    },
    country: function (value) {
      if(!value || value === "") return VALIDATION_MESSAGES.FISH.COUNTRY_REQUIRED;
      if(value.length < 4) return VALIDATION_MESSAGES.FISH.COUNTRY_LENGTH;

      return null;
    }
  });
}

Fish.displayName = "Рыба";