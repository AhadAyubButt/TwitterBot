from flask_cors import CORS
from flask import Flask, jsonify, request
import awsgi
import boto3
from uuid import uuid4
from boto3.dynamodb.conditions import BeginsWith, Key
import urllib.parse
import tweepy
import requests
import json

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table('TwiterBotTable-dev')
# Constant variable with path prefix
BASE_ROUTE = "/items"

app = Flask(__name__)
CORS(app)

enableCurr = []
allCurr = []

def currencySort(obj):
    return obj['CurrencyData']['Change']

@app.route(BASE_ROUTE + '/listallcurrency', methods=['GET'])
def list_allcurrency():
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

    item['Items'].sort(key=currencySort)

    return jsonify(item)

@app.route(BASE_ROUTE + '/listcheckcurrency', methods=['GET'])
def list_checkcurrency():
    item = table.query(
        IndexName='GSI1',
        KeyConditionExpression='#Sk = :value',

        ExpressionAttributeValues={
            ':value': 'checkCurrency'
        },
        ExpressionAttributeNames={
            '#Sk': 'Sk'
        }
    )

    item['Items'].sort(key=currencySort)
    
    return jsonify(item)

@app.route(BASE_ROUTE + '/listflag', methods=['GET'])
def listflag():
    item = table.query(
        KeyConditionExpression='#Pk = :value',
        ExpressionAttributeValues={
            ':value': '__Flag'
        },
        ExpressionAttributeNames={
            '#Pk': 'Pk'
        }
    )
    return jsonify(item)

@app.route(BASE_ROUTE + '/updateflag', methods=['PUT'])
def updateflag():
    request_json = request.get_json()
    table.update_item(
        Key={'Pk': "__Flag",
             'Sk': 'currency'},
        UpdateExpression='SET #FlagData = :FlagData',
        ExpressionAttributeNames={
            '#FlagData': 'FlagData'
        },
        ExpressionAttributeValues={
            ":FlagData": request_json['FlagData']
        }
    )
    return jsonify(message="item updated")

@app.route(BASE_ROUTE + '/updateallcurrency', methods=['POST'])
def update_allcurrency():
    request_json = request.get_json()
    table.update_item(

        Key={'Pk': request_json['Pk'],
             'Sk': 'allCurrency'},
        UpdateExpression='SET #CurrencyData = :CurrencyData',
        ExpressionAttributeNames={
            '#CurrencyData': 'CurrencyData'

        },
        ExpressionAttributeValues={
            ":CurrencyData": request_json['CurrencyData']
        }
    )
    return jsonify(message="item updated")

@app.route(BASE_ROUTE + '/updatecheckcurrency' + '/<Pk>', methods=['PUT'])
def update_checkcurrency(Pk):
    request_json = request.get_json()
    Pk = urllib.parse.unquote(Pk)
    table.update_item(

        Key={'Pk': Pk,
             'Sk': 'checkCurrency'},
        UpdateExpression='SET #CurrencyData = :CurrencyData',
        ExpressionAttributeNames={
            '#CurrencyData': 'CurrencyData'

        },
        ExpressionAttributeValues={
            ":CurrencyData": request_json['CurrencyData']
        }
    )
    return jsonify(message="item updated")

@app.route(BASE_ROUTE + '/setpercent', methods=['POST'])
def set_percent():
    request_json = request.get_json()
    table.put_item(Item={
        "Pk": 'Constant',
        "Sk": 'Value',
        "PosValue": str(request_json['PosValue']),
        "NegValue": str(request_json['NegValue']),
    })
    return jsonify(message="Created")

@app.route(BASE_ROUTE + '/getpercent', methods=['GET'])
def get_percent():
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
    return jsonify(item)

@app.route(BASE_ROUTE + '/updateallcurrencyflag', methods=['PUT'])
def update_allcurrencyflag():
    request_json = request.get_json()
    table.update_item(

        Key={'Pk': request_json['Pk'],
             'Sk': 'allCurrency'},
        UpdateExpression='SET #CurrencyData = :CurrencyData, #Flag = :Flag',
        ExpressionAttributeNames={
            '#CurrencyData': 'CurrencyData',
            '#Flag': 'Flag'

        },
        ExpressionAttributeValues={
            ":CurrencyData": request_json['CurrencyData'],
            ":Flag": request_json['Flag']
        }
    )
    return jsonify(message="item updated")

@app.route(BASE_ROUTE + '/updatenewsflag', methods=['PUT'])
def update_newsflag():
    request_json = request.get_json()
    table.update_item(

        Key={'Pk': request_json['Pk'],
             'Sk': 'news'},
        UpdateExpression='SET #NewsData = :NewsData, #Flag = :Flag',
        ExpressionAttributeNames={
            '#NewsData': 'NewsData',
            '#Flag': 'Flag'

        },
        ExpressionAttributeValues={
            ":NewsData": request_json['NewsData'],
            ":Flag": request_json['Flag']
        }
    )
    return jsonify(message="item updated")

@app.route(BASE_ROUTE + '/getpostschedule', methods=['GET'])
def get_postschedule():
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
    return jsonify(item)

@app.route(BASE_ROUTE + '/setpostschedule', methods=['POST'])
def set_postschedule():
    request_json = request.get_json()
    table.put_item(Item={
        "Pk": 'Constant',
        "Sk": 'Schedule',
        "Post": request_json['Value'],
    })
    return jsonify(message="Created")

@app.route(BASE_ROUTE + '/twitterpostall', methods=['POST'])
def twitter_postall():
    new_str = ''
    request_json = request.get_json()
    status = request_json['twitterStatus']

    client = tweepy.Client (consumer_key='BcvbHGrtNXYUkEzp7WCLLjHwa',
                            consumer_secret='OHx8XeXYDAS3kZZVSwQxBPVScsGn7lGO2RoeQHyw5mHXlmszVb',
                            access_token='256261185-RMOARF4SCnQljJMOge6we6Zn0fqHlgal00R5qGAz',
                            access_token_secret ='Naqn8bQ5kcHt6MQjQa2sQHz3yb5M23U0HoUyDMphgECA5')

    tweet = status
    response= client.create_tweet(text= tweet)

    return jsonify(response)

@app.route(BASE_ROUTE + '/listenableflag', methods=['GET'])
def list_enableflag():
    item = table.query(
        KeyConditionExpression='#Pk = :value',
        ExpressionAttributeValues={
            ':value': '__enableFlag'
        },
        ExpressionAttributeNames={
            '#Pk': 'Pk'
        }
    )
    return jsonify(item)

@app.route(BASE_ROUTE + '/updateenableflag', methods=['PUT'])
def update_enableflag():
    request_json = request.get_json()
    table.update_item(
        Key={'Pk': "__enableFlag",
             'Sk': 'currency'},
        UpdateExpression='SET #FlagData = :FlagData',
        ExpressionAttributeNames={
            '#FlagData': 'FlagData'
        },
        ExpressionAttributeValues={
            ":FlagData": request_json['FlagData']
        }
    )
    return jsonify(message="item updated")

@app.route(BASE_ROUTE + '/getCurrency', methods=['GET'])
def get_currency():
    url ='https://www.mtfxgroup.com/Umbraco/Api/LiveRates/GetMTFXLiveExchangeRates?currencies=USD,EUR,GBP,JPY,CHF,NZD,INR,MXN,AUD,CAD,CNY,CZK,DKK,HKD,HRK,HUF,ILS,PLN,SEK,ZAR&source=CAD'

    r = requests.get(url)
    new = r.content.decode()
    new = json.loads(new)
    return jsonify(new)

def handler(event, context):
    return awsgi.response(app, event, context)