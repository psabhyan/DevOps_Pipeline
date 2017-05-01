var Botkit = require('botkit');
var express = require('express');
var app = express();
var npmCheck = require('npm-check');
var request = require('request');
var fs = require("fs");
var Promise = require('bluebird');
var parse = require('parse-link-header');
var sprintf = require('sprintf-js').sprintf;
var request = require('request');
var shell = require('shelljs');
var sleep = require('sleep');
var forever = require('forever-monitor');

var controller = Botkit.slackbot({
    debug: false,
    //logLevel: 7
    //include "log: false" to disable logging
    //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
var myBot = controller.spawn({
    token: process.env.VERSION_MONKEY_TOKEN,
    //token: process.env.slackbot_token,
    incoming_webhook: {
        url: "https://hooks.slack.com/services/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"
    }
}).startRTM()

controller.setupWebserver(3000, function (err, webserver) {
    controller.createWebhookEndpoints(webserver);
});


function start_rtm() {
        myBot.startRTM(function(err,bot,payload) {
                if (err) {
                        console.log('Failed to start RTM')
                return setTimeout(start_rtm, 60000);
                }
                console.log("RTM started!");
                });
}

controller.on('rtm_close', function(bot, err) {
        start_rtm();
});


/**For periodic checking */

//var CronJob = require('cron').CronJob;
//new CronJob('1 * * * * *', function() {
    //need to pass channel id as arguments.
// listDependency();
// }, null, true, 'America/Los_Angeles');

controller.hears('(list|show|what|which|how)(.*)(dependenc|jar|link)', ['direct_message', 'mention', 'direct_mention'], function (bot, message) {
    bot.startConversation(message, listDependency);
});

listDependency = function (response, convo) {

    console.log("List dependency");
    shell.cp('-R', '/home/vagrant/checkbox.io/', '/home/vagrant/checkbox.io_temp1/');
    shell.cp('-R', '/home/vagrant/checkbox.io/', '/home/vagrant/checkbox.io_temp2/');

    sleep.sleep(30);
    var wanted_package_list = "";
    var latest_package_list = "";

    var nodeScript = "forever start  -a -o ~/report.log -e ~/report.log server.js"

    var options = { 'cwd': '/home/vagrant/checkbox.io/server-side/site/' }

    //Create report
    npmCheck(options).
        then(function (currentState) {
            var moduleList = currentState.get('packages');

            var report = sprintf("%-15s %-15s %-15s %-15s %-15s\n", 'Module Name', 'Installed', 'Wanted', 'Latest', 'Update');
            //            report += sprintf("%=75s",'');
            report += "\n========================================================================\n";
            for (var i = 0; i < moduleList.length; i++) {
                  
               if ((moduleList[i].installed != moduleList[i].packageWanted) || (moduleList[i].installed != moduleList[i].latest)) {

                    report += sprintf("%-15s %-15s %-15s %-15s %-15s\n", moduleList[i].moduleName, moduleList[i].installed, moduleList[i].packageWanted, moduleList[i].latest, moduleList[i].bump);
                    wanted_package_list += "npm install --save " + moduleList[i].moduleName + "@" + moduleList[i].packageWanted + "\n";
                    latest_package_list += "npm install --save " + moduleList[i].moduleName + "@" + moduleList[i].latest + "\n";
               }
            }
            console.log(report);

            report += "\n\n====================INSTALLING NPM MODULES(LATEST)========================\n\n";

            shell.cd('/home/vagrant/checkbox.io_temp2/server-side/site');
            report += shell.exec(latest_package_list).stdout;

            var child = new (forever.Monitor)('server.js', {
                max: 1,
                silent: false,
                cwd: '/home/vagrant/checkbox.io_temp2/server-side/site',
                outFile: '/home/vagrant/report_latest.log',
                errFile: '/home/vagrant/report_latest.log',
                args: ["--port", "3001"]
            });

            child.on('exit', function () {

                console.log('server.js has exited after 1 restart');
            });

            child.on('stdout', function (data) {

                report += "\n===========================STDOUT LOGS(LATEST)======================\n";

                report += data.toString();
                console.log("Stdout " + data.toString());
            });

            child.on('stderr', function (data) {

                report += "\n===========================STDERR LOGS(LATEST)======================\n";

                report += data;
                console.log("Stderr " + data.toString());
            });

            child.start();
            sleep.sleep(60);
            child.stop();

            sleep.sleep(120)
            report += "\n\n====================INSTALLING NPM MODULES(Wanted)========================\n\n";

            shell.cd('/home/vagrant/checkbox.io_temp1/server-side/site');
            report += shell.exec(wanted_package_list).stdout;

            report += "\n===========================REPORT FOR CHECKBOX BUILD======================\n";


            var child2 = new (forever.Monitor)('server.js', {
                max: 1,
                silent: false,
                cwd: '/home/vagrant/checkbox.io_temp1/server-side/site',
                outFile: '/home/vagrant/report_wanted.log',
                errFile: '/home/vagrant/report_wanted.log',
                args: ["--port", "3002"]
            });

            child2.on('exit', function () {

                console.log('server.js has exited after 1 restart');

                console.log("Generating postrequest");

                var r = request.post('https://slack.com/api/files.upload', function (err, res, body) {
                    convo.ask("How would you like to update package.json?(Select from below options) " +
                       "\n 1. Update to latest \n2. Update to Wanted\n 3. Ignore",udpateDep);
                });

                var form = r.form();
                form.append('token', process.env.VERSION_MONKEY_TOKEN);
                form.append('file', report, {
                    filename: 'report.txt',
                    contentType: 'text/plain'
                });
                form.append('channels', convo.source_message.channel);

            });

            child2.on('stdout', function (data) {
                report += "\n===========================STDOUT LOGS(WANTED)======================\n";
                report += data.toString();
                console.log("Stdout " + data.toString());
            });

            child2.on('stderr', function (data) {
                report += "\n===========================STDERR LOGS(WANTED)======================\n";
                report += data;
                console.log("Stderr " + data.toString());
            });

            child2.start();
            sleep.sleep(60);
            child2.stop();

        });


}

udpateDep = function (response, convo) {
    var option = response.text;

    if (option == '1') {

        shell.cd('/home/vagrant/checkbox.io_temp2/server-side/site');
        shell.exec('git add package.json');
        shell.exec('git commit -m "Updated package.json"');
        shell.exec('git push');
        convo.say('Changes pushed to github')
    }
    else if (option == '2') {
        shell.cd('/home/vagrant/checkbox.io_temp1/server-side/site');
        shell.exec('git add package.json');
        shell.exec('git commit -m "Updated package.json"');
        shell.exec('git push');
        convo.say('Changes pushed to github')
    } else {
        convo.say('Ignoring....')
    }

    sleep.sleep(30);
    convo.say('Cleaning up folders');
    shell.rm('-rf', '/home/vagrant/checkbox.io_temp*');
    shell.rm('/home/vagrant/report*');

}
