// wwwroot/js/mapInterop.js

// Bảng map mã → tên huyện
const lengthNames = {
    '142414': 'Huyện U Minh',
    '142447': 'Huyện Thới Bình',
    '156758': 'Huyện Trần Văn Thời',
    '85250': 'Thành phố Cà Mau',
    '99812': 'Huyện Cái Nước',
    '136041': 'Huyện Đầm Dơi',
    '103083': 'Huyện Phú Tân',
    '142321': 'Huyện Năm Căn',
    '174259': 'Huyện Ngọc Hiển',
    '295': 'Huyện Ngọc Hiển',
    '14649': 'Hòn Gốm',
    '3478': 'Hòn Chuối',
    '2054': 'Hòn Bương',
    '10993': 'Hòn Khoai',
    '3135': 'Hòn Sao',
    '744': 'Hòn Gỗ'
};

window.renderBematStatic = () => {
 
    // 2) Nguồn WFS (EPSG:4326 -> EPSG:3857)
    const vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON({
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        }),
        url:
            'http://gisportal.vn:8080/geoserver/camau_quyhoachgiadat/ows' +
            '?service=WFS&version=1.0.0&request=GetFeature' +
            '&typeName=camau_quyhoachgiadat:diaphanhuyen_4326' +
            '&outputFormat=application/json'
    });

    // 3) Layer vector (chưa style)
    const vectorLayer = new ol.layer.Vector({ source: vectorSource });
    map.addLayer(vectorLayer);

    // 4) Controls
    map.addControl(new ol.control.Zoom());
    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(5),
        projection: 'EPSG:4326',
        target: document.getElementById('mouse-position'),
        undefinedHTML: ''
    }));

    // 5) Khi load xong, tính min/max để choropleth và gán style function
    vectorSource.once('change', () => {
        if (vectorSource.getState() !== 'ready') return;

        const feats = vectorSource.getFeatures();
        const lens = feats.map(f => f.get('shape_leng') || 0);
        const minLen = Math.min(...lens);
        const maxLen = Math.max(...lens);

        vectorLayer.setStyle(feature => {
            const len = feature.get('shape_leng') || 0;
            const t = (len - minLen) / (maxLen - minLen);
            const hue = 260 * (1 - t);
            const fillColor = `hsl(${hue}, 90%, 60%)`;

            const key = Math.round(len).toString();
            const label = lengthNames[key] || key;

            return new ol.style.Style({
                fill: new ol.style.Fill({ color: fillColor }),
                stroke: new ol.style.Stroke({ color: '#333', width: 1 }),
                text: new ol.style.Text({
                    text: label,
                    font: 'bold 14px sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
                    overflow: true,
                    placement: 'point'
                })
            });
        });

        // 5.3) Fit extent
        const ext = vectorSource.getExtent();
        if (!ol.extent.isEmpty(ext)) {
            map.getView().fit(ext, {
                padding: [20, 20, 20, 20],
                maxZoom: 12
            });
        }
    });

    // expose map để dùng ở ngoài

};




