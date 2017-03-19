var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var path = require('path');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["marqdown.js"];
	}
	var filePath = args[0];

    var filelist = getAllFiles('./',[]);
    //console.log(filelist);
	filelist.forEach(function(filePath) {
        //console.log("===================="+filePath+"====================");
        parseFile(filePath);    
    });
    


}

var getAllFiles = function(dir, filelist) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if(file == 'node_modules'){
        return;
    }
    var filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = getAllFiles(path.join(dir, file), filelist);
    }
    else if(path.extname(filePath) === '.js') {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};


function parseFile(filePath)
{
    var loopConstructList = [];
    var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);
    var flag = true;
	traverse(result, function (node) 
	{
		if(node.type === 'IfStatement')
		{
			var funcName = functionName(node);
			//console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var expression = buf.substring(node.test.range[0], node.test.range[1]);
			var re = /(&{2}|\|{2})/g;
			var count = ((expression.match(re) || []).length)+1;
			
            if(count > 8){
                console.error("ERROR! In File: {2}, In Function: {1} at line {0}  number of conditions inside if statement are {3}".format(node.loc.start.line, funcName,filePath,count));
				flag =false;
          //      return -1;
            }
		}
		if(node.type === 'FunctionDeclaration')
		{
			var funcName = functionName(node);
			var funcLength = node.loc.end.line - node.loc.start.line;
            
            if(funcLength > 100){
                console.error("ERROR! In File : {0} function: {1} has {2} line of code ".format(filePath, funcName,funcLength ));
				flag =false;
            //    return -1;
            }
		} 

		if(node.type === 'ForStatement' || node.type === 'DoWhileStatement' || node.type === 'WhileStatement')
		{
			var funcName = functionName(node);
			var loopConstruct = {
				id: loopConstructList.length + 1,
				depth : 1,
				range:node.range,
				type:node.type,
				funcName:funcName
			};
			loopConstructList.push(loopConstruct);
			//console.log("Nested for loops"+ count);
		}

	});

	//sort loop blocks by closing brace
    loopConstructList.sort(function(a,b){
		if(a.range[1] > b.range[1])
			return 1
		else
			return -1;
	});
    
    //Calculate depth
	for (var i =0; i < loopConstructList.length; i++){
		var temp = loopConstructList[i];
		for (var j = i+1; j < loopConstructList.length; j++){
			var temp2 = loopConstructList[j];
			if(temp.range[0] >= temp2.range[0] && temp.range[1] <= temp2.range[1])
				{
					temp2.depth = max(temp2.depth,temp.depth +1);
					break;
				}
		}
    }
	
    for (var i =0; i < loopConstructList.length; i++){
        var loopConstruct = loopConstructList[i];
        if(loopConstruct.depth > 3){
            console.error("ERROR! In File : {0} function: {1} has complexity greater than Big O of 3 ".format(filePath, loopConstruct.funcName));
			flag =false;
            //return -1;
        }
    }
	if(flag){
		console.log("SUCCESS!")
	}
    //console.log(loopConstructList);
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
