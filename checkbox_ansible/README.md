====== Checkbox.io Ansible scripts =======

### Task 1: 
Extend the materials from the configuration management milestone and Jenkins homework assignment to create a Jenkins build server that contains:  

-A build job for checkbox.io  
-Analysis Component

Create an analysis tool that runs on checkbox.io's server-side code and implements the following detections.

##### Max condition: Detect the max number of conditions within an if statement in a function (greater than 8).
##### Long method: Detect any long methods (greater than 100 lines of code).
##### The Big O. Detect any method with a big O greater than 3.
And Fail the build if any of these results occur.

### Solution 
We first extended the ansible playbook to add support for nginx and ansible, and then the script creats a jenkings job and builds it. The ansible playbook also adds 'post build script' and 'post build task' plugins to jenkins to run the analysis script.
Then we implemented a node.js script to analyze the checkbox.io project for the above mentioned conditions. 

##### Link to screencast: https://youtu.be/gkkTJyGzD_E 
