import json

import requests

headers = {'Content-Type': 'application/json'}

datas = []

# Продаж
url = 'http://127.0.0.1:5000/api/real'
data = {'rro_id': 4000371338, 'key_id': 180,
        'reals': [{'NAME': 'Улыбка', 'UNITNM': 'шт', 'AMOUNT': 2, 'PRICE': 100, 'COST': 200}],
        'pays': [{'PAYFORMCD': 0, 'PAYFORMNM': 'Готівка', 'SUM': 200}], 'taxes': [], 'testing': True}
datas.append([url, data])

url = 'http://127.0.0.1:5000/api/podkrep'
data = {
  "rro_id": 4000371338,
  "sum": 1000
}
datas.append([url, data])

url = 'http://127.0.0.1:5000/api/inkass'
data = {
  "rro_id": 4000371338,
  "sum": 1000
}
datas.append([url, data])

count = 3

for x in range(1, count+1):

    for data in datas:

        response = requests.post(data[0], json=data[1], headers=headers)

        if response.status_code == 200:
            json_data = json.loads(response.content)
            # print(json_data)
            if json_data['error_code'] != 0:
                print('\033[91mTEST {} {} FAILED'.format(x, data[0]))
            else:
                print('\033[92mTEST {} {} SUCCESS'.format(x, data[0]))
        else:
            print('\033[91mTEST {} {} FAILED. status_code='.format(x, data[0], response.status_code))

