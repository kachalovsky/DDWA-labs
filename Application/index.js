var app = new function() {
  var self = this;
  var CONSTANTS = {
    ATTRIBUTIONS: {
      TYPE: "type",
      DATA_PICKER: "data-date-inline-picker"
    },
    SYMBOLS: {
      SINGLE_QUOTE: "'",
      DOUBLE_QUOTE: "\"",
      EQUAL: "=",
      SPACE: " ",
    },
    IDENTIFIERS: {
      CREATION_CONTENT: "create-content",
      CREATION_CONTROL_BUTTON: "create-controller-button",
    },
    STYLES: {
      DISPLAY: {
        NONE: "none",
        TABLE_CELL: "table-cell",
        BLOCK: "block"
      }
    },
    API: {
      URL: "http://localhost:3000/"
    },
    TYPES: {
      milk: Milk,
      fish: Fish,
      product: Product
    }
  };
  this.APIHelper = new APIHelper({url: CONSTANTS.API.URL});
  this.creationVariants = [Milk, Fish, Product];

  
  this.content = [];
  this.fetchAll = function(callback) {
    this.APIHelper.GET({}, function (err, data) {
      if(err) return callback(err);

      callback(null, self.buildProductsFromServerData(data))
    });
  };

  this.buildProductsFromServerData = function(data) {
    return data.map(function(product) { return self.buildProductFromServerData(product)})
  };

  this.buildProductFromServerData = function(data) {
    return (new CONSTANTS.TYPES[data.type](data))
  };

  this.createProduct = function () {
    
    if (!self.creationProduct) return;

    var validationResult = self.creationProduct.validate();

    if(!validationResult.isValid) {
      validationResult.results.forEach(function(propertyValidationResult) {
        self.checkValidation(propertyValidationResult.propertyName, propertyValidationResult)
      });
      return;
    }


    if(self.creationProduct.id) {
      self.APIHelper.PUT(self.creationProduct, {}, function (err, data) {
        if(err) return alert(err);

        var product = self.buildProductFromServerData(data);
        var replacedIndex = self.content.indexOf(findProductById(product.getId()));
        self.content[replacedIndex] = product;
        self.hideCreationView();
        self.buildHtmlForData(self.content);
      });
    } else {
      self.APIHelper.POST(self.creationProduct, {}, function (err, data) {
        if(err) return alert(err);

        self.content.push(self.buildProductFromServerData(data));
        self.hideCreationView();
        self.buildHtmlForData(self.content);
      });
    }
  };

  this.onUpdateButtonPressed = function (id) {
    self.showCreationView(findProductById(id))
  };

  this.onDeleteButtonPressed = function (id) {
    this.APIHelper.DELETE(null, {uriModifier: function (url) {
      return url + id;
    }}, function (err, data) {
      if(err) return alert(err.message);

      const deletedIndex = self.content.indexOf(findProductById(id));

      if (deletedIndex !== -1) {
        self.content.splice(deletedIndex, 1);
        self.buildHtmlForData(self.content);
      }
    })
  };

  this.navigateToMainView = function() {
    window.location.href = "index.html";
  };

  this.buildHtmlForData = function(data) {
    var contentContainer = document.getElementById('content');
    var html = "";
    if (!data.length) {
      html = "<b>Nothing to show</b>";
      contentContainer.innerHTML = html;
      return;
    }

    html += "<table>";
    html += "<tr><th>Наименование</th><th>Дата изготовления</th><th>Срок хранения (дней)</th><th>Вес (кг)</th><th>Цена (руб)</th></tr>";
    data.forEach(function (product) {
      html += "<tr>";
      html += "<td>"+ (product.getName() || "") + "</td>";
      html += "<td>"+ (product.getDateOfManufacture() || "") + "</td>";
      html += "<td>"+ (product.getShelfTime() || "") + "</td>";
      html += "<td>"+ (product.getWeight() || "") + "</td>";
      html += "<td>"+ (product.getPrice() || "") + "</td>";
      html += "<td>"+ "<input class='orange-button' type='button' onclick=app.onUpdateButtonPressed('" + product.getId() + "') value='Изменить' />" || "" + "</td>";
      html += "<td>"+ "<input class='red-button' type='button' onclick=app.onDeleteButtonPressed('"+ product.getId() +"') value='Удалить' />" + "</td>";
      html += "<td>"+ "<input class='blue-button' type='button' onclick=app.navigateToDetailsView('"+ product.getId() + "') value='Подробнее' />" || "" + "</td>";
      html += "</tr>"
    });
    html += "</table>";
    contentContainer.innerHTML = html;
  };

  this.navigateToDetailsView =function(productId) {
    window.location.href = "details.html?id=" + productId;
  };

  this.updateContent = function() {
    self.fetchAll(function (err, data) {
      if (err) throw Error(err.message || "Fetching data error");
      self.content = data;
      self.buildHtmlForData(data);
    })
  };

  this.buildHTMLForCreationContent = function (product, createContent) {
    createContent = createContent || document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    product = product || new Product();
    self.creationProduct = product;
    var html = "";
    html += "<table>";
    html += generateProductSelectionCell(self.creationVariants, product);
    product.displayProperties.forEach(function (property) {
      propertiesCreationHTML[property] && (html += generateValidationCell(property) + propertiesCreationHTML[property](product[property]));
    });
    html += "</table>";
    html += "<input type='button' class='action-button' onclick='app.createProduct()' value=" + (product.getId() ? "'Обновить'" :"'Добавить'") + "/>";
    createContent.innerHTML = html;
  };

  this.showCreationView = function (product) {
    var createContent = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    var button = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTROL_BUTTON);
    button.value = "Отмена";
    createContent.style.display = CONSTANTS.STYLES.DISPLAY.BLOCK;
    self.buildHTMLForCreationContent(product);
  };

  this.hideCreationView = function() {
    var createContent = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    var button = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTROL_BUTTON);
    createContent.style.display = CONSTANTS.STYLES.DISPLAY.NONE;
    button.value = "Добавить продукт";
    self.creationProduct = new Product();
  };

  this.onCreationControlPressed = function() {
    var createContent = document.getElementById(CONSTANTS.IDENTIFIERS.CREATION_CONTENT);
    var contentDisplayValue = createContent.style.display;
    if (contentDisplayValue !== CONSTANTS.STYLES.DISPLAY.NONE)
      self.hideCreationView();
    else
      self.showCreationView(self.creationProduct)
  };

  this.onCreationSelectionChanged = function (index) {
    self.creationProduct = new self.creationVariants[index](self.creationProduct || {});
    self.buildHTMLForCreationContent(self.creationProduct)
  };

  this.onFieldChange = function(propertyName, value) {
    if(!this.creationProduct.hasOwnProperty(propertyName)) return;

    this.creationProduct[propertyName] = value;
    var validationResult = this.creationProduct.validate(propertyName);
    this.checkValidation(propertyName, validationResult)
  };

  this.checkValidation = function (propertyName, validationResult) {
    var validationId = buildValidationId(propertyName);
    var validationField = document.getElementById(validationId);
    if (!validationResult.isValid) {
      validationField.innerHTML = validationResult.cause;
      validationField.style.display = CONSTANTS.STYLES.DISPLAY.TABLE_CELL
    }
    else {
      validationField.innerHTML = null;
      validationField.style.display = CONSTANTS.STYLES.DISPLAY.NONE;
    }
  };

  this.fetchProductById = function(id, callback) {
    self.APIHelper.GET({uriModifier: function (url) {
      return url + id;
    }}, function (err, data) {
      if (err) return alert(err.message);

      var displayedProduct = self.buildProductFromServerData(data);
      callback(null, displayedProduct);
    })
  };

  this.displayProductDetails = function (product, container) {
    var html = "<table>";
    product.displayProperties.forEach(function (propertyName) {
      var htmlGenerator = generateDefaultDisplayTextCell[propertyName];

      html += htmlGenerator ? htmlGenerator(product[propertyName]) : "";
    });
    html += "</table>";
    container.innerHTML = html;
  };

  this.getParamFromQueryString = function (paramName) {
    var url = window.location.href;
    paramName = paramName.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + paramName + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  var propertiesCreationHTML = new function () {
    this.name = generateDefaultCreationTextCell("name", "Наименование *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
    this.dateOfManufacture = generateDefaultCreationTextCell("dateOfManufacture", "Дата изготовления *", [
      {name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "date"},
      {name: CONSTANTS.ATTRIBUTIONS.DATA_PICKER, value: "true"}
    ]);
    this.shelfTime = generateDefaultCreationTextCell("shelfTime", "Срок хранения (дней) *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
    this.description = generateDefaultCreationTextAreaCell('description', "Описание");
    this.price = generateDefaultCreationTextCell("price", "Цена (руб) *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
    this.weight = generateDefaultCreationTextCell("weight", "Вес (кг)", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
    this.percentOfFat = generateDefaultCreationTextCell("percentOfFat", "Процент жирности (%) *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
    this.country = generateDefaultCreationTextCell("country", "Страна происхождения *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
    this.variety = generateDefaultCreationTextCell("variety", "Вид *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
    this.volume = generateDefaultCreationTextCell("volume", "Объем (л) *", [{name: CONSTANTS.ATTRIBUTIONS.TYPE, value: "text"}]);
  };



  var generateDefaultDisplayTextCell = {
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
    var html = "<div  class='select'> <span class='arr'></span><select onchange='app.onCreationSelectionChanged(this.selectedIndex)'>";
    html += creationVariants.reduce(function(result, creationVariant, index) {
      return result + "<option" + ((currentProduct instanceof creationVariant) ? " selected " : "") + ">" + creationVariant.displayName + "</option>"
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
    return "<tr><td>"+ displayName +"</td><td>"+ (value || "-") +"</td></tr>"
  }

  function generateValidationCell(propertyName) {
    return "<tr></tr><td colspan='2' style='display: none' class='validation-cell' id='"+ buildValidationId(propertyName) +"'></td></tr>"
  }

  function buildValidationId(propertyName) {
    return "validation-" + propertyName;
  }

  function generateAttributionString(attributions) {
    if (!attributions) return "";

    var SYM = CONSTANTS.SYMBOLS;
    return attributions.reduce(function (result, attribution) {
      return (result + attribution.name + SYM.EQUAL + SYM.SINGLE_QUOTE + attribution.value + SYM.SINGLE_QUOTE + SYM.SPACE)
    }, "")
  }

  function findProductById(id) {
    for (var index in self.content) {
      var product = self.content[index];
      if (product.getId() === id) return product;
    }
  }

};