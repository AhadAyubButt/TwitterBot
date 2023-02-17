from uuid import uuid4
import requests
import ast # convert string of list in actual list
import json
import boto3
from flask import Flask, jsonify, request
import datetime

def handler(event, context):
    date = datetime.datetime.now()
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('TwiterBotTable-dev')
    
    arr = []
    flagArr = []

    item = table.query(
        IndexName='GSI1',
        KeyConditionExpression='#Sk = :value',

        ExpressionAttributeValues={
            ':value': 'allCurrency'
        },
        ExpressionAttributeNames={
            '#Sk': 'Sk'
        }
    )

    for cur in item['Items']:
        table.delete_item(
            Key={
                'Pk': cur['Pk'],
                'Sk': cur['Sk']
            }
        )

    item2 = table.query(
        KeyConditionExpression='#Pk = :value',
        ExpressionAttributeValues={
            ':value': '__enableFlag'
        },
        ExpressionAttributeNames={
            '#Pk': 'Pk'
        }
    )

    print('item2', item2)
    
    for flag in item2['Items'][0]['FlagData']:
        if flag['Value'] == True:
            flagArr.append(flag['Currency'])
    print('flagArr', flagArr)
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
    
    for data in arr:
        if data['Currency'] in flagArr:
            flag = True
        else:
            flag = False

        table.put_item(Item={
            "Pk": str(uuid4()),
            "Sk": 'allCurrency',
            "CurrencyData": data,
            "CreateDate": str(date),
            "Is_Posted": False,
            "Flag": flag
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
    
