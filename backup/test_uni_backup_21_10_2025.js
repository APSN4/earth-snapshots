/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var table = ee.FeatureCollection("projects/ee-igrek23022001/assets/ROI_test_forEvg");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var table = ee.FeatureCollection("projects/ee-igrek23022001/assets/ROI_test_forEvg");
var table2 = ee.FeatureCollection("projects/ee-igrek23022001/assets/LST_Rakitinka");
var table3 = ee.FeatureCollection("projects/ee-igrek23022001/assets/LST_Staryj");
var table4 = ee.FeatureCollection("projects/ee-igrek23022001/assets/Gomel");
var geometry = ee.FeatureCollection("projects/ee-igrek23022001/assets/LST_Plotnikovo");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

//var rgbTs = require('users/jstnbraaten/modules:rgb-timeseries/rgb-timeseries.js');

// #############################################################################
// ### РЕЖИМЫ РАБОТЫ ###
// #############################################################################

// Доступные места для анализа (объединено из objects.js)
var places = {
    'Плотниково': table,
    'Ракитинка': table2,
    'Гомель': table4,
    'Старый Оскол 1': table3.limit(1),
    'УниХимТех': geometry,
};

// Динамически добавленные области (в памяти)
var dynamicPlaces = {};

// Текущий режим работы
var currentMode = 1;

// Панель переключения режимов
var modePanel = ui.Panel({
    style: {position: 'top-center', width: '600px', backgroundColor: 'white', padding: '10px'}
});

var modeTitle = ui.Label('Выберите режим работы:', {
    fontWeight: 'bold',
    fontSize: '16px',
    textAlign: 'center',
    margin: '5px'
});

var modeButtonsPanel = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {margin: '5px'}
});

var mode1Button = ui.Button('Режим 1: RGB Анализ', function() { switchMode(1); }, false, {
    backgroundColor: '#4CAF50',
    color: 'white',
    margin: '0px 10px'
});

var mode2Button = ui.Button('Режим 2: Температурный анализ', function() { switchMode(2); }, false, {
    backgroundColor: '#2196F3',
    color: 'white',
    margin: '0px 10px'
});

var mode3Button = ui.Button('Режим 3: Рисование областей', function() { switchMode(3); }, false, {
    backgroundColor: '#FF9800',
    color: 'white',
    margin: '0px 10px'
});

modeButtonsPanel.add(mode1Button);
modeButtonsPanel.add(mode2Button);
modeButtonsPanel.add(mode3Button);

modePanel.add(modeTitle);
modePanel.add(modeButtonsPanel);

// Функция переключения режимов
function switchMode(mode) {
    currentMode = mode;

    // Обновляем стили кнопок
    mode1Button.style().set('backgroundColor', mode === 1 ? '#4CAF50' : '#E0E0E0');
    mode2Button.style().set('backgroundColor', mode === 2 ? '#2196F3' : '#E0E0E0');
    mode3Button.style().set('backgroundColor', mode === 3 ? '#FF9800' : '#E0E0E0');

    mode1Button.style().set('color', mode === 1 ? 'white' : 'black');
    mode2Button.style().set('color', mode === 2 ? 'white' : 'black');
    mode3Button.style().set('color', mode === 3 ? 'white' : 'black');

    // Очищаем карту
    Map.clear();
    Map.add(modePanel);

    print('Переключен на режим', mode);

    // Инициализируем нужный режим
    if (mode === 1) {
        initMode1();
    } else if (mode === 2) {
        initMode2();
    } else if (mode === 3) {
        initMode3();
    }
}

// #############################################################################
// ### GET URL PARAMS ###
// #############################################################################


var initRun = 'false';
var runUrl = ui.url.get('run', initRun);
ui.url.set('run', runUrl);

var initSensor = 'Sentinel-2 SR';
var sensorUrl = ui.url.get('sensor', initSensor);
ui.url.set('sensor', sensorUrl);

var initLon = 37.63201417;
var lonUrl = ui.url.get('lon', initLon);
ui.url.set('lon', lonUrl);

var initLat = 55.67103410;
var latUrl = ui.url.get('lat', initLat);
ui.url.set('lat', latUrl);

var initRgb = 'RED/GREEN/BLUE';
var rgbUrl = ui.url.get('rgb', initRgb);
ui.url.set('rgb', rgbUrl);

var initCloud = 10;
var cloudUrl = ui.url.get('cloud', initCloud);
ui.url.set('cloud', cloudUrl);

var zzz = 10;
var zzzUrl = ui.url.get('zzz', zzz);
ui.url.set('zzz', zzzUrl);

var initChipWidth = 2;
var chipWidthUrl = ui.url.get('chipwidth', initChipWidth);
ui.url.set('chipwidth', chipWidthUrl);



// #############################################################################
// ### DEFINE UI ELEMENTS ###
// #############################################################################

// Style.
var CONTROL_PANEL_WIDTH = '280px';
var CONTROL_PANEL_WIDTH_HIDE = '141px';
var textFont = {fontSize: '12px'};
var headerFont = {
    fontSize: '13px', fontWeight: 'bold', margin: '4px 8px 0px 8px'};
var sectionFont = {
    fontSize: '16px', color: '#808080', margin: '16px 8px 0px 8px'};
var infoFont = {fontSize: '11px', color: '#505050'};

// Control panel.
var controlPanel = ui.Panel({
    style: {position: 'top-left', width: CONTROL_PANEL_WIDTH_HIDE,
        maxHeight: '90%'
    }});

// Info panel.
var infoElements = ui.Panel(
    {style: {shown: false, margin: '0px -8px 0px -8px'}});

// Element panel.
var controlElements = ui.Panel(
    {style: {shown: false, margin: '0px -8px 0px -8px'}});

// Instruction panel.
var instr = ui.Label('Click on a location',
    {fontSize: '15px', color: '#303030', margin: '0px 0px 6px 0px'});

// Show/hide info panel button.
var infoButton = ui.Button(
    {label: 'About ❯', style: {margin: '0px 4px 0px 0px'}});

// Show/hide control panel button.
var controlButton = ui.Button(
    {label: 'Options ❯', style: {margin: '0px 0px 0px 0px'}});


// Info/control button panel.
var buttonPanel = ui.Panel(
    [infoButton, controlButton],
    ui.Panel.Layout.Flow('horizontal'),
    {stretch: 'horizontal', margin: '0px 0px 0px 0px'});

var coordZoom = ui.Textbox({placeholder:'Координаты', value:'37.63135958, 55.67095556', style:{width:'180px'}});
var coordZoomDa = ui.Button({label: 'Zoom! 📸' , style: {margin: '0px 0px 0px -16px', width:'70px'}});

var ZoomSlider = ui.Slider({min: 6, max: 18, value: 15,
    step: 2, style: {stretch: 'horizontal', margin: '5px 0px 0px 10px', width:'120px'}});



// Создаем панель для размещения виджетов
var panel = ui.Panel({
    widgets: [coordZoom],
    layout: ui.Panel.Layout.flow('vertical'),
    style: {width: '200px', position: 'bottom-right'}
});

var panel2 = ui.Panel({
    widgets: [ZoomSlider, coordZoomDa],
    layout: ui.Panel.Layout.flow('horizontal')
});

panel.add(panel2)

// Options label.
var optionsLabel = ui.Label('Options', sectionFont);
optionsLabel.style().set('margin', '16px 8px 2px 8px');

// Information label.
var infoLabel = ui.Label('About', sectionFont);

// Information text.
var aboutLabel = ui.Label(
    'This app shows a time series chart and image chips for selected ' +
    'datasets and locations for images collected within two years of today. Time series ' +
    'point colors are defined by RGB assignment to selected bands where ' +
    'intensity is based on the area-weighted mean pixel value within a radius ' +
    'around the clicked point in the map (30 m for Sentinel-2, 45 m for Landsat-8/9).',
    infoFont);

var appCodeLink = ui.Label({
    value: 'App source code',
    style: {fontSize: '11px', color: '#505050', margin: '-4px 8px 0px 8px'},
    targetUrl: 'https://github.com/jdbcode/ee-rgb-timeseries/blob/main/eo-timeseries-explorer.js'
});



// Sensor selection.
var sensorLabel = ui.Label({value: 'Sensor selection', style: headerFont});
var sensorList = ['Sentinel-2 SR', 'Sentinel-2 TOA',
    'Landsat-8/9 SR', 'Landsat-8/9 TOA'];
var sensorSelect = ui.Select({
    items: sensorList, placeholder: ui.url.get('sensor'),
    value: ui.url.get('sensor'), style: {stretch: 'horizontal'}
});
var sensorPanel = ui.Panel([sensorLabel, sensorSelect], null, {stretch: 'horizontal'});


// RGB bands selection.
var rgbLabel = ui.Label({value: 'RGB visualization', style: headerFont});
var rgbList = ['SWIR1/NIR/GREEN', 'RED/GREEN/BLUE', 'NIR/RED/GREEN',
    'NIR/SWIR1/RED'];
var rgbSelect = ui.Select({
    items: rgbList, placeholder: ui.url.get('rgb'),
    value: ui.url.get('rgb'), style: {stretch: 'horizontal'}
});
var rgbPanel = ui.Panel([rgbLabel, rgbSelect], null, {stretch: 'horizontal'});

// Duration.
var durationLabel = ui.Label(
    {value: 'Period', style: headerFont});

//var txtbox1 = ui.Panel([ ui.Textbox({placeholder:'date1', value: '2024-01-01'})], null, {width:'100px'});
//var txtbox2 = ui.Panel([ ui.Textbox({placeholder:'date2', value: '2025-01-01'})], null, {width:'100px'});

var d2 = ee.Date(Date.now()).advance(1, 'day').format('YYYY-MM-dd').getInfo();
var d1 = ee.Date(d2).advance(-1, 'year').format('YYYY-MM-dd').getInfo();
var txtbox1 = ui.Textbox({placeholder:'date1', value: d1, style:{width:'90px'}})
var txtbox2 = ui.Textbox({placeholder:'date2', value: d2, style:{width:'90px'}});
var aaa = ui.Panel([txtbox1, txtbox2], ui.Panel.Layout.flow('horizontal'));

var durationPanel = ui.Panel(
    [durationLabel, txtbox1, txtbox2],
    ui.Panel.Layout.flow('horizontal'), {stretch: 'horizontal'});



// Cloud threshold.
var cloudLabel = ui.Label(
    {value: 'Cloud threshold % (exclude >)', style: headerFont});
var cloudSlider = ui.Slider({
    min: 0, max: 100 , value: parseInt(ui.url.get('cloud')),
    step: 1, style: {stretch: 'horizontal'}
});
var cloudPanel = ui.Panel(
    [cloudLabel, cloudSlider], null, {stretch: 'horizontal'});

// Region buffer.
var regionWidthLabel = ui.Label(
    {value: 'Image chip width (km)', style: headerFont});
var regionWidthSlider = ui.Slider({
    min: 10, max: 160 , value: parseInt(ui.url.get('chipwidth')),
    step: 10, style: {stretch: 'horizontal'}
});
var regionWidthPanel = ui.Panel(
    [regionWidthLabel, regionWidthSlider], null, {stretch: 'horizontal'});

// A message to wait for image chips to load.
var waitMsgImgPanel = ui.Label({
    value: '⚙️' + ' Processing, please wait.',
    style: {
        stretch: 'horizontal',
        textAlign: 'center',
        backgroundColor: '#d3d3d3'
    }
});

// Panel to hold the chart.
var chartPanel = ui.Panel({style: {height: '25%'}});

// Holder for image cards.
var imgCardPanel = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal', true),
    style: {width: '897px', backgroundColor: '#d3d3d3'}
});

// Map widget.
var map = ui.Map();
/*
// Map/chart panel
var mapChartSplitPanel = ui.Panel(ui.SplitPanel({
  firstPanel: map, //
  secondPanel: chartPanel,
  orientation: 'vertical',
  wipe: false,
}));
*/
// Map/chart and image card panel
var splitPanel = ui.SplitPanel(map, imgCardPanel);

// Submit changes button.
var submitButton = ui.Button({
    label: 'Submit changes',
    style: {stretch: 'horizontal', shown: false}
});



// #############################################################################
// ### DEFINE INITIALIZING CONSTANTS ###
// #############################################################################

// Set color of the circle to show on map and images where clicked
var AOI_COLOR = 'ffffff';  //'b300b3';

var COORDS = null;
var CLICKED = false;



var sensorInfo = {
    'Landsat-8/9 SR': {
        id: 'LANDSAT/LC08/C02/T1_L2',
        scale: 30,
        aoiRadius: 45,
        rgb: {
            'SWIR1/NIR/GREEN': {
                bands: ['SR_B6', 'SR_B5', 'SR_B3'],
                min: [0.01, 0.01 , 0.01],
                max: [0.47, 0.47, 0.47],
                gamma: [1, 1, 1]
            },
            'RED/GREEN/BLUE': {
                bands: ['SR_B4', 'SR_B3', 'SR_B2'],
                min: [0.05, 0.05, 0.05],
                max: [0.25, 0.25, 0.25],
                gamma: [1.3, 1.3, 1.3]
            },
            'NIR/RED/GREEN': {
                bands: ['SR_B5', 'SR_B4', 'SR_B3'],
                min: [0.01, 0.01, 0.01],
                max: [0.47, 0.47, 0.47],
                gamma: [1, 1, 1]
            },
            'NIR/SWIR1/RED': {
                bands: ['SR_B5', 'SR_B6', 'SR_B3'],
                min: [0.01, 0.01, 0.01],
                max: [0.47, 0.47, 0.47],
                gamma: [1, 1, 1]
            }
        }
    },
    'Landsat-8/9 TOA': {
        id: 'LANDSAT/LC08/C02/T1_TOA',
        scale: 30,
        aoiRadius: 45,
        rgb: {
            'SWIR1/NIR/GREEN': {
                bands: ['B6', 'B5', 'B3'],
                min: [0.01, 0.01 , 0.01],
                max: [0.47, 0.47, 0.47],
                gamma: [1, 1, 1]
            },
            'RED/GREEN/BLUE': {
                bands: ['B4', 'B3', 'B2'],
                min: [0.01, 0.01, 0.01],
                max: [0.25, 0.25, 0.25],
                gamma: [1.3, 1.3, 1.3]
            },
            'NIR/RED/GREEN': {
                bands: ['B5', 'B4', 'B3'],
                min: [0.01, 0.01 , 0.01],
                max: [0.47, 0.47, 0.47],
                gamma: [1, 1, 1]
            },
            'NIR/SWIR1/RED': {
                bands: ['B5', 'B6', 'B3'],
                min: [0.01, 0.01 , 0.01],
                max: [0.47, 0.47, 0.47],
                gamma: [1, 1, 1]
            }
        }
    },
    'Sentinel-2 SR': {
        id: 'COPERNICUS/S2_SR_HARMONIZED',
        scale: 20,
        aoiRadius: 30,
        rgb: {
            'SWIR1/NIR/GREEN': {
                bands: ['B11', 'B8', 'B3'],
                min: [100, 100 , 100],
                max: [4700, 4700, 4700],
                gamma: [1, 1, 1]
            },
            'RED/GREEN/BLUE': {
                bands: ['B4', 'B3', 'B2'],
                min: [100, 100, 100],
                max: [2500, 2500, 2500],
                gamma: [1.3, 1.3, 1.3]
            },
            'NIR/RED/GREEN': {
                bands: ['B8', 'B4', 'B3'],
                min: [100, 100 , 100],
                max: [4700, 4700, 4700],
                gamma: [1, 1, 1]
            },
            'NIR/SWIR1/RED': {
                bands: ['B8', 'B11', 'B3'],
                min: [100, 100 , 100],
                max: [4700, 4700, 4700],
                gamma: [1, 1, 1]
            }
        }
    },
    'Sentinel-2 TOA': {
        id: 'COPERNICUS/S2_HARMONIZED',
        scale: 20,
        aoiRadius: 30,
        rgb: {
            'SWIR1/NIR/GREEN': {
                bands: ['B11', 'B8', 'B3'],
                min: [100, 100 , 100],
                max: [4700, 4700, 4700],
                gamma: [1, 1, 1]
            },
            'RED/GREEN/BLUE': {
                bands: ['B4', 'B3', 'B2'],
                min: [100, 100, 100],
                max: [2500, 2500, 2500],
                gamma: [1.2, 1.2, 1.2]
            },
            'NIR/RED/GREEN': {
                bands: ['B8', 'B4', 'B3'],
                min: [100, 100 , 100],
                max: [4700, 4700, 4700],
                gamma: [1, 1, 1]
            },
            'NIR/SWIR1/RED': {
                bands: ['B8', 'B11', 'B3'],
                min: [100, 100 , 100],
                max: [4700, 4700, 4700],
                gamma: [1, 1, 1]
            }
        }
    }
};



// #############################################################################
// ### DEFINE FUNCTIONS ###
// #############################################################################

/**
 * Ccloud masks OLI images.
 */
function prepOliSr(img) {
    var opticalBands = img.select('SR_B.').multiply(0.0000275).add(-0.2);
    img = img.addBands(opticalBands, null, true);
    return addDate(img);
}



/**
 * Add date property.
 */
function addDate(img) {
    var date = img.date().format('YYYY-MM-dd');
    return img.set('date', date);
}



/**
 * Gathers all Landsat into a collection.
 */
function getLandsatCollection(aoi, startDate, endDate, cloudthresh, id) {
    var id8 = id;
    var id9 = id.replace('LC08', 'LC09');

    var oli8Col = ee.ImageCollection(id8)
        .filterBounds(aoi)
        .filterDate(startDate, endDate)
        .filter(ee.Filter.lt('CLOUD_COVER', cloudthresh));
    var oli9Col = ee.ImageCollection(id9)
        .filterBounds(aoi)
        .filterDate(startDate, endDate)
        .filter(ee.Filter.lt('CLOUD_COVER', cloudthresh));
    var oliCol = oli8Col.merge(oli9Col).sort('system:time_start');

    if (id8 == 'LANDSAT/LC08/C02/T1_TOA') {
        oliCol = oliCol.map(prepOliToa);
    } else {
        oliCol = oliCol.map(prepOliSr);
    }

    return oliCol;
}



/**
 * Join S2 SR and S2 cloudless.
 */
function getS2SrCldCol(aoi, startDate, endDate, cloudthresh, id) {
    var date_start = ee.Date(startDate);
    var date_end   = ee.Date(endDate);

    var nDays = date_end.difference(date_start, 'days');
    var dayOffsets = ee.List.sequence(0, nDays.subtract(1));

    var s2SrCol = ee.ImageCollection(dayOffsets
        .map(function (dayOffset) {
            var dayStart = date_start.advance(dayOffset, 'days');
            var dayFinish = dayStart.advance(1, 'days');
            var composite = ee.ImageCollection(id)
                .filterBounds(aoi)
                .filterDate(dayStart, dayFinish)
                .linkCollection(ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED'), ['cs'])
                .median();
            return composite
                .set('empty', composite.bandNames().size().eq(0))
                .set('system:time_start', dayStart.millis())
                .set('date', dayStart.format('YYYY-MM-dd'));
        }))
        .filterMetadata('empty', 'equals', 0)
        .sort('system:time_start')
        .map(function (image) {
            var qa = image.select('cs');
            var mask = qa.lte(0.5);
            var cloudiness = mask.reduceRegion({
                reducer: 'mean',
                geometry: aoi,
                scale: 30,
                maxPixels:1e12
            });
            return image.set(cloudiness);})
        .filter(ee.Filter.lt('cs', ee.Number(cloudthresh).divide(100)));

    return s2SrCol;
}

/**
 * Clears image cards from the image card panel.
 */
function clearImgs() {
    imgCardPanel.clear();
}

/**
 * Displays image cards to the card panel.
 */
function displayBrowseImg(col, aoiBox, aoiCircle) {
    clearImgs();
    waitMsgImgPanel.style().set('shown', true);
    imgCardPanel.add(waitMsgImgPanel);
    var visParams = sensorInfo[sensorSelect.getValue()]['rgb'][rgbSelect.getValue()];

    var dates = col.aggregate_array('date').sort();

    dates.evaluate(function(dates) {
        waitMsgImgPanel.style().set('shown', false);
        dates.forEach(function(date) {

            var img = col.filter(ee.Filter.eq('date', date)).median();

            var exp_im = img.visualize(visParams).clip(aoiBox.bounds());
            var dateNow = Date.now()

            var aoiImg = ee.Image().byte()
                .paint(ee.FeatureCollection(ee.Feature(table.geometry())), 1, 2)
                .visualize({palette: 'ff0000'});

            var thumbnail = ui.Thumbnail({
                image: img.visualize(visParams).blend(aoiImg),
                params: {region: aoiBox, dimensions: '200',  crs: 'EPSG:3857',  format: 'PNG'}});

            var button = ui.Button(date);
            button.onClick(function()
            {Export.image.toDrive({image:exp_im, description:date+'_'+dateNow, scale:10, folder: 'EO_Times_Series_test',
                fileFormat:'GeoTIFF', maxPixels:1e12});
            });

            var imgCard = ui.Panel([
                button,
                //ui.Label(date, {margin: '4px 4px -6px 8px', fontSize: '13px', fontWeight: 'bold'}),
                thumbnail,
            ], null, {margin: '4px 0px 0px 4px' , width: 'px'});

            imgCardPanel.add(imgCard);
        });

    });
}



/**
 * Generates chart and adds image cards to the image panel.
 */
function renderGraphics(coords) {
    var sensor = sensorSelect.getValue();

    // Get the selected RGB combo vis params.
    var visParams = sensorInfo[sensorSelect.getValue()]['rgb'][rgbSelect.getValue()];

    // Get the clicked point and buffer it.
    var point = ee.Geometry.Point(coords);
    var aoiCircle = point.buffer(sensorInfo[sensor]['aoiRadius']);
    var aoiBox = point.buffer(regionWidthSlider.getValue()*1000/2);

    // Clear previous point from the Map.
    map.layers().forEach(function(el) {
        map.layers().remove(el);
    });

    // Add new point to the Map.
    map.addLayer(aoiCircle, {color: AOI_COLOR});
    map.centerObject(aoiCircle, 14);

    // Get collection options.

    var cloudThresh = cloudSlider.getValue();
    var datasetId = sensorInfo[sensor]['id'];

    var startDate = durationPanel.widgets().get(1).getValue();
    var endDate = durationPanel.widgets().get(2).getValue();
    print(startDate, endDate);
    // Build the collection.
    var col;
    if(sensor == 'Sentinel-2 SR' | sensor == 'Sentinel-2 TOA') {
        col = getS2SrCldCol(aoiBox, startDate, endDate, cloudThresh, datasetId);
    } else if(sensor == 'Landsat-8/9 SR' | sensor == 'Landsat-8/9 TOA') {
        col = getLandsatCollection(aoiBox, startDate, endDate, cloudThresh, datasetId);
    }

    col = ee.ImageCollection(col.distinct('date')).sort('system:time_start');

    // Display the image chip time series.
    displayBrowseImg(col, aoiBox, aoiCircle);
}

/**
 * Handles map clicks.
 */
function handleMapClick(coords) {
    CLICKED = true;
    COORDS = [coords.lon, coords.lat];
    ui.url.set('run', 'true');
    ui.url.set('lon', COORDS[0]);
    ui.url.set('lat', COORDS[1]);
    renderGraphics(COORDS);
}

/**
 * Handles submit button click.
 */
function handleSubmitClick() {
    renderGraphics(COORDS);
    submitButton.style().set('shown', false);
}

/**
 * Sets URL params.
 */
function setParams() {
    ui.url.set('sensor', sensorSelect.getValue());
    ui.url.set('rgb', rgbSelect.getValue());
    ui.url.set('cloud', cloudSlider.getValue());
    ui.url.set('chipwidth', regionWidthSlider.getValue());
}

/**
 * Show/hide the submit button.
 */
function showSubmitButton() {
    if(CLICKED) {
        submitButton.style().set('shown', true);
    }
}



/**
 * Handles options changes.
 */
function optionChange() {
    showSubmitButton();
    setParams();
}

/**
 * Show/hide the control panel.
 */
var controlShow = false;
function controlButtonHandler() {
    if(controlShow) {
        controlShow = false;
        controlElements.style().set('shown', false);
        controlButton.setLabel('Options ❯');
    } else {
        controlShow = true;
        controlElements.style().set('shown', true);
        controlButton.setLabel('Options ❮');
    }

    if(infoShow | controlShow) {
        controlPanel.style().set('width', CONTROL_PANEL_WIDTH);
    } else {
        controlPanel.style().set('width', CONTROL_PANEL_WIDTH_HIDE);
    }
}

/**
 * Show/hide the control panel.
 */
var infoShow = false;
function infoButtonHandler() {
    if(infoShow) {
        infoShow = false;
        infoElements.style().set('shown', false);
        infoButton.setLabel('About ❯');
    } else {
        infoShow = true;
        infoElements.style().set('shown', true);
        infoButton.setLabel('About ❮');
    }

    if(infoShow | controlShow) {
        controlPanel.style().set('width', CONTROL_PANEL_WIDTH);
    } else {
        controlPanel.style().set('width', CONTROL_PANEL_WIDTH_HIDE);
    }
}



// #############################################################################
// ### SETUP UI ELEMENTS ###
// #############################################################################

infoElements.add(infoLabel);
infoElements.add(aboutLabel);
infoElements.add(appCodeLink);

controlElements.add(optionsLabel);
controlElements.add(sensorPanel);
controlElements.add(rgbPanel);
controlElements.add(durationPanel);
controlElements.add(cloudPanel);
controlElements.add(regionWidthPanel);
controlElements.add(submitButton);

controlPanel.add(instr);
controlPanel.add(buttonPanel);
controlPanel.add(infoElements);
controlPanel.add(controlElements);

map.add(controlPanel);
map.add(panel);

infoButton.onClick(infoButtonHandler);
controlButton.onClick(controlButtonHandler);
sensorSelect.onChange(optionChange);
rgbSelect.onChange(optionChange);
txtbox1.onChange(optionChange);
txtbox2.onChange(optionChange);

cloudSlider.onChange(optionChange);
regionWidthSlider.onChange(optionChange);
submitButton.onClick(handleSubmitClick);
map.onClick(handleMapClick);

function zoomDaDa() {
    var lat1 = coordZoom.getValue().split(", ");
    var sc = parseFloat(ZoomSlider.getValue());
    map.setCenter(Number(lat1[0]), Number(lat1[1]), sc);
}

coordZoomDa.onClick(zoomDaDa);
ZoomSlider.onChange(zoomDaDa);
map.style().set('cursor', 'crosshair');
map.setOptions('hybrid');
map.setControlVisibility(
    {layerList: false, fullscreenControl: false, zoomControl: false});


// #############################################################################
// ### ФУНКЦИИ ИНИЦИАЛИЗАЦИИ РЕЖИМОВ ###
// #############################################################################

// Режим 1: RGB Анализ (существующий функционал test_uni.js)
function initMode1() {
    ui.root.clear();
    ui.root.add(splitPanel);
    map.add(controlPanel);

    if(ui.url.get('run')) {
        CLICKED = true;
        COORDS = [ui.url.get('lon'), ui.url.get('lat')];
        renderGraphics(COORDS);
    }

    Map.add(modePanel); // Всегда показываем переключатель режимов
}

// Режим 2: Температурный анализ (из program.js)
function initMode2() {
    ui.root.clear();

    var tempPanel = ui.Panel({style: {position: 'top-left'}});
    var tempTitle = ui.Label('Температурный анализ', {
        fontWeight: 'bold',
        textAlign: 'center',
        stretch: 'horizontal',
        fontSize: '24px'
    });
    tempPanel.add(tempTitle);

    // Объединяем все области (базовые + динамические)
    var allPlaces = Object.assign({}, places, dynamicPlaces);

    var tempSelect = ui.Select({
        items: Object.keys(allPlaces),
        placeholder: 'Выберите место...',
        onChange: function(key) {
            Map.layers().reset();
            Map.add(modePanel);
            var uch = allPlaces[key];
            var roi = uch.geometry().buffer(2000).bounds();
            tempQ = {uch: uch, roi: roi, imya: key};
            Map.centerObject(roi);
            Map.addLayer(ee.Image().byte().paint({featureCollection: roi, width: 2}), {palette: ['red']}, 'Буфер');
            Map.addLayer(ee.Image().byte().paint({featureCollection: uch, width: 2}), {palette: ['black']}, key);
        }
    });

    var updatePlacesButton = ui.Button('Обновить список областей', function() {
        var allPlaces = Object.assign({}, places, dynamicPlaces);
        tempSelect.items().reset(Object.keys(allPlaces));
        print('Список областей обновлен:', Object.keys(allPlaces));
    }, false, {
        margin: '5px 0px',
        backgroundColor: '#4CAF50',
        color: 'white'
    });

    var tempDatePanel = ui.Panel({
        widgets: [
            ui.Label('Впишите даты:'),
            ui.Textbox({placeholder: 'date1', value: '2024-06-10', style: {width: '100px'}}),
            ui.Textbox({placeholder: 'date2', value: '2024-07-28', style: {width: '100px'}}),
            ui.Textbox({placeholder: 'cloud', value: 0.1, style: {width: '40px'}})
        ]
    });

    // Функция применения анализа температур
    var tempApplyButton = ui.Button('Применить', function() {
        Map.layers().reset();
        Map.add(modePanel);

        var DATE1 = tempDatePanel.widgets().get(1).getValue();
        var DATE2 = tempDatePanel.widgets().get(2).getValue();
        var cloud = Number(tempDatePanel.widgets().get(3).getValue());
        var ROI = tempQ.roi;

        // Доля облачного покрытия района интереса
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

        // Составляется исходный снимок в естественных цветах
        var l821 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA');
        var l921 = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA');
        var l822 = ee.ImageCollection('LANDSAT/LC08/C02/T2_TOA');
        var l922 = ee.ImageCollection('LANDSAT/LC09/C02/T2_TOA');
        var coll = l821.merge(l921).merge(l822).merge(l922)
            .filterDate(ee.Date(DATE1), ee.Date(DATE2))
            .filterBounds(tempQ.uch)
            .map(getCloudScore).filter(ee.Filter.lt('cloud', cloud))
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

        if (coll.size().getInfo() === 0) {
            print(tempQ.imya, 'Снимки на выбранный период не нашлись.');
        } else {
            print(tempQ.imya, 'Снимки на выбранный период нашлись!', coll.toList(coll.size()));
        }

        var imagePAN = coll.mosaic().clip(ROI);
        var hsv = imagePAN.select(['B4', 'B3', 'B2']).rgbToHsv();
        var sharpened = ee.Image.cat([hsv.select('hue'), hsv.select('saturation'), imagePAN.select('B8')]).hsvToRgb();

        Map.addLayer(ee.Image().byte().paint({featureCollection: ROI, width: 2}), {palette: ['red']}, 'Буфер');
        Map.addLayer(ee.Image().byte().paint({featureCollection: tempQ.uch, width: 2}), {palette: ['black']}, tempQ.imya);

        tempQ.coll = coll_LST.sort('system:time_start', true)
            .reduceColumns(ee.Reducer.toList(), ['date'])
            .get('list');

        tempQ.coll.evaluate(function(ids) {
            tempSelect2.items().reset(ids);
            tempSelect2.setValue(tempSelect2.items().get(0));
        });
    });

    var tempSelect2 = ui.Select({
        placeholder: 'Выберите дату...',
        onChange: function(DATE) {
            Map.layers().reset();
            Map.add(modePanel);

            var name_uchastok = tempQ.imya;
            var uchastok = tempQ.uch;
            var ROI = uchastok.geometry().buffer(2000).bounds();

            // Функции добавления температуры
            function addTemp8(image) {
                var toa = image.select('B10').multiply(0.0003342).add(0.1);
                var br_temp_kelvin = ee.Image(1321.0789).divide(ee.Image(774.8853).divide(toa).add(1).log());
                var LST8 = br_temp_kelvin.subtract(273.15).rename('Temperature');
                return image.addBands(LST8, null, true);
            }

            function addTemp9(image) {
                var toa = image.select('B10').multiply(0.00038).add(0.1);
                var br_temp_kelvin = ee.Image(1329.2405).divide(ee.Image(799.0284).divide(toa).add(1).log());
                var LST9 = br_temp_kelvin.subtract(273.15).rename('Temperature');
                return image.addBands(LST9, null, true);
            }

            var l81 = ee.ImageCollection('LANDSAT/LC08/C02/T1').map(addTemp8);
            var l91 = ee.ImageCollection('LANDSAT/LC09/C02/T1').map(addTemp9);
            var l82 = ee.ImageCollection('LANDSAT/LC08/C02/T2').map(addTemp8);
            var l92 = ee.ImageCollection('LANDSAT/LC09/C02/T2').map(addTemp9);
            var l89 = l81.merge(l91).merge(l82).merge(l92)
                .filterDate(ee.Date(DATE), ee.Date(DATE).advance(1, 'days'))
                .filterBounds(ROI);

            var image = l89.mosaic().clip(ROI);
            var LST = image.select('Temperature');

            // Определение минимального и максимального значений температуры
            var minMax = LST.reduceRegion({
                reducer: ee.Reducer.minMax(),
                geometry: ROI,
                scale: 30,
                maxPixels: 1e9
            });

            minMax = minMax.rename(minMax.keys(), ['max','min']);
            var min = ee.Number(minMax.get('min')).getInfo().toFixed(1);
            var max = ee.Number(minMax.get('max')).getInfo().toFixed(1);

            var palette = ['040274', '0502ce', '307ef3', '3be285', 'b5e22e', 'ffb613', 'ff0000', '911003'];
            var visLST = {min: min, max: max, palette: palette};

            Map.addLayer(LST, visLST, 'Тепловая карта (LST)');
            Map.addLayer(ee.Image().byte().paint({featureCollection: ROI, width: 2}), {palette: ['red']}, 'Буфер');
            Map.addLayer(ee.Image().byte().paint({featureCollection: uchastok, width: 2}), {palette: ['black']}, name_uchastok);

            tempQ.export_paramsLST = {
                image: LST,
                description: name_uchastok + '_' + DATE + '_LST',
                scale: 30,
                region: image.geometry(),
                fileFormat: 'GeoTIFF',
                folder: 'GEE_exports',
                maxPixels: 1e12
            };

            print('Температурный анализ для', name_uchastok, 'на дату', DATE, 'завершен');
        }
    });

    var tempExportButton = ui.Button('Экспорт LST', function() {
        if (tempQ.export_paramsLST) {
            Export.image.toDrive(tempQ.export_paramsLST);
            print('Экспорт LST запущен:', tempQ.export_paramsLST.description);
        } else {
            print('Сначала выберите дату для анализа');
        }
    });

    tempPanel.add(tempSelect);
    tempPanel.add(updatePlacesButton);
    tempPanel.add(tempDatePanel);
    tempPanel.add(tempApplyButton);
    tempPanel.add(tempSelect2);
    tempPanel.add(tempExportButton);

    Map.add(tempPanel);
    Map.add(modePanel);

    ui.root.clear();
    ui.root.add(ui.Map());
}

// Режим 3: Рисование областей (из objects.js)
function initMode3() {
    ui.root.clear();

    var drawingPanel = ui.Panel({
        style: {position: 'top-right', width: '250px'}
    });

    var drawingTitle = ui.Label('Рисование новых областей', {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '16px',
        margin: '5px'
    });

    var instructionLabel = ui.Label('1. Нажмите на инструмент рисования\n2. Нарисуйте область на карте\n3. Введите название области', {
        fontSize: '12px',
        margin: '5px',
        whiteSpace: 'pre-line'
    });

    var drawingTools = Map.drawingTools();
    drawingTools.setShown(true);

    var drawButton = ui.Button('Нарисовать новую область', function() {
        drawingTools.setShape('polygon');
        drawingTools.draw();
    }, false, {margin: '5px'});

    var clearButton = ui.Button('Очистить все', function() {
        drawingTools.layers().reset();
    }, false, {margin: '5px'});

    drawingPanel.add(drawingTitle);
    drawingPanel.add(instructionLabel);
    drawingPanel.add(drawButton);
    drawingPanel.add(clearButton);

    // Обработчик событий рисования
    drawingTools.onDraw(function() {
        var layers = drawingTools.layers();
        var layerCount = layers.length();
        var lastLayer = layers.get(layerCount - 1);
        var geometry = lastLayer.getEeObject();

        // Диалог для ввода названия области
        var nameDialog = ui.Panel({
            style: {
                position: 'top-center',
                backgroundColor: 'white',
                border: '2px solid #ccc',
                padding: '10px',
                width: '300px'
            }
        });

        var dialogTitle = ui.Label('Введите название области:', {
            fontWeight: 'bold',
            fontSize: '14px',
            margin: '5px'
        });

        var nameTextbox = ui.Textbox({
            placeholder: 'Название области...',
            style: {width: '250px', margin: '5px'}
        });

        var buttonPanel = ui.Panel({
            layout: ui.Panel.Layout.flow('horizontal'),
            style: {margin: '5px'}
        });

        var saveButton = ui.Button('Сохранить', function() {
            var placeName = nameTextbox.getValue();
            if (placeName && placeName.trim() !== '') {
                // Добавляем область в динамическую коллекцию
                dynamicPlaces[placeName.trim()] = ee.FeatureCollection([ee.Feature(geometry)]);

                print('Область "' + placeName.trim() + '" успешно добавлена!');
                print('Доступные области:', Object.keys(Object.assign({}, places, dynamicPlaces)));

                // Визуализация
                Map.addLayer(ee.Image().byte().paint({
                    featureCollection: ee.FeatureCollection([ee.Feature(geometry)]),
                    width: 2
                }), {palette: ['blue']}, placeName.trim());

                Map.remove(nameDialog);
                Map.centerObject(geometry);
            } else {
                print('Ошибка: Введите название области!');
            }
        });

        var cancelButton = ui.Button('Отмена', function() {
            layers.remove(lastLayer);
            Map.remove(nameDialog);
        });

        buttonPanel.add(saveButton);
        buttonPanel.add(cancelButton);

        nameDialog.add(dialogTitle);
        nameDialog.add(nameTextbox);
        nameDialog.add(buttonPanel);

        Map.add(nameDialog);
    });

    Map.add(drawingPanel);
    Map.add(modePanel);

    ui.root.clear();
    ui.root.add(ui.Map());
}

// Глобальные переменные для режима 2
var tempQ = {};

// Запускаем в режиме 1 по умолчанию
Map.add(modePanel);
initMode1();
