var fs = require("fs");
var randomstring = require("randomstring");

exports.processFiles= function(filelist) {
    console.log(filelist.length);    
    var files = shuffle(filelist);
    for(var i = 0; i < 100; i++) {
    
      var index = i;//getRandomInt(0, files.length - 1);
      var fileName = files[index];
      console.log(fileName);
         var mutations = getMutations();
         replaceInFile(fileName, mutations);
    
   }

}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMutations() {

   var mutations = [
			{
				regex: /(\(\s*\w+\s*)(\<)(\s*\w+\s*\))/g,
				replacement: '$1>$3'
			},

			{
				regex: /(\(\s*\w+\s*)(\>)(\s*\w+\s*\))/g,
				replacement: '$1<$3'
			},
			{
				regex: /(return\s*)(-*\d)/g,
				replacement: '$1 0'
			},
			{
				regex: /(\(\s*\w+\s*)(\<=)(\s*\w+\s*\))/g,
				replacement: '$1>$3'
			},
			{
				regex: /(\(\s*\w+\s*)(\>=)(\s*\w+\s*\))/g,
				replacement: '$1<$3'
			},
			{
				regex: /(\(\s*\w+\s*)(\==)(\s*\w+\s*\))/g,
				replacement: '$1!=$3'
			},
			{
				regex: /(\(\s*\w+\s*)(\!=)(\s*\w+\s*\))/g,
				replacement: '$1==$3'
//			},
//			{
//				regex: /([!=]=[ ]{0,1})(["])((?:(?=(\\?))\4.)*?)\2/g,
//				replacement: '$1$2' +randomstring.generate() + '$2'
			} 
		  ]  

	return mutations;
}
function replaceInFile(filePath, mutations) {

        var result = fs.readFileSync(filePath, 'utf8');
        var lines = result.split('\n');
        for( var l =0; l < lines.length; l++){
        
            var matchedMutations = [];
             for (var j = 0; j < mutations.length; j++){

        	    if(lines[l].match(mutations[j].regex)){
         		
			matchedMutations.push(j);
		    }
             }
	     
             for (var k = 0; k < matchedMutations.length; k++){
                  var mutation = mutations[matchedMutations[k]];
                  lines[l] = lines[l].replace(mutation.regex,mutation.replacement);

             }


            
	}
        result = lines.join('\n');
        fs.writeFileSync(filePath, result, 'utf8');
}


