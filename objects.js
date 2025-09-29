var places = {
    'Плотниково':table,
    'Ракитинка':table2,
    'Гомель':table4,
    'Старый Оскол 1':table3.limit(1),
    'УниХимТех':geometry,
};

exports.places = places;

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