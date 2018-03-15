require("babel-core/register");
require("babel-polyfill");

import Milk from './models/milk/index.js'
import Fish from './models/fish/index.js'
import Product from './models/product/index.js'
import APIHelper from './utils/api-helper/index.js'
import style from '../styles/style.css';

const CONSTANTS = {
  ATTRIBUTIONS: {
    TYPE: 'type',
    DATA_PICKER: 'data-date-inline-picker'
  },
  SYMBOLS: {
    SINGLE_QUOTE: '\'',
    DOUBLE_QUOTE: '\"',
    EQUAL: '=',
    SPACE: ' ',
  },
  IDENTIFIERS: {
    CREATION_CONTENT: 'create-content',
    CREATION_CONTROL_BUTTON: 'create-controller-button',
  },
  STYLES: {
    DISPLAY: {
      NONE: 'none',
      TABLE_CELL: 'table-cell',
      BLOCK: 'block'
    }
  },
  API: {
    URL: 'http://localhost:3000/'
  },
  TYPES: {
    product: Product,
    milk: Milk,
    fish: Fish
  },
  WORKER: {
    TIMESTAMP_LS_KEY: 'last_update_count_of_event',
  }
};


function generateDefaultCreationTextCell(propertyName, labelText, inputAttributes) {
  return function (value) {
    return "<tr>" +
      "<td>"+ labelText +"</td><td>" +
      "<input " + generateAttributionString(inputAttributes) + "onchange='app.onFieldChange(" +
      [CONSTANTS.SYMBOLS.DOUBLE_QUOTE + propertyName + CONSTANTS.SYMBOLS.DOUBLE_QUOTE, "this.value"].join(',') +
      ")' value='"+ (value || "") +"'/>"+
      "</td>" +
      "</tr>"
  }
}

function generateProductSelectionCell(creationVariants, currentProduct) {
  let html = "<div  class='select'> <span class='arr'></span><select onchange='app.onCreationSelectionChanged(this.selectedIndex)'>";
  html += creationVariants.reduce(function(result, creationVariant, index) {
    return result + "<option" + ((currentProduct.type === (new creationVariant()).type) ? " selected " : "") + ">" + creationVariant.displayName + "</option>"
  }, "");
  html += "</select></div>";
  return html;
}

function generateDefaultCreationTextAreaCell(propertyName, name) {
  return function (value) {
    return "<tr><td>"+ name +"</td><td><textarea "+ "onchange='app.onFieldChange(" +
      [CONSTANTS.SYMBOLS.DOUBLE_QUOTE + propertyName + CONSTANTS.SYMBOLS.DOUBLE_QUOTE, "this.value"].join(',') +
      ")'>"+ (value || "") +"</textarea></td></tr>"
  }
}

function generateDefaultDisplayPropertyCell(displayName, value) {
  return `<tr><td>${displayName}</td><td>${value || '-'}</td></tr>`
}

function generateValidationCell(propertyName) {
  return `<tr></tr><td colspan='2' style='display: none' class='validation-cell' id='${buildValidationId(propertyName)}'></td></tr>`
}

function buildValidationId(propertyName) {
  return `validation-${propertyName}`;
}

function generateAttributionString(attributions) {
  if (!attributions) return '';

  const SYM = CONSTANTS.SYMBOLS;
  return attributions.reduce(function (result, attribution) {
    return (`${result}${attribution.name} = '${attribution.value}' `)
  }, "")
}



class Application {

  constructor() {
  this.APIHelper = new APIHelper({url: CONSTANTS.API.URL});
  this.creationVariants = [Milk, Fish, Product];
  this.content = [];
  this.sortState = {};

    this.propertiesCreationHTML = new function () {
      this.name = generateDefaultCreationTextCell('name', 'Наименование *', [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'text'}]);
      this.dateOfManufacture = generateDefaultCreationTextCell('dateOfManufacture', 'Дата изготовления *', [
        {name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'date'},
        {name: CONSTANTS.ATTRIBUTIONS.DATA_PICKER, value: 'true'}
      ]);
      this.shelfTime = generateDefaultCreationTextCell('shelfTime', 'Срок хранения (дней) *', [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
      this.description = generateDefaultCreationTextAreaCell('description', 'Описание');
      this.price = generateDefaultCreationTextCell('price', 'Цена (руб) *', [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'text'}]);
      this.weight = generateDefaultCreationTextCell('weight', 'Вес (кг)', [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'text'}]);
      this.percentOfFat = generateDefaultCreationTextCell("percentOfFat", "Процент жирности (%) *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'text'}]);
      this.country = generateDefaultCreationTextCell('country', 'Страна происхождения *', [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'text'}]);
      this.variety = generateDefaultCreationTextCell('variety', 'Вид *', [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'text'}]);
      this.volume = generateDefaultCreationTextCell('volume', 'Объем (л) *', [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: 'text'}]);
    };



    this.generateDefaultDisplayTextCell = {
      name: function(value){ return generateDefaultDisplayPropertyCell('Наименование', value)},
      dateOfManufacture: function(value){ return generateDefaultDisplayPropertyCell('Дата изготовления', value)},
      shelfTime: function(value){ return generateDefaultDisplayPropertyCell('Срок хранения (дней)', value)},
      description: function(value){ return generateDefaultDisplayPropertyCell('Описание', value)},
      price: function(value){ return generateDefaultDisplayPropertyCell('Цена (руб)', value)},
      weight: function(value){ return generateDefaultDisplayPropertyCell('Вес (кг)', value)},
      percentOfFat: function(value){ return generateDefaultDisplayPropertyCell('Процент жирности (%)', value)},
      country: function(value){ return generateDefaultDisplayPropertyCell('Страна происхождения', value)},
      variety: function(value){ return generateDefaultDisplayPropertyCell('Вид', value)},
      volume: function(value){ return generateDefaultDisplayPropertyCell('Объем (л)', value)}
    };

    this.contentGenerator = function* () {
      for (let product of this.content) {
        yield product;
      }
    }
  }

  async fetchAll() {
    return this.buildProductsFromServerData(await this.APIHelper.GET({}));
  };

  buildProductsFromServerData(data) {
    return data.map((product) => this.buildProductFromServerData(product))
  };

  buildProductFromServerData(data) {
    return (new CONSTANTS.TYPES[data.type](data))
  };

  async createProduct() {

    if (!this.creationProduct) return;

    const validationResult = this.creationProduct.validate();

    if(!validationResult.isValid) {
      validationResult.results.forEach((propertyValidationResult) => {
        this.checkValidation(propertyValidationResult)
      });
      return;
    }

    try{
      if(this.creationProduct.id) {
        const data = await this.APIHelper.PUT(this.creationProduct, {});
        const product = this.buildProductFromServerData(data);
        const replacedIndex = this.content.indexOf(this.findProductById(product.id));
        this.content[replacedIndex] = product;
      } else {
        const data = await this.APIHelper.POST(this.creationProduct, {});
        this.content.push(this.buildProductFromServerData(data));
      }
    }
    catch(err) {
      alert(err);
      return;
    }


    this.hideCreationView();
    this.buildHtmlForData(this.content);

  };

  onUpdateButtonPressed(id) {
    this.showCreationView(this.findProductById(id))
  };

  async onDeleteButtonPressed(id) {
    try{
      await this.APIHelper.DELETE(null, {uriModifier: (url) => (url + id)})
    }
    catch(err) {
      alert(err);
      return
    }
    const deletedIndex = this.content.indexOf(this.findProductById(id));

    if (deletedIndex !== -1) {
      this.content.splice(deletedIndex, 1);
      this.buildHtmlForData(this.content);
    }
  };

  onSearchButtonPressed() {
    let queryString = document.getElementById('search').value || '';
    if (!queryString.length) return this.buildHtmlForData(this.content);
    queryString = queryString.toLowerCase();
    let searchResult = this.content.filter((product) => {return (product.name.toLowerCase().includes(queryString) ||
      product.price.toLowerCase().includes(queryString) ||
      product.dateOfManufacture.toLowerCase().includes(queryString))
    });
    this.buildHtmlForData(searchResult, queryString);
  }


  navigateToMainView() {
    window.location.href = 'index.html';
  };

  onSortPressed(prop) {
    const state = this.sortState[prop] = !this.sortState[prop];
    const multiplier = state ? -1 : 1;
    this.content = this.content.sort((a, b) => {
      if(a[prop] < b[prop]) return (-1 * multiplier);
      else if (a[prop] > b[prop]) return (1 * multiplier);
      else return 0;
    });
    this.buildHtmlForData(this.content);
  }

  buildHtmlForData(data, searchString = "") {
    const contentContainer = document.getElementById('content');
    let html = '';

    html += "<table>";
    html += "<tr><th onclick='app.onSortPressed(\"name\")'>Наименование</th><th onclick='app.onSortPressed(\"dateOfManufacture\")'>Дата изготовления</th><th  onclick='app.onSortPressed(\"shelfTime\")'>Срок хранения (дней)</th><th  onclick='app.onSortPressed(\"weight\")'>Вес (кг)</th><th  onclick='app.onSortPressed(\"price\")'>Цена (руб)</th><th style='min-width: 420px !important;' colspan='3'>" +
      `<input type='text' placeholder='Поиск' value='${searchString}' id='search'><input onclick='app.onSearchButtonPressed()' type='button' id='search-button' class='action-button' value='Найти'>` +
      "</th></tr>";
    if (!data.length) {
      html += '</table>';
      html += `<b>${searchString.length ? 'Результаты не найдены' : 'Список пуст'}</b>`;

      contentContainer.innerHTML = html;
      return;
    }
    data.forEach(function (product) {
      html += "<tr>";
      html += "<td>"+ (product.name || "") + "</td>";
      html += "<td>"+ (product.dateOfManufacture || "") + "</td>";
      html += "<td>"+ (product.shelfTime || "") + "</td>";
      html += "<td>"+ (product.weight || "") + "</td>";
      html += "<td>"+ (product.price || "") + "</td>";
      html += "<td>"+ "<input class='orange-button' type='button' onclick=app.onUpdateButtonPressed('" + product.id + "') value='Изменить' />" || "" + "</td>";
      html += "<td>"+ "<input class='red-button' type='button' onclick=app.onDeleteButtonPressed('"+ product.id +"') value='Удалить' />" + "</td>";
      html += "<td>"+ "<input class='blue-button' type='button' onclick=app.navigateToDetailsView('"+ product.id + "') value='Подробнее' />" || "" + "</td>";
      html += "</tr>"
    });
    html += "</table>";
    contentContainer.innerHTML = html;
  };

  navigateToDetailsView(productId) {
    window.location.href = "details.html?id=" + productId;
  };

  async updateContent() {
    try {
      const data = await this.fetchAll();
      this.content = data;
      let [firstItem] = this.content;
      console.log('First fetched item: ', firstItem)
      this.buildHtmlForData(data);
    }
    catch (err) {
      alert(new Error(err.message || "Fetching data error"))
    }
  };

  buildHTMLForCreationContent (product, createContent) {
    createContent = createContent || document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    product = product || new Product();
    this.creationProduct = product;
    let html = "";
    html += "<table>";
    html += generateProductSelectionCell(this.creationVariants, product);
    product.displayProperties.forEach((property) => {
      this.propertiesCreationHTML[property] && (html += generateValidationCell(property) + this.propertiesCreationHTML[property](product[property]));
    });
    html += "</table>";
    html += "<input type='button' class='action-button' onclick='app.createProduct()' value=" + (product.id ? "'Обновить'" :"'Добавить'") + "/>";
    createContent.innerHTML = html;
  };

  showCreationView(product) {
    const createContent = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    const button = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTROL_BUTTON);
    button.value = 'Отмена';
    createContent.style.display = CONSTANTS.STYLES.DISPLAY.BLOCK;
    this.buildHTMLForCreationContent(product);
  };

  hideCreationView() {
    const createContent = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    const button = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTROL_BUTTON);
    createContent.style.display = CONSTANTS.STYLES.DISPLAY.NONE;
    button.value = 'Добавить продукт';
    this.creationProduct = new Product();
  };

  onCreationControlPressed() {
    const createContent = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    const contentDisplayValue = createContent.style.display;
    if (contentDisplayValue !== CONSTANTS.STYLES.DISPLAY.NONE)
      this.hideCreationView();
    else
      this.showCreationView(this.creationProduct)
  };

  onCreationSelectionChanged(index) {
    this.creationProduct = new this.creationVariants[index](this.creationProduct || {});
    this.buildHTMLForCreationContent(this.creationProduct)
  };

  onFieldChange(propertyName, value) {
    if(!this.creationProduct.hasOwnProperty(`_${propertyName}`)) return;

    this.creationProduct[propertyName] = value;
    const validationResult = this.creationProduct.validate(propertyName);
    this.checkValidation(validationResult)
  };

  checkValidation({propertyName, isValid, cause}) {
    const validationId = buildValidationId(propertyName);
    const validationField = document.getElementById(validationId);
    if (!isValid) {
      validationField.innerHTML = cause;
      validationField.style.display = CONSTANTS.STYLES.DISPLAY.TABLE_CELL
    }
    else {
      validationField.innerHTML = null;
      validationField.style.display = CONSTANTS.STYLES.DISPLAY.NONE;
    }
  };

  fetchProductById(id) {
    return this.APIHelper.GET({uriModifier: (url) => (url + id)})
    .then(data => this.buildProductFromServerData(data))
  };

  displayProductDetails (product, container)  {
    let html = "<table>";
    product.displayProperties.forEach((propertyName) => {
      const htmlGenerator = this.generateDefaultDisplayTextCell[propertyName];

      html += htmlGenerator ? htmlGenerator(product[propertyName]) : "";
    });
    html += "</table>";
    container.innerHTML = html;
  };

  getParamFromQueryString(paramName) {
    const url = window.location.href;
    paramName = paramName.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${paramName}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  findProductById(id) {
    const contentGen = this.contentGenerator();
    let item = contentGen.next();
    while (!item.done) {
      if (item.value.id === id) return item.value;
      item = contentGen.next();
    }
  }

}

const app = new Application();
window.app = app;
console.log("I'm here")
