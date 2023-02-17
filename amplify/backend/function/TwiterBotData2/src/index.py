import json
import boto3
import requests
import ast
import datetime
from uuid import uuid4
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TwiterBotTable-dev')

date  = datetime.datetime.now()
def handler(event, context):
    chitem = table.query(
        IndexName='GSI1',
        KeyConditionExpression='#Sk = :value',

        ExpressionAttributeValues={
            ':value': 'checkCurrency'
        },
        ExpressionAttributeNames={
            '#Sk': 'Sk'
        }
    )

    for cur in chitem['Items']:
        table.delete_item(
            Key={
                'Pk': cur['Pk'],
                'Sk': cur['Sk']
            }
        )

    item = table.query(
        IndexName='GSI1',
        KeyConditionExpression='#Sk = :value',

        ExpressionAttributeValues={
            ':value': 'Value'
        },
        ExpressionAttributeNames={
            '#Sk': 'Sk'
        }
    )

    pospercent = item['Items'][0]['PosValue']
    negpercent = item['Items'][0]['NegValue']

    arr = []
    new_arr = []
    store_countries = ['USD','EUR','GBP','JPY','CHF','NZD','INR','MXN', 'AUD', 'CAD', 'CNY', 'CZK', 'DKK', 'HKD', 'HRK', 'HUF', 'ILS', 'PLN', 'SEK', 'ZAR']
    for x in range(len(store_countries)):
        r = requests.get('https://www.mtfxgroup.com/Umbraco/Api/LiveRates/GetMTFXLiveExchangeRates?currencies=CAD&source=' + store_countries[x])
        s = r.content.decode()
        s = ast.literal_eval(s)
        res = s.strip('][').split(', ')
        get_stats = res[0]

        json_stats = json.loads(get_stats)
        json_stats['Currency'] = store_countries[x]

        jsonObj = {
            "Currency": store_countries[x],
            "Rate": str(json_stats['Amount']),
            "Change": str(json_stats['ChangePercent']),
        }
        arr.append(jsonObj)

    print(arr)

    for item in arr:
        if item['Change'] >= pospercent or item['Change'] >= negpercent:
            new_arr.append(item)

    print(new_arr)
    if len(new_arr) > 0:
        for data in new_arr:
            table.put_item(Item={
                "Pk": str(uuid4()),
                "Sk": 'checkCurrency',
                "CurrencyData": data,
                "CreateDate": str(date),
                "Is_Posted": False,
                "Flag": True
            })
    response = {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET, POST"
            },
            'body': json.dumps({"status": "Created"})
            }
    return response
    
