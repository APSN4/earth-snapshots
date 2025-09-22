var imports = require('users/dreamsresults/test_uni:objects');
var places = imports.places;
print(places);
Map.setControlVisibility(false);
var panel = ui.Panel({style: {position: 'top-left'}});
Map.add(panel);
var intro = ui.Label('Panel', {fontWeight: 'bold', textAlign: 'center', stretch: 'horizontal', fontSize: '24px'});
panel.add(intro);

var select2 = ui.Select();
var button = ui.Button('Применить');
var q = {};

//Панели, чтобы удалять старые
var current_temperature_panel = null;
var current_actions = null;
var current_legend = null;
var current_main_panel = null;
var current_inspector = null;

var select = ui.Select({
    items: Object.keys(places),
    onChange: function(key) {
        Map.layers().reset();
        var imya = key;
        var uch = places[imya];
        var roi = uch.geometry().buffer(2000).bounds();
        q = {uch:uch, roi:roi, imya:imya};
        Map.centerObject(roi);
        Map.addLayer(ee.Image().byte().paint({featureCollection:roi, width:2}), {palette: ['red']}, 'Буфер');
        Map.addLayer(ee.Image().byte().paint({featureCollection:uch, width:2}), {palette: ['black']}, key);
    }});


button.onClick(function()
{
    Map.layers().reset();
    var DATE1 = panel_date.widgets().get(1).getValue();
    var DATE2 = panel_date.widgets().get(2).getValue();
    var cloud = Number(panel_date.widgets().get(3).getValue());
    var ROI = q.roi;
    // Доля облачного покрытия района интереса.
    function getCloudScore(image) {
        var qa = image.select('QA_PIXEL').rename('cloud');
        var mask = qa.bitwiseAnd(1 << 3)
            .or(qa.bitwiseAnd(1 << 4))
            .or(qa.bitwiseAnd(1 << 2))
            .or(qa.bitwiseAnd(1 << 1));
        var cloudiness = mask.reduceRegion({
            reducer: 'mean',
            geometry: ROI,
            scale: 30,
        });
        return image.set(cloudiness);
    }


    //Составляется исходный снимок в естественных цветах
    var l821 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA');
    var l921 = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA');
    var l822 = ee.ImageCollection('LANDSAT/LC08/C02/T2_TOA');
    var l922 = ee.ImageCollection('LANDSAT/LC09/C02/T2_TOA');
    var coll = l821.merge(l921).merge(l822).merge(l922)
        .filterDate(ee.Date(DATE1), ee.Date(DATE2))
        .filterBounds(q.uch)
        .map(getCloudScore).filter(ee.Filter.lt('cloud', cloud))
        //.filterMetadata('CLOUD_COVER', 'less_than', cloud)
        .sort('CLOUD_COVER', false);
    var start = ee.Date(DATE1);
    var finish = ee.Date(DATE2);

    var nDays = finish.difference(start, 'days');
    var dayOffsets = ee.List.sequence(0, nDays.subtract(1));

    var coll_LST = ee.ImageCollection(dayOffsets
        .map(function (dayOffset) {
            var dayStart = start.advance(dayOffset, 'days');
            var dayFinish = dayStart.advance(1, 'days');
            var composite = coll.filterDate(dayStart, dayFinish).median();
            return composite
                .set('empty', composite.bandNames().size().eq(0))
                .set('date', dayStart.format('YYYY-MM-dd'))
                .set('system:time_start', dayStart.millis());
        }))
        .filterMetadata('empty', 'equals', 0);


    if (coll.size().getInfo() === 0) {print(q.imya, 'Снимки на выбранный период не нашлись.')}
    else {print(q.imya, 'Снимки на выбранный период нашлись!', coll.toList(coll.size()))}
    var imagePAN = coll.mosaic().clip(ROI);
    var hsv = imagePAN.select(['B4', 'B3', 'B2']).rgbToHsv();
    var sharpened = ee.Image.cat([hsv.select('hue'), hsv.select('saturation'), imagePAN.select('B8')]).hsvToRgb();
    //var maxP2 = sharpened.select('red').reduceRegion({reducer:ee.Reducer.max(), geometry:ROI, scale:15, maxPixels: 1e9});
    //maxP2= ee.Number(maxP2.get('red')).getInfo();
    //print(q.imya, cloud, DATE1, DATE2, maxP2, coll.toList(coll.size()), coll_LST.toList(coll_LST.size()), coll.aggregate_array('DATE_ACQUIRED').distinct());
    //Map.addLayer(sharpened,{min: 0, max: maxP2*0.6, gamma: 1.4},'Исходный снимок '+DATE1);
    Map.addLayer(ee.Image().byte().paint({featureCollection:ROI, width:2}), {palette: ['red']}, 'Буфер');
    Map.addLayer(ee.Image().byte().paint({featureCollection:q.uch, width:2}), {palette: ['black']}, q.imya);

    q.coll = coll_LST.sort('system:time_start', true)//.aggregate_array('DATE_ACQUIRED').distinct();
        .reduceColumns(ee.Reducer.toList(), ['date'])
        .get('list');
    //print(q.coll);
    q.coll.evaluate(function(ids) {
        select2.items().reset(ids);
        select2.setValue(select2.items().get(0));
    });
});

var panel_date = ui.Panel({
    widgets: [
        ui.Label('Впишите даты:'),
        ui.Textbox({placeholder:'date1', value: '2024-06-10', style:{width:'100px'}}),
        ui.Textbox({placeholder:'date2', value: '2024-07-28', style:{width:'100px'}}),
        ui.Textbox({placeholder:'cloud', value: 0.1, style:{width:'40px'}})
    ]
});


var select2 = ui.Select({
    items: q.coll,
    onChange: function(DATE) {
        Map.layers().reset();
        var name_uchastok = q.imya;
        var folder = 'GEE_exports';

        //Создаётся буфер области интереса, приближаемся к объекту
        var uchastok = q.uch
        var ROI = uchastok.geometry().buffer(2000).bounds();
        Map.setOptions('hybrid', {});
        //Map.centerObject(ROI);

        //Составляется исходный снимок в естественных цветах
        var l821 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA');
        var l921 = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA');
        var l822 = ee.ImageCollection('LANDSAT/LC08/C02/T2_TOA');
        var l922 = ee.ImageCollection('LANDSAT/LC09/C02/T2_TOA');
        var coll = l821.merge(l921).merge(l822).merge(l922)
            .filterDate(ee.Date(DATE), ee.Date(DATE).advance(1, 'days'))
            .filterBounds(ROI);
        //if (coll.size().getInfo() === 0) {print('Снимки не нашлись.')} else {print('Снимки нашлись!', coll.toList(coll.size()))}
        var imagePAN = coll.mosaic().clip(ROI);
        var hsv = imagePAN.select(['B4', 'B3', 'B2']).rgbToHsv();
        var sharpened = ee.Image.cat([hsv.select('hue'), hsv.select('saturation'), imagePAN.select('B8')]).hsvToRgb();
        var maxP2 = sharpened.select('red').reduceRegion({reducer:ee.Reducer.minMax(), geometry:ROI, scale:30, maxPixels: 1e9});
        maxP2= ee.Number(maxP2.get('red_max')).getInfo();
        //Map.addLayer(sharpened,{min: 0, max: maxP2*0.6, gamma: 1.4},'Исходный снимок');
        print(maxP2);


        //Составление тепловой карты
        function addTemp8(image) {
            var toa = image.select('B10').multiply(0.0003342).add(0.1);
            var br_temp_kelvin = ee.Image(1321.0789).divide(ee.Image(774.8853).divide(toa).add(1).log());
            var LST8 = br_temp_kelvin.subtract(273.15).rename('Temperature');
            return image.addBands(LST8, null, true);}

        function addTemp9(image) {
            var toa = image.select('B10').multiply(0.00038).add(0.1);
            var br_temp_kelvin = ee.Image(1329.2405).divide(ee.Image(799.0284).divide(toa).add(1).log());
            var LST9 = br_temp_kelvin.subtract(273.15).rename('Temperature');
            return image.addBands(LST9, null, true);}


        var l81 = ee.ImageCollection('LANDSAT/LC08/C02/T1').map(addTemp8);
        var l91 = ee.ImageCollection('LANDSAT/LC09/C02/T1').map(addTemp9);
        var l82 = ee.ImageCollection('LANDSAT/LC08/C02/T2').map(addTemp8);
        var l92 = ee.ImageCollection('LANDSAT/LC09/C02/T2').map(addTemp9);
        var l89 = l81.merge(l91).merge(l82).merge(l92)
            .filterDate(ee.Date(DATE), ee.Date(DATE).advance(1, 'days'))
            .filterBounds(ROI);
        var image = l89.mosaic().clip(ROI);
        var LST = image.select('Temperature');

        //Определение минимального и максимального значений температуры созданной карты
        var minMax = LST.reduceRegion({reducer:ee.Reducer.minMax(), geometry:ROI, scale:30, maxPixels: 1e9});
        minMax = minMax.rename(minMax.keys(), ['max','min']);
        var min = ee.Number(minMax.get('min')).getInfo().toFixed(1);
        var max = ee.Number(minMax.get('max')).getInfo().toFixed(1);
        if (min > 0) {var min_l = '+'+min+' '+String.fromCharCode(176)+'C'}
        else {var min_l = min+' '+String.fromCharCode(176)+'C'}
        if (max > 0) {var max_l = '+'+max+' '+String.fromCharCode(176)+'C'}
        else {var max_l = max+' '+String.fromCharCode(176)+'C'}
        //print('Температура в пределах буферной зоны '+DATE, min_l+' - минимальная', max_l+' - максимальная');

        //Вывод тепловой карты, буферной зоны и границ области интреса
        var palette = ['040274', '0502ce', '307ef3', '3be285', 'b5e22e', 'ffb613', 'ff0000', '911003'];
        var visLST = {min: min, max: max, palette: palette};
        //Map.addLayer(LST, visLST, 'Тепловая карта (LST)');
        //Map.addLayer(ee.Image().byte().paint({featureCollection:ROI, width:2}), {palette: ['red']}, 'Буфер');
        //Map.addLayer(ee.Image().byte().paint({featureCollection:uchastok, width:2}), {palette: ['black']}, name_uchastok);

        //Определение минимального и максимального значений температуры в области интереса
        var minMax_o = LST.reduceRegion({reducer:ee.Reducer.minMax(), geometry:uchastok, scale:30, maxPixels: 1e9});
        minMax_o = minMax_o.rename(minMax_o.keys(), ['max','min']);
        var min_o = ee.Number(minMax_o.get('min')).getInfo().toFixed(1);
        var max_o = ee.Number(minMax_o.get('max')).getInfo().toFixed(1);
        if (min_o > 0) {var min_l_o = '+'+min_o+' '+String.fromCharCode(176)+'C'}
        else {var min_l_o = min_o+' '+String.fromCharCode(176)+'C'}
        if (max_o > 0) {var max_l_o = '+'+max_o+' '+String.fromCharCode(176)+'C'}
        else {var max_l_o = max_o+' '+String.fromCharCode(176)+'C'}
        //print('Температура в пределах объекта '+DATE, min_l_o+' - минимальная', max_l_o+' - максимальная');

        q.export_paramsRGB = {
            image: sharpened, description: name_uchastok+'_'+DATE+'_RGB', scale: 15, region: image.geometry(),
            fileFormat: 'GeoTIFF', folder: folder,  maxPixels: 1e12 };

        q.export_paramsLST = {
            image: LST,  description: name_uchastok+'_'+DATE+'_LST',  scale: 30,
            region: image.geometry(),  fileFormat: 'GeoTIFF',  folder: folder,  maxPixels: 1e12}


        // Создание определителя температуры в точке
        var inspector = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
        inspector.add(ui.Label('Нажмите для получения значения температуры в точке'));
        Map.add(inspector);
        Map.style().set('cursor', 'crosshair');

        Map.onClick(function(coords) {
            inspector.clear();
            inspector.style().set('shown', true);
            inspector.add(ui.Label('Loading...', {color: 'gray'}));

            var point = ee.Geometry.Point(coords.lon, coords.lat);
            var temporalMean = LST.reduce(ee.Reducer.mean());
            var sampledPoint = temporalMean.reduceRegion(ee.Reducer.mean(), point, 10);
            var computedValue = sampledPoint.get('mean');

            computedValue.evaluate(function(result) {
                inspector.clear();
                if (computedValue.getInfo() !== null)
                {inspector.add(ui.Label({value: 'Температура в данной точке: ' + result.toFixed(1)+' '+String.fromCharCode(176)+'C',  style: {stretch: 'vertical'} }));}
                else {inspector.add(ui.Label({value: 'Точка не входит в буферную зону',  style: {stretch: 'vertical'} }));}
                inspector.add(ui.Button({label:'Close', onClick:function() {inspector.style().set('shown', false)}}));
            });
        });

        var sss1 = {fontSize: '14px', margin: '1px 5px'};
        var sss2 = {fontSize: '14px', margin: '1px 5px'};
        var sss3 = {fontSize: '16px', margin: '0px 0px'};
        var ddd1 = ui.Label('Температура в пределах буферной зоны '+DATE, sss1);
        var ddd2 = ui.Label(min_l+' - минимальная', sss2);
        var ddd3 = ui.Label(max_l+' - максимальная', sss2);
        var ddd7 = ui.Label('-------------------------------------------------------------------------', sss3);
        var ddd4 = ui.Label('Температура в пределах объекта '+DATE, sss1);
        var ddd5 = ui.Label(min_l_o+' - минимальная', sss2);
        var ddd6 = ui.Label(max_l_o+' - максимальная', sss2);


        var Panel_map = ui.Panel({style: {position: 'top-right'}});
        var label2 = ui.Label({value: 'Действия с картой', style: {fontWeight: 'bold', textAlign: 'center', stretch: 'horizontal', margin: '1px 5px'}});
        var buu1 = ui.Button('1', function() {Map.centerObject(ROI)});
        var buu2 = ui.Button('2', function() {Map.setOptions('ROADMAP', {})});
        var buu3 = ui.Button('3', function() {Map.setOptions('SATELLITE', {})});
        var buu4 = ui.Button('4', function() {Map.setOptions('hybrid', {})});

        var ddd = ui.Panel({
            widgets: [
                ui.Label('Действия с картой', {fontWeight: 'bold', textAlign: 'center', stretch: 'horizontal', margin: '0px 1px'}),
                ui.Panel([buu1, buu2, buu3, buu4], ui.Panel.Layout.flow('horizontal')),
                ui.Label(' 1. Приблизиться к буферной зоне', {margin: '0px 8px'}),
                ui.Label(' 2. Гугл карта - схема', {margin: '0px 8px'}),
                ui.Label(' 3. Гугл карта - спутник', {margin: '0px 8px'}),
                ui.Label(' 4. Гугл карта - спутник с надписями', {margin: '0px 8px'}),
            ],
        });
        Map.add(Panel_map.add(ddd));


        var resultsPanel = ui.Panel({style: {position: 'bottom-right'}});
        Map.add(resultsPanel.add(ddd1).add(ddd2).add(ddd3).add(ddd7).add(ddd4).add(ddd5).add(ddd6));

        var mainPanel = ui.Panel({style: {position: 'top-right'}});
        var layerControlPanel = ui.Panel();
        var label = ui.Label({value: 'Слои', style: {fontWeight: 'bold', textAlign: 'center', stretch: 'horizontal', margin: '1px 5px'}});
        layerControlPanel.add(label);

        var checkBoxLayer3 = ui.Checkbox({label: name_uchastok}).setValue(true);
        var checkBoxLayer4 = ui.Checkbox({label: 'Буфер'}).setValue(true);
        var checkBoxLayer1 = ui.Checkbox({label: 'Тепловая карта'}).setValue(true);
        var checkBoxLayer2 = ui.Checkbox({label: 'Исходный снимок'}).setValue(true);

        layerControlPanel.add(checkBoxLayer3);
        layerControlPanel.add(checkBoxLayer4);
        layerControlPanel.add(checkBoxLayer1);
        layerControlPanel.add(checkBoxLayer2);
        mainPanel.add(layerControlPanel);
        Map.add(mainPanel);

        var layer2020 = ui.Map.Layer(LST, {min: min, max: max, palette: palette}, 'LST');
        var layer2021 = ui.Map.Layer(sharpened,{min: 0, max: maxP2*0.65, gamma: 1.3},'Исходный снимок');
        var layer2022 = ui.Map.Layer(ee.Image().byte().paint({featureCollection:ROI, width:2}), {palette: ['red']}, 'Буфер');
        var layer2023 = ui.Map.Layer(ee.Image().byte().paint({featureCollection:uchastok, width:2}), {palette: ['black']}, name_uchastok);

        Map.add(layer2021);
        Map.add(layer2020);
        Map.add(layer2022);
        Map.add(layer2023);

        checkBoxLayer1.onChange(function(checked){layer2020.setShown(checked)});
        checkBoxLayer2.onChange(function(checked){layer2021.setShown(checked)});
        checkBoxLayer3.onChange(function(checked){layer2023.setShown(checked)});
        checkBoxLayer4.onChange(function(checked){layer2022.setShown(checked)});

        //Создание легенды
        var title = ui.Label({
            value: 'Легенда тепловой карты',
            style: {fontWeight: 'bold', textAlign: 'center', stretch: 'horizontal'}});

        var legend = ui.Thumbnail({
            image: ee.Image.pixelLonLat().select(0),
            params: {bbox:[0, 0, 1, 0.5], dimensions:'194x15',
                format:'png', min:0, max:1, palette:visLST.palette},
            style: {stretch: 'horizontal', margin: '0px 0px', maxHeight: '10px'},
        });

        var labels = ui.Panel({
            widgets: [
                ui.Label(min_l, {margin: '4px 5px',textAlign: 'left', stretch: 'horizontal'}),
                ui.Label(max_l, {margin: '4px 5px',textAlign: 'right', stretch: 'horizontal'})],
            layout: ui.Panel.Layout.flow('horizontal')});

        var legendPanel = ui.Panel({
            widgets: [title, legend, labels],
            style: {position: 'bottom-center', padding: '6px 15px'}});

        Map.add(legendPanel);


        if (current_temperature_panel) {
            Map.remove(current_temperature_panel);
            Map.remove(current_main_panel);
            Map.remove(current_legend);
            Map.remove(current_actions);
            Map.remove(current_inspector);
        }

        current_temperature_panel = resultsPanel;
        current_main_panel = mainPanel;
        current_legend = legendPanel;
        current_actions = Panel_map;
        current_inspector = inspector;
    }});


select.setPlaceholder('Выберите место...');
panel.add(select);

panel.add(panel_date);
panel.add(button);
panel.add(select2);
select2.setPlaceholder('Выберите дату...');

var button2 = ui.Button('Экспорт RGB и LST');
panel.add(button2);
button2.onClick(function()
{
    Export.image.toDrive(q.export_paramsRGB);
    Export.image.toDrive(q.export_paramsLST);
});
