// Función para agrupar por nmro_cliente
function groupByClientNumber(data) {
  return data.reduce((acc, item) => {
    // Usa el número de cliente como clave
    const key = getDigits(item.documento);

    // Si la clave no existe en el acumulador, inicializa un array vacío
    if (!acc[key]) {
      acc[key] = [];
    }

    // Agrega el objeto actual al array correspondiente
    acc[key].push(item);

    return acc;
  }, {});
}

// Obtener solo dígitos
function getDigits(str) {
  // Reemplazar todo lo que no sea un dígito con una cadena vacía
  const digitsOnly = str.replace(/\D/g, '');

  return digitsOnly;
}

// Recopilar datos
function recompileData(groupedData) {
  const arrayWithDuplicates = []
  const arrayWithoutDuplicates = []
  const arrayWithtDuplicatesAndCases = []

  for (const documentClient in groupedData) {
    if (groupedData[documentClient].length > 1) {
      const clients = groupedData[documentClient]
      // Verificar si existe al menos un objeto con count > 0
      const hasCountGreaterThanZero = clients.some(item => item.count > 0);

      if (hasCountGreaterThanZero) {
        // Filtrar el array en base a la verificación
        // const filteredData = hasCountGreaterThanZero ? clients.filter(item => item.count > 0) : [];
        arrayWithtDuplicatesAndCases.push(clients);
      } else {
        arrayWithDuplicates.push(clients);
      }
    } else {
      arrayWithoutDuplicates.push(groupedData[documentClient])
    }
  }

  dataToTable(arrayWithDuplicates.flat(), "table-container-duplicates")
  dataToTable(arrayWithtDuplicatesAndCases.flat(), "table-container-duplicates_and_cases")
  dataToTable(arrayWithoutDuplicates.flat(), "table-container-not-duplicates")

  generateSql(arrayWithoutDuplicates.flat(), "sql-container-not-duplicates")

  console.log({ arrayWithoutDuplicates: arrayWithoutDuplicates.flat(), arrayWithDuplicates, arrayWithtDuplicatesAndCases })
}

function dataToTable(data, idDiv) {
  const container = document.getElementById(idDiv);

  // Crear la tabla
  let table = "<table><thead><tr>";

  // Obtener las claves del primer objeto para los encabezados de columna
  const headers = Object.keys(data[0]);
  headers.forEach(header => {
    table += `<th>${header}</th>`;
  });

  table += "</tr></thead><tbody>";

  // Añadir las filas de la tabla
  data.forEach(item => {
    table += "<tr>";
    headers.forEach(header => {
      table += `<td>${item[header]}</td>`;
    });
    table += "</tr>";
  });

  table += "</tbody></table>";

  // Insertar la tabla en el contenedor
  container.innerHTML = table;
}

function generateSql(data, idDiv) {
  const container = document.getElementById(idDiv);

  // Expresión regular para verificar si el string contiene tanto letras como números
  const regex = /(?=.*[a-zA-Z])(?=.*\d)/;

  // Filtrar los objetos cuyo atributo 'documento' cumpla con la expresión regular
  const filteredData = data.filter(item => regex.test(item.documento));


  // Crear la tabla
  let sql = "";

  filteredData.forEach(item => {
    sql += "Update clientes SET ";
    sql += `documento='${getNumbersFromString(item.documento)}',`;
    sql += `tippo_documento='${getLettersFromString(item.documento)}' `;
    sql += `WHERE id = ${item.cliente_id};`;
    sql += `<br />`;
  });

  // Insertar la tabla en el contenedor
  container.innerHTML = sql;
}

function getNumbersFromString(document) {
  // Expresión regular para extraer números
  return document.match(/\d+/g).join('');
}

function getLettersFromString(document) {
  // Expresión regular para extraer números
  return document.match(/[a-zA-Z]+/g).join('');
}

function loadData() {
  fetch('./clientes2.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      // Agrupa los datos
      const groupedData = groupByClientNumber(data.data);
      recompileData(groupedData);
    }).catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function toggleVisibility(idDiv, toggleButton) {
  const section = document.getElementById(idDiv);

  if (section.classList.contains('hideSection')) {
    section.classList.remove('hideSection');
    toggleButton.textContent = 'Ocultar tabla';
  } else {
    section.classList.add('hideSection');
    toggleButton.textContent = 'Mostrar tabla';
  }
}

function addEventListenerToButton(idButton, idSection) {
  const toggleButton = document.getElementById(idButton);
  toggleButton.addEventListener('click', () => toggleVisibility(idSection, toggleButton));
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  addEventListenerToButton("toggleButtonDuplicates", "table-container-duplicates");
  addEventListenerToButton("toggleButtonDuplicatesAndCases", "table-container-duplicates_and_cases");
  // addEventListenerToButton("toggleButtonNotDuplicates", "table-container-not-duplicates");
  addEventListenerToButton("toggleButtonSqlNotDuplicates", "sql-container-not-duplicates");
});