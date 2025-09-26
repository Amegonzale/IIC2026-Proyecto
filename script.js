// Crear variables globales
const global_data = "data.json";
let datos;
let top_5;
let top_10;

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
        showscale: false,
        locations: codes,
        z: values,
        text: states,
        zmin: 0,
        zmax: 12,
        colorscale: [
            [0, 'rgba(229, 222, 249, 1)'], [0.2, 'rgba(210, 198, 236, 1)'],
            [0.4, 'rgba(183, 177, 222, 1)'], [0.6, 'rgba(135, 127, 203, 1)'],
            [0.8, 'rgba(88, 76, 157, 1)'], [1, 'rgba(69, 31, 120, 1)']
        ],
        marker: {
            line: {
                color: 'rgb(255,255,255)',
                width: 1
            }
        }
    }];

    // acá esta el layout para que se centre el mapa en Chile
    var layout = {
        title: { text: 'How endangered is your child at school?<br><sup>Average shooting rates by 100.000 students in US states (1990 - 2024)</sup>' },
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

        images: [
            {
                source: "usmap.png",
                x: 0.472,
                y: 0.438,
                sizex: 1.05,
                sizey: 1.05,
                xanchor: "center",
                yanchor: "middle",
                layer: "above"
            }
        ],
        dragmode: false,
        staticPlot: true,
        responsive: true,

    };


    Plotly.newPlot("graph", data, layout, config);

}

fetch('top10.json').then(response => response.json()).then(json => {
    top_10 = json;
}).then(() => createTop10())

function createTop10() {
    console.log(top_10)
    const states = top_10.map((dato) => dato.state);
    const codes = top_10.map((dato) => dato.code);
    const values = top_10.map((dato) => dato.rate_2);

    const config = {
        displayModeBar: false,
    };

    var data = [{
        type: 'bar',
        x: states.map((state, i) => `${state} (${codes[i]})`),
        y: values,
        text: values.map(val => val.toFixed(1)),
        hoverinfo: 'none',
        marker: {
            color: values.map(val => {
                const normVal = val / 12;
                if (normVal <= 0) return 'rgba(229, 222, 249, 1)';
                else if (normVal <= 0.2) return 'rgba(210, 198, 236, 1)';
                else if (normVal <= 0.4) return 'rgba(183, 177, 222, 1)';
                else if (normVal <= 0.6) return 'rgba(135, 127, 203, 1)';
                else if (normVal <= 0.8) return 'rgba(88, 76, 157, 1)';
                else return 'rgba(69, 31, 120, 1)';
            }),
        }
    }];

    var layout = {
        width: 800,
        height: 400,
        title: { text: 'Top 10 states with highest average shooting rates' },
        xaxis: { title: 'States', showgrid: false },
        yaxis: {
            automargin: true,
            showgrid: false
        },
        dragmode: false,
        staticPlot: true,
        responsive: true,

    };

    Plotly.newPlot("top10", data, layout, config);

}