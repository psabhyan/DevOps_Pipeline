
# Devops_Project

This project contains software modules which can be used to create DevOps pipeline for Continuous Deployment.

Team:

| Name              | Unity Id |   Contribution                                    |
|-------------------|----------|---------------------------------------------------|
| Pinakin Abhyankar | Psabhyan | Worked on slack bot implementation.               |
| Shalini Sejwani   | Smsejwan | Worked on slack bot implementation.               |
| Nitin Ramchandani | Nramcha  | Worked on version update monkey with npm-check    |
| Ronak Ghadiya     | rghadiy  | Worked on version update monkey with npm-check    |

Submission

We have submitted our deliverable documents on a separate branch  [MileStone_1_CM](https://github.ncsu.edu/smsejwan/Devops_Project/tree/Milestone_1_CM) .

We have submitted our deliverable documents on a separate branch  [MileStone_2_BuildTestAnalysis](https://github.ncsu.edu/smsejwan/Devops_Project/tree/Milestone_2_BuildTestAnalysis)

We have submitted our deliverable documents on a separate branch [Milestone_3_Deployment](https://github.ncsu.edu/smsejwan/Devops_Project/tree/Milestone_3_DEPLOYMENT)


MileStone 4: 

#### VersionMonkey ####

- We have used Slack bot to communicate with user to notify about the version update and all reporting.Slack bot will match the pattern type in message received from the user and make certain actions based on the matched pattern.

- If user has typed message - "list dependency" to perform version update check, slack bot will first initiate checking of current status of all installed modules' versions.

- To check for the version check, we have used 'npm-check' module. This module will check for all the dependencies mentioned in package.json and will check for its available wanted versions and latest versions. 

npmCheck method will give JSON data for each module as followed:
```json
{
moduleName: 'morgan',
    homepage: 'https://github.com/expressjs/morgan#readme',
    regError: undefined,
    pkgError:
     Error: A package.json was not found at /home/vagrant/checkbox.io/server-side/site/node_modules/morgan/package.json
         at readPackageJson (/home/vagrant/version_monkey_bot/node_modules/npm-check/lib/in/read-package-json.js:12:21)
         at createPackageSummary (/home/vagrant/version_monkey_bot/node_modules/npm-check/lib/in/create-package-summary.js:17:31)
         at allDependenciesIncludingMissing.map.moduleName (/home/vagrant/version_monkey_bot/node_modules/npm-check/lib/in/index.js:34:32)
         at Array.map (native)
         at /home/vagrant/version_monkey_bot/node_modules/npm-check/lib/in/index.js:34:14
         at Generator.next (<anonymous>)
         at onFulfilled (/home/vagrant/version_monkey_bot/node_modules/co/index.js:65:19),
    latest: '1.8.1',
    installed: '1.8.1',
    isInstalled: false,
    notInstalled: true,
    packageWanted: '1.8.1',
    packageJson: '1.8.1',
    notInPackageJson: undefined,
    devDependency: false,
    usedInScripts: undefined,
    mismatch: false,
    semverValid: '1.8.1',
    easyUpgrade: true,
    bump: null,
    unused: false
}
```
- Above JSON data is for module 'morgan' that we received from npmCheck method. In this, you can see different fields for latest available and wanted versions. Also, 'bump' field shows that whether the latest version is a patch update, minor update or major update.

- Bot will parse the above json data for every module  and check if available wanted or latest versions are different from the currently installed version, then only it will consider the module to be updated otherwise the current version will be remained as it is. 

- In report, it will display all the modules which has different latest or wanter versions with their version numbers and also the bump data whether it was patch/minor/major update as follow:


Module Name     Installed       Wanted          Latest          Update        

========================================================================

archiver        0.4.10          0.4.10          1.3.0           major          

async           2.1.4           2.4.0           2.4.0           minor          

cors            2.8.1           2.8.3           2.8.3           patch          

express         3.21.2          3.21.2          4.15.2          major          

mongodb         2.2.22          2.2.26          2.2.26          patch          

validator       6.2.1           6.3.0           7.0.0           major


- Now it will create two temporary folders and copy the checkbox.io code into both of these folders. One folder will be use to update wanted version and other folder will be used to update latest versions.
- In folder 1, Bot will update the versions in package.json in checkbox.io code repo, with the latest versions for the modules mentioned in the above table. It will display the logs of npm install command in the report showing that version update was successful.
- Next, bot will build and test the checkbox.io whether it is building and running successfully with latest version update, it will start running the checkbox with the forever service and will display the logs of checkbox.io server connection in the report.

- Bot will perform similar process for folder 2, but it will update to wanted versions of modules lister above in the table. And it will include npm install logs and also checkbox.io successfully running logs for wanted versions of folder 2 also in the report.

- After all the report data is prepared, bot will attach the report to the user on slack channel and then it will give the user 3 options to choose as below.

How would you like to update package.json?(Select from below options)
 1. Update to latest 
 2. Update to Wanted
 3. Ignore



- If user has selected option 1 or 2, bot will push the package.json of folder 1 or 2 to the original checkbox.io repo on github. If user opts for option 3, bot will ignore the changes and both folders will be deleted and noting will be pushed to github.

- Screencast link - https://youtu.be/gm8GL_WoCtE
