// wwwroot/js/mapInit.js

//window.initializeMap = () => {

//    const map = new ol.Map({
//        target: 'map',
//        layers: [
//            new ol.layer.Tile({ source: new ol.source.OSM() })
//        ],
//        view: new ol.View({
//            center: ol.proj.fromLonLat([106.6297, 10.8231]), // TP. HCM
//            zoom: 9
//        })
//    });
//    window.map = map;
//};
window.initializeMap = (mapId) => {
    const map = new ol.Map({
        target: mapId,
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([106.6297, 10.8231]), // TP.HCM
            zoom: 13
        })
    });

    // Tạo popup overlay
    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content');
    const closer = document.getElementById('popup-closer');

    const popupOverlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: { duration: 250 }
    });
    map.addOverlay(popupOverlay);

    closer.onclick = () => {
        popupOverlay.setPosition(undefined);
        closer.blur();
        return false;
    };

    // Gán vào global để các hàm khác gọi
    window.map = map;

    map.on('singleclick', async (evt) => {
        const coordinate = evt.coordinate;

        // Tính bbox quanh điểm click (5px x 5px)
        const resolution = map.getView().getResolution();
        const buffer = 5 * resolution;

        const extent = [
            coordinate[0] - buffer,
            coordinate[1] - buffer,
            coordinate[0] + buffer,
            coordinate[1] + buffer
        ];

        // Chuyển extent về EPSG:9210 (vì WFS bạn đang dùng là EPSG:9210)
        const extent9210 = ol.proj.transformExtent(
            extent, 'EPSG:3857', 'EPSG:9210'
        );

        // Tạo URL WFS với bbox
        const url = `http://gisportal.vn:8080/geoserver/hcm_esb/ows?` +
            `service=WFS&version=1.0.0&request=GetFeature` +
            `&typeName=hcm_esb:nutgiaoduongbo_5n` +
            `&outputFormat=application/json` +
            `&srsName=EPSG:9210` +
            `&bbox=${extent9210.join(',')},EPSG:9210`;

        try {
            const res = await fetch(url);
            const geojson = await res.json();

            if (geojson.features.length > 0) {
                const props = geojson.features[0].properties;
                let html = '<table>';
                for (const k in props) {
                    html += `<tr><th>${k}</th><td>${props[k]}</td></tr>`;
                }
                html += '</table>';

                document.getElementById('popup-content').innerHTML = html;
                popupOverlay.setPosition(coordinate);
            }
        } catch (e) {
            console.error("Lỗi WFS fetch:", e);
        }
    });
};
