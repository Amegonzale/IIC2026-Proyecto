// Crear variables globales
const global_data = "data.json";
let selectedState = null;
let currentYear = null;
let allStatesData = {};

// Line graph ñom
function createLineGraph(data, selectedState = null, currentYear = "2011") {
    const years = Object.keys(data).sort();
    const states = new Set();
    const wstate = [];

    years.forEach(year => {
        Object.keys(data[year]).forEach(state => states.add(state));
    }); // Consigo states

    const traces = []; // Cada linea
    const selectedTrace = []; // Asi la puedo poner encima

    states.forEach(state => {
        const xValues = [];
        const yValues = [];

        years.forEach(year => {
            xValues.push(year);
            yValues.push(data[year][state].value);
        });

        let yMax = Math.max(...yValues)

        if (yMax >= 90) {
            yMax = 100
        }
        else if (yMax >= 30) {
            yMax = 40
        }
        else if (yMax >= 15) {
            yMax = 20
        }
        else {
            yMax = 10
        }

        // Si fue seleccionado en el mapa o grafico
        const isSelected = selectedState === state;

        const markerSizes = years.map(year => {
            if (currentYear && year === currentYear) {
                return isSelected ? 10 : 5;
            }
            return isSelected ? 7 : 1;
        });

        const trace = {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: state,
            line: {
                color: isSelected ? 'rgba(255, 21, 21, 1)' : (selectedState ? 'gray' : 'gray'), // No me gusta el color default ;;
                width: isSelected ? 4 : 1 // Al seleccionarlo se pone mas waton
            },
            marker: {
                size: markerSizes,
                color: isSelected ? 'rgba(255, 21, 21, 1)' : (selectedState ? 'gray' : 'gray'),
                line: {
                    width: currentYear ? years.map(y => y === currentYear ? 1 : 1) : 0,
                    color: isSelected ? 'black' : (selectedState ? 'gray' : 'gray'),
                },
                opacity: 1,
            },
            opacity: selectedState && !isSelected ? 0.3 : 1,
            showlegend: false,
            uid: isSelected ? 'SELECTED' + yMax : state,
        };

        if (isSelected) {
            selectedTrace.push(trace);
            wstate.push(state)

        }
        else traces.push(trace);
    });

    if (wstate.length > 0) {
        const state = wstate[0]
        const xValues = [];
        const yValues = [];

        years.forEach(year => {
            xValues.push(year);
            yValues.push(data[year][state].value);
        });

        const markerSizes = years.map(year => {
            return 2;
        });

        const trace = {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: state,
            line: {
                color: 'black', // No me gusta el color default ;;
                width: 6 // Al seleccionarlo se pone mas waton
            },
            marker: {
                size: markerSizes,
                color: 'white',
                line: {
                    width: 0,
                    color: 'white'
                }
            },
            opacity: 1,
            showlegend: false,
            uid: 'SELECTED-OUTLINE',
        };

        traces.push(trace)
    }

    if (selectedTrace.length > 0) traces.push(...selectedTrace);

    const layout = {
        title: {
            text: selectedState ? `${data[years[0]][selectedState].stateName}` : 'All States',
            font: { size: 8 }
        },
        xaxis: {
            title: 'Year',
            tickangle: 0,
            showgrid: false,
            zeroline: false,

        },
        yaxis: {
            title: 'Rate per 100,000 students',
            showgrid: true,
            zeroline: false,
            side: 'right'

        },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 20, r: 40, t: 100, b: 40 },
        height: 350,
        width: 600
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    Plotly.newPlot("lineGraph", traces, layout, config);

    // Click event desde el el grafico :3
    document.getElementById('lineGraph').on('plotly_click', function (eventData) {
        const clickedState = eventData.points[0].data.name;
        selectedState = selectedState === clickedState ? null : clickedState;
        createLineGraph(allStatesData, selectedState, currentYear);
    });
}

// Cargar datos y actualizar variables globales
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allStatesData = data;
        createLineGraph(data);
        const allValues = Object.values(data).flatMap(yearData =>
            Object.values(yearData).map(d => d.value)
        );
        const zmaxGlobal = Math.max(...allValues);

        const color = [
            [0, 'rgba(255, 200, 200, 1)'], [0.2, 'rgba(251, 127, 127, 1)'],
            [0.4, 'rgba(253, 80, 80, 1)'], [0.6, 'rgba(249, 21, 21, 1)'],
            [0.8, 'rgba(186, 0, 0, 1)'], [1, 'rgba(133, 0, 0, 1)']
        ];

        const years = Object.keys(data).sort();
        const frames = [];
        const locationsAll = [];
        const valuesAll = [];
        const textsAll = [];

        years.forEach(year => {
            const states = Object.keys(data[year]);
            const values = states.map(s => data[year][s].value);
            const texts = states.map(s => data[year][s].info);

            frames.push({
                name: year,
                data: [{
                    type: "choropleth",
                    locationmode: "USA-states",
                    locations: states,
                    z: values,
                    text: texts,
                    colorscale: color,
                    colorbar: {
                        title: "Valor",
                        x: -0.05,
                        xanchor: 'left',
                        thickness: 8,
                        len: 0.85,
                        outlinewidth: 0
                    },
                    zmin: 0,
                    zmax: zmaxGlobal
                }]
            });
            if (year === years[0]) {
                locationsAll.push(...states);
                valuesAll.push(...values);
                textsAll.push(...texts);
            }
        });

        const dataInit = [{
            type: "choropleth",
            locationmode: "USA-states",
            locations: locationsAll,
            z: valuesAll,
            text: textsAll,
            hoverinfo: "text",
            colorscale: color,
            colorbar: {
                title: "Valor",
                x: -0.05,
                xanchor: 'left',
                thickness: 8,
                len: 0.85,
                outlinewidth: 0
            },
            zmin: 0,
            zmax: zmaxGlobal
        }];

        const layout = {
            // title: { text: 'How endangered is your child at school?<br><sup>Number of public school students who brought firearms to or possessed firearms at school per 100,000 students enrolled</sup>' },
            geo: {
                scope: "usa"
            },
            sliders: [{
                active: 0,
                pad: { t: 50 },
                len: 1,
                x: 0.1,
                y: 0,
                currentvalue: { visible: false },
                bgcolor: " #cfcfcfff",
                steps: years.map(year => ({
                    label: year,
                    method: "animate",
                    args: [[year], {
                        mode: "immediate",
                        frame: { duration: 500, redraw: true },
                        transition: { duration: 300 }
                    }]
                }))
            }],
            images: [
                {
                    source: "usmap.png",
                    x: 0.52,
                    y: 0.46,
                    sizex: 0.79,
                    sizey: 0.79,
                    xanchor: "center",
                    yanchor: "middle",
                    layer: "above"
                }
            ],
            margin: {
                l: 50,
                r: 0,
                b: 0,
                t: 0,
                pad: 0
            },
            height: 520,
            width: 850
        };

        Plotly.newPlot("choroplethMap", dataInit, layout, {
            scrollZoom: false,
            displayModeBar: false,
            responsive: false
        }).then(() => {
            Plotly.addFrames("choroplethMap", frames);
        });

        // Click event desde el mapa :3
        document.getElementById('choroplethMap').on('plotly_click', function (eventData) {
            if (eventData.points[0] && eventData.points[0].location) {
                const clickedState = eventData.points[0].location;
                selectedState = selectedState === clickedState ? null : clickedState;
                createLineGraph(allStatesData, selectedState, currentYear);
            }
        });

        document.getElementById('choroplethMap').on('plotly_sliderchange', function (eventData) {
            if (eventData && eventData.slider && eventData.slider.active !== undefined) {
                const activeIndex = eventData.slider.active;
                currentYear = years[activeIndex];
                updateYear(currentYear);
            }
        });

    })
    .catch(error => console.error('Error:', error));

function updateYear(year) {
    currentYear = year;
    createLineGraph(allStatesData, selectedState, currentYear);
}