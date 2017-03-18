var fs = require("fs");
var _ = require("lodash");

function main(){

    var testCasesReport = fs.readFileSync("/home/vagrant/Fuzzer2/Fuzzer/allTestCases.txt", 'utf8');
    var failedReport = fs.readFileSync("/home/vagrant/Fuzzer2/Fuzzer/failures.txt",'utf8');

    var allTestCases = testCasesReport.split("\n");
    var failedTestCases = failedReport.split("\n");

    var uselessTestCases = _.difference(allTestCases,failedTestCases);

    fs.appendFileSync("/home/vagrant/Fuzzer2/Fuzzer/uselessTestCaseReport.txt","          USELESS TESTCASE REPORT\n   ClassName <-> TestCase ",'utf-8');
    var uselessReport = uselessTestCases.join('\n');
    fs.appendFileSync("/home/vagrant/Fuzzer2/Fuzzer/uselessTestCaseReport.txt",uselessReport,'utf-8');
}

main();
