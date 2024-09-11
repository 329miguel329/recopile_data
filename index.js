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
        if(groupedData[documentClient].length > 1) {
            const clients = groupedData[documentClient]
            // Verificar si existe al menos un objeto con count > 0
            const hasCountGreaterThanZero = clients.some(item => item.count > 0);

            if(hasCountGreaterThanZero) {
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

    console.log({arrayWithoutDuplicates, arrayWithDuplicates, arrayWithtDuplicatesAndCases})
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

fetch('./clientes3.json')
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
