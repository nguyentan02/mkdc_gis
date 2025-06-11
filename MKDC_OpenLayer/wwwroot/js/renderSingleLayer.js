
import WebGLLineLayer from 'ol/la'
const layerConfig = {
    'duongbo_5n': { typeName: 'hcm_esb:duongbo_5n', color: 'red' },
    'mepduong_5n': { typeName: 'hcm_esb:mepduong_5n', color: 'blue' },
    'meplongduong_5n': { typeName: 'hcm_esb:meplongduong_5n', color: 'green' },
    'nutgiaoduongbo_5n': { typeName: 'hcm_esb:nutgiaoduongbo_5n', color: 'orange' },
    'cacdoituongmatduongbos': { typeName: 'hcm_esb:cacdoituongmatduongbos', color: 'black' }
};

// lưu các layer đã khởi
window.bematLayers = window.bematLayers || {};

window.toggleLayer = async (key, visible) => {
    if (!window.map) {
        console.error("Map chưa khởi tạo");
        return;
    }

    // ẩn khi uncheck
    if (!visible) {
        const l = window.bematLayers[key];
        if (l) l.setVisible(false);
        return;
    }

    // hiện lại khi đã load
    if (window.bematLayers[key]) {
        window.bematLayers[key].setVisible(true);
        return;
    }

    // lần đầu load: build URL theo bbox nhưng native CRS rồi reproj client
    const cfg = layerConfig[key];
    const view = window.map.getView();
    const size = window.map.getSize();
    const extent3857 = view.calculateExtent(size);            // [minX,minY,maxX,maxY] in EPSG:3857
    const extent9210 = ol.proj.transformExtent(               // chuyển về native CRS
        extent3857,
        'EPSG:3857',
        'EPSG:9210'
    );

    // 1) build URL
    const url = [
        'http://gisportal.vn:8080/geoserver/hcm_esb/ows?',
        'service=WFS',
        '&version=1.0.0',
        '&request=GetFeature',
        `&typeName=${encodeURIComponent(cfg.typeName)}`,
        '&outputFormat=application/json'
    ].join('');

    // 2) fetch & show spinner
    window.showSpinner?.();
    let geojson;
    try {
        const resp = await fetch(url);
        geojson = await resp.json();
    } catch (e) {
        console.error("Fetch lỗi", e);
        window.hideSpinner?.();
        return;
    }

    // 3) readFeatures với dataProjection=9210 → reproj lên 3857
    const features = new ol.format.GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:9210',
        featureProjection: 'EPSG:3857'
    });

    // 4) source + layer
    const source = new ol.source.Vector({ features });
    const layer = new ol.layer.VectorImage({
        source,
        declutter: true,
        renderMode: 'image',
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        style: f => {
            const t = f.getGeometry().getType();
            if (t === 'Point' || t === 'MultiPoint') {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({ color: cfg.color }),
                        stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
                    })
                });
            }
            return new ol.style.Style({
                stroke: new ol.style.Stroke({ color: cfg.color, width: 2 })
            });
        }
    });

    window.map.addLayer(layer);
    window.bematLayers[key] = layer;
    window.hideSpinner?.();

    // 5) fit extent nếu muốn
    const ext = source.getExtent();
    if (!ol.extent.isEmpty(ext)) {
        view.fit(ext, { padding: [20, 20, 20, 20], maxZoom: 14 });
    }
};