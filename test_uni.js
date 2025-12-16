
//var rgbTs = require('users/jstnbraaten/modules:rgb-timeseries/rgb-timeseries.js'); 

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
var CONTROL_PANEL_WIDTH_HIDE = '220px';
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

// Settings panel.
var settingsElements = ui.Panel(
  {style: {shown: false, margin: '0px -8px 0px -8px'}});

// Instruction panel.
var instr = ui.Label('Click on a location',
  {fontSize: '15px', color: '#303030', margin: '0px 0px 6px 0px'});

// Show/hide info panel button.
var infoButton = ui.Button(
  {label: 'About ❯', style: {margin: '0px 4px 0px 0px'}});

// Show/hide settings panel button.
var settingsButton = ui.Button(
  {label: 'Settings ❯', style: {margin: '0px 4px 0px 0px'}});

// Show/hide control panel button.
var controlButton = ui.Button(
  {label: 'Options ❯', style: {margin: '0px 0px 0px 0px'}});


// Info/control button panel.
var buttonPanel = ui.Panel(
  [infoButton, settingsButton, controlButton],
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

// Settings label.
var settingsLabel = ui.Label('Settings', sectionFont);

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

// Cloud filtering method (hidden by default).
var cloudMethodLabel = ui.Label(
  {value: 'Cloud filter method', style: headerFont});
var cloudMethodList = [
  'Cloud Score Plus (cs)', 
  'CLOUD_COVERAGE_ASSESSMENT', 
  'No filter'
];
var cloudMethodSelect = ui.Select({
  items: cloudMethodList, 
  value: 'CLOUD_COVERAGE_ASSESSMENT',
  style: {stretch: 'horizontal'}
});
var cloudMethodPanel = ui.Panel(
  [cloudMethodLabel, cloudMethodSelect], null, 
  {stretch: 'horizontal', shown: false});

// Cloud settings button (next to slider)
var cloudSettingsVisible = false;
var cloudSettingsButton = ui.Button({
  label: '⚙️',
  style: {
    width: '80px',
    padding: '0px',
    margin: '0px 0px 0px 0px'
  },
  onClick: function() {
    cloudSettingsVisible = !cloudSettingsVisible;
    cloudMethodPanel.style().set('shown', cloudSettingsVisible);
  }
});

var cloudSliderRow = ui.Panel({
  widgets: [cloudSlider, cloudSettingsButton],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {stretch: 'horizontal'}
});

var cloudPanel = ui.Panel(
  [cloudLabel, cloudSliderRow, cloudMethodPanel], null, {stretch: 'horizontal'});

// Region buffer with settings.
var regionWidthLabel = ui.Label(
  {value: 'Image chip width (km)', style: headerFont});

// Default slider parameters
var sliderParams = {
  min: 10,
  max: 160,
  step: 10
};

var regionWidthSlider = ui.Slider({
  min: sliderParams.min, 
  max: sliderParams.max, 
  value: parseInt(ui.url.get('chipwidth')),
  step: sliderParams.step, 
  style: {stretch: 'horizontal'}
});

// Settings panel for slider parameters (initially hidden)
var sliderSettingsVisible = false;

var sliderMinInput = ui.Textbox({
  placeholder: 'Min',
  value: String(sliderParams.min),
  style: {width: '60px'}
});

var sliderMaxInput = ui.Textbox({
  placeholder: 'Max',
  value: String(sliderParams.max),
  style: {width: '60px'}
});

var sliderStepInput = ui.Textbox({
  placeholder: 'Step',
  value: String(sliderParams.step),
  style: {width: '60px'}
});

var applySliderSettingsButton = ui.Button({
  label: 'Применить',
  style: {fontSize: '10px'},
  onClick: function() {
    try {
      var newMin = parseFloat(sliderMinInput.getValue());
      var newMax = parseFloat(sliderMaxInput.getValue());
      var newStep = parseFloat(sliderStepInput.getValue());
      
      // Validation
      if (isNaN(newMin) || isNaN(newMax) || isNaN(newStep)) {
        print('❌ Ошибка: все значения должны быть числами');
        return;
      }
      
      if (newMin >= newMax) {
        print('❌ Ошибка: min должен быть меньше max');
        return;
      }
      
      if (newStep <= 0) {
        print('❌ Ошибка: step должен быть больше 0');
        return;
      }
      
      // Update parameters
      sliderParams.min = newMin;
      sliderParams.max = newMax;
      sliderParams.step = newStep;
      
      // Adjust current value to fit new range
      var currentValue = regionWidthSlider.getValue();
      var newValue = currentValue;
      if (newValue < newMin) newValue = newMin;
      if (newValue > newMax) newValue = newMax;
      
      // Recreate slider with new parameters
      regionWidthSlider = ui.Slider({
        min: newMin,
        max: newMax,
        value: newValue,
        step: newStep,
        style: {stretch: 'horizontal'}
      });
      
      // Re-attach onChange handler
      regionWidthSlider.onChange(optionChange);
      
      // Replace slider in control panel (keeping the settings button)
      regionWidthControlPanel.widgets().set(0, regionWidthSlider);
      
      // Hide settings panel
      sliderSettingsPanel.style().set('shown', false);
      sliderSettingsVisible = false;
      
      print('✅ Параметры обновлены: min=' + newMin + ', max=' + newMax + ', step=' + newStep);
      
    } catch (e) {
      print('❌ Ошибка настройки: ' + e.message);
    }
  }
});

// First row: Min and Max
var sliderSettingsRow1 = ui.Panel({
  widgets: [
    ui.Label('Min:', {fontSize: '10px'}),
    sliderMinInput,
    ui.Label('Max:', {fontSize: '10px', margin: '0px 0px 0px 5px'}),
    sliderMaxInput
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

// Second row: Step and Apply button
var sliderSettingsRow2 = ui.Panel({
  widgets: [
    ui.Label('Step:', {fontSize: '10px'}),
    sliderStepInput,
    applySliderSettingsButton
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});

var sliderSettingsPanel = ui.Panel({
  widgets: [sliderSettingsRow1, sliderSettingsRow2],
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    shown: false,
    margin: '0px 0px 0px 8px'
  }
});

// Settings button
var regionWidthSettingsButton = ui.Button({
  label: '⚙️',
  style: {
    width: '80px',
    padding: '0px',
    margin: '0px 0px 0px 0px'
  },
  onClick: function() {
    sliderSettingsVisible = !sliderSettingsVisible;
    sliderSettingsPanel.style().set('shown', sliderSettingsVisible);
    
    // Update input values to current parameters
    sliderMinInput.setValue(String(sliderParams.min));
    sliderMaxInput.setValue(String(sliderParams.max));
    sliderStepInput.setValue(String(sliderParams.step));
  }
});

var regionWidthControlPanel = ui.Panel({
  widgets: [regionWidthSlider, regionWidthSettingsButton],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {stretch: 'horizontal'}
});

var regionWidthPanel = ui.Panel(
  [regionWidthLabel, regionWidthControlPanel, sliderSettingsPanel], 
  null, 
  {stretch: 'horizontal'}
);

// Region selection method.
var regionMethodLabel = ui.Label(
  {value: 'Способ выбора области', style: headerFont});
var regionMethodList = ['По клику', 'Графически', 'GeoJSON', '4 координаты'];
var regionMethodSelect = ui.Select({
  items: regionMethodList, 
  value: 'По клику', 
  style: {stretch: 'horizontal'}
});
var regionMethodPanel = ui.Panel(
  [regionMethodLabel, regionMethodSelect], null, {stretch: 'horizontal'});

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

// Colors are now configurable via Settings panel
// Legacy variable (kept for compatibility)
var AOI_COLOR = 'ffffff';  //'b300b3';

var COORDS = null;
var CLICKED = false;
var DRAWN_GEOMETRY = null;
var CURRENT_REQUEST_ID = 0; // Счетчик для отслеживания актуального запроса

// Drawing tools initialization
var drawingTools = map.drawingTools();
drawingTools.setShown(false);
drawingTools.setDrawModes(['polygon', 'point', 'rectangle']);

// Function to clear all areas from map
function clearAllAreas() {
  // Remove drawing tool layers WITHOUT calling clear() to keep handler alive
  var layers = drawingTools.layers();
  while (layers.length() > 0) {
    layers.remove(layers.get(0));
  }
  DRAWN_GEOMETRY = null;
  
  // Remove all relevant map layers
  var layersToRemove = [];
  map.layers().forEach(function(layer) {
    var name = layer.getName();
    if (name === 'Drawn area' || name === 'Image chip area (square)' || 
        name === 'Point Circle' || name === 'Loaded GeoJSON' || name === 'Loaded from 4 coords') {
      layersToRemove.push(layer);
    }
  });
  layersToRemove.forEach(function(layer) {
    map.layers().remove(layer);
  });
  
  clearImgs();
  CURRENT_REQUEST_ID++;
  submitButton.style().set('shown', false);
  
  // Hide clear panel after clearing
  clearAreaPanel.style().set('shown', false);
  
  print('Область очищена');
}

// Function to check if there are relevant layers on the map
function hasMapLayers() {
  var hasLayers = false;
  map.layers().forEach(function(layer) {
    var name = layer.getName();
    if (name === 'Drawn area' || name === 'Image chip area (square)' || 
        name === 'Point Circle' || name === 'Loaded GeoJSON' || name === 'Loaded from 4 coords') {
      hasLayers = true;
    }
  });
  return hasLayers;
}

// Function to update clear panel visibility
function updateClearPanelVisibility() {
  // Only show in click mode and only when there are layers
  if (regionMethodSelect.getValue() !== 'Графически' && hasMapLayers()) {
    clearAreaPanel.style().set('shown', true);
  } else {
    clearAreaPanel.style().set('shown', false);
  }
}

// Clear drawing button for drawing control panel
var clearDrawingButton = ui.Button({
  label: '🗑️ Очистить',
  onClick: clearAllAreas,
  style: {backgroundColor: '#ff6b6b', color: 'white', fontSize: '11px'}
});

// Drawing tools control panel (shown in "Графически" mode)
var drawingControlPanel = ui.Panel({
  widgets: [
    ui.Label('🎨 Графический выбор области', {fontWeight: 'bold', fontSize: '14px'}),
    ui.Label('1. Выберите инструмент рисования', {fontSize: '11px'}),
    ui.Label('2. Нарисуйте область на карте', {fontSize: '11px'}),
    ui.Label('3. Нажмите "Submit changes"', {fontSize: '11px'}),
    clearDrawingButton
  ],
  style: {
    position: 'top-left', 
    width: '220px',
    shown: false,
    margin: '10px 0px 0px 0px'
  }
});

// Clear button for click mode panel
var clearAreaButton = ui.Button({
  label: '🗑️ Очистить',
  onClick: clearAllAreas,
  style: {backgroundColor: '#ff6b6b', color: 'white', fontSize: '11px'}
});

// Clear area panel (shown in "По клику" mode when there are layers)
var clearAreaPanel = ui.Panel({
  widgets: [
    ui.Label('🎨 Графический выбор области', {fontWeight: 'bold', fontSize: '14px'}),
    ui.Label('1. Выберите инструмент рисования', {fontSize: '11px'}),
    ui.Label('2. Нарисуйте область на карте', {fontSize: '11px'}),
    ui.Label('3. Нажмите "Submit changes"', {fontSize: '11px'}),
    clearAreaButton
  ],
  style: {
    width: '220px',
    shown: false,
    margin: '10px 0px 0px 0px'
  }
});

// Handler for drawing tools
drawingTools.onDraw(function(geometry) {
  DRAWN_GEOMETRY = geometry;
  CLICKED = true;
  var layerCount = drawingTools.layers().length();
  if (layerCount === 1) {
    print('✅ Область нарисована! Нажмите "Submit changes" для применения.');
  } else {
    print('✅ Нарисовано ' + layerCount + ' областей. Нажмите "Submit changes" для объединения.');
  }
  submitButton.style().set('shown', true);
});

drawingTools.onEdit(function(geometry) {
  DRAWN_GEOMETRY = geometry;
});



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
 * Creates a minimal bounding square that fully contains the geometry.
 */
function createMinimalBoundingSquare(geometry) {
  // Get bounds and work with them
  var bounds = geometry.bounds();
  
  // Get coordinates of bounds
  var coords = bounds.coordinates();
  var listCoords = ee.List(coords.get(0));
  
  var point1 = ee.List(listCoords.get(0)); // [minLon, minLat]
  var point3 = ee.List(listCoords.get(2)); // [maxLon, maxLat]
  
  var minLon = ee.Number(point1.get(0));
  var minLat = ee.Number(point1.get(1));
  var maxLon = ee.Number(point3.get(0));
  var maxLat = ee.Number(point3.get(1));
  
  // Calculate center
  var centerLon = minLon.add(maxLon).divide(2);
  var centerLat = minLat.add(maxLat).divide(2);
  
  // Calculate dimensions in meters for a proper square
  var widthDegrees = maxLon.subtract(minLon);
  var heightDegrees = maxLat.subtract(minLat);
  
  // Convert to meters (exact values):
  // 1 degree of latitude = 111319.9 meters (exact value)
  // 1 degree of longitude = 111319.9 * cos(latitude) meters
  var METERS_PER_DEGREE = 111319.9; // exact value for WGS84
  
  var avgLat = centerLat.multiply(Math.PI).divide(180); // in radians
  var cosLat = avgLat.cos();
  
  var widthMeters = widthDegrees.multiply(METERS_PER_DEGREE).multiply(cosLat);
  var heightMeters = heightDegrees.multiply(METERS_PER_DEGREE);
  
  // Take the maximum side in meters
  var maxSideMeters = widthMeters.max(heightMeters);
  
  // Convert back to degrees to create a square
  var halfSideLon = maxSideMeters.divide(2).divide(METERS_PER_DEGREE).divide(cosLat);
  var halfSideLat = maxSideMeters.divide(2).divide(METERS_PER_DEGREE);
  
  // Create a proper square
  return ee.Geometry.Rectangle([
    centerLon.subtract(halfSideLon),
    centerLat.subtract(halfSideLat),
    centerLon.add(halfSideLon),
    centerLat.add(halfSideLat)
  ]);
}

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
 * cloudMethod: 'Cloud Score Plus (cs)', 'CLOUD_COVERAGE_ASSESSMENT', 'No filter'
 */
function getS2SrCldCol(aoi, startDate, endDate, cloudthresh, id, cloudMethod) {
    var date_start = ee.Date(startDate);
    var date_end   = ee.Date(endDate);
    
    var nDays = date_end.difference(date_start, 'days');
    var dayOffsets = ee.List.sequence(0, nDays.subtract(1));
    
    // Method 1: CLOUD_COVERAGE_ASSESSMENT - use metadata filter
    if (cloudMethod === 'CLOUD_COVERAGE_ASSESSMENT') {
      var s2SrCol = ee.ImageCollection(dayOffsets
        .map(function (dayOffset) {
          var dayStart = date_start.advance(dayOffset, 'days');
          var dayFinish = dayStart.advance(1, 'days');
          var composite = ee.ImageCollection(id)
            .filterBounds(aoi)
            .filterDate(dayStart, dayFinish)
            .filterMetadata('CLOUD_COVERAGE_ASSESSMENT', 'less_than', cloudthresh)
            .linkCollection(ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED'), ['cs'])
            .map(function(img) {return img.updateMask(img.select('cs').gte(0.7));})
            .median();
          return composite
            .set('empty', composite.bandNames().size().eq(0))
            .set('system:time_start', dayStart.millis())
            .set('date', dayStart.format('YYYY-MM-dd'));
        }))
        .filterMetadata('empty', 'equals', 0)
        .sort('system:time_start');
      return s2SrCol;
    }
    
    // Method 2: Cloud Score Plus (cs) - calculate cloudiness via map
    if (cloudMethod === 'Cloud Score Plus (cs)') {
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
    
    // Method 3: No filter - just get images without cloud filtering
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
      .sort('system:time_start');

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
function displayBrowseImg(col, aoiBox, aoiCircle, geometryForBorder, requestId) {
  clearImgs();
  waitMsgImgPanel.style().set('shown', true);
  imgCardPanel.add(waitMsgImgPanel);
  var visParams = sensorInfo[sensorSelect.getValue()]['rgb'][rgbSelect.getValue()];

  var dates = col.aggregate_array('date').sort();

  dates.evaluate(function(dates) {
    // Проверяем, актуален ли еще этот запрос
    if (requestId !== CURRENT_REQUEST_ID) {
      print('Предыдущий запрос отменен');
      return;
    }
    
    waitMsgImgPanel.style().set('shown', false);
    
    // Проверяем, что dates не null или undefined
    if (!dates) {
      print('Ошибка: не удалось получить даты');
      return;
    }
    
    dates.forEach(function(date) {
      // Еще раз проверяем актуальность внутри цикла
      if (requestId !== CURRENT_REQUEST_ID) {
        return;
      }
      
      var img = col.filter(ee.Filter.eq('date', date)).median();
      
      var exp_im = img.visualize(visParams).clip(aoiBox.bounds());
      var dateNow = Date.now()

      var aoiImg = ee.Image().byte()
        .paint(ee.FeatureCollection(ee.Feature(table.geometry())), 1, 2)
        .visualize({palette: colorOptions[chipBorderColorSelect.getValue()]});
      
      // Border for your AOI (drawn area or clicked point)
      var aoiBorder = ee.Image().byte()
        .paint(ee.FeatureCollection(ee.Feature(geometryForBorder)), 1, 3)
        .visualize({palette: colorOptions[aoiBorderColorSelect.getValue()]});
      
      // Финальная проверка перед созданием thumbnail (самая дорогая операция)
      if (requestId !== CURRENT_REQUEST_ID) {
        return;
      }
      
      var thumbnail = ui.Thumbnail({
        image: img.visualize(visParams).blend(aoiImg).blend(aoiBorder),
        params: {region: aoiBox, dimensions: thumbnailSizeSlider.getValue().toString(),  crs: 'EPSG:3857',  format: 'PNG'}});
      
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

      // Проверяем еще раз перед добавлением в панель
      if (requestId !== CURRENT_REQUEST_ID) {
        return;
      }
      
      imgCardPanel.add(imgCard);
    });

  });
}



/**
 * Generates chart and adds image cards to the image panel.
 */
function renderGraphics(coords) {
  // Увеличиваем счетчик запросов, чтобы прервать предыдущие
  CURRENT_REQUEST_ID++;
  var currentRequestId = CURRENT_REQUEST_ID;
  
  var sensor = sensorSelect.getValue();

  // Get the selected RGB combo vis params.
  var visParams = sensorInfo[sensorSelect.getValue()]['rgb'][rgbSelect.getValue()];
  
  // Determine if using drawn geometry or clicked point
  var aoiCircle, aoiBox, aoiSquare;
  var useDrawnGeometry = (regionMethodSelect.getValue() === 'Графически' && DRAWN_GEOMETRY !== null);
  
  if (useDrawnGeometry) {
    // Use drawn geometry
    var drawnGeom = DRAWN_GEOMETRY;
    aoiCircle = drawnGeom.buffer(sensorInfo[sensor]['aoiRadius']);
    // Create minimal bounding square for the drawn geometry
    aoiSquare = createMinimalBoundingSquare(drawnGeom);
    aoiBox = aoiSquare; // Use square for image processing
  } else {
    // Get the clicked point and buffer it.
    var point = ee.Geometry.Point(coords);
    aoiCircle = point.buffer(sensorInfo[sensor]['aoiRadius']);
    var tempBox = point.buffer(regionWidthSlider.getValue()*1000/2);
    // Create minimal bounding square for the buffered point
    aoiSquare = createMinimalBoundingSquare(tempBox);
    aoiBox = aoiSquare; // Use square for image processing
  }
  
  // Clear previous point from the Map.
  map.layers().forEach(function(el) {
    map.layers().remove(el);
  });

  // Add visualization layers
  if (useDrawnGeometry) {
    // In graphical mode: show the drawn geometry
    var drawnGeomCollection = ee.FeatureCollection([ee.Feature(DRAWN_GEOMETRY)]);
    map.addLayer(ee.Image().byte().paint({featureCollection: drawnGeomCollection, width: 3}), 
                 {palette: [colorOptions[aoiBorderColorSelect.getValue()]]}, 'Drawn area');
    // Square border shows the actual image chip area
    var aoiSquareCollection = ee.FeatureCollection([ee.Feature(aoiSquare)]);
    map.addLayer(ee.Image().byte().paint({featureCollection: aoiSquareCollection, width: 2}), 
                 {palette: [colorOptions[chipBorderColorSelect.getValue()]]}, 'Image chip area (square)');
    // Auto-fit zoom to the square boundary
    map.centerObject(aoiSquare);
  } else {
    // In click mode: show the point circle
    map.addLayer(aoiCircle, {color: colorOptions[pointCircleColorSelect.getValue()]}, 'Point Circle');
    // Square border shows the actual image chip area
    var aoiSquareCollection = ee.FeatureCollection([ee.Feature(aoiSquare)]);
    map.addLayer(ee.Image().byte().paint({featureCollection: aoiSquareCollection, width: 2}), 
                 {palette: [colorOptions[chipBorderColorSelect.getValue()]]}, 'Image chip area (square)');
    // Auto-fit zoom to the square boundary
    map.centerObject(aoiSquare);
  }

  // Update clear panel visibility since we added layers to the map
  updateClearPanelVisibility();

  // Get collection options.

  var cloudThresh = cloudSlider.getValue();
  var datasetId = sensorInfo[sensor]['id'];

  var startDate = durationPanel.widgets().get(1).getValue();
  var endDate = durationPanel.widgets().get(2).getValue();
  print(startDate, endDate);
  // Build the collection.
  var col;
  var cloudMethod = cloudMethodSelect.getValue();
  if(sensor == 'Sentinel-2 SR' | sensor == 'Sentinel-2 TOA') {
    col = getS2SrCldCol(aoiSquare, startDate, endDate, cloudThresh, datasetId, cloudMethod);
  } else if(sensor == 'Landsat-8/9 SR' | sensor == 'Landsat-8/9 TOA') {
    col = getLandsatCollection(aoiSquare, startDate, endDate, cloudThresh, datasetId);
  }

  col = ee.ImageCollection(col.distinct('date')).sort('system:time_start');

  // Display the image chip time series.
  // Pass the actual drawn geometry for proper display in thumbnails
  var geometryForBorder = useDrawnGeometry ? DRAWN_GEOMETRY : aoiCircle;
  displayBrowseImg(col, aoiSquare, aoiCircle, geometryForBorder, currentRequestId);
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
  if (regionMethodSelect.getValue() === 'Графически') {
    // Check if DRAWN_GEOMETRY is already set (from GeoJSON or 4 coords)
    if (DRAWN_GEOMETRY !== null) {
      // Use the already set geometry
      var centroid = DRAWN_GEOMETRY.centroid().coordinates();
      centroid.evaluate(function(coords) {
        COORDS = coords;
        renderGraphics(COORDS);
        DRAWN_GEOMETRY = null;
      });
    } else {
      // Get all drawn geometries from drawing tools layers
      var layers = drawingTools.layers();
      if (layers.length() > 0) {
        // Collect all geometries from all layers and their features
        var geometries = [];
        for (var i = 0; i < layers.length(); i++) {
          var layer = layers.get(i);
          // Check if layer has geometries() method (multiple features)
          // If not, use toGeometry() for single geometry
          try {
            var layerGeometries = layer.geometries();
            if (layerGeometries) {
              for (var j = 0; j < layerGeometries.length(); j++) {
                geometries.push(layerGeometries.get(j));
              }
            }
          } catch(e) {
            // If geometries() doesn't exist, fall back to toGeometry()
            geometries.push(layer.toGeometry());
          }
        }
        
        // If only one geometry, use it directly
        // If multiple geometries, create a union or bounding geometry
        var finalGeometry;
        if (geometries.length === 1) {
          finalGeometry = geometries[0];
        } else {
          // Create a union of all geometries (combines them into one)
          finalGeometry = ee.Algorithms.GeometryConstructors.MultiPolygon(geometries).dissolve();
        }
        
        DRAWN_GEOMETRY = finalGeometry;
        
        // Use centroid of final geometry as coords for compatibility
        var centroid = finalGeometry.centroid().coordinates();
        centroid.evaluate(function(coords) {
          COORDS = coords;
          renderGraphics(COORDS);
          // Remove drawing tool layers WITHOUT calling clear() to keep handler alive
          var layers = drawingTools.layers();
          while (layers.length() > 0) {
            layers.remove(layers.get(0));
          }
          DRAWN_GEOMETRY = null;
        });
      }
    }
  } else if (COORDS !== null) {
    renderGraphics(COORDS);
  }
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
    // Hide both panels when Options is hidden
    drawingControlPanel.style().set('shown', false);
    clearAreaPanel.style().set('shown', false);
  } else {
    controlShow = true;
    controlElements.style().set('shown', true);
    controlButton.setLabel('Options ❮');
    // Show appropriate panel based on mode
    if(regionMethodSelect.getValue() === 'Графически') {
      drawingControlPanel.style().set('shown', true);
      clearAreaPanel.style().set('shown', false);
    } else {
      drawingControlPanel.style().set('shown', false);
      // Show clear panel if there are layers on the map
      updateClearPanelVisibility();
    }
  }
  
  if(infoShow | settingsShow | controlShow) {
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
  
  if(infoShow | settingsShow | controlShow) {
    controlPanel.style().set('width', CONTROL_PANEL_WIDTH);
  } else {
    controlPanel.style().set('width', CONTROL_PANEL_WIDTH_HIDE);
  }
}

/**
 * Show/hide the settings panel.
 */
var settingsShow = false;
function settingsButtonHandler() {
  if(settingsShow) {
    settingsShow = false;
    settingsElements.style().set('shown', false);
    settingsButton.setLabel('Settings ❯');
  } else {
    settingsShow = true;
    settingsElements.style().set('shown', true);
    settingsButton.setLabel('Settings ❮');
  }
  
  if(infoShow | settingsShow | controlShow) {
    controlPanel.style().set('width', CONTROL_PANEL_WIDTH);
  } else {
    controlPanel.style().set('width', CONTROL_PANEL_WIDTH_HIDE);
  }
}

function geoJsonParser(jsonText) {
  var json = JSON.parse(jsonText);
  var geometries = [];
  
  for (var i = 0; i < json.features.length; i++) {
    var feature = json.features[i];
    var geomType = feature.geometry.type;
    var coords = feature.geometry.coordinates;
    
    if (geomType === 'MultiPolygon') {
      // MultiPolygon: coordinates[polygon][ring][point]
      for (var p = 0; p < coords.length; p++) {
        // Each polygon in the MultiPolygon
        var polygonCoords = coords[p];
        // Convert to Earth Engine Polygon
        var eePolygon = ee.Geometry.Polygon(polygonCoords);
        geometries.push(eePolygon);
      }
    } else if (geomType === 'Polygon') {
      // Polygon: coordinates[ring][point]
      var eePolygon = ee.Geometry.Polygon(coords);
      geometries.push(eePolygon);
    }
  }
  
  // Return single geometry or union of all geometries
  if (geometries.length === 0) {
    print('⚠️ No geometries found in GeoJSON');
    return null;
  } else if (geometries.length === 1) {
    print('✅ Loaded 1 geometry from GeoJSON');
    return geometries[0];
  } else {
    print('✅ Loaded ' + geometries.length + ' geometries from GeoJSON, combining...');
    // Combine all geometries into one
    return ee.Algorithms.GeometryConstructors.MultiPolygon(
      geometries.map(function(g) { return g.coordinates(); })
    ).dissolve();
  }
}

// Функция для создания полигона из 4 координат
function addNewObjectFrom4Coords() {
  var coordPrompt = prompt('Введите 4 координаты (lon1,lat1,lon2,lat2,lon3,lat3,lon4,lat4):', '80.95168200,53.49430700,83.04978700,54.73861000,83.04978700,53.49430700,80.95168200,54.73861000');
  if (!coordPrompt) {
    // User cancelled - reset to default mode
    regionMethodSelect.setValue('По клику', false);
    return;
  }
  
  try {
    // Parse coordinates
    var coords = coordPrompt.split(',').map(function(x) { return parseFloat(x.trim()); });
    
    // Check if we have exactly 8 numbers (4 points x 2 coordinates)
    if (coords.length !== 8) {
      print('❌ Ошибка: необходимо ввести ровно 8 чисел (4 точки по 2 координаты)');
      regionMethodSelect.setValue('По клику', false);
      return;
    }
    
    // Check if all values are valid numbers
    for (var i = 0; i < coords.length; i++) {
      if (isNaN(coords[i])) {
        print('❌ Ошибка: все значения должны быть числами');
        regionMethodSelect.setValue('По клику', false);
        return;
      }
    }
    
    // Extract 4 points
    var points = [
      {lon: coords[0], lat: coords[1]},
      {lon: coords[2], lat: coords[3]},
      {lon: coords[4], lat: coords[5]},
      {lon: coords[6], lat: coords[7]}
    ];
    
    // Find bounding box
    var minLon = Math.min(points[0].lon, points[1].lon, points[2].lon, points[3].lon);
    var maxLon = Math.max(points[0].lon, points[1].lon, points[2].lon, points[3].lon);
    var minLat = Math.min(points[0].lat, points[1].lat, points[2].lat, points[3].lat);
    var maxLat = Math.max(points[0].lat, points[1].lat, points[2].lat, points[3].lat);
    
    // Create rectangle in clockwise order (looking from above):
    // top-left -> top-right -> bottom-right -> bottom-left -> back to top-left
    var polygonCoords = [
      [minLon, maxLat],  // top-left (верхний левый)
      [maxLon, maxLat],  // top-right (верхний правый)
      [maxLon, minLat],  // bottom-right (нижний правый)
      [minLon, minLat],  // bottom-left (нижний левый)
      [minLon, maxLat]   // close polygon
    ];
    
    var geometry = ee.Geometry.Polygon([polygonCoords]);
    
    // Set the geometry as if it was drawn
    DRAWN_GEOMETRY = geometry;
    CLICKED = true;
    
    // Switch to graphical mode without triggering onChange again
    regionMethodSelect.setValue('Графически', false);
    
    // Make sure Options panel is visible (not the drawing panel)
    controlElements.style().set('shown', true);
    drawingControlPanel.style().set('shown', false);
    controlButton.setLabel('Options ❮');
    controlShow = true;
    
    // Hide chip width slider (not used in graphical mode)
    regionWidthPanel.style().set('shown', false);
    
    // Show the submit button
    submitButton.style().set('shown', true);
    
    // Show on map with yellow border
    map.layers().forEach(function(el) {
      map.layers().remove(el);
    });
    
    var geomCollection = ee.FeatureCollection([ee.Feature(geometry)]);
    map.addLayer(ee.Image().byte().paint({featureCollection: geomCollection, width: 3}), 
                 {palette: ['yellow']}, 'Loaded from 4 coords');
    // Auto-fit zoom to the geometry boundary
    map.centerObject(geometry);
    
    // Update clear panel visibility since we added a layer
    updateClearPanelVisibility();
    
    print('✅ Полигон из 4 координат создан! Нажмите "Submit changes" для обработки.');
  } catch (e) {
    print('❌ Ошибка создания полигона: ' + e.message);
    // Reset to default mode on error
    regionMethodSelect.setValue('По клику', false);
  }
}

// Функция для добавления нового объекта
function addNewObjectGeoJson() {
  var namePrompt = prompt('Вставьте GeoJSON:', 'Код GeoJSON');
  if (!namePrompt) {
    // User cancelled - reset to default mode
    regionMethodSelect.setValue('По клику', false);
    return;
  }
  
  try {
    var geometry = geoJsonParser(namePrompt);
    if (geometry !== null) {
      // Set the geometry as if it was drawn
      DRAWN_GEOMETRY = geometry;
      CLICKED = true;
      
      // Switch to graphical mode without triggering onChange again
      regionMethodSelect.setValue('Графически', false);
      
      // Make sure Options panel is visible (not the drawing panel)
      controlElements.style().set('shown', true);
      drawingControlPanel.style().set('shown', false);
      controlButton.setLabel('Options ❮');
      controlShow = true;
      
      // Hide chip width slider (not used in graphical mode)
      regionWidthPanel.style().set('shown', false);
      
      // Show the submit button
      submitButton.style().set('shown', true);
      
      // Show on map with yellow border (like drawn geometry)
      map.layers().forEach(function(el) {
        map.layers().remove(el);
      });
      
      var geomCollection = ee.FeatureCollection([ee.Feature(geometry)]);
      map.addLayer(ee.Image().byte().paint({featureCollection: geomCollection, width: 3}), 
                   {palette: ['yellow']}, 'Loaded GeoJSON');
      // Auto-fit zoom to the geometry boundary
      map.centerObject(geometry);
      
      // Update clear panel visibility since we added a layer
      updateClearPanelVisibility();
      
      print('✅ GeoJSON загружен! Нажмите "Submit changes" для обработки.');
    } else {
      // Parsing returned null - reset to default mode
      regionMethodSelect.setValue('По клику', false);
    }
  } catch (e) {
    print('❌ Ошибка парсинга GeoJSON: ' + e.message);
    // Reset to default mode on error
    regionMethodSelect.setValue('По клику', false);
  }
}



// #############################################################################
// ### SETUP UI ELEMENTS ###
// #############################################################################

infoElements.add(infoLabel);
infoElements.add(aboutLabel);
infoElements.add(appCodeLink);

// Settings panel content
var settingsDescLabel = ui.Label(
  'Configure application preferences and display settings.',
  infoFont);

var themeLabel = ui.Label({value: 'UI Theme', style: headerFont});
var themeSelect = ui.Select({
  items: ['Light', 'Dark', 'Auto'],
  value: 'Light',
  style: {stretch: 'horizontal'}
});
var themePanel = ui.Panel([themeLabel, themeSelect], null, {stretch: 'horizontal'});

var languageLabel = ui.Label({value: 'Language', style: headerFont});
var languageSelect = ui.Select({
  items: ['English', 'Русский'],
  value: 'Русский',
  style: {stretch: 'horizontal'}
});
var languagePanel = ui.Panel([languageLabel, languageSelect], null, {stretch: 'horizontal'});

var autoLoadLabel = ui.Label({value: 'Auto-load imagery', style: headerFont});
var autoLoadCheckbox = ui.Checkbox({
  label: 'Automatically load images on selection',
  value: true,
  style: {fontSize: '11px'}
});
var autoLoadPanel = ui.Panel([autoLoadLabel, autoLoadCheckbox], null, {stretch: 'horizontal'});

var thumbnailSizeLabel = ui.Label({value: 'Thumbnail size (pixels)', style: headerFont});
var thumbnailSizeSlider = ui.Slider({
  min: 100,
  max: 1000,
  value: 200,
  step: 50,
  style: {stretch: 'horizontal'}
});
var thumbnailSizePanel = ui.Panel([thumbnailSizeLabel, thumbnailSizeSlider], null, {stretch: 'horizontal'});

// Color selection for boundaries
var colorOptions = {
  'Red': 'ff0000',
  'Yellow': 'ffff00',
  'Blue': '0000ff',
  'Green': '00ff00',
  'White': 'ffffff',
  'Orange': 'ff8800',
  'Purple': 'ff00ff',
  'Cyan': '00ffff'
};

var aoiBorderColorLabel = ui.Label({value: 'AOI border color', style: headerFont});
var aoiBorderColorSelect = ui.Select({
  items: Object.keys(colorOptions),
  value: 'Yellow',
  style: {stretch: 'horizontal'}
});
var aoiBorderColorPanel = ui.Panel([aoiBorderColorLabel, aoiBorderColorSelect], null, {stretch: 'horizontal'});

var chipBorderColorLabel = ui.Label({value: 'Image chip border color', style: headerFont});
var chipBorderColorSelect = ui.Select({
  items: Object.keys(colorOptions),
  value: 'Red',
  style: {stretch: 'horizontal'}
});
var chipBorderColorPanel = ui.Panel([chipBorderColorLabel, chipBorderColorSelect], null, {stretch: 'horizontal'});

var pointCircleColorLabel = ui.Label({value: 'Point circle color', style: headerFont});
var pointCircleColorSelect = ui.Select({
  items: Object.keys(colorOptions),
  value: 'White',
  style: {stretch: 'horizontal'}
});
var pointCircleColorPanel = ui.Panel([pointCircleColorLabel, pointCircleColorSelect], null, {stretch: 'horizontal'});

settingsElements.add(settingsLabel);
settingsElements.add(settingsDescLabel);
settingsElements.add(themePanel);
settingsElements.add(languagePanel);
settingsElements.add(autoLoadPanel);
settingsElements.add(thumbnailSizePanel);
settingsElements.add(aoiBorderColorPanel);
settingsElements.add(chipBorderColorPanel);
settingsElements.add(pointCircleColorPanel);

controlElements.add(optionsLabel);
controlElements.add(sensorPanel);
controlElements.add(rgbPanel);
controlElements.add(durationPanel);
controlElements.add(cloudPanel);
controlElements.add(regionMethodPanel);
controlElements.add(regionWidthPanel);
controlElements.add(submitButton);

controlPanel.add(instr);
controlPanel.add(buttonPanel);
controlPanel.add(infoElements);
controlPanel.add(settingsElements);
controlPanel.add(controlElements);
controlPanel.add(drawingControlPanel);
controlPanel.add(clearAreaPanel);

map.add(controlPanel);
map.add(panel);

infoButton.onClick(infoButtonHandler);
settingsButton.onClick(settingsButtonHandler);
controlButton.onClick(controlButtonHandler);
sensorSelect.onChange(optionChange);
rgbSelect.onChange(optionChange);
txtbox1.onChange(optionChange);
txtbox2.onChange(optionChange);

cloudSlider.onChange(optionChange);
regionWidthSlider.onChange(optionChange);
submitButton.onClick(handleSubmitClick);
map.onClick(handleMapClick);

// Handler for region method selection
regionMethodSelect.onChange(function(method) {
  if (method === 'GeoJSON') {
    // Open GeoJSON dialog
    addNewObjectGeoJson();
    // After dialog, the function will set the mode to 'Графически' if successful
    return;
  } else if (method === '4 координаты') {
    // Open 4 coordinates dialog
    addNewObjectFrom4Coords();
    // After dialog, the function will set the mode to 'Графически' if successful
    return;
  } else if (method === 'Графически') {
    // Show drawing tools
    drawingTools.setShown(true);
    drawingControlPanel.style().set('shown', true);
    clearAreaPanel.style().set('shown', false);
    instr.setValue('Draw a region on the map');
    // Hide chip width slider (not used in graphical mode)
    regionWidthPanel.style().set('shown', false);
    // Disable map click handler temporarily
    map.unlisten('click');
  } else {
    // Mode "По клику"
    // Hide drawing tools
    drawingTools.setShown(false);
    drawingControlPanel.style().set('shown', false);
    // Remove only drawing tool layers (keep map layers)
    var layers = drawingTools.layers();
    while (layers.length() > 0) {
      layers.remove(layers.get(0));
    }
    DRAWN_GEOMETRY = null;
    instr.setValue('Click on a location');
    // Show chip width slider (used in click mode)
    regionWidthPanel.style().set('shown', true);
    // Re-enable map click handler
    map.onClick(handleMapClick);
    submitButton.style().set('shown', false);
    // Show clear panel if there are layers on the map
    updateClearPanelVisibility();
  }
  optionChange();
});

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


ui.root.clear();
ui.root.add(splitPanel);


if(ui.url.get('run')) {
  CLICKED = true;
  COORDS = [ui.url.get('lon'), ui.url.get('lat')];
  renderGraphics(COORDS);
}
