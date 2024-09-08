function loadMap(){
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2VwdGVudHJpbyIsImEiOiJjbHlqMTB3eXMwaHplMmxzOG5xbmxibzE5In0.hezFowk7zxVxP95gL6nr_Q';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/satellite-v9', // style initial de la carte
        center: [2.3522, 48.8566], // starting position [lng, lat]
        zoom: 12 // starting zoom
    });

    let animationSpeed = 50;
    let coordinates = [];
    let animationRequest;

    map.on('load', () => {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.terrain-rgb',
            'tileSize': 512,
            'maxzoom': 14
        });
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        });
    });

    document.getElementById('toggle3d').addEventListener('change', (e) => {
        if (e.target.checked) {
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        } else {
            map.setTerrain(null);
        }
    });

    document.getElementById('toggleDayNight').addEventListener('change', (e) => {
        const mapStyle = document.getElementById('mapStyle');
        if (e.target.checked) {
            mapStyle.value = 'mapbox://styles/mapbox/navigation-night-v1';
        } else {
            mapStyle.value = 'mapbox://styles/mapbox/streets-v11';
        }
        map.setStyle(mapStyle.value);
    });

    document.getElementById('mapStyle').addEventListener('change', (e) => {
        map.setStyle(e.target.value);
    });

    document.getElementById('nmeaFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target.result;
                coordinates = parseNMEA(data);
                animateRouteProgressive(coordinates);
            };
            reader.readAsText(file);
        }
    });

    document.getElementById('speedRange').addEventListener('input', (e) => {
        animationSpeed = 100 - e.target.value;
    });

    document.getElementById('replayButton').addEventListener('click', () => {
        if (coordinates.length > 0) {
            animateRouteProgressive(coordinates);
        }
    });

    function parseNMEA(data) {
        const lines = data.split('\n');
        const coordinates = [];
        lines.forEach(line => {
            if (line.startsWith('$GPGGA')) {
                const parts = line.split(',');
                if (parts[2] && parts[4]) {
                    const lat = convertToDecimal(parts[2], parts[3]);
                    const lon = convertToDecimal(parts[4], parts[5]);
                    coordinates.push([lon, lat]);
                }
            }
        });
        return coordinates;
    }

    function convertToDecimal(coord, direction) {
        let decimal = parseFloat(coord.slice(0, 2)) + parseFloat(coord.slice(2)) / 60;
        if (direction === 'S' || direction === 'W') decimal *= -1;
        return decimal;
    }

    function animateRouteProgressive(coordinates) {
        const geojson = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': []
                    }
                }
            ]
        };

        if (map.getSource('line')) {
            map.removeLayer('line-background');
            map.removeLayer('line-dashed');
            map.removeSource('line');
        }

        map.addSource('line', {
            type: 'geojson',
            data: geojson
        });

        map.addLayer({
            type: 'line',
            source: 'line',
            id: 'line-background',
            paint: {
                'line-color': 'yellow',
                'line-width': 6,
                'line-opacity': 0.4
            }
        });

        map.addLayer({
            type: 'line',
            source: 'line',
            id: 'line-dashed',
            paint: {
                'line-color': 'yellow',
                'line-width': 6,
                'line-dasharray': [0, 4, 3]
            }
        });

        const dashArraySequence = [
            [0, 4, 3],
            [0.5, 4, 2.5],
            [1, 4, 2],
            [1.5, 4, 1.5],
            [2, 4, 1],
            [2.5, 4, 0.5],
            [3, 4, 0],
            [0, 0.5, 3, 3.5],
            [0, 1, 3, 3],
            [0, 1.5, 3, 2.5],
            [0, 2, 3, 2],
            [0, 2.5, 3, 1.5],
            [0, 3, 3, 1],
            [0, 3.5, 3, 0.5]
        ];

        let step = 0;
        let currentIndex = 0;

        function animateDashArray(timestamp) {
            const newStep = parseInt((timestamp / animationSpeed) % dashArraySequence.length);
            if (newStep !== step) {
                map.setPaintProperty('line-dashed', 'line-dasharray', dashArraySequence[step]);
                step = newStep;
            }

            if (currentIndex < coordinates.length) {
                geojson.features[0].geometry.coordinates.push(coordinates[currentIndex]);
                map.getSource('line').setData(geojson);
                currentIndex++;
            }

            animationRequest = requestAnimationFrame(animateDashArray);
        }

        cancelAnimationFrame(animationRequest);
        animateDashArray(0);
    }
}