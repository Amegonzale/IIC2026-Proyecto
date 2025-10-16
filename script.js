// Crear variables globales
const global_data = "data.json";
let selectedState = null;
let currentYear = null;
let allStatesData = {};

// Line graph ñom
function createLineGraph(data, selectedState = null, currentYear = null) {
    const years = Object.keys(data).sort();
    const states = new Set();
    
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
        
        // Si fue seleccionado en el mapa o grafico
        const isSelected = selectedState === state;

        const markerSizes = years.map(year => {
            if (currentYear && year === currentYear) {
                return isSelected ? 15 : 10; 
            }
            return isSelected ? 6 : 3;
        });
        
        const trace = {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: state,
            line: {
                color: isSelected ? 'rgba(255, 21, 21, 1)' : (selectedState ? 'lightgray' : 'rgba(113, 175, 255, 1)'), // No me gusta el color default ;;
                width: isSelected ? 3 : 1 // Al seleccionarlo se pone mas waton
            },
            marker: {
                size: markerSizes,
                color: isSelected ? 'rgba(255, 21, 21, 1)' : (selectedState ? 'lightgray' : 'rgba(113, 175, 255, 1)'),
                line: {
                    width: currentYear ? years.map(y => y === currentYear ? 2 : 0) : 0,
                    color: 'white'
                }
            },
            opacity: selectedState && !isSelected ? 0.3 : 1,
            showlegend: false
        };

        if (isSelected) selectedTrace.push(trace);
        else traces.push(trace);
    });

    if (selectedTrace.length > 0) traces.push(...selectedTrace);
    
    const layout = {
        title: {
            text: selectedState ? `${data[years[0]][selectedState].stateName} Timeline` : 'All States Timeline', // Sujeto a cambios :p
            font: { size: 14 }
        },
        xaxis: {
            title: 'Year',
            tickangle: -45
        },
        yaxis: {
            title: 'Rate per 100,000 students'
        },
        margin: { l: 50, r: 20, t: 50, b: 50 },
    };
    
    const config = {
        displayModeBar: false,
        responsive: true
    };
    
    Plotly.newPlot("lineGraph", traces, layout, config);
    
    // Click event desde el el grafico :3
    document.getElementById('lineGraph').on('plotly_click', function(eventData) {
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
            [0, 'rgba(255, 200, 200, 1)'], [0.2, 'rgba(255, 161, 161, 1)'],
            [0.4, 'rgba(255, 125, 125, 1)'], [0.6, 'rgba(255, 86, 86, 1)'],
            [0.8, 'rgba(253, 55, 55, 1)'], [1, 'rgba(255, 21, 21, 1)']
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
                    colorbar: { title: "Valor" },
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
            colorbar: { title: "Valor" },
            zmin: 0,
            zmax: zmaxGlobal
        }];

        const layout = {
            title: { text: 'How endangered is your child at school?<br><sup>Number of public school students who brought firearms to or possessed firearms at school per 100,000 students enrolled</sup>' },
            geo: {
                scope: "usa",
            },
            sliders: [{
                active: 0,
                pad: { t: 50 },
                len: 0.9,
                x: 0.1,
                y: 0,
                currentvalue: { visible: false },
                bgcolor:" #cfcfcfff",
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
                    x: 0.517,
                    y: 0.45,
                    sizex: 0.92,
                    sizey: 0.92,
                    xanchor: "center",
                    yanchor: "middle",
                    layer: "above"
                }
            ]
        };

        Plotly.newPlot("map", dataInit, layout, {
            scrollZoom: false,
            displayModeBar: false,
            responsive: false
        }).then(() => {
            Plotly.addFrames("map", frames);
        });

        // Click event desde el mapa :3
        document.getElementById('map').on('plotly_click', function(eventData) {
            if (eventData.points[0] && eventData.points[0].location) {
                const clickedState = eventData.points[0].location;
                selectedState = selectedState === clickedState ? null : clickedState;
                createLineGraph(allStatesData, selectedState, currentYear);
            }
        });

        document.getElementById('map').on('plotly_sliderchange', function(eventData) {
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