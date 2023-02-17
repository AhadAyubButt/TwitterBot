import tweepy
import requests
import ast # convert string of list in actual list
import json
import boto3
from flask import Flask, jsonify, request

def handler(event, context):
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table('TwiterBotTable-dev')

    client = tweepy.Client (
        consumer_key='BcvbHGrtNXYUkEzp7WCLLjHwa',
        consumer_secret='OHx8XeXYDAS3kZZVSwQxBPVScsGn7lGO2RoeQHyw5mHXlmszVb',
        access_token='256261185-RMOARF4SCnQljJMOge6we6Zn0fqHlgal00R5qGAz',
        access_token_secret ='Naqn8bQ5kcHt6MQjQa2sQHz3yb5M23U0HoUyDMphgECA5'
        )

    arr = []
    newArr = []
    enablearrCur = []
    flagArr = []
    newString = ''

    item = table.query(
        IndexName='GSI1',
        KeyConditionExpression='#Sk = :value',

        ExpressionAttributeValues={
            ':value': 'Schedule'
        },
        ExpressionAttributeNames={
            '#Sk': 'Sk'
        }
    )

    if item['Items'][0]['Flag'] == True:
        flagitem = table.query(
            KeyConditionExpression='#Pk = :value',

            ExpressionAttributeValues={
                ':value': '__enableFlag'
            },
            ExpressionAttributeNames={
                '#Pk': 'Pk'
            }
        )

        for fla in flagitem['Items']:
            if fla['Value'] == True:
                flagArr.append(fla['Currency'])


        enaitem = table.query(
            KeyConditionExpression='#Pk = :value',

            ExpressionAttributeValues={
                ':value': '__enableFlag'
            },
            ExpressionAttributeNames={
                '#Pk': 'Pk'
            }
        )

        for abc in enaitem['Items']:
            if abc['Value'] == True:
                enablearrCur.append(abc['Currency'])

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
        for new in arr:
            if new['Currency'] in enablearrCur:
                if new['Currency'] in flagArr:
                    new['Rate'] = str(1/int(new['Rate']))
                    new['Change'] = str(-1 * new['Change'])
                    newArr.append(new)
                else:
                    newArr.append(new)
                    
        if len(newArr) < 6:
            for xyz in newArr:
                if xyz['Change'] > '0':
                    newString += 'Currency: ' + xyz['Currency'] + ', Rate: ' + xyz['Rate'] + ', Change: ' + xyz['Change'] + '%' + str('🔺') + '\n'
                else: 
                    newString += 'Currency: ' + xyz['Currency'] + ', Rate: ' + xyz['Rate'] + ', Change: ' + xyz['Change'] + '%' + str('🔻') + '\n'
            
            response= client.create_tweet(text= newString)
            return jsonify(response)

        else:
            return jsonify(message="Length exceed")

    else:
        return jsonify(message="Bot is Paused")