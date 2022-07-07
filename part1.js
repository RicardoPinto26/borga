'use strict';

function filterProperties(propNames, obj) {
    const newObj = {};
    for (const key of propNames) {
        //if(key in obj) newObj[key] = obj[key];
        if(obj[key] !== undefined) newObj[key] = obj[key];
    }
    return newObj;
}

function filterPropertiesN(propNames, objs) {
    return objs.map((x) => { 
        return filterProperties(propNames, x); 
    });
}

Array.prototype.zip = function(a, combiner) {
    const length = (a.length > this.length) ? this.length : a.length;
    const newArr = [];
    for(let i = 0; i < length; i++) {
        //newArr[i] = combiner(a[i], this[i]);
        newArr.push(combiner(a[i], this[i]));
    }
    return newArr;
}

module.exports = {
    filterProperties: filterProperties,
    filterPropertiesN: filterPropertiesN,
    zip: Array.prototype.zip,
}
