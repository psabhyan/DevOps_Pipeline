var fs = require('fs'),
    path = require('path'),
    xml2js = require('xml2js');
var parser = new xml2js.Parser();



exports.updateFailureReport = function(){
    var reports = ["/var/lib/jenkins/jobs/iTrust/workspace/target/surefire-reports/"];
    gatherFailedTestCases(reports[0],false);
}

exports.getAllTestCases = function(){
    var reports = ["/home/vagrant/project/target/surefire-reports/"];
    gatherFailedTestCases(reports[0],true);
    
}


function gatherFailedTestCases(dir,ignoreFailed) {

    var files = fs.readdirSync(dir);
    var filelist = [];

    files.forEach(function (file) {

        var filePath = path.join(dir, file);
        if (path.extname(filePath) === '.xml') {
            filelist.push(filePath);
        }
    });

    function compare(a, b) {

        if (!a.failed && b.failed) {
            return 1;
        }
        else if (a.failed && !b.failed) {
            return -1;
        }
        else
            return a.time - b.time;
    }
   console.log("FilelIst"+filelist.length) 
   var failedTestCases = [];
    for (var file in filelist) {
        fs.readFile(filelist[file], function (err, data) {
            parser.parseString(data, function (err, result) {
                for (var testCase in result.testsuite.testcase) {
                    
		    var t = {};
		    t.classname = result.testsuite.testcase[testCase]['$'].classname;
                    t.testname = result.testsuite.testcase[testCase]['$'].name;
                    t.failed = false;;
                    
                    if(ignoreFailed){
			
		          fs.appendFileSync('/home/vagrant/allTestCases.txt', t.classname+"<->"+t.testname+"\n", 'utf8');

		     }else if (result.testsuite.testcase[testCase].hasOwnProperty("failure")) {
                    
		           t.failed = true;
                           console.log("FailedTestCases =>>>>>>"+t.classname+"<->"+t.testname);
                           fs.appendFileSync('/home/vagrant/failures.txt', t.classname+"<->"+t.testname+"\n", 'utf8');

                    }

                }


            });
        });

    }
}
