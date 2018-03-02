const VALIDATION_MESSAGES = {
  PRODUCT: {
    NAME_REQUIRED: 'Наименование - обязательное поле',
    NAME_LENGTH: 'Наименование должно быть длиннее 3 символов',
    DATE_OF_MANUFACTURE_REQUIRED: 'Дата изготовления - обязательное поле',
    DATE_OF_MANUFACTURE_INVALID: 'Дата изготовления имеет неверный формат.',
    SHELF_TIME_REQUIRED: 'Срок хранения - обязательное поле',
    SHELF_TIME_SHOULD_BE_NUMBER: 'Срок хранения должна быть целым числом',
    PRICE_REQUIRED: 'Цена - обязательное поле',
    PRICE_SHOULD_BE_NUMBER: 'Цена должна быть числом',
    WEIGHT_SHOULD_BE_NUMBER: 'Вес должен быть числом'
  },
  MILK: {
    PERCENT_OF_FAT_REQUIRED: 'Процент жирности - обязательное поле',
    PERCENT_OF_FAT_SHOULD_BE_NUMBER: 'Процент жирности должен быть числом числом',
    VOLUME_SHOULD_BE_NUMBER: 'Объем должен быть числом'
  },
  FISH: {
    VARIETY_REQUIRED: 'Вид рыбы - обязательное поле',
    VARIETY_LENGTH: 'Вид рыбы должен быть длиннее чем 3 символа',
    COUNTRY_REQUIRED: 'Страна - обязательное поле',
    COUNTRY_LENGTH: 'Страна должена иметь длину более 3 символов'
  }
};

const VALID_DATE_FORMAT = 'dd/MM/yyyy';

export {VALIDATION_MESSAGES, VALID_DATE_FORMAT};