# DevOps Project – Milestone 1 (CM)

This is first milestone for the DevOps project in which we implemented automation for the configuration management.

We implemented this for two projects wiz Checkbox.io(NodeJS project) and ITrust(Java project). We used tools like vagrant for setting up virtual machine for deploying these applications. We also used ansible tool for configuration of VM.

We faced several issues during the entire process. Herewith we are writing the detailed report about the entire process.

## A] iTrust:

- iTrust is a java application used in the undergrad software engineering system. It uses tomcat, mysql, java, and maven. It has a rich set of unit tests.
- Following is the configuration management process for the iTrust
![alt tag](./itrust2.jpg)

Following were the steps followed while setting up iTrust manually on virtual machine:

1. 1)JDK Installation:
  1. sudo add-apt-repository ppa:webupd8team/java
  2. sudo apt-get update
  3. sudo apt-get install oracle-java8-installer
2. 2)Maven Installation:
  1. sudo apt-get update
  2. sudo apt-get install maven
3. 3)MySQL server installation:
  1. sudo apt-get update
  2. sudo apt-get install mysql-server
4. 4)Tomcat installation:
  1. wget http://www.us.apache.org/dist/tomcat/tomcat-9/v9.0.0.M1/bin/apache-tomcat-9.0.0.M1.tar.gz (Please refer tohttp://tomcat.apache.org/download-90.cgi for the exact URL )
  2. tar xzf apache-tomcat-9.0.0.M1.tar.gz
  3. mv apache-tomcat-9.0.0.M1 tomcat9
5. 5)Maven Build:
  1. Use &quot;mvn clean test package&quot;. This will perform following tasks:
    1. Clean the target directory of iTrust.
    2. Compile java files in iTrust.
    3. Executing Junit test cases for iTrust.
    4. Package binary files into a WAR file.
6. 6)Deploy War file and Start Tomcat:
  1. Copy war file into webapps directory of tomcat.
  2. Start tomcat using /usr/local/tomcat9/bin/startup.sh

We came across following issues during the process:

1. a)Vagrant allocates some initial memory to the VM created. When we tried to build the iTrust project, the build process was getting terminated abruptly. After analyzing this issue we concluded that this was because the memory assigned by vagrant was not sufficient. Quick solution to this problem was allocating memory manually for the VM in to .vagrant file. This solved our problem.
2. b)Problems while executing database scripts. Table name in database scripts is case sensitive when run in linux environment. This was the showstopper for us since we were not able to understand the reason why scripts are not running. However minor modifications to my.conf solved the problem.
