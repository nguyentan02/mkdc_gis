window.initializeMap = () => {
    // Map init
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([106.4, 10.89]), // Quận 1
            zoom: 12
        })
    });

    // Định nghĩa nguồn dữ liệu
    function createLayer(url, color) {
        const source = new ol.source.Vector({
            format: new ol.format.GeoJSON({
                dataProjection: 'EPSG:9210',      // 🔥 phải đúng EPSG gốc
                featureProjection: 'EPSG:3857'    // 🔥 chiếu lên bản đồ nền
            }),
            url
        });

        const layer = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 1.2
                })
            })
        });

        source.once('change', function () {
            if (source.getState() === 'ready') {
                const extent = source.getExtent();
                if (!ol.extent.isEmpty(extent)) {
                    map.getView().fit(extent, { padding: [20, 20, 20, 20], maxZoom: 15 });
                }
            }
        });

        return { layer, source };
    }

    const layers = {
        duongbo: createLayer("http://gisportal.vn:8080/geoserver/hcm_esb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hcm_esb%3Aduongbo_5n&outputFormat=application%2Fjson", 'blue'),
        mepduong: createLayer("http://gisportal.vn:8080/geoserver/hcm_esb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hcm_esb%3Amepduong_5n&outputFormat=application%2Fjson", 'red'),
        meplong: createLayer("http://gisportal.vn:8080/geoserver/hcm_esb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hcm_esb%3Ameplongduong_5n&outputFormat=application%2Fjson", 'green')
    };

    // Mặc định bật 3 lớp
    for (let key in layers) {
        map.addLayer(layers[key].layer);
    }

    // Toggle checkbox
    window.toggleLayer = (key, checked) => {
        layers[key].layer.setVisible(checked);
    };
};
