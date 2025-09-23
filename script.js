// Crear variables globales
const global_data = "data.json";
let datos;
let top_5;

// Cargar datos y actualizar variables globales
fetch('data.json')
    .then(response => response.json())
    .then(json => {
        datos = json;
    })
    // Crear el mapa
    .then(() => createMap())


function createMap() {
    // TODO: Crear mapa con Plotly
    console.log(datos)
    const states = datos.map((dato) => dato.state);
    const codes = datos.map((dato) => dato.code);
    const values = datos.map((dato) => dato.rate_2)

    console.log(states)

    // configuración de plotly
    const config = {
        displayModeBar: false, // sacar la barra de herramientas de plotly
    };

    var data = [{
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: codes,
        z: values,
        text: states,
        zmin: 0,
        zmax: 12,
        colorscale: [
            [0, 'rgb(242,240,247)'], [0.2, 'rgb(218,218,235)'],
            [0.4, 'rgb(188,189,220)'], [0.6, 'rgb(158,154,200)'],
            [0.8, 'rgb(117,107,177)'], [1, 'rgb(84,39,143)']
        ],
        colorbar: {
            thickness: 20,
            title: {
                text: 'Shooting Rate<br>(per 100,000 inhabitants)',
                side: 'right'
            },
        },
        marker: {
            line: {
                color: 'rgb(255,255,255)',
                width: 1
            }
        }
    }];

    // acá esta el layout para que se centre el mapa en Chile
    var layout = {
        title: { text: 'Average shootings in US states 1990-2024' },
        width: 800,
        height: 500,
        geo: {

            scope: 'usa',
            showlakes: true,
            lakecolor: 'rgb(255,255,255)',
            resolution: 50,
            landcolor: "white",
            visible: false,
        },
        dragmode: false,
        staticPlot: true,
        responsive: true,

    };


    Plotly.newPlot("graph", data, layout, config);

}

fetch('top5.json').then(response => response.json()).then(json => {
    top_5 = json;
}).then(() => createTop())

function createTop() {
    console.log(top_5)
    const states = top_5.map((dato) => dato.state);
    const codes = top_5.map((dato) => dato.code);
    const values = top_5.map((dato) => dato.rate_2);

    const config = {
        displayModeBar: false,
    };

    var data = [{
        type: 'bar',
        x: states.map((state, i) => `${state} (${codes[i]})`),
        y: values,
        text: values.map(val => val.toFixed(3)),
        hoverinfo: 'none',
        marker: {
            color: values.map(val => {
                const normVal = val / 12;
                if (normVal <= 0) return 'rgb(242,240,247)';
                else if (normVal <= 0.2) return 'rgb(218,218,235)';
                else if (normVal <= 0.4) return 'rgb(188,189,220)';
                else if (normVal <= 0.6) return 'rgb(158,154,200)';
                else if (normVal <= 0.8) return 'rgb(117,107,177)';
                else return 'rgb(84,39,143)';
            }),
        }
    }];

    var layout = {
        title: { text: 'Top 5 states with highest average shooting rates 1990-2024' },
        xaxis: { title: 'States', showgrid: false },
        yaxis: { 
            title: { text: 'Shooting Rate (per 100,000 inhabitants)' },
            automargin: true,
            showgrid: false
        },
    };

    Plotly.newPlot("top5", data, layout, config);

}