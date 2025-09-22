// Crear variables globales
let datos;

// Cargar datos y actualizar variables globales
fetch('data.json')
	.then(response => response.json())
	.then(json => {
		datos = json;
	})
    // Crear el mapa
    .then(() => createMap())


function createMap(){
    // TODO: Crear mapa con Plotly
    const data = []; // Aqui hay q poner los datos :D

    const layout = {
        margin: {t: 50},
        title: {text: 'temp'},
    };

    Plotly.newPlot('graph', data, layout);
    
}

