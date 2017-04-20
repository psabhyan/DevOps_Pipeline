**Milestone 3: Deployment –**

In this MILESTONE, we had extend our deployment pipeline to support additional concerns related to deployment. As a part of deployment pipeline we have implemented following components:

### **Components**

- **Deployment:**
  - iTrust:
    -  As a part of deployment process for iTrust we have created an ansible playbook which spawns EC2 instances which we are using for Jenkins and iTrust deployment.
    - We have used webhooks in order to automate the deployment of iTrust. Whenever we push any changes to iTrust repository, Jenkins build is triggered which generates an updated war after successful build.
    - Another ansible script is used to push this war into production server from Jenkins server.
- **Infrastructure Upgrade**  Make improvements to the infrastructure of checkbox.io.
  - Create a load balancer that stores and redirects traffic to checkbox.io instances.
  - Create a redis feature flagserver that can be used to turn off features on checkbox.io. The redis properties server should be mirrored locally to each instance.
- **Canary Release**. Implement the ability to perform a canary release for checkbox.io: Using a proxy/load balancer server, route a percentage of traffic to a newly staged version of software and remaining traffic to a stable version of software. Stop routing traffic to canary if alert is raised.
- **Rolling Update** :
  - 5 instances of EC2 are launched and iTrust is deployed on each of them using the deployment strategy mentioned in Deployment component.
  - In order to implement rolling update an ansible play-book is written which deploys updated war onto the available servers one at a time. This involves shutting down the server, deploying the war and then restarting the server.
  - This ensures that only one server is down at a given point of time.

For iTrust deployment and rolling update demonstration, [Click Here](https://youtu.be/08RNE_Ie7uY)
