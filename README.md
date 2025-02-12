# TAG Based CloudWatch Dashboard using CDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS Provider](https://img.shields.io/badge/provider-AWS-orange?logo=amazon-aws&color=ff9900)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

The project is an example how to use AWS Resource Groups Tagging API to retrieve a specific tag
and then based on found resources pull additional information from respective service APIs to generate
a configuration file (JSON) to build a CloudWatch Dashboard with _reasonable_ metrics and alarms.

## Features

### Supported services

- API Gateway v1 (REST)
- API Gateway v2 (HTTP, WebSockets)
- AppSync
- Aurora
- Autoscaling Groups
- On-Demand Capacity Reservations
- CloudFront
- DynamoDB
- EBS (as part of EC2)
- EC2 (support for t\* burstable instances, support for CloudWatch Agent)
- ELB v1 (ELB Classic)
- ELB v2 (ALB, NLB)
- ECS (EC2 and Fargate)
- Lambda
- NAT Gateway
- RDS
- S3
- SNS
- SQS
- Transit Gateway
- WAFv2

## How it works

1. `data/resource_collector.py` is used to call the Resource Groups Tagging API and to generate the configuration file.
2. CDK (v2) is used to generate CloudFormation template and deploy it

The solution will create metrics and alarms following best practices.

## Prerequisites

### To generate the resource configuration:

- Python 3
- Boto 3 (Python module. `python -m pip install boto3`)

### To generate the dashboard

- NodeJS 14+ (required by CDK v2)
- CDK v2 (Installation: `npm -g install aws-cdk@latest`)

## Configuration properties in lib/config.json

`BaseName` (String:required) - Base-name of your dashboards. This will be the prefix of the dashboard names.

`ResourceFile` (String:required) - The path for the file where resources are stored. Used by the `resource_collector.py` when generating resource config and by the CDK when generating the CF template.

`TagKey` (String:required) - Configuration of the tag key that will select resources to be included.

`TagValues` (Array<String>:required) - List of values of `TagKey` to include.

`Regions` (Array<String>:required) - List of regions from which resources are displayed.

`GroupingTagKey` (String:optional) - If set, separate Lambda and EC2 dashboards will be created for every value of that tag. Every value groups resources by that value.

`CustomEC2TagKeys` (Array<String>:optional) - If set, the tag info will show in the EC2 header widget in format Key:Value. Useful to add auxilary information to the header.

`CustomNamepsaceFile` (String:required) - Detected custom namespaces. Not yet used.

`Compact` (boolean (true/false):required) - When set to true, multiple Lambda functions will be put in a single widget set. Useful when there are many Lambda functions.

`CompactMaxResourcesPerWidget` (Integer:required) - When `Compact` is set to true, determines how many Lambda functions will be in each widget set.

`AlarmTopic` (String:optional) - When `AlarmTopic` contains a string with an ARN to a SNS topic, all alarms will be created with an action to send notification to that SNS topic.

## Getting started

1. Check out the project.
2. Change current directory to project directory.
3. If deploying for the first time, run `cdk bootstrap` to bootstrap the environment (https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html). In case you don't want to bootstrap read [Deploying without boostraping CDK](BOOTSTRAP.md).
4. Run `npm install` to install dependencies.
5. Edit `lib/config.json` and set TagKey to tag key you want to use and TagValues to an array of values. Set Regions to include the regions that contain resources.
6. Run `cd data; python3 resource_collector.py` to create configuration file `resources.json` in the `data` directory. IMPORTANT NOTICE: `data/getResources.sh`is now deprecated and will not be maintained. Use `data/resource_collector.py` instead.
7. **OPTIONAL:** Edit `BaseName`-property in `lib/config.json` to change the name of your dashboard.
8. Run `cdk synth` from the project root to generate CF template in `cdk.out` or `cdk deploy` to deploy directly to your AWS account.

## Tips

Try setting up a CodeCommit repository where you store your code. Set up a CI/CD pipeline to automatically redeploy your dashboard.
This way, if you want to change/add/remove any metrics for any of the services you change the code, commit it, and it will be automatically deployed.

Try creating an EventBridge rule that will listen to specific tag change and trigger the CodeBuild project to redeploy the dashboard.
This way, if you have an autoscaling group or just tag additional resources the dashboard will deploy automatically. In case you do so, monitor your builds
to avoid rare situations where a lot of tag changes could cause excessive amounts of concurrent or queued builds (for example event bridge rule misconfiguration or
variable loads that causes ASG to scale up and down quickly). This can be done by specifying tag value in the Event Bridge rule or instead of triggering the build
directly from Event Bridge sending it to a Lambda function for more flexible decision-making on whether to trigger a build or not.

## Screenshots

> Click on the thumbnails to see the full res screenshot

> Note that all blue labels in the headers (text widgets) are links that will take you to the respective resource in the console for quick access.

### Lambda in "compact" mode

- Number of Lambda functions per widget is controlled through `CompactMaxResourcesPerWidget` parameter in `lib/config.json`

  [![Click to open screenshot](screenshots/LambdaCompact-thumb.png)](screenshots/LambdaCompact.png)

### EC2 Instance

- Individual EBS volumes are presented with additional volume information (type and IOPS)
- PIO volumes are presented with additional metrics

  [![Click to open screenshot](screenshots/EC2-instance-thumb.png)](screenshots/EC2-instance.png)

### Burstable EC2 Instance with CloudWatch agent configured

- Burstable instances are presented with additional burstmode information
- Additional metrics to keep track of CPU-credits usage are shown
- If CloudWatch agent is configured then the widgets are shown automatically

  [![Click to open screenshot](screenshots/EC2-burstable-instance-thumb.png)](screenshots/EC2-burstable-instance.png)

### Network dashboard - TGW view

- Metrics are shown on TGW and on attachment level
- Type of attachment is shown

  [![Click to open screenshot](screenshots/Network-TGW-thumb.png)](screenshots/Network-TGW.png)

### ECS with EC2 service

- Cluster level and service level metrics are shown separately
- If service is EC2-type then high level metrics for EC2 instances are shown

  [![Click to open screenshot](screenshots/ECS-EC2-service-thumb.png)](screenshots/ECS-EC2-service.png)

### Developing

[Developing](DEVELOPING.md)
