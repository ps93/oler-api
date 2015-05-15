
module.exports = {

ValidationTrim: function(values, fieldToCheck){

    var valuesUpdated = [];

    for(var i = 0 ; i < values.length ; i++) {
      if(values[i].hasOwnProperty(fieldToCheck)){
          values[i][fieldToCheck] = values[i][fieldToCheck].trim();
          if(!_.isEmpty(values[i][fieldToCheck])) valuesUpdated.push(values[i]);
      }
    }
    return valuesUpdated;
  }

};