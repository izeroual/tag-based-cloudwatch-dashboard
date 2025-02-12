import {Construct} from "constructs";
import {WidgetSet} from "./widgetset";
import {GraphWidget, Metric, Row, Statistic, TextWidget} from "aws-cdk-lib/aws-cloudwatch";
import {Duration} from "aws-cdk-lib";

export class TgwWidgetSet extends Construct implements WidgetSet{
    namespace:string = "AWS/TransitGateway";
    widgetSet:any = [];
    alarmSet:any = [];


    constructor(scope: Construct, id: string, resource:any) {
        super(scope, id);
        const tgwId = resource.ResourceARN.split('/')[resource.ResourceARN.split('/').length - 1];
        const region = resource.ResourceARN.split(':')[3];
        let markDown = `### TGW [${tgwId}](https://${region}.console.aws.amazon.com/vpc/home?region=${region}#TransitGatewayDetails:transitGatewayId=${tgwId}) Attachments:${resource.attachments.length} Peers:${this.countPeers(resource)}`
        this.widgetSet.push(new TextWidget({
            markdown: markDown,
            width: 24,
            height: 1
        }));

        const bytesOutMetric = new Metric({
            namespace: this.namespace,
            metricName: 'BytesOut',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SUM,
            period: Duration.minutes(1)
        });

        const bytesInMatric = new Metric({
            namespace: this.namespace,
            metricName: 'BytesIn',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SUM,
            period: Duration.minutes(1)
        });

        const packetsOutMetric = new Metric({
            namespace: this.namespace,
            metricName: 'PacketsOut',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SUM,
            period: Duration.minutes(1)
        });

        const packetsInMetric = new Metric({
            namespace: this.namespace,
            metricName: 'PacketsIn',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SUM,
            period: Duration.minutes(1)
        });

        const bytesDropCountBlackhole = new Metric({
            namespace: this.namespace,
            metricName: 'BytesDropCountBlackhole',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SAMPLE_COUNT,
            period: Duration.minutes(1)
        });

        const packetsDropCountBlackhole = new Metric({
            namespace: this.namespace,
            metricName: 'PacketsDropCountBlackhole',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SAMPLE_COUNT,
            period: Duration.minutes(1)
        });

        const bytesDropCountNoRoute = new Metric({
            namespace: this.namespace,
            metricName: 'BytesDropCountNoRoute',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SAMPLE_COUNT,
            period: Duration.minutes(1)
        });

        const packetsDropCountNoRoute = new Metric({
            namespace: this.namespace,
            metricName: 'PacketsDropCountNoRoute',
            dimensionsMap: {
                TransitGateway: tgwId
            },
            statistic: Statistic.SAMPLE_COUNT,
            period: Duration.minutes(1)
        });

        const bytesWidget = new GraphWidget({
            title: 'Bytes In/Out',
            left:[bytesInMatric],
            right:[bytesOutMetric],
            period: Duration.minutes(1),
            region: region,
            width: 8
        });

        const packetsWidget = new GraphWidget({
            title: 'Packets In/Out',
            left:[packetsInMetric],
            right:[packetsOutMetric],
            period: Duration.minutes(1),
            region: region,
            width: 8
        });

        const droppedWidget = new GraphWidget({
            title: 'Dropped packets/bytes',
            left:[packetsDropCountNoRoute,packetsDropCountBlackhole],
            right:[bytesDropCountNoRoute,bytesDropCountBlackhole],
            period: Duration.minutes(1),
            region: region,
            width: 8
        });

        this.widgetSet.push(new Row(bytesWidget,packetsWidget,droppedWidget));

        for ( let attachment of resource.attachments ){
            const attachmentId = attachment.TransitGatewayAttachmentId
            let vpcMarkup = '';
            if ( attachment.ResourceType === 'vpc'){
                vpcMarkup = ` - [${attachment.ResourceId}](https://${region}.console.aws.amazon.com/vpc/home?region=${region}#VpcDetails:VpcId=${attachment.ResourceId})`
            }
            let markDown = `**Attachment [${attachmentId}](https://${region}.console.aws.amazon.com/vpc/home?region=${region}#TransitGatewayAttachmentDetails:transitGatewayAttachmentId=${attachmentId}) Type:${attachment.ResourceType}${vpcMarkup}**`
            this.widgetSet.push(new TextWidget({
                markdown: markDown,
                width: 24,
                height: 1
            }));
            const attBytesOutMetric = new Metric({
                namespace: this.namespace,
                metricName: 'BytesOut',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SUM,
                period: Duration.minutes(1)
            });

            const attBytesInMetric = new Metric({
                namespace: this.namespace,
                metricName: 'BytesIn',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SUM,
                period: Duration.minutes(1)
            });

            const attPacketsOutMetric = new Metric({
                namespace: this.namespace,
                metricName: 'PacketsOut',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SUM,
                period: Duration.minutes(1)
            });

            const attPacketsInMetric = new Metric({
                namespace: this.namespace,
                metricName: 'PacketsIn',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SUM,
                period: Duration.minutes(1)
            });

            const attBytesDropCountBlackhole = new Metric({
                namespace: this.namespace,
                metricName: 'BytesDropCountBlackhole',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SAMPLE_COUNT,
                period: Duration.minutes(1)
            });

            const attPacketsDropCountBlackhole = new Metric({
                namespace: this.namespace,
                metricName: 'PacketsDropCountBlackhole',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SAMPLE_COUNT,
                period: Duration.minutes(1)
            });

            const attBytesDropCountNoRoute = new Metric({
                namespace: this.namespace,
                metricName: 'BytesDropCountNoRoute',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SAMPLE_COUNT,
                period: Duration.minutes(1)
            });

            const attPacketsDropCountNoRoute = new Metric({
                namespace: this.namespace,
                metricName: 'PacketsDropCountNoRoute',
                dimensionsMap: {
                    TransitGateway: tgwId,
                    TransitGatewayAttachment: attachmentId
                },
                statistic: Statistic.SAMPLE_COUNT,
                period: Duration.minutes(1)
            });

            const attBytesWidget = new GraphWidget({
                title: 'Bytes In/Out',
                left:[attBytesInMetric],
                right:[attBytesOutMetric],
                period: Duration.minutes(1),
                region: region,
                width: 8
            });

            const attPacketsWidget = new GraphWidget({
                title: 'Packets In/Out',
                left:[attPacketsInMetric],
                right:[attPacketsOutMetric],
                period: Duration.minutes(1),
                region: region,
                width: 8
            });

            const attDroppedWidget = new GraphWidget({
                title: 'Dropped packets/bytes',
                left:[attPacketsDropCountNoRoute,attPacketsDropCountBlackhole],
                right:[attBytesDropCountNoRoute,attBytesDropCountBlackhole],
                period: Duration.minutes(1),
                region: region,
                width: 8
            });

            this.widgetSet.push(new Row(attBytesWidget,attPacketsWidget,attDroppedWidget));
        }

    }

    countPeers(resource:any){
        let peerCount = 0;
        for (let attachment of resource.attachments ){
            if ( attachment.ResourceType === "peering" ){
                peerCount++;
            }
        }
        return peerCount;
    }

    getWidgetSets(): [] {
        return this.widgetSet;
    }

    getAlarmSet(): [] {
        return this.alarmSet;
    }
}