export type AmplifyDependentResourcesAttributes = {
    "function": {
        "TwiterBotCRUD": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "TwiterBotData": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string",
            "CloudWatchEventRule": "string"
        },
        "TwiterBotData2": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string",
            "CloudWatchEventRule": "string"
        },
        "TwiterBotPost": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "TwiterBotCRUD": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "TwiterBotData": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "TwiterBotData2": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "TwiterBotPost": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    },
    "auth": {
        "twitterbot": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "storage": {
        "TwiterBotTable": {
            "Name": "string",
            "Arn": "string",
            "StreamArn": "string",
            "PartitionKeyName": "string",
            "PartitionKeyType": "string",
            "SortKeyName": "string",
            "SortKeyType": "string",
            "Region": "string"
        }
    },
    "hosting": {
        "S3AndCloudFront": {
            "Region": "string",
            "HostingBucketName": "string",
            "WebsiteURL": "string",
            "S3BucketSecureURL": "string",
            "CloudFrontDistributionID": "string",
            "CloudFrontDomainName": "string",
            "CloudFrontSecureURL": "string",
            "CloudFrontOriginAccessIdentity": "string"
        }
    }
}