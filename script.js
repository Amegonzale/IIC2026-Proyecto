// Crear variables globales
const global_data = "data.json";
const image = { img: "resources/usmap.png" };
const shot = new Tone.Player("resources/single-shot-2.mp3").toDestination();
let selectedState = null;
let currentYear = "2011";
let allStatesData = {};
let allStatesInfo = {};
let playbackrate = 1;

// Contexto
const global_yearly = "data_yearly.json";
const global_states = "data_states.json";
let contextYearly = {};
let contextStates = {};

// Loop sonido
const loop = new Tone.Loop(time => {
    console.log(time);
    shot.start(0);
}, "1n").start(0);



function timer() {
    Tone.Transport.stop()
}

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
            yValues.push(data[year][state].value * 2); // Per 50,000 students
        });

        allStatesInfo[state] = [Math.max(...yValues), data['2011'][state].info]


        let yMax = Math.max(...yValues)

        if (yMax >= 180) {
            yMax = 100
        }
        else if (yMax >= 30) {
            yMax = 40
        }
        else if (yMax >= 10) {
            yMax = 20
        }
        else {
            yMax = 10
        }

        // Si fue seleccionado en el mapa o grafico
        const isSelected = selectedState === state;

        const markerSizes = years.map(year => {
            if (currentYear && year === currentYear) {
                return isSelected ? 0 : 0; // 10 : 5 sin la linea
            }
            return 0;
        });

        const grey = 'rgba(159, 159, 159, 1)';
        //const grey = 'gray';
        const trace = {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: state,
            line: {
                color: isSelected ? 'rgba(255, 21, 21, 1)' : (selectedState ? grey : grey), // No me gusta el color default ;;
                width: isSelected ? 4 : 1 // Al seleccionarlo se pone mas waton
            },
            marker: {
                size: markerSizes,
                color: isSelected ? '#000000' : (selectedState ? grey : grey),
                line: {
                    width: currentYear ? years.map(y => y === currentYear ? 1 : 1) : 0,
                    color: isSelected ? 'black' : (selectedState ? grey : grey),
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
            yValues.push(data[year][state].value * 2);
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
                color: 'black',
                width: 6
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

    const avgxValues = [];
    const avgyValues = [];

    years.forEach(year => {
        avgxValues.push(year);
        const avgValue = Array.from(states).reduce((sum, state) => sum + data[year][state].value, 0) / states.size;
        avgyValues.push(avgValue * 2);
    });

    const avgMarkerSizes = years.map(year => {
        if (currentYear && year === currentYear) {
            return (selectedTrace.length > 0) ? 0 : 0; // 5 : 10 sin la linea
        }
        return 0;
    });

    const avgTrace = {
        x: avgxValues,
        y: avgyValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Average',
        line: {
            color: 'rgba(0, 0, 0, 1)',
            width: 3,
            dash: 'dashdot'
        },
        marker: {
            size: avgMarkerSizes
        },
    };

    traces.push(avgTrace);
    if (selectedTrace.length > 0) traces.push(...selectedTrace);
    // else traces.push(avgTrace); // por si queremos mostrarlo solo cuando no hay seleccionado

    const layout = {
        title: {
            text: selectedState ? `${data[years[0]][selectedState].stateName}` : 'All States',
            font: { family: 'sans-serif', size: 8 }
        },
        xaxis: {
            title: 'Year',
            tickangle: 0,
            showgrid: false,
            zeroline: false,

        },
        yaxis: {
            title: 'Rate per 50,000 students',
            showgrid: true,
            zeroline: false,
            side: 'right'

        },
        shapes: currentYear ? [{
            type: 'line',
            xref: 'x',
            x0: String(currentYear),
            x1: String(currentYear),
            yref: 'paper',
            y0: 0,
            y1: 1,
            line: { color: 'rgba(0, 0, 0, 0.5)', width: 2, dash: 'solid' },
            layer: 'above'
        }] : [],
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 20, r: 40, t: 100, b: 40 },
        height: 350,
        width: 600,
        legend: {
            x: 0.90,
            y: 1.13,
            xanchor: 'left',
            yanchor: 'top',
            bgcolor: 'rgba(255,255,255,0.85)',
            font: { size: 10 }
        },
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    Plotly.newPlot("lineGraph", traces, layout, config);

    // Click event desde el el grafico :3
    //document.getElementById('lineGraph').on('plotly_click', function (eventData) {
    //    const clickedState = eventData.points[0].data.name;
    //    selectedState = selectedState === clickedState ? null : clickedState;
    //    createLineGraph(allStatesData, selectedState, currentYear);
    //});
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
        const ZMAX = zmaxGlobal * 2;

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
            const values = states.map(s => data[year][s].value * 2);
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
                        outlinewidth: 1
                    },
                    zmin: 0,
                    zmax: ZMAX,
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
                outlinewidth: 1,

            },
            zmin: 0,
            zmax: ZMAX
        }];

        const layout = {
            // title: { text: 'How endangered is your child at school?<br><sup>Number of public school students who brought firearms to or possessed firearms at school per 100,000 students enrolled</sup>' },
            font: { family: "sans-serif" },
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
                    source: image['img'],
                    x: 0.52,
                    y: 0.47,
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
            width: 800,
            dragmode: false,
            activeselection: 'black',

        };

        Plotly.newPlot("choroplethMap", dataInit, layout, {
            scrollZoom: false,
            displayModeBar: false,
            responsive: false,


        }).then(() => {
            Plotly.addFrames("choroplethMap", frames);
        });

        // Click event desde el mapa :3
        document.getElementById('choroplethMap').on('plotly_click', function (eventData) {
            if (eventData.points[0] && eventData.points[0].location) {
                const clickedState = eventData.points[0].location;
                selectedState = selectedState === clickedState ? null : clickedState;

                updateInfo(currentYear, selectedState);

                createLineGraph(allStatesData, selectedState, currentYear);
                if (selectedState != null) {
                    image['img'] = "resources/usmap-" + clickedState + ".png";
                    var update = {
                        images: [
                            {
                                source: image['img'],
                                x: 0.52,
                                y: 0.47,
                                sizex: 0.79,
                                sizey: 0.79,
                                xanchor: "center",
                                yanchor: "middle",
                                layer: "above"
                            }
                        ],
                    }
                    Plotly.relayout("choroplethMap", update)
                    let max = Math.min(allStatesInfo[selectedState][0] / 10, 15)
                    loop.playbackRate = max
                    console.log(max)
                    Tone.Transport.start();
                    setTimeout(timer, 4000)
                }
                else {
                    image['img'] = "resources/usmap.png";
                    var update = {
                        images: [
                            {
                                source: image['img'],
                                x: 0.52,
                                y: 0.47,
                                sizex: 0.79,
                                sizey: 0.79,
                                xanchor: "center",
                                yanchor: "middle",
                                layer: "above"
                            }
                        ],
                    }

                    Plotly.relayout("choroplethMap", update)
                    timer()
                }
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
    createLineGraph(allStatesData, selectedState, year);
    updateInfo(year, selectedState);
}

// Contexts
fetch('data_states.json')
    .then(response => response.json())
    .then(data => {
        contextStates = data;
    })
    .catch(error => console.error('Error:', error));

fetch('data_yearly.json')
    .then(response => response.json())
    .then(data => {
        contextYearly = data;
    })
    .catch(error => console.error('Error:', error));

function updateInfo(year, state) {
    const info = document.getElementById('info');
    if (!state) {
        const context = contextYearly[year];
        info.innerHTML = context || 'No context available';
        console.log(context);
    } else {
        const context = contextStates[state];
        info.innerHTML = context || 'No context available';
        console.log(context);
    }
}