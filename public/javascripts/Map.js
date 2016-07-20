var GeoJSONFeatures=!{JSON.stringify(features)};
		//alert(GeoJSONFeatures);
		var osm = new ol.layer.Tile({source: new ol.source.OSM()})
		
		var layer = new ol.layer.Vector({
			title: 'microzones',
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				projection :'EPSG:4326',
				features: (new ol.format.GeoJSON()).readFeatures(GeoJSONFeatures)
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#737373',
					width: 2
				}),
				fill: new ol.style.Fill({
					color: 'rgba(255,255,255,0.2)'
				})
			})
		});
		//layer.setVisible(true);
		
		//document.getElementById('text').innerHtml=GeoJSONFeatures;
		var map = new ol.Map({
			layers: [osm, layer],
			target: 'map',
			controls: ol.control.defaults().extend([
				new ol.control.ScaleLine({className: 'ol-scale-line', target: document.getElementById('scale-line')})
			]),
			view: new ol.View({
				projection: 'EPSG:4326',
				center: [#{lng}, #{lat}],
				zoom: 11
			})
		});

		hoverInteraction = new ol.interaction.Select({
			condition: ol.events.condition.pointerMove,
			layers:[layer]	//Setting layers to be hovered
		});
		map.addInteraction(hoverInteraction);