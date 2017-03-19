var recursiveReadSync = require('recursive-readdir-sync');
var fuzzer = require('./fuzzer.js');
var shell = require('shelljs');
var fr = require('./failure_report.js');
var sleep = require('sleep');
var files = [];
function main() {
    
    var directory = "/home/vagrant/iTrust/src/main/";
    var filelist = listFilesRecursively(directory);
    
    for (var i = 0; i < 100; i++){
   
        try{

           shell.cd('/home/vagrant/');
           shell.rm('-rf','/home/vagrant/iTrust/');
           shell.cp('-R', '/home/vagrant/project/', '/home/vagrant/iTrust/');

           fuzzer.processFiles(filelist);
           //sleep.sleep(5);
          // console.log("Waiting for git commit");    
          // sleep.sleep(30); 

           //shell.exec('cd /home/vagrant/iTrust/; mvn clean package');
           
           shell.cd('/home/vagrant/iTrust/src/main/');
           shell.exec('git config user.email "nramcha@ncsu.edu"');
           shell.exec('git config user.name "Nitin Ramchandani"')
           shell.exec('git add .');
           shell.exec('git commit -m "Fuzzed '+i+' "');
        
           var isProjectBuilding = true;
           while(isProjectBuilding){
    	      sleep.sleep(10);
              var jsonOutput = shell.exec('curl http://localhost:8080/job/iTrust/lastBuild/api/json');
              var buildObj = JSON.parse(jsonOutput);
	      //console.log(JSON.stringify(jsonOutput));
              isProjectBuilding = buildObj.building;
           
	   }
	}catch(e){
	  console.log("Exception in building project");
	  console.log(e);
	}
       
        
        //child_process.execSync('ls').toString();
        // child_process.execSync('mvn clean package');
     fr.updateFailureReport();
       
    }
    fr.getAllTestCases();

}

function listFilesRecursively(directory) {
    var files = []
    try {
        files = recursiveReadSync(directory);
    }
    catch (err) {
        if (err.errno === 34) {
            console.log('Path does not exist');
        }
        else {
            //something unrelated went wrong, rethrow 
            throw err;
        }
    }
    
    return files;

}
main();
