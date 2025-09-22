var places = {
    'Плотниково':table,
    'Ракитинка':table2,
    'Гомель':table4,
    'Старый Оскол 1':table3.limit(1),
    'УниХимТех':geometry,
};

exports.places = places;

// === UI ДЛЯ РИСОВАНИЯ ОБЛАСТЕЙ ===
var drawingTools = Map.drawingTools();
drawingTools.setShown(true);
drawingTools.setDrawModes(['polygon', 'point', 'rectangle']);

// Панель управления
var controlPanel = ui.Panel({
    widgets: [
        ui.Label('🎨 Создание новых областей', {fontWeight: 'bold', fontSize: '16px'}),
        ui.Label('1. Выберите инструмент рисования'),
        ui.Label('2. Нарисуйте область на карте'),
        ui.Label('3. Скопируйте код из popup'),
        ui.Label('4. Вставьте в program.js'),
    ],
    style: {position: 'top-left', width: '300px'}
});
Map.add(controlPanel);

// Элементы диалога
var nameInput = ui.Textbox({placeholder: 'Введите название области...', style: {width: '250px'}});
var codeTextbox = ui.Textbox({
    placeholder: 'Код геометрии появится здесь...',
    style: {width: '250px', height: '60px'}
});
var copyButton = ui.Button({
    label: '📋 Скопировать код',
    style: {backgroundColor: '#4CAF50', color: 'white'}
});
var closeButton = ui.Button({
    label: '❌ Закрыть',
    style: {backgroundColor: '#f44336', color: 'white'}
});

var dialogPanel = ui.Panel({
    widgets: [
        ui.Label('📝 Данные для копирования:', {fontWeight: 'bold'}),
        ui.Label('Название области:'),
        nameInput,
        ui.Label('Код геометрии:'),
        codeTextbox,
        ui.Panel([copyButton, closeButton], ui.Panel.Layout.flow('horizontal'))
    ],
    style: {shown: false, backgroundColor: 'white', padding: '15px', border: '2px solid #4CAF50'}
});
controlPanel.add(dialogPanel);

var currentGeometry = null;

// Функция для показа диалога с кодом
function showGeometryCode(geometry, name) {
    currentGeometry = geometry;
    
    // Получаем координаты геометрии
    var coordinates = geometry.coordinates();
    coordinates.evaluate(function(coords) {
        var geoType = geometry.type().getInfo();
        var code;
        
        // Генерируем код в зависимости от типа геометрии
        if (geoType === 'Point') {
            code = "ee.Geometry.Point(" + JSON.stringify(coords) + ")";
        } else if (geoType === 'Polygon') {
            code = "ee.Geometry.Polygon(" + JSON.stringify(coords) + ")";
        } else if (geoType === 'Rectangle') {
            code = "ee.Geometry.Rectangle(" + JSON.stringify(coords) + ")";
        } else {
            code = "ee.Geometry(" + JSON.stringify(coords) + ")";
        }
        
        // Показываем в диалоге
        codeTextbox.setValue(code);
        nameInput.setValue(name || 'Новая область');
        dialogPanel.style().set('shown', true);
        
        print('✅ Область создана! Скопируйте код из диалога');
        print('📋 Код для вставки:', code);
    });
}

// Обработчики кнопок
copyButton.onClick(function() {
    var name = nameInput.getValue();
    var code = codeTextbox.getValue();
    
    print('📋 Скопируйте эти строки в program.js:');
    print('// В начале файла добавьте:');
    print("var " + name.replace(/\s+/g, '_') + " = ee.FeatureCollection([ee.Feature(" + code + ")]);");
    print('');
    print('// В объект places добавьте:');
    print("'" + name + "': " + name.replace(/\s+/g, '_') + ",");
    print('');
    print('💡 После добавления нажмите кнопку "Добавить объект" в program.js');
});

closeButton.onClick(function() {
    dialogPanel.style().set('shown', false);
    nameInput.setValue('');
    codeTextbox.setValue('');
    drawingTools.clear();
});

// Обработчик рисования
drawingTools.onDraw(function(geometry) {
    print('✏️ Область нарисована! Введите название.');
    showGeometryCode(geometry, 'Область_' + Date.now());
});

/*
var eee = Object.keys(places);
var nDays = ee.Number(eee.length);
var dayOffsets = ee.List.sequence(0, nDays.subtract(1));
print(dayOffsets);
var n = 4;
//print(eee);
//print(places[eee[n]]);

var edd = places[eee[n]].geometry().buffer(2000).bounds();
var new_f = ee.Feature(edd).set('Buffer', 'Yes');
var new_coll =  places[eee[n]].merge(new_f);
print(new_coll);
Map.addLayer(new_coll.filterMetadata('Buffer', 'equals', 'Yes'), {color:'red'}, 'Buffer');
Map.addLayer(new_coll.limit(1), {}, 'ROI');
Map.centerObject(new_coll.filterMetadata('Buffer', 'equals', 'Yes'));*/