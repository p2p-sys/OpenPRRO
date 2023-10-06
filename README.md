# **Фіскальний сервер**

_версія 1.7.20231006_

## Загальні положення

**Програмний реєстратор розрахункових операцій фіскальний сервер, забезпечує:**

* Одержання документів (чеків, Z-звіти і складу одержаних документів);
* Призначення документам фіскальних номерів взаємодіючи з сервером ДПС;
* Надсилання відправнику документа відповіді, що містить результат обробки документа і призначений документу фіскальний номер;
* Зберігання документів для подальшого використання в інформаційно-аналітичних системах;
* Обробку запитів щодо надання документів (чеків покупцям, даних розрахункових операцій для формування ПРРО, Z-звітів тощо).
* Збереження сертифікатів електронних підписів та/або печаток, що використовуються ПРРО;
* Збереження даних про зареєстровані ПРРО та господарські одиниці, на яких ПРРО застосовується (реєстр ПРРО).

**Реєстрація документів (чеків, Z-звітів, повідомлень тощо) здійснюється:**
* в режимі оперативного («онлайн») надсилання документів на Фіскальний Сервер;
* в режимі відкладеного («офлайн») надсилання документів на Фіскальний Сервер.

_Документи в системі засвідчуються кваліфікованим електронним підписом (КЕП) фізичної особи або електронною печаткою суб’єкта господарювання, на якого зареєстровано ПРРО. Час засвідчення документа фіксується накладанням на КЕП позначки часу (за виключенням документів, створених в режимі офлайн).
Джерелом позначки часу може виступати від будь-який кваліфікований надавач електронних довірчих послуг._

**У програмному комплексі взаємодію по API використовується для управління наступним функціоналом:**
* Робота з ключами (додати або видалити ключ, який використовується для підписання документів;
* Реєстрація торгової точки, форма J1312004 Повідомлення про об’єкти оподаткування або об’єкти, пов’язані з оподаткуванням або через які провадиться діяльність (20-ОПП);
* Реєстрація касового апарату, форма J1316604 Заява про реєстрацію програмного реєстратора розрахункових операцій (1-ПРРО) ;
* Реєстрація касира, форма J1391802 Повідомлення про надання інформації щодо кваліфікованого сертифіката відкритого ключа (5-ПРРО);
* Відкриття зміни;
* Закриття зміни (Z-баланс);
* Відправити чек;
* Відмінити чек;

## Поняття і визначення

**ПРРО** – Програмний реєстратор розрахункових операцій. Система виписки електронних касових чеків.

**Сервер ДПС** – Фіскальний Сервер реєстрації розрахункових операцій ДПС.

**Локальний номер документа** – Номер, призначений документу (чеку, Z-звіту) системою виписки електронних касових чеків, що використовується продавцем.

**Фіскальний номер документа** – Номер, призначений документу (чеку, Z-звіту) Фіскальним Сервером.

**Офлайн сесія** – Сукупність документів, створених в режимі офлайн, між припиненням і відновленням зв’язку ПРРО з Фіскальним Сервером.

**Локальний номер реєстратора** – Номер, призначений ПРРО організацією продавця і зареєстрований формою 1-ПРРО «Заява про реєстрацію програмного реєстратора розрахункових операцій».

**Фіскальний номер реєстратора** – Номер, призначений ПРРО Фіскальним Сервером в процесі реєстрації форми 1-ПРРО.

**Порядок локальної нумерації документів**

Локальна нумерація документів ведеться окремо кожним ПРРО. Нумерація здійснюється в межах:
* юридичної/фізичної особи продавця;
* господарської одиниці;
* фіскального номера ПРРО.

_Локальна нумерація документів ведеться наскрізь, незалежно від класу документа (чек, Z-звіт)._

**Порядок фіскальної нумерації онлайн документів**
* Фіскальна нумерація документів ведеться Сервером ДПС. 
* Фіскальна нумерація документів ведеться наскрізь, незалежно від джерела і класу документа.

**Загальний порядок взаємодії з ПРРО**
1. Відкриття зміни;
2. Реєстрація фіскальних касових чеків;
3. Реєстрація Z-звіту і закриття зміни.

**Відкриття зміни**
1. ПРРО отримує через API  та створює XML документ повідомлення із призначеним локальним номером і типом «Відкриття зміни», засвідчує його кваліфікованим електронним підписом продавця і надсилає на Сервер ДПС. Відкриття кожної наступної зміни відбувається за умови закриття попередньої зміни (формування Z-звіту).
2. Сервер здійснює необхідні перевірки.
3. У разі помилки, сервер надсилає ДПС у відповідь код помилки.
4. У разі успішної обробки, Сервер реєструє документ шляхом присвоєння йому номера, який є номером зміни, зберігає документ в БД і надсилає у відповідь квитанції щодо успішної реєстрації документа.
5. Сервер встановлює для ПРРО стан «зміну відкрито».

**Реєстрація Z-звіту і закриття зміни**
1. фіскальний сервер отримує через API команду закриття зміни. 
2. фіскальний сервер самостійно створює XML документ Z-звіту із призначеним локальним номером, засвідчує його КЕП продавця і надсилає на Сервер ДПС.
3. Сервер ДПС здійснює необхідні перевірки.
4. У разі помилки, Сервер ДПС надсилає у відповідь код помилки.
5. У разі успішної обробки, фіскальний сервер зберігає документ в БД, і надсилає у відповідь квитанції щодо успішної реєстрації документа.
6. фіскальний сервер надсилає на Сервер ДПС повідомлення (технічний документ) із типом «Закриття зміни», на підставі якого відбувається закриття зміни.
7. Сервер встановлює для ПРРО стан «зміну закрито».

**Зауваження щодо реалізації**
1. Кодування текстових полів документів json: utf-8.
2. Тип HTTP-запиту – POST, GET згідно з методом API.
3. Заголовок Content-Type”: “application/json; charset=UTF-8”.
4. Вхідне повідомлення може містити серйозні помилки, що не дозволяють його подальшу обробку. У випадку грубого порушення вимог до формату вхідного повідомлення, у відповідь надсилається код статусу обробки HTTP 4xx “Client Error”. У тілі відповіді надається інформація щодо причини помилки. 
5. Команди надсилаються у форматі JSON. Див. розділ «Команди».

**Адреса серверу**
http://127.0.0.1:5000/api/<command>
_наприклад_ http://127.0.0.1:5000/api/add_key


## **API команди:**

### **Список доданих ключів**

**Метод**: GET 

**URI**: /api/keys

**Формат JSON відповіді:**

`{
    "error_code": <integer>,
    "keys": [
        {
            "begin_time": <>,
            "ceo_fio": <>,
            "ceo_tin": <>,
            "create_date": <>,
            "edrpou": <>,
            "encrypt": <>,
            "end_time": <>,
            "key_content": <>,
            "key_id": <>,
            "key_role": <>,
            "name": <>,
            "public_key": <>,
            "sign": <>
        },
    "status": "success"
}`

**Приклад:**

`{
    "error_code": 0,
    "keys": [
        {
            "begin_time": "2020-10-01T00:00:00",
            "ceo_fio": "Тестовий платник 3 (Тестовий сертифікат)",
            "ceo_tin": "",
            "create_date": "2021-09-22T17:46:51",
            "edrpou": "34554362",
            "encrypt": true,
            "end_time": "2022-09-30T23:59:59",
            "key_content": [...],
            "key_id": 33,
            "key_role": "stamp",
            "name": "Тестовий платник 3 (Тестовий сертифікат)",
            "public_key": "a7037cdba891ebac46ba3f05cc4b4ba68ce86be9252ea1ab2cf5d626b274c11b",
            "sign": true
        },
        {
            "begin_time": "2020-10-01T00:00:00",
            "ceo_fio": "Тестовий платник 3 (Тестовий сертифікат)",
            "ceo_tin": "",
            "create_date": "2021-10-11T09:32:25",
            "edrpou": "34554362",
            "encrypt": true,
            "end_time": "2022-09-30T23:59:59",
            "key_content":  [...],
            "key_id": 34,
            "key_role": "stamp",
            "name": "Тестовий платник 3 (Тестовий сертифікат)",
            "public_key": "a7037cdba891ebac46ba3f05cc4b4ba68ce86be9252ea1ab2cf5d626b274c11b",
            "sign": true
        },
        }
    ],
    "status": "success"
}`

### **Дані по одному раніше доданому ключу**

**Метод:** GET 

**URI:** /api/key

**Формат JSON запиту:**

`{
    "key_id": <>, # Ідентифікатор ключа
}`

**Приклад:**

`{
    "key_id": 74
}`

**Формат JSON відповіді:**

`{
    "error_code": <integer>,
    "key":
        {
            "begin_time": <>,
            "ceo_fio": <>,
            "ceo_tin": <>,
            "create_date": <>,
            "edrpou": <>,
            "encrypt": <>,
            "end_time": <>,
            "key_content": <>,
            "key_id": <>,
            "key_role": <>,
            "name": <>,
            "public_key": <>,
            "sign": <>
        }
    "status": "success"
}`

**Приклад:**

`{
    "error_code": 0,
    "key":
        {
            "begin_time": "2020-10-01T00:00:00",
            "ceo_fio": "Тестовий платник 3 (Тестовий сертифікат)",
            "ceo_tin": "",
            "create_date": "2021-09-22T17:46:51",
            "edrpou": "34554362",
            "encrypt": true,
            "end_time": "2022-09-30T23:59:59",
            "key_content": [...],
            "key_id": 33,
            "key_role": "stamp",
            "name": "Тестовий платник 3 (Тестовий сертифікат)",
            "public_key": "a7037cdba891ebac46ba3f05cc4b4ba68ce86be9252ea1ab2cf5d626b274c11b",
            "sign": true
        }
    "status": "success"
}`

###  **Список доданих підрозділів (РРО) /застаріла команда/**

**Метод:** GET 

**URI:** /api/rro

**Формат JSON відповіді:**

`{
    "error_code": <integer>,
    "rro": [
        {
            "department_id": <>,
            "key_tax_registered": <>,
            "name": <>,
            "prro_key_id": <>,
            "rro_id": <>,
            "signer_type": <>,
            "taxform_key_id": <>
        },
    ],
    "status": "success"
}`

**Приклад:**

`{
    "error_code": 0,
    "rro": [
        {
            "department_id": 1,
            "key_tax_registered": true,
            "name": "Тест",
            "prro_key_id": 54,
            "rro_id": "4000046372",
            "signer_type": "Старший касир",
            "taxform_key_id": 61
        },
    ],
    "status": "success"
}`

### **Список раніше доданих об'єктів (підрозділів/РРО)**

**Метод:** GET 

**URI:** /api/departments

**Формат JSON відповіді:**

`{
    "error_code": <integer>,
    "departments": [
        {
            "department_id": <>,
            "key_tax_registered": <>,
            "name": <>,
            "prro_key_id": <>,
            "rro_id": <>,
            "signer_type": <>,
            "taxform_key_id": <>
        },
    ],
    "status": "success"
}`

**Приклад:**

`{
    "error_code": 0,
    "departments": [
        {
            "department_id": 1,
            "key_tax_registered": true,
            "name": "Тест",
            "prro_key_id": 54,
            "rro_id": "4000046372",
            "signer_type": "Старший касир",
            "taxform_key_id": 61
        },
    ],
    "status": "success"
}`

### **Дані одного раніше доданого об'єкта (підрозділу/РРО)**

**Метод:** GET 

**URI:** /api/department

**Формат JSON запиту:**

`{
    "department_id": <>, # Ідентифікатор
}`

**Приклад:**

`{
    "department_id": 74
}`

**Формат JSON відповіді:**

`{
    "error_code": <integer>,
    "department":
        {
            "department_id": <>,
            "key_tax_registered": <>,
            "name": <>,
            "prro_key_id": <>,
            "rro_id": <>,
            "signer_type": <>,
            "taxform_key_id": <>
        },
    "status": "success"
}`

**Приклад:**

`{
    "error_code": 0,
    "department":
        {
            "department_id": 1,
            "key_tax_registered": true,
            "name": "Тест",
            "prro_key_id": 54,
            "rro_id": "4000046372",
            "signer_type": "Старший касир",
            "taxform_key_id": 61
        },
    "status": "success"
}`

### **Додавання ключа для підпису**

**Метод:** POST 

**URI:** /api/add_key

**Формат JSON запиту:**

`{
     “key”: <base64 key6-dat>, - обов'язково у випадку додавання ключа в один етап, якщо ключ додається в два етапи, на другому етапі необов’язково ***
     “cert1”: <base64 sign file>, необов'язково, якщо не встановлено, визначається автоматично *
     “cert2”: <base64 wrap file>, необов'язково, якщо не встановлено, визначається автоматично *
     “password”: <string>, обов'язково,
     “key_role”: <string>, необов'язково, якщо не встановлено, визначається автоматично ** 
     "allow_duplicates": <boolean true/false>, необов'язково, якщо не встановлено, визначається false, дублікати ключів не будуть допускатися, при додаванні ключа з існуючим public_key повернуться дані раніше доданого ключа. Якщо встановити true, ключі будуть додані ще раз
     “key_id”: <integer>, необов’язково ***
}`
* “cert1” та “cert2” необов'язкові для ключів Приватбанку

 ** “key_role”: 
            stamp: Печатка
            personal, Особистий
            director, Директор,
            fop: ФОП
            other: Інше
*** для додавання ключа в два етапи, на першому етапі вказується “key”, на другому - “key_id”

Приклад:
{
    "key": "/u3+7QAAAAIAAAABAA==",
    "password": "123456789",
    "key_role": "fop"
}

Формат JSON відповіді:
{
    "error_code": <integer>,
    "key_content": <json array>,
    "key_id": <integer>,
    "key_role": <string>,
    "message": <string>,
    "public_key": <string>,
    "status": <string success/error>,
    "update_key_data_text": <string>
}

Приклад:
{
    "error_code": 0,
    "key_content":  [...],
    "key_id": 12,
    "key_role": "personal",
    "message": "Дані успішно зчитані з ключа та оновлені!",
    "public_key": "3be273fb3f7ac79f0cdd3c2ebac7518bf64148",
    "status": "success",
    "update_key_data_text": "Дані успішно зчитані з ключа та оновлені!"
}

Можна розділити додавання ключа в два етапи, додавання файлів та відправлення пароля. У цьому випадку потрібно по черзі надіслати дві команди на додавання, файли та пароль, наприклад:

Запит 1:
POST http://<address>/api/add_key
Content-Type: application/json

{
  "key": "g82nMVaNIenKHGNUTzlT95zOAgInEA==",
  "cert1": "MItA9T0J1IDqWduNKKZUUyIQGD6H9lM=",
  "cert2": "MIIHkMhI="
}

Відповідь:

{
    "error_code": 0,
    "key_id": 13,
    "message": "Дані створені для подальшої обробки. Надішліть ідентифікатор key_id та пароль для завершення операції",
    "status": "success"
}

Запит 2:
POST http://<address>/api/add_key
Content-Type: application/json

{
  "key_id": 13,
   "password":"123456789"
}

Відповідь:
{
  "error_code": 0,
  "key_content": [...],
  "key_id": 49,
  "key_role": "director",
  "public_key": "0a1bf83eb0797de1af95d4495b89e7bd9532dc8624e053242ee6427efee5c033",
  "status": "success",
  "update_key_data_text": "Дані успішно зчитані з ключа та оновлені!"
}

Видалення ключа для підпису

Метод: POST 
URI: /api/delete_key

Формат JSON запиту:
{
    “key_id”: <>
}

Формат JSON відповіді:
{
    "error_code": 0,
    "status": "success"
}

Додавання ГО 

Метод: POST 
URI: /api/add_department

Формат JSON запиту:
{
    "name": <string>,
    "address": < як в 20-ОПП>, # опционально
    "rro_id": <> # фискальный номер РРО, опционально *,
    "main_key_id": <> # опционально,
    "prro_key_id": <> # опционально
    "auto_close_time": <string ЧЧ:ММ:СС> # опционально, час автоматичного закриття зміни, якщо не зазначено, зміну потрібно закрити вручну командою close_shift, або вона закриється автоматично у вказаний час
}
* можливо поставити пізніше шляхом set_rro

Формат JSON відповіді:
{
   "department_id": <integer>,
   "error_code": <integer>,
   "signer_type": <string>,
   "status": <success/error>
}

Приклад:
{
  "department_id": 12,
  "error_code": 0,
  "signer_type": "Старший касир",
  "status": "success"
}

Додавання РРО

Метод: POST 
URI: /api/set_rro

Формат JSON запиту:
{
    "department_id": <>,
    "rro_id": <> # фискальный номер РРО
}

Формат JSON відповіді:
{
    "error_code": 0,
    "status": "success"
}

Додавання ключів до РРО

Метод: POST 
URI: /api/set_department_keys

Формат JSON запиту:
{
    "department_id": <integer>,
    "main_key_id": <integer>,
    "prro_key_id": <integer>
}

Формат JSON відповіді:
{
   "error_code": <integer>,
   "signer_type": <string>, # Касир / Старший касир
   “status”: <success/error>
}
 
Приклад:
{
    "error_code": 0,
    "signer_type": "Старший касир",
    "status": "success"
}

Запит стану сервера ДПС

Метод: POST 
URI: /api/server_state

Формат JSON запиту:
{
    "rro_id": <фискальний номер РРО>
}

Приклад:
{
    "rro_id": 4000058253
}

або
{
    "key_id”: <>
}

Приклад:
{
    "key_id": 8
}

або
{
    "department_id": <>
}

Приклад:
{
    "department_id": 9
}

Формат JSON відповіді:
{
    "error_code": <-1...10>,
    "status": <success/error>,
    "time": <Дата і час відповіді сервера>,
    "message": <Повідомлення в разі помилки>
}
Дата і час представлені текстом у форматі ISO 8601 (наприклад, "2021-07-26T20:15:25.117835+03:00" ).

Приклад:
{
    "error_code": 0,
    "status": "success",
    "time": "2022-08-15T16:19:53.1457123+03:00"
}

Запит доступних об'єктів

Метод: POST 
URI: /api/objects
 
Формат JSON запиту:
{
    “key_id”: <>
}

Приклад:
{
    "key_id": 8
}

У цьому випадку будуть отримані всі об'єкти та фіскальні номери, до яких ключ має доступ

або:
{
    "rro_id": <фискальний номер РРО>
}

Приклад:
{
    "rro_id": 4000058253
}

або
{
    "department_id": <>
}

Приклад:
{
    "department_id": 9
}

У відповідь повертається перелік доступних користувачу господарських одиниць і ПРРО.
Формат JSON відповіді:
{
  "error_code": 0,
  "objects": {
    "TaxObjects": [...],
    "UID": "a010a996-d1c5-4f93-9ff8-515ac956bd62"
  },
  "status": "success"
}

Приклад:
{
  "error_code": 0,
  "objects": {
    "TaxObjects": [
      {
        "Address": "УКРАЇНА, М.КИЇВ ШЕВЧЕНКІВСЬКИЙ Р-Н, проспект Перемоги, буд.8",
        "ChiefCashier": false,
        "Entity": 147630,
        "Ipn": null,
        "Name": "Магазин \"АТ проспект Перемоги 8\"",
        "OrgName": "ИВАНОВ АНАТОЛІЙ ГАЛІЙОВИЧ",
        "SingleTax": false,
        "TaxObjGuid": "D3967CD0C1880530E0530A2142078BC6",
        "Tin": "2672551631",
        "TransactionsRegistrars": [
          {
            "Closed": false,
            "Name": "Каса",
            "NumFiscal": 4000070455,
            "NumLocal": 1
          }
        ]
      }
    ],
    "UID": "afc0c916-c180-4e0b-beb4-853dbf0b98e4"
  },
  "status": "success"
}

Запит переліку операторів (касирів) для суб’єкта господарювання

Метод: POST 
URI: /api/operators

Формат JSON запиту:
{
    "rro_id": <фискальний номер РРО>
}

Приклад:
{
    "rro_id": 4000058253
}

або
{
    "key_id": <>
}

Приклад:
{
    "key_id": 8
}

або
{
    "department_id": <>
}

Приклад:
{
    "department_id": 9
}

У відповідь повертається перелік операторів, що зареєстровані для суб'єкта господарювання, реєстраційний номер якого (ЄДРПОУ, ДРФО, Картка платника податків) міститься у сертифікаті КЕП, яким засвідчений запит.

Формат JSON відповіді:
{
  "error_code": 0,
  "operators": {
    "Operators": [
      {
        "ChiefCashier": true,
        "RegNum": "34554363",
        "SubjectKeyId": "c0039e8093dee743e740af8b251181e4fd2cc3ee0bd405a4279e64c5b217bd03"
      },
    "Tin": "34554363",
    "UID": "498c9396-a492-454f-a666-394f6bb9338e"
  },
  "status": "success"
}

Запит чеку

Метод: POST 
URI: /api/check

Формат JSON запиту:
{
    "rro_id": <фискальний номер РРО>,
    "tax_id": <фискальний номер  чеку>,
}

Формат JSON відповіді:
{
    error_code: <>,
    status: <success/error>,
    "tax_visual": <Base64 encoded UTF-8 string>
}

Приклад:
{
  "error_code": 0,
  "status": "success",
  "tax_visual": "0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0DQrQqNCw0L3RgdC+0L0NCtCj0JrQoNCQ0IfQndCQLCDQkknQndCd0JjQptCs0JrQkCDQntCR0JsuLCDQnC4g0JLQhtCd0J3QmNCm0K8sINCX0L7Qu9C+0YLRi9C1INC60YPQv9C+0LvQsCwgMdCwDQoJCdCG0JQgMzQ1NTQzNjMNCgkJ0J/QnSAxMjM0NTY3ODkwMjANCgkJ0JrQsNGB0L7QstC40Lkg0YfQtdC6DQrQn9Cg0KDQniAg0KTQnSA0MDAwMDk2MTkzICAgICAgICAg0JLQnSAyMzMyMDU1DQrQp9CV0JogICDQpNCdIDEzMTM3MjM4OCAgICAgICAgICDQktCdIDQxINC+0L3Qu9Cw0LnQvQ0K0JrQsNGB0LjRgCDQotC10YHRgtC+0LLQuNC5INC/0LvQsNGC0L3QuNC6IDQgKNCi0LXRgdGCKQ0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0K0JDQoNCiLuKEliAxMjM0NSDQvNC+0YDQutCy0LANCjEuMDAwICAgICAgICAgeCAgICAgICAgIDEwMC4wMCA9ICAgICAgICAgICAgICAgICAgMTAwLjAwIEENCgnQlNC40YHQutC+0L3RgjogNTAuMDANCtCQ0KDQoi7ihJYgNTQzMjEg0YbQuNCx0YPQu9GPDQoxLjAwMCAgICAgICAgIHggICAgICAgICAyMDAuMDAgPSAgICAgICAgICAgICAgICAgIDIwMC4wMCBBDQoJ0JTQuNGB0LrQvtC90YI6IDQwLjAwDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQrQlNCY0KHQmtCe0J3QojogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOTAuMDANCtCh0KPQnNCQINCU0J4g0KHQn9Cb0JDQotCYOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMjEwLjAwDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQrQn9CU0JIgQSAgICAgICAgICAgICAgICAgICAgMjAuMDAlINCy0ZbQtCAgICAyMTAuMDA6ICAgICA0Mi4wMA0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0KMTAtMTItMjAyMSAyMjozNzowNQ0KCQnQpNCG0KHQmtCQ0JvQrNCd0JjQmSDQp9CV0JoNCgkJ0KTQodCa0J4g0ITQktCf0JXQlw0K0JTQtdGA0LbQsNCy0L3QsCDQv9C+0LTQsNGC0LrQvtCy0LAg0YHQu9GD0LbQsdCwINCj0LrRgNCw0ZfQvdC4DQo="
}

Декодований рядок tax_visual:

Тестовий платник 4
Шансон
УКРАЇНА, ВIННИЦЬКА ОБЛ., М. ВІННИЦЯ, Золотые купола, 1а
		ІД 34554363
		ПН 123456789020
		Касовий чек
ПРРО  ФН 4000096193         ВН 2332055
ЧЕК   ФН 131372388          ВН 41 онлайн
Касир Тестовий платник 4 (Тест)
----------------------------------------------------------------------
АРТ.№ 12345 морква
1.000         x         100.00 =                  100.00 A
	Дисконт: 50.00
АРТ.№ 54321 цибуля
1.000         x         200.00 =                  200.00 A
	Дисконт: 40.00
----------------------------------------------------------------------
ДИСКОНТ:                                           90.00
СУМА ДО СПЛАТИ:                                   210.00
----------------------------------------------------------------------
ПДВ A                    20.00% від    210.00:     42.00
----------------------------------------------------------------------
10-12-2021 22:37:05
		ФІСКАЛЬНИЙ ЧЕК
		ФСКО ЄВПЕЗ
Державна податкова служба України

Запит Z-звіту

Метод: POST 
URI: /api/zrep

Формат JSON запиту:
{
    "rro_id": <фискальний номер РРО>,
    "key_id": <integer>, #опціонально, якщо необхідно підписати іншим ключем
    "tax_id": <фискальний номер  Z-звіту>,
}

Формат JSON відповіді:
{
    "error_code": <>,
    "status": <success/error>,,
    "tax_json": {json dict},
    "xml": <Base64 encoded windows-1251 string>
    "z_visual_data": <Base64 encoded UTF-8 string>
}

Приклад:
{
    "error_code": 0,
    "status": "success",
    "tax_json": {...},
    "xml": "...",
    "z_visual_data": "0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0DQrQqNCw0L3RgdC+0L0NCtCj0JrQoNCQ0IfQndCQLCDQkknQndCd0JjQptCs0JrQkCDQntCR0JsuLCDQnC4g0JLQhtCd0J3QmNCm0K8sINCX0L7Qu9C+0YLRi9C1INC60YPQv9C+0LvQsCwgMdCwDQoJCdCG0JQgMzQ1NTQzNjMNCgkJ0J/QnSAxMjM0NTY3ODkwMjANCtCf0KDQoNCeICAg0KTQnSA0MDAwMDk2MTkzICAgICAgICAg0JLQnSAyMzMyMDU1DQpaLdCX0JLQhtCiINCk0J0gMTMxMzYzOTgzICAgICAgICAgINCS0J0gMzUg0L7QvdC70LDQudC9DQrQmtCw0YHQuNGAINCi0LXRgdGC0L7QstC40Lkg0L/Qu9Cw0YLQvdC40LogNCAo0KLQtdGB0YIpDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQoJ0J/QhtCU0KHQo9Cc0JrQmCDQoNCV0JDQm9CG0JfQkNCm0IbQhw0K0JfQsNCz0LDQu9GM0L3QsCDRgdGD0LzQsDogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMTAuMDANCi0g0JPQntCi0IbQktCa0JA6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIxMC4wMA0KDQrQp9C10LrRltCyOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQoJCdCf0J7QlNCQ0KLQmtCYDQrQn9CU0JIgQSAgICAgICAgICAgICAgICAgICAgMjAuMDAlINCy0ZbQtCAgICAyMTAuMDA6ICAgICA0Mi4wMA0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0KMTAtMTItMjAyMSAyMTo0NTowNQ0KCQnQpNCG0KHQmtCQ0JvQrNCd0JjQmSBaLdCX0JLQhtCiDQoJCdCk0KHQmtCeINCE0JLQn9CV0JcNCtCU0LXRgNC20LDQstC90LAg0L/QvtC00LDRgtC60L7QstCwINGB0LvRg9C20LHQsCDQo9C60YDQsNGX0L3QuA0K"
}

Декодований рядок z_report_visual:

Тестовий платник 4
Шансон
УКРАЇНА, ВIННИЦЬКА ОБЛ., М. ВІННИЦЯ, Золотые купола, 1а
		ІД 34554363
		ПН 123456789020
ПРРО   ФН 4000096193         ВН 2332055
Z-ЗВІТ ФН 131363983          ВН 35 онлайн
Касир Тестовий платник 4 (Тест)
----------------------------------------------------------------------
	ПІДСУМКИ РЕАЛІЗАЦІЇ
Загальна сума:                                    210.00
- ГОТІВКА:                                        210.00

Чеків:                                                 1
----------------------------------------------------------------------
		ПОДАТКИ
ПДВ A                    20.00% від    210.00:     42.00
----------------------------------------------------------------------
10-12-2021 21:45:05
		ФІСКАЛЬНИЙ Z-ЗВІТ
		ФСКО ЄВПЕЗ
Державна податкова служба України

Запит переліку документів за період

Метод: POST 
URI: /api/operations

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касир
    "from": <дата с>,
    "to": <дата по>
}

Приклад:
{
  "rro_id": 4000096193,
  "from": "2021-12-15T16:57:22",
  "to": "2021-12-16T16:57:22"
}

Формат JSON відповіді:
{
    error_code: <>,
    status: <success/error>,
    "shifts": [],
    "documents": []
}

Приклад:
{
  "documents": {
    "3496273": [
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "OpenShift",
        "DocClass": "Check",
        "DocDateTime": "2021-12-16T16:57:22",
        "NumFiscal": "138671806",
        "NumLocal": 116,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "SaleGoods",
        "DocClass": "Check",
        "DocDateTime": "2021-12-16T16:57:24",
        "NumFiscal": "138671856",
        "NumLocal": 117,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "SaleGoods",
        "DocClass": "Check",
        "DocDateTime": "2021-12-16T16:58:54",
        "NumFiscal": "138675495",
        "NumLocal": 118,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "SaleGoods",
        "DocClass": "Check",
        "DocDateTime": "2021-12-16T16:59:12",
        "NumFiscal": "138676263",
        "NumLocal": 119,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "SaleGoods",
        "DocClass": "Check",
        "DocDateTime": "2021-12-16T17:29:49",
        "NumFiscal": "138756500",
        "NumLocal": 120,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "SaleGoods",
        "DocClass": "Check",
        "DocDateTime": "2021-12-17T15:59:34",
        "NumFiscal": "140159980",
        "NumLocal": 121,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "OfflineBegin",
        "DocClass": "Check",
        "DocDateTime": "2021-12-18T16:16:17",
        "NumFiscal": "301083.1.8010",
        "NumLocal": 122,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "ServiceDeposit",
        "CheckDocType": "SaleGoods",
        "DocClass": "Check",
        "DocDateTime": "2021-12-18T16:16:17",
        "NumFiscal": "301083.2.3414",
        "NumLocal": 123,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "OfflineEnd",
        "DocClass": "Check",
        "DocDateTime": "2021-12-18T16:16:17",
        "NumFiscal": "301083.3.8128",
        "NumLocal": 124,
        "Revoked": false,
        "Storned": false
      },
      {
        "CheckDocSubType": "CheckGoods",
        "CheckDocType": "SaleGoods",
        "DocClass": "Check",
        "DocDateTime": "2021-12-19T15:21:55",
        "NumFiscal": "142821340",
        "NumLocal": 125,
        "Revoked": false,
        "Storned": false
      }
    ]
  },
  "error_code": 0,
  "shifts": [
    {
      "CloseName": null,
      "CloseShiftFiscalNum": null,
      "CloseSubjectKeyId": null,
      "Closed": null,
      "OpenName": "Тестовий платник 4 (Тест)",
      "OpenShiftFiscalNum": "138671806",
      "OpenSubjectKeyId": "b3320cbf12dcc0c3acb2f366d0f6cedf51ae8ecd59f809eeac58612b0fc260c8",
      "Opened": "2021-12-16T16:57:23.654532",
      "ShiftId": 3496273,
      "ZRepFiscalNum": null
    }
  ],
  "status": "success"
}

Запит підсумків останньої зміни

Метод: POST 
URI: /api/totals

Формат JSON запиту:
{
    "rro_id": <фискальний номер РРО>,
}

Формат JSON відповіді:
{
    "error_code": <integer>,
    "status": <success/error>,
    "totals": {
        "CloseName": <П.І.Б. оператора, що закрив зміну>,
        "CloseSubjectKeyId": <Ідентифікатор ключа суб’єкта сертифікату оператора>,
        "Closed": <Дата і час закриття зміни>,
        "OpenName": <П.І.Б. оператора, що відкрив зміну>,
        "OpenSubjectKeyId": <Ідентифікатор ключа суб’єкта сертифікату оператора>,
        "Opened": <Дата і час відкриття зміни>,
        "ShiftState": <0-зміну не відкрито, 1-зміну відкрито>,
        "Testing": <Ознака зміни, що містить тестові документи (false/true)>,
        "Totals": <Підсумки зміни (якщо зміну відкрито)>,
        "UID": <Унікальний ідентифікатор запиту>,
        "ZRepFiscalNum": <Фіскальний номер Z-звіту>,
        "ZRepPresent": <Ознака присутності Z-звіту (false/true)>,
    }
}

Приклад:
{
    "error_code": 0,
    "status": "success",
    "totals": {
        "CloseName": "Тестовий платник 4",
        "CloseSubjectKeyId": "b3320cbf12dcc0c3acb2f366d0f6cedf51ae8ecd59f809eeac58612b0fc260c8",
        "Closed": "2022-04-18T16:29:45",
        "OpenName": "Тестовий платник 4",
        "OpenSubjectKeyId": "b3320cbf12dcc0c3acb2f366d0f6cedf51ae8ecd59f809eeac58612b0fc260c8",
        "Opened": "2022-04-18T16:26:59.088777",
        "ShiftState": 0,
        "Testing": false,
        "Totals": null,
        "UID": null,
        "ZRepFiscalNum": "123456789",
        "ZRepPresent": true
    }
}

Виправлення внутрішнього номера черги чеків
у разі колишнього або паралельного використання номера РРО в іншій системі

Метод: POST 
URI: /api/fix

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
}

Приклад:
{
    "rro_id": 4000096193
}

Формат JSON відповіді:
{
    "error_code": <integer>,
    "message": <string>,
    "status": <success/error>
}

Приклад:
{
    "error_code": 0,
    "message": "Все ОК",
    "status": "success"
}

Час автоматичного закриття зміни

Метод: POST 
URI: /api/set_shift_auto_close

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "auto_close_time": <string ЧЧ:ММ:СС> # час автоматичного закриття зміни, якщо не зазначено, зміну потрібно закрити вручну командою close_shift, або вона закриється автоматично у вказаний час
}

Приклад:
{
    "rro_id": 4000096193,
    "auto_close_time": "23:55:00"
}

Формат JSON відповіді:
{
    "error_code": <integer>,
    "message": <string>,
    "new_auto_close_time": <string ЧЧ:ММ:СС>
    "status": <success/error>
}

Приклад:
{
    "error_code":0,
    "message":"ОК",
    "new_auto_close_time": "23:55:00"
    "status": "success"
}

Відкриття зміни

Метод: POST 
URI: /api/open_shift

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
    "auto_close_time": <string ЧЧ:ММ:СС> # опционально, час автоматичного закриття зміни, якщо не зазначено, зміну потрібно закрити вручну командою close_shift, або вона закриється автоматично у вказаний час
    "cashier": <string> # опционально, ПИБ Касира
    "balance": <float 15.2>, # опционально, реєстрація залишків грошей на початок зміни
    "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Формат JSON відповіді:
{
    "error_code": <integer>,
    "message": <string>,
    "shift_opened": <boolean>,
    "shift_opened_datetime": <ISO datetime>,
    "status": <success/error>,
    "tax_id": <integer>
}

Приклад:
{
    "error_code": 0,
    "message": "Стан зміни: відкрита, сл. лок. ном. 69",
    "shift_opened": true,
    "shift_opened_datetime": "2022-08-15T14:03:47",
    "status": "success",
    "tax_id": 444123456
}

Реєстрація початкового залишку грошей каси

Метод: POST 
URI: /api/advance

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
    "sum": <>,
    "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Приклад:
{
    "rro_id": 4000096193,
    "sum": 1000
}

Формат JSON відповіді:
{
    "error_code": <integer>,
    "message": <string>,
    "qr": <string>,
    "shift_opened": <boolean>,
    "shift_opened_datetime": <ISO datetime>,
    "shift_tax_id": <>,
    "status": <success/error>,
    "tax_id": <integer for online, string for offline>,
    "tax_visual": <Base64 encoded UTF-8 string>
}

Приклад:
{
"error_code":0,
"message":"Відправлено чек службового внесення (аванс), отримано фіскальний номер 133115029",
"qr":"https://cabinet.tax.gov.ua/cashregs/check?id=133115029&fn=4000096193&date=20211212",
"shift_opened": false,
"shift_opened_datetime": "2021-12-12T13:51:56",
"shift_tax_id": 132933342,
"status":"success",
"tax_id":133115029,
"tax_visual": "0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0DQrQqNCw0L3RgdC+0L0NCtCj0JrQoNCQ0IfQndCQLCDQkknQndCd0JjQptCs0JrQkCDQntCR0JsuLCDQnC4g0JLQhtCd0J3QmNCm0K8sINCX0L7Qu9C+0YLRi9C1INC60YPQv9C+0LvQsCwgMdCwDQoJCdCG0JQgMzQ1NTQzNjMNCgkJ0J/QnSAxMjM0NTY3ODkwMjANCgkJ0KHQu9GD0LbQsdC+0LLQtSDQstC90LXRgdC10L3QvdGPDQoJCdCa0LDRgdC+0LLQuNC5INGH0LXQug0K0J/QoNCg0J4gINCk0J0gNDAwMDA5NjE5MyAgICAgICAgINCS0J0gMjMzMjA1NQ0K0KfQldCaICAg0KTQnSAxMzMxMTUwMjkgICAgICAgICAg0JLQnSA3MiDQvtC90LvQsNC50L0NCtCa0LDRgdC40YAg0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0ICjQotC10YHRgikNCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0NCtCh0KPQnNCQOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMTAwMC4wMA0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0KMTItMTItMjAyMSAxNTozMzo1Mw0KCQnQpNCG0KHQmtCQ0JvQrNCd0JjQmSDQp9CV0JoNCgkJ0KTQodCa0J4g0ITQktCf0JXQlw0K0JTQtdGA0LbQsNCy0L3QsCDQv9C+0LTQsNGC0LrQvtCy0LAg0YHQu9GD0LbQsdCwINCj0LrRgNCw0ZfQvdC4DQo="
}

Декодований рядок tax_visual:

Тестовий платник 4
Шансон
УКРАЇНА, ВIННИЦЬКА ОБЛ., М. ВІННИЦЯ, Золотые купола, 1а
		ІД 34554363
		ПН 123456789020
		Службове внесення
		Касовий чек
ПРРО  ФН 4000096193         ВН 2332055
ЧЕК   ФН 133115029          ВН 72 онлайн
Касир Тестовий платник 4 (Тест)
----------------------------------------------------------------------
СУМА:                                            1000.00
----------------------------------------------------------------------
12-12-2021 15:33:53
		ФІСКАЛЬНИЙ ЧЕК
		ФСКО ЄВПЕЗ
Державна податкова служба України

Реєстрація підкріплення грошей в касу

Метод: POST 
URI: /api/podkrep

Формат JSON запиту:
{
    "department_id": <integer>, #або rro_id
    "rro_id": <integer>, # опционально
    "key_id": <integer>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
   "sum": <число 15.2>,
   "balance": <число 15.2>, # опционально, якщо додати поле, і якщо зміна була закрита, зміна відкриється автоматично і реєструватиметься залишок каси службовим чеком, у цьому випадку у відповіді будуть повернуті додаткові поля tax_id_advance, qr_advance, tax_visual_advance 
   "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Приклад:
{
    "rro_id": 4000096193,
    "sum": 1000
}

Формат JSON відповіді:
{
    "error_code"= <>,
    "message": <>,
    "offline": <boolean>,
    "qr": <>,
    "qr_advance": <>, 
    "shift_opened": <boolean>,
    "shift_opened_datetime": <ISO datetime>,
    "shift_tax_id": <>,
    "status": <success/error>,
    "tax_id": <>,
    "tax_id_advance": <>,
    "tax_visual": <Base64 encoded UTF-8 string>
    "visual_advance": <>
}

Реєстрація інкасації грошей з каси

Метод: POST 
URI: /api/inkass

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
    "sum": <число 15.2>,
    "balance": <число 15.2>, # опционально, якщо додати поле, і якщо зміна була закрита, зміна відкриється автоматично і реєструватиметься залишок каси службовим чеком, у цьому випадку у відповіді будуть повернуті додаткові поля tax_id_advance, qr_advance, tax_visual_advance 
    "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Приклад:
{
    "rro_id": 4000096193,
    "sum": 1000
}

Формат JSON відповіді:
{
    "error_code"= <>,
    "message": <>,
    "offline": <boolean>,
    "qr": <>,
    "qr_advance": <>, 
    "shift_opened": <boolean>,
    "shift_opened_datetime": <ISO datetime>,
    "shift_tax_id": <>,
    "status": <success/error>,
    "tax_id": <>,
    "tax_id_advance": <>,
    "tax_visual": <Base64 encoded UTF-8 string>,
    "visual_advance": <>
}

Реалізація товарів або послуг

Метод: POST 
URI: /api/real

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
    "totals": {},  # опционально, якщо блок не вказано, програма спробує розрахувати значення автоматично по блоку товарів
    "reals": [],
    "pays": [],
    "taxes": [],
    "balance": <число 15.2>, # опционально, якщо додати поле, і якщо зміна була закрита, зміна відкриється автоматично і реєструватиметься залишок каси службовим чеком, у цьому випадку у відповіді будуть повернуті додаткові поля tax_id_advance, qr_advance, tax_visual_advance 
    "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Приклад:
{
"rro_id":4000046372,
"totals":
  {
      "SUM": 12.60, // <!--Загальна сума (15.2 цифри) -->
      "RNDSUM": -0.03,//<!--Заокруглення (15.2 цифри) -->
      "NORNDSUM": 12.57 //<!--Загальна сума без заокруглення (15.2 цифри) -->
  },
"reals":[
{
"CODE":12345, //<!--Внутрішній код товару (64 символи)--> 
"BARCODE":978020137962, //<!--Штриховий код товару (64 символи)-->
"UKTZED":876543, // <!--Код товару згідно з УКТЗЕД (15 цифр)--> або:
"DKPP": "18.11.1", // <!--Код послуги згідно з ДКПП (15 символів)-->
"NAME":"морква",  //<!--Найменування товару, послуги або операції (текст)-->
"DESCRIPTION":"морква червона",  //<!--Опис товару, послуги або операції (текст)-->
"UNITCD":2009, //<!--Код одиниці виміру згідно класифікатора (5 цифр)-->
"UNITNM":"шт",  //<!--Найменування одиниці виміру (64 символи)-->
"AMOUNT":1, //<!--Кількість/об’єм товару (15.3 цифри)-->
"PRICE":100, //<!--Ціна за одиницю товару (15.2 цифри)-->
"LETTERS":"A", //<!--Літерні позначення видів і ставок податків/зборів (15 символів)-->
"COST":100, //<!--Сума операції (15.2 цифри)-->
"USAGETYPE":1, //<!--Тип застосування знижки/націнки (числовий): 0–Попередній продаж, 1–Проміжний підсумок, 2–Спеціальна...-->
"DISCOUNTTYPE":1, //<!--Тип знижки/націнки (числовий): 0–Сумова, 1–Відсоткова→
"SUBTOTAL":100, //<!--Проміжна сума чеку, на яку нараховується знижка/націнка (15.2 цифри)-->
"DISCOUNTNUM":1, //<!--Порядковий номер операції, до якої відноситься знижка/націнка. Присутній, якщо знижка/націнка стосується лише однієї операції. (числовий)-->
"DISCOUNTTAX":"A", //<!--Податок, якщо знижка/націнка стосується лише одного податку (1 символ)-->
"DISCOUNTPERCENT":50, //<!--Відсоток знижки/націнки, для відсоткових знижок/націнок (не зазначається при фіксованій сумі знижки/націнки) (15.2 цифри)-->
"DISCOUNTSUM":50,  //<!--Загальна сума знижки/націнки (15.2 цифри)-->
"COMMENT":"морква червона гарна",  //<!--Коментар→-->
      "EXCISELABELS": [
        {
          "EXCISELABEL": "123132132" // !--Серія та номер марки акцизного податку-->
        }
      ]


},
{
"CODE":54321,
"NAME":"цибуля",
"UNITCD":2009,
"UNITNM":"шт",
"AMOUNT":1,
"PRICE":200,
"LETTERS":"A",
"COST":200,
"DISCOUNTTYPE":1,
"DISCOUNTPERCENT":20,
"DISCOUNTSUM":40
}
],
"pays":[
{
"PAYFORMCD":0, // 	<!--Код форми оплати (числовий):--> <!--0–Готівка, 1–Банківська картка...-->
"PAYFORMNM":"Банківська картка", // 	<!--Найменування форми оплати (128 символів)-->
"SUM":210, // 	<!--Загальна сума (15.2 цифри)-->
"PROVIDED":250, // <!--Сума внесених коштів (15.2 цифри)-->
"REMAINS":40, // <!--Решта (не зазначається, якщо решта відсутня) (15.2 цифри)-->
"PAYSYS": [
{
"TAXNUM": "123132132", // <!--Податковий номер платіжної системи (64 символи)-->
"NAME": "ОщадБанк", // <!--Найменування платіжної системи (текст)-->
"ACQUIREPN": "456465465", // <!--Податковий номер еквайра торговця (64 символи)-->
"ACQUIRENM": "NameEq", // <!--Найменування еквайра торговця (текст)-->
"ACQUIRETRANSID": "456465465", // <!--Ідентифікатор транзакції, що надається еквайром та ідентифікує операцію в платіжній системі (128 символів)-->
"POSTRANSDATE": "2021-12-12T13:51:56", // <!--POS-термінал. Дата та час транзакції (iso format)-->
"POSTRANSNUM": "546579872332", // <!--POS-термінал. Номер чека транзакції (128 символів)-->
"DEVICEID": "87987987987", // <!--Ідентифікатор платіжного пристрою (128 символів)-->
"EPZDETAILS": "UA8797897UA", // <!--Реквізити електронного платіжного засобу (128 символів)-->
"AUTHCD": "asfdefwefwefv", // <!--Код авторизації (64 символи)-->
"SUM": 250, // <!--Сума оплати (15.2 цифри)-->
"COMMISSION": 5, // <!--Сума комісії (15.2 цифри)-->
}
], // <!--Платіжні системи-->
}
],
"taxes":[
{
"TYPE":0, // <!--Код виду податку/збору (числовий):--> // <!--0-ПДВ,1-Акциз,2-ПФ...-->
"NAME":"ПДВ", // <!--Найменування виду податку/збору (64 символи)-->
"LETTER":"A", //<!--Літерне позначення виду і ставки податку/збору (А,Б,В,Г,...) (1 символ)-->
"PRC":20, // <!--Відсоток податку/збору (15.2 цифри)-->
"SIGN":false, // <!--Ознака податку/збору, не включеного у вартість--> //false/true
"TURNOVER":300, // <!--Сума для розрахування податку/збору (15.2 цифри)-->
"TURNOVERDISCOUNT":300, // <!--Сума обсягів для розрахування податку/збору з урахуванням знижки (15.2 цифри)-->
"SOURCESUM":210, // <!--Вихідна сума для розрахування податку/збору (15.2 цифри)-->
"SUM":42 // <!--Сума податку/збору (15.2 цифри)-->
}
]
}

Формат JSON відповіді:
{
    "error_code"= <>,
    "message": <>,
    "offline": <boolean>,
    "qr": <>,
    "qr_advance": <>, 
    "shift_opened": <boolean>,
    "shift_opened_datetime": <ISO datetime>,
    "shift_tax_id": <>,
    "status": <success/error>,
    "tax_id": <>,
    "tax_id_advance": <>,
    "tax_visual": <Base64 encoded UTF-8 string>,
    "tax_visual_advance": <>,
    "visual_advance": <>
}

Приклад:
{
"error_code":0,
"message":"Отправлен чек, получен фискальный номер 21818184",
"offline": false,
"qr":"https://cabinet.tax.gov.ua/cashregs/check?id=21818184&fn=4000046372&date=20210803",
"shift_opened": true,
"shift_opened_datetime": "2021-11-25T15:53:46",
"shift_tax_id": 112584769,
"status":"success",
"tax_id":21818184,
"tax_visual": "0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0DQrQqNCw0L3RgdC+0L0NCtCj0JrQoNCQ0IfQndCQLCDQkknQndCd0JjQptCs0JrQkCDQntCR0JsuLCDQnC4g0JLQhtCd0J3QmNCm0K8sINCX0L7Qu9C+0YLRi9C1INC60YPQv9C+0LvQsCwgMdCwDQoJCdCG0JQgMzQ1NTQzNjMNCgkJ0J/QnSAxMjM0NTY3ODkwMjANCgkJ0JrQsNGB0L7QstC40Lkg0YfQtdC6DQrQn9Cg0KDQniAg0KTQnSA0MDAwMDk2MTkzICAgICAgICAg0JLQnSAyMzMyMDU1DQrQp9CV0JogICDQpNCdIDEzMTM3MjM4OCAgICAgICAgICDQktCdIDQxINC+0L3Qu9Cw0LnQvQ0K0JrQsNGB0LjRgCDQotC10YHRgtC+0LLQuNC5INC/0LvQsNGC0L3QuNC6IDQgKNCi0LXRgdGCKQ0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0K0JDQoNCiLuKEliAxMjM0NSDQvNC+0YDQutCy0LANCjEuMDAwICAgICAgICAgeCAgICAgICAgIDEwMC4wMCA9ICAgICAgICAgICAgICAgICAgMTAwLjAwIEENCgnQlNC40YHQutC+0L3RgjogNTAuMDANCtCQ0KDQoi7ihJYgNTQzMjEg0YbQuNCx0YPQu9GPDQoxLjAwMCAgICAgICAgIHggICAgICAgICAyMDAuMDAgPSAgICAgICAgICAgICAgICAgIDIwMC4wMCBBDQoJ0JTQuNGB0LrQvtC90YI6IDQwLjAwDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQrQlNCY0KHQmtCe0J3QojogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOTAuMDANCtCh0KPQnNCQINCU0J4g0KHQn9Cb0JDQotCYOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMjEwLjAwDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQrQn9CU0JIgQSAgICAgICAgICAgICAgICAgICAgMjAuMDAlINCy0ZbQtCAgICAyMTAuMDA6ICAgICA0Mi4wMA0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0KMTAtMTItMjAyMSAyMjozNzowNQ0KCQnQpNCG0KHQmtCQ0JvQrNCd0JjQmSDQp9CV0JoNCgkJ0KTQodCa0J4g0ITQktCf0JXQlw0K0JTQtdGA0LbQsNCy0L3QsCDQv9C+0LTQsNGC0LrQvtCy0LAg0YHQu9GD0LbQsdCwINCj0LrRgNCw0ZfQvdC4DQo="
}

Декодований рядок tax_visual:

Тестовий платник 4
Шансон
УКРАЇНА, ВIННИЦЬКА ОБЛ., М. ВІННИЦЯ, Золотые купола, 1а
		ІД 34554363
		ПН 123456789020
		Касовий чек
ПРРО  ФН 4000096193         ВН 2332055
ЧЕК   ФН 131372388          ВН 41 онлайн
Касир Тестовий платник 4 (Тест)
----------------------------------------------------------------------
АРТ.№ 12345 морква
1.000         x         100.00 =                  100.00 A
	Дисконт: 50.00
АРТ.№ 54321 цибуля
1.000         x         200.00 =                  200.00 A
	Дисконт: 40.00
----------------------------------------------------------------------
ДИСКОНТ:                                           90.00
СУМА ДО СПЛАТИ:                                   210.00
----------------------------------------------------------------------
ПДВ A                    20.00% від    210.00:     42.00
----------------------------------------------------------------------
10-12-2021 22:37:05
		ФІСКАЛЬНИЙ ЧЕК
		ФСКО ЄВПЕЗ
Державна податкова служба України



Використання літер не регламентоване законом. Однак у межах зміни заборонено змінювати систему позначень, необхідно попередньо закрити зміну
 
Скасування чека
Важливо! Сторнуватись може лише останній документ

Метод: POST 
URI: /api/storno

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира,
    "tax_id": <>, # Фіскальний номер чека, для якого здійснюється сторно	
    "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Формат JSON відповіді:
{
    "error_code"= <>,
    "message": <>,
    "offline": <boolean>,
    "qr": <>,
    "shift_opened": <boolean>,
    "shift_opened_datetime": <ISO datetime>,
    "shift_tax_id": <>,
    "status": <success/error>,
    "tax_id": <>,
    "tax_visual": <Base64 encoded UTF-8 string>
}

Приклад:
{
"error_code":0,
"message":"Отправлено сторно документа 133101611, получен фискальный номер 133104756",
"qr":"https://cabinet.tax.gov.ua/cashregs/check?id=133104756&fn=4000096193&date=20211212",
"status":"success",
"tax_id":133101611,
"tax_visual": "0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0DQrQqNCw0L3RgdC+0L0NCtCj0JrQoNCQ0IfQndCQLCDQkknQndCd0JjQptCs0JrQkCDQntCR0JsuLCDQnC4g0JLQhtCd0J3QmNCm0K8sINCX0L7Qu9C+0YLRi9C1INC60YPQv9C+0LvQsCwgMdCwDQoJCdCG0JQgMzQ1NTQzNjMNCgkJ0J/QnSAxMjM0NTY3ODkwMjANCgkJ0KHRgtC+0YDQvdGD0LLQsNC90L3RjyDQv9C+0L/QtdGA0LXQtNC90YzQvtCz0L4g0YfQtdC60LANCgkJ0JrQsNGB0L7QstC40Lkg0YfQtdC6DQrQn9Cg0KDQniAg0KTQnSA0MDAwMDk2MTkzICAgICAgICAg0JLQnSAyMzMyMDU1DQrQp9CV0JogICDQpNCdIDEzMzEwNDc1NiAgICAgICAgICDQktCdIDcxINC+0L3Qu9Cw0LnQvQ0K0JrQsNGB0LjRgCDQotC10YHRgtC+0LLQuNC5INC/0LvQsNGC0L3QuNC6IDQgKNCi0LXRgdGCKQ0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0K0KHRgtC+0YDQvdGD0ZTRgtGM0YHRjyDQtNC+0LrRg9C80LXQvdGCIOKEliAxMzMxMDE2MTENCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0NCjEyLTEyLTIwMjEgMTU6Mjc6NTINCgkJ0KTQhtCh0JrQkNCb0KzQndCY0Jkg0KfQldCaDQoJCdCk0KHQmtCeINCE0JLQn9CV0JcNCtCU0LXRgNC20LDQstC90LAg0L/QvtC00LDRgtC60L7QstCwINGB0LvRg9C20LHQsCDQo9C60YDQsNGX0L3QuA0K"
}

Декодований рядок tax_visual:
Тестовий платник 4
Шансон
УКРАЇНА, ВIННИЦЬКА ОБЛ., М. ВІННИЦЯ, Золотые купола, 1а
		ІД 34554363
		ПН 123456789020
		Сторнування попереднього чека
		Касовий чек
ПРРО  ФН 4000096193         ВН 2332055
ЧЕК   ФН 133104756          ВН 71 онлайн
Касир Тестовий платник 4 (Тест)
----------------------------------------------------------------------
Сторнується документ № 133101611
----------------------------------------------------------------------
12-12-2021 15:27:52
		ФІСКАЛЬНИЙ ЧЕК
		ФСКО ЄВПЕЗ
Державна податкова служба України

Повернення товарів або послуг

Метод: POST 
URI: /api/return

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, #опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
    "totals": {},  # опционально, якщо блок не вказано, програма спробує розрахувати значення автоматично по блоку товарів
    "reals": [],
    "pays": [],
    "taxes": [],
    "orderretnum": <>, #або tax_id, Фіскальний номер чека, для якого здійснюється повернення (зазначається тільки для чеків повернення) (128 символів)
    "tax_id": <>,  # Фіскальний номер чека, для якого здійснюється повернення (зазначається тільки для чеків повернення) (128 символів),
    "balance": <число 15.2>, # опционально, якщо додати поле, і якщо зміна була закрита, зміна відкриється автоматично і реєструватиметься залишок каси службовим чеком, у цьому випадку у відповіді будуть повернуті додаткові поля tax_id_advance, qr_advance, tax_visual_advance 
    "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Приклад:
{
"rro_id":4000046372,
"totals":
  {
      "SUM": 12.60, // <!--Загальна сума (15.2 цифри) -->
      "RNDSUM": -0.03,//<!--Заокруглення (15.2 цифри) -->
      "NORNDSUM": 12.57 //<!--Загальна сума без заокруглення (15.2 цифри) -->
  },
"reals":[
{
"CODE":12345,
"NAME":"морква",
"UNITCD":2009,
"UNITNM":"шт",
"AMOUNT":1,
"PRICE":100,
"LETTERS":"A",
"COST":100,
"DISCOUNTTYPE":1,
"DISCOUNTPERCENT":50,
"DISCOUNTSUM":50
},
{
"CODE":54321,
"NAME":"цибуля",
"UNITCD":2009,
"UNITNM":"шт",
"AMOUNT":1,
"PRICE":200,
"LETTERS":"A",
"COST":200,
"DISCOUNTTYPE":1,
"DISCOUNTPERCENT":20,
"DISCOUNTSUM":40
}
],
"pays":[
{
"PAYFORMCD":0,
"PAYFORMNM":"ГОТІВКА",
"SUM":210
}
],
"taxes":[
{
"TYPE":0,
"NAME":"ПДВ",
"LETTER":"A",
"PRC":20,
"SIGN":false,
"TURNOVER":300,
"SOURCESUM":210,
"SUM":42
}
],
"tax_id":22186289 // <!--Фіскальний номер чека, для якого здійснюється повернення (зазначається тільки для чеків повернення) (128 символів)-->
}

Формат JSON відповіді:
{
    "error_code"= <>,
    "message": <>,
    "offline": <boolean>,
    "qr": <>,
    "qr_advance": <>, 
    "shift_opened": <boolean>,
    "shift_opened_datetime": <ISO datetime>,
    "shift_tax_id": <>,
    "status": <success/error>,
    "tax_id": <>,
    "tax_id_advance": <>,
    "tax_visual": <Base64 encoded UTF-8 string>,
    "tax_visual_advance": <>
}

Приклад:
{
"error_code":0,
"message":"Отправлен чек возврата, получен фискальный номер 22186318",
"offline": false,
"qr":"https://cabinet.tax.gov.ua/cashregs/check?id=22186318&fn=4000046372&date=20210804",
"status":"success",
"tax_id":22186318,
"tax_visual": "0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0DQrQqNCw0L3RgdC+0L0NCtCj0JrQoNCQ0IfQndCQLCDQkknQndCd0JjQptCs0JrQkCDQntCR0JsuLCDQnC4g0JLQhtCd0J3QmNCm0K8sINCX0L7Qu9C+0YLRi9C1INC60YPQv9C+0LvQsCwgMdCwDQoJCdCG0JQgMzQ1NTQzNjMNCgkJ0J/QnSAxMjM0NTY3ODkwMjANCgkJ0JLQuNC00LDRgtC60L7QstC40Lkg0YfQtdC6ICjQv9C+0LLQtdGA0L3QtdC90L3RjykNCgkJ0JrQsNGB0L7QstC40Lkg0YfQtdC6DQrQn9Cg0KDQniAg0KTQnSA0MDAwMDk2MTkzICAgICAgICAg0JLQnSAyMzMyMDU1DQrQp9CV0JogICDQpNCdIDEzMTM3MzMwMiAgICAgICAgICDQktCdIDQyINC+0L3Qu9Cw0LnQvQ0K0JrQsNGB0LjRgCDQotC10YHRgtC+0LLQuNC5INC/0LvQsNGC0L3QuNC6IDQgKNCi0LXRgdGCKQ0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0K0J/QvtCy0LXRgNC90LXQvdC90Y8g0LTQu9GPINC00L7QutGD0LzQtdC90YLRgyDihJYgMTMxMzcyMzg4DQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQrQkNCg0KIu4oSWIDEyMzQ1INC80L7RgNC60LLQsA0KMS4wMDAgICAgICAgICB4ICAgICAgICAgMTAwLjAwID0gICAgICAgICAgICAgICAgICAxMDAuMDAgQQ0KCdCU0LjRgdC60L7QvdGCOiA1MC4wMA0K0JDQoNCiLuKEliA1NDMyMSDRhtC40LHRg9C70Y8NCjEuMDAwICAgICAgICAgeCAgICAgICAgIDIwMC4wMCA9ICAgICAgICAgICAgICAgICAgMjAwLjAwIEENCgnQlNC40YHQutC+0L3RgjogNDAuMDANCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0NCtCU0JjQodCa0J7QndCiOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA5MC4wMA0K0KHQo9Cc0JAg0JTQniDQodCf0JvQkNCi0Jg6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMTAuMDANCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0NCtCf0JTQkiBBICAgICAgICAgICAgICAgICAgICAyMC4wMCUg0LLRltC0ICAgIDIxMC4wMDogICAgIDQyLjAwDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQoxMC0xMi0yMDIxIDIyOjQ5OjIyDQoJCdCk0IbQodCa0JDQm9Cs0J3QmNCZINCn0JXQmg0KCQnQpNCh0JrQniDQhNCS0J/QldCXDQrQlNC10YDQttCw0LLQvdCwINC/0L7QtNCw0YLQutC+0LLQsCDRgdC70YPQttCx0LAg0KPQutGA0LDRl9C90LgNCg=="
}

Декодований рядок tax_visual:

Тестовий платник 4
Шансон
УКРАЇНА, ВIННИЦЬКА ОБЛ., М. ВІННИЦЯ, Золотые купола, 1а
		ІД 34554363
		ПН 123456789020
		Видатковий чек (повернення)
		Касовий чек
ПРРО  ФН 4000096193         ВН 2332055
ЧЕК   ФН 131373302          ВН 42 онлайн
Касир Тестовий платник 4 (Тест)
----------------------------------------------------------------------
Повернення для документу № 131372388
----------------------------------------------------------------------
АРТ.№ 12345 морква
1.000         x         100.00 =                  100.00 A
	Дисконт: 50.00
АРТ.№ 54321 цибуля
1.000         x         200.00 =                  200.00 A
	Дисконт: 40.00
----------------------------------------------------------------------
ДИСКОНТ:                                           90.00
СУМА ДО СПЛАТИ:                                   210.00
----------------------------------------------------------------------
ПДВ A                    20.00% від    210.00:     42.00
----------------------------------------------------------------------
10-12-2021 22:49:22
		ФІСКАЛЬНИЙ ЧЕК
		ФСКО ЄВПЕЗ
Державна податкова служба України

Запит стану зміни

Метод: POST 
URI: /api/shift_status

Формат JSON запиту:
{
    "rro_id": <>,
    "key_id": <>, # опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира
}

Приклад:
{
    "rro_id": 4000096193
}

Формат JSON відповіді:
{
    "error_code": <>,
    "operation_time": <ISO datetime>,
    "registrar_state": <json>,
    "status": <success/error>
}

Приклад:
{
    "error_code": 0,
    "operation_time": "2022-04-18T16:27:08",
    "registrar_state": {...},
    "status": "success"
}

Формування Z звіту та закриття зміни

Метод: POST 
URI: /api/close_shift

Формат JSON запиту:
{
    "department_id": <>, #або rro_id
    "rro_id": <>, # опционально
    "key_id": <>, # опционально, якщо необхідно підписати іншим ключем, наприклад, ключем старшого касира,
    "balance": <число 15.2>, # опционально
    "testing": <true/false> # опционально, ознака тестового нефіскального документа, за замовчуванням false
}

Формат JSON відповіді:
{
    "close_shift_tax_id": <>,
    "data": <z report data>,
    "error_code": <>,
    "message": <>,
    "qr_inkass": <>,
    "status": <success/error>,
    "tax_id_inkass": <>,
    "visual_inkass": <>,
    "z_report_tax_id": <string>,
    "z_report_visual": <Base64 encoded UTF-8 string>
}

Приклад:
{
  "close_shift_tax_id": 131364000,
  "data": {
    "ShiftState": 1,
    "Testing": false,
    "Totals": {
      "Cash": null,
      "Currency": null,
      "Real": {
        "NoRndSum": 0.0,
        "OrdersCount": 1,
        "PayForm": [
          {
            "PayFormCode": 0,
            "PayFormName": "ГОТІВКА",
            "Sum": 210.0
          }
        ],
        "PwnSumIssued": 0.0,
        "PwnSumReceived": 0.0,
        "RndSum": 0.0,
        "Sum": 210.0,
        "Tax": [
          {
            "Letter": "A",
            "Name": "ПДВ",
            "Prc": 20.0,
            "Sign": false,
            "SourceSum": 210.0,
            "Sum": 42.0,
            "Turnover": 300.0,
            "TurnoverDiscount": 0.0,
            "Type": 0
          }
        ],
        "TotalCurrencyCommission": 0.0,
        "TotalCurrencyCost": 0,
        "TotalCurrencySum": 0.0
      },
      "Ret": null,
      "ServiceInput": 0.0,
      "ServiceOutput": 0.0
    },
    "UID": "6c9bff1f-1b3d-4363-9b66-c86868567534",
    "ZRepPresent": false
  },
  "error_code": 0,
  "message": "Смена успешно закрыта, Z отчет отправлен",
  "status": "success",
  "z_report_visual": "0KLQtdGB0YLQvtCy0LjQuSDQv9C70LDRgtC90LjQuiA0DQrQqNCw0L3RgdC+0L0NCtCj0JrQoNCQ0IfQndCQLCDQkknQndCd0JjQptCs0JrQkCDQntCR0JsuLCDQnC4g0JLQhtCd0J3QmNCm0K8sINCX0L7Qu9C+0YLRi9C1INC60YPQv9C+0LvQsCwgMdCwDQoJCdCG0JQgMzQ1NTQzNjMNCgkJ0J/QnSAxMjM0NTY3ODkwMjANCtCf0KDQoNCeICAg0KTQnSA0MDAwMDk2MTkzICAgICAgICAg0JLQnSAyMzMyMDU1DQpaLdCX0JLQhtCiINCk0J0gMTMxMzYzOTgzICAgICAgICAgINCS0J0gMzUg0L7QvdC70LDQudC9DQrQmtCw0YHQuNGAINCi0LXRgdGC0L7QstC40Lkg0L/Qu9Cw0YLQvdC40LogNCAo0KLQtdGB0YIpDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQoJ0J/QhtCU0KHQo9Cc0JrQmCDQoNCV0JDQm9CG0JfQkNCm0IbQhw0K0JfQsNCz0LDQu9GM0L3QsCDRgdGD0LzQsDogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMTAuMDANCi0g0JPQntCi0IbQktCa0JA6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIxMC4wMA0KDQrQp9C10LrRltCyOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxDQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tDQoJCdCf0J7QlNCQ0KLQmtCYDQrQn9CU0JIgQSAgICAgICAgICAgICAgICAgICAgMjAuMDAlINCy0ZbQtCAgICAyMTAuMDA6ICAgICA0Mi4wMA0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQ0KMTAtMTItMjAyMSAyMTo0NTowNQ0KCQnQpNCG0KHQmtCQ0JvQrNCd0JjQmSBaLdCX0JLQhtCiDQoJCdCk0KHQmtCeINCE0JLQn9CV0JcNCtCU0LXRgNC20LDQstC90LAg0L/QvtC00LDRgtC60L7QstCwINGB0LvRg9C20LHQsCDQo9C60YDQsNGX0L3QuA0K",
  "z_report_tax_id": 131363983
}

Декодований рядок z_report_visual:

Тестовий платник 4
Шансон
УКРАЇНА, ВIННИЦЬКА ОБЛ., М. ВІННИЦЯ, Золотые купола, 1а
		ІД 34554363
		ПН 123456789020
ПРРО   ФН 4000096193         ВН 2332055
Z-ЗВІТ ФН 131363983          ВН 35 онлайн
Касир Тестовий платник 4 (Тест)
----------------------------------------------------------------------
	ПІДСУМКИ РЕАЛІЗАЦІЇ
Загальна сума:                                    210.00
- ГОТІВКА:                                        210.00

Чеків:                                                 1
----------------------------------------------------------------------
		ПОДАТКИ
ПДВ A                    20.00% від    210.00:     42.00
----------------------------------------------------------------------
10-12-2021 21:45:05
		ФІСКАЛЬНИЙ Z-ЗВІТ
		ФСКО ЄВПЕЗ
Державна податкова служба України

Підписати довільні дані ключем

Метод: POST 
URI: /api/sign

Формат JSON запиту:
{
   “key_id”: <integer>,
   “unsigned_data”: <string base64 decoded data>,
   "tsp": "all" # не обов'язково ** <signature/content/all>,
   "ocsp": <boolean> # не обов'язково *** <true/false>
}
** Щоб додати безпечну позначку часу, використовуйте tsp. Захищена позначка часу є обов’язковою для тривалого зберігання з 7 листопада 2018 року. Приймає значення tsp: signature, content або all

Якщо вказано як tsp: all, агент включатиме позначки часу як вмісту, так і підпису. Якщо вказано під час аналізу повідомлення, мітки часу будуть перевірятися з документом, а сертифікат TSP і дати будуть включені у вихідні дані.
*** Вказання ocsp:true під час підписання додасть повні відповіді OCSP до повідомлення (cades X-long).

Приклад:
{
    "key_id": 2,
    "unsigned_data": "0KLQtdGB0YI="
}

Формат JSON відповіді:
{
    "error_code": <-1...10>,
    "status": <success/error>,
    "signed_data": <string base64 decoded data>,
    "message": <Повідомлення в разі помилки>
}

Приклад:
{
    "error_code": 0,
    "signed_data":"MIIJ6 … mNw==",
    "status":"success"
}

Перевірити підписані дані можна за посиланням:
https://acskidd.gov.ua/verify

Розшифрувати довільні дані ключем

Метод: POST 
URI: /api/unwrap

Формат JSON запиту:
{
    “key_id”: <>,
    “signed_data”: <string base64 decoded data>,
    "tsp": "all" # не обов'язково ** <signature/content/all>,
    "ocsp": <string> # не обов'язково *** <strict or lax>
}
*** Якщо надано список ЦС, можна також перевірити дійсність сертифіката підписувача через OCSP. Аргумент OCSP може бути strict або lax. У строгому режимі всі збої OCSP, навіть тимчасові, призведуть до помилки розгортання. 
У послабленому режимі мережеві помилки (включаючи відповіді, сформовані поштою та підроблені відповіді) повідомлятимуться, але не призводять до помилки розгортання.
Примітка: czo/verify все одно видасть запит ocsp для перевірки дійсності сертифіката tsp, незважаючи на наявність у файлі штампа ocsp.


Приклад:

{
    "key_id": 2,
    "signed_data": "MIIJ5AYJKoZ .. HK9oAQ=="
}

Формат JSON відповіді:
{
    "error_code": <-1...10>,
    "status": <success/error>,
    "unsigned_data": <base64>,
    "metadata": <json>, #Дані вмісту ключа, використовуваного при підписанні
    "message": <Повідомлення в разі помилки>
}

Приклад:
{"metadata":{"meta":{"pipe":[{"cert":{"extension":{"authorityInfoAccess":{"id":"ocsp","issuers":"http://acskidd.gov.ua/download/certificates/allacskidd-2019.p7b","link":"http://acskidd.gov.ua/services/ocsp/"},"authorityKeyIdentifier":"d8e2d9e7f900307b38f27288b40502c7a7b3fe655290e849c291d064a7338c5c","ipn":{"EDRPOU":"34554363"},"subjectInfoAccess":{"id":"tsp","link":"http://acskidd.gov.ua/services/tsp/"},"subjectKeyIdentifier":"e95d10f3c104b1bbe5c74a8eaaccb4c33300d5d6306b45ce3154765f6b334459"},"issuer":{"commonName":"\u041a\u041d\u0415\u0414\u041f - \u0406\u0414\u0414 \u0414\u041f\u0421","countryName":"UA","localityName":"\u041a\u0438\u0457\u0432","organizationName":"\u0406\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0456\u0439\u043d\u043e-\u0434\u043e\u0432\u0456\u0434\u043a\u043e\u0432\u0438\u0439 \u0434\u0435\u043f\u0430\u0440\u0442\u0430\u043c\u0435\u043d\u0442 \u0414\u041f\u0421","organizationalUnitName":"\u0423\u043f\u0440\u0430\u0432\u043b\u0456\u043d\u043d\u044f (\u0446\u0435\u043d\u0442\u0440) \u0441\u0435\u0440\u0442\u0438\u0444\u0456\u043a\u0430\u0446\u0456\u0457 \u043a\u043b\u044e\u0447\u0456\u0432 \u0406\u0414\u0414 \u0414\u041f\u0421","serialNumber":"UA-43174711-2019"},"subject":{"commonName":"\u0422\u0435\u0441\u0442\u043e\u0432\u0438\u0439 \u043f\u043b\u0430\u0442\u043d\u0438\u043a 4 (\u0422\u0435\u0441\u0442)","countryName":"UA","localityName":"\u041a\u0438\u0457\u0432","organizationName":"\u0422\u0435\u0441\u0442\u043e\u0432\u0438\u0439 \u043f\u043b\u0430\u0442\u043d\u0438\u043a 4","serialNumber":"2468610"},"usage":{"encrypt":false,"sign":true},"valid":{"from":1574287200000,"to":1637445600000},"verified":true},"contentTime":null,"signed":true,"signingTime":1627324445000,"tokenTime":null}]},"op":"META"},"status":"success","unsigned_data":"0KLQtdGB0YI="}

Запит облікових даних платника

Метод: POST 
URI: /api/tax_info

Формат JSON запиту:
{
    "key_id": <>, # Ідентифікатор ключа, який має право підпису документів у податковому кабінеті
    "group": <integer 1..16> # Якщо потрібно дані по всіх групах, параметр необхідно прибрати *
}

Приклад:
{
    "key_id": 73,
    "group": 11
}

* group може приймати такі значення:

1 Ідентифікаційні дані
2 Реєстраційні дані
3 Відомості про керівників
4 Присвоєння ознаки неприбутковості
5 Дані про реєстрацію платником ПДВ
6 Дані про реєстрацію платником єдиного податку
7 Дані про реєстрацію платником ЄСВ
8 Відомості з Реєстру осіб, які здійснюють операції з товаром
9 Відомості про РРО
10 Інформація про книги ОРО
11 Відомості про ПРРО
12 Відомості про об’єкти оподаткування
13 Інформація про неосновні місця обліку
14 Дані про банківські рахунки
15 Дані про укладені договори згідно з журналом договорів
16 Види діяльності

Формат JSON відповіді:
{
    "error_code": <>,
    "status": <success/error>,
    "data": []
}

Приклад:
{
  "data": {
    "idGroup": 11,
    "page": 0,
    "values": [
      {
        "ADDRESS": "УКРАЇНА, М.КИЇВ ДАРНИЦЬКИЙ Р-Н, вул. Дніпровська набережна, буд. 111",
        "D_REG": "20.12.2021",
        "FNUM": 4000168821,
        "LNUM": 1,
        "NAME": "Каса",
        "STATUS": "Активний"
      },
      {
        "ADDRESS": "УКРАЇНА, М.КИЇВ ШЕВЧЕНКІВСЬКИЙ Р-Н, проспект Перемоги, буд.31",
        "D_REG": "21.12.2021",
        "FNUM": 4000470455,
        "LNUM": 1,
        "NAME": "Каса",
        "STATUS": "Активний"
      }
    ]
  },
  "error_code": 0,
  "status": "success"
}

Якщо форма не має права підпису для запиту даних, буде повернено помилку:

{
    "error_code": -1,
    "message": "Помилка перевірки підпису:хибний підпис",
    "status": "error"
}

Детальний опис формату відповідей за посиланням:
https://cabinet.tax.gov.ua/help/api-registers-int.html#id2

Відправлення форми 5-ПРРО

Метод: POST 
URI: /api/taxform_5prro

Формат JSON запиту:
{
    key_id: <>, # Ідентифікатор ключа, який має право підпису документів у податковому кабінеті
    "public_key": <string>, # Ідентифікатор ключа суб’єкта. Якщо потрібно надіслати ідентифікатор зазначеного ключа, параметр необхідно прибрати
    "T1RXXXXG4S": <string>, # Тип підпису. У графі зазначається: Касир / Старший касир / Припинення роботи. Якщо не вказано, надсилається значення “Старший касир”
}

Приклад:
{
    "key_id":74,
    "public_key": "74cb1c8a7916e056e285880bc6d10b610fcae4d3a011bfbcfff382ec0401bbed"
}

Формат JSON відповіді:
{
  "error_code": 0,
  "filename": "22272672521631J1391802100000000010220222227.XML",
  "message": "Форму 5-ПРРО відправлено",
  "status": "success"
}

Відправлення форми 1-ПРРО

Метод: POST 
URI: /api/taxform_1prro

Формат JSON запиту:
{
    "key_id": <>, # Ідентифікатор ключа, який має право підпису документів у податковому кабінеті
    "dpi_id": <integer>, # Ідентифікатор об’єкта оподаткування *
    "KATOTTG": <string>, # код за КАТОТТГ, не обов'язково
    "R03G3S": <string>,  # назва ГО, не обов'язково
    "R04G11S": <string>, # назва ПРРО, не обов'язково
    "R04G2S": <string>   # фіскальний номер, вказати, якщо проводиться скасування
}

Приклад:
{
    "key_id": 74,
    "dpi_id": 45200001
}

* Ідентифікатор об’єкта оподаткування заповнюється згідно з повідомленням про такий об’єкт оподаткування, поданим до контролюючого органу відповідно до вимог пункту 63.3 статті 63 Податкового кодексу України.
dpi_id можна отримати з податкового кабінету або через запит /api/tax_info "group": 12, значення TO_CODE, наприклад:

POST http://127.0.0.1:5000/api/tax_info
Content-Type: application/json

{
  "key_id":73,
  "group": 11
}

Приклад частини відповіді:
{
        "ADDRESS": "УКРАЇНА, М.КИЇВ ШЕВЧЕНКІВСЬКИЙ Р-Н, проспект Перемоги, буд.3",
        "C_DISTR": "ГУ ДПС У М.КИЄВІ (ШЕВЧЕНКІВСЬКИЙ Р-Н М.КИЄВА) (код ДПІ-2659)",
        "C_TERRIT": 8039100000,
        "D_ACC_END": null,
        "D_ACC_START": "20.12.2021",
        "D_LAST_CH": "20.12.2021",
        "NAME": "Магазин \"АТ проспект Перемоги 3\"",
        "REG_NUM_OBJ": null,
        "STAN_OBJECT": "орендується",
        "TO_CODE": 32100002,
        "TYPE_OBJECT_NAME": "МАГАЗИН",
        "TYPE_OF_RIGHTS": "право короткострокового користування, оренди або найму"
}

Формат JSON відповіді:

{
    "error_code": 0,
    "filename": "22272672521631J1391802100000000010220222227.XML",
    "message": "Форму 1-ПРРО відправлено",
    "status": "success"
}

Відправлення форми 20-ОПП

Метод: POST 
URI: /api/taxform_20opp

Формат JSON запиту:
{
    "key_id": <>, # Ідентифікатор ключа, який має право підпису документів у податковому кабінеті
    "values": [
        "T1RXXXXG2": <integer>, # Код ознаки надання інформації
        "T1RXXXXG3": <integer>, # Тип об’єкта оподаткування
        "T1RXXXXG4S": <string>, # Найменування об’єкта оподаткування (зазначити у разі наявності)
        "T1RXXXXG5": <integer>, # Ідентифікатор об’єкта оподаткування
        "T1RXXXXG6S": <string>, # код за КАТОТТГ
        "T1RXXXXG7S": <string>, # область, район, населений пункт
        "T1RXXXXG8S": <string>, # Місцезнаходження об’єкта оподаткування (вулицю, номер будинку/офіса/квартири)
        "T1RXXXXG9": <integer>, # Стан об’єкта оподаткування
        "T1RXXXXG10": <integer> # Вид права на об’єкт оподаткування
        "T1RXXXXG11": <boolean>, # Прошу взяти на облік за неосновним місцем обліку за місцезнаходженням об’єкта оподаткування
        "T1RXXXXG12S": <string>, # Реєстраційний номер об’єкта оподаткування
    ]
}

T1RXXXXG2 «Код ознаки надання інформації» має значення:
1 Первинне надання інформації про об’єкти оподаткування
3 Зміна відомостей про об’єкт оподаткування
6 Закриття об’єкта оподаткування
T1RXXXXG3 «Тип об’єкта оподаткування» заповнюється відповідно до рекомендованого довідника типів
об’єктів оподаткування, що оприлюднений на офіційному веб-сайті Центрального контролюючого органу та
розміщений на інформаційних стендах у контролюючих органах.
Типи об'єктів оподаткування
T1RXXXXG5 «Ідентифікатор об’єкта оподаткування» – це числове значення, яке складається з коду типу
об’єкта оподаткування та внутрішнього ідентифікатора, прийнятого самою особою, що складається з 5-ти знаків.
Наприклад:
для кафе ідентифікатор об’єкта оподаткування може бути 24700001, де 247 – код типу об’єкта
оподаткування відповідно до рекомендованого довідника типів об’єктів оподаткування, 00001 – внутрішній
ідентифікатор, прийнятий особою;
для кіоску – 200010, де 2 – код типа об’єкта оподаткування відповідно до рекомендованого довідника
типів об’єктів оподаткування, 00010 – внутрішній ідентифікатор, прийнятий особою.
T1RXXXXG6S «Територія територіальної громади, де знаходиться об’єкт оподаткування» заповнюється відповідно до Кодифікатора адміністративно-територіальних одиниць та територій територіальних громад (КАТОТТГ), що розміщений на офіційному вебсайті Міністерства розвитку громад та територій України.
Кодифікатор адміністративно-територіальних одиниць та територій територіальних громад – Мінрегіон
Кодифікатор адміністративно-територіальних одиниць та територій територіальних громад
T1RXXXXG7S область, район, населений пункт відповідно до Класифікатора об’єктів адміністративно-територіального устрою (КОАТУУ), або відповідно до Кодифікатора адміністративно-територіальних одиниць та територій територіальних громад (КАТОТТГ)
T1RXXXXG9 «Стан об’єкта оподаткування» зазначається: 
1 - будується/готується до введення в експлуатацію; 
2 - експлуатується; 
3 - тимчасово не експлуатується; 
5 - непридатний до експлуатації; 
6 - об’єкт відчужений/повернутий власнику; 
7 - зміна призначення/перепрофілювання; 
8 - орендується; 
9 - здається в оренду.
 
T1RXXXXG10 «Вид права на об’єкт» зазначається: 
1 - право власності; 
2 - право володіння; 
3 - право користування (сервітут, емфітевзис, суперфіцій); 
4 - право господарського відання; 
5 - право оперативного управління; 
6 - право постійного користування; 
7 - право довгострокового користування або оренди; 
8 - право короткострокового користування, оренди або найму; 
9 - іпотека; 
10 - довірче управління майном.

T1RXXXXG11 На підставі проставленої відповідної позначки в графі 11 здійснюється взяття на облік платника податків за неосновним місцем обліку в контролюючому органі за місцезнаходженням об’єкта оподаткування.
T1RXXXXG12S «Реєстраційний номер об’єкта оподаткування (зазначити у разі наявності)» заповнюється у разі реєстрації об’єкта оподаткування у відповідному державному органі з отриманням відповідного реєстраційного номера (наприклад, таким номером є: кадастровий номер – для земельної ділянки; реєстраційний номер об’єкта нерухомого майна – для нерухомого майна, відмінного від земельної ділянки; номер кузова транспортного засобу – для легкового автомобіля; номер шасі транспортного засобу – для вантажного автомобіля та причепа; бортовий реєстраційний номер – для суден; реєстраційний знак – для повітряних суден тощо).
 
Приклад:
{
    "key_id": 73,
    "values": [
      {
        "T1RXXXXG2": 1,
        "T1RXXXXG3": 274,
        "T1RXXXXG4S":"Кафе Поплавок",
        "T1RXXXXG5": 24700001,
        "T1RXXXXG6S": "UA48040230080020671",
        "T1RXXXXG7S": "Київ",
        "T1RXXXXG8S": "вулиця Євгена Коновальця, 36В",
        "T1RXXXXG9": 8,
        "T1RXXXXG10": 7,
        "T1RXXXXG11": true,
        "T1RXXXXG12S": ""
      }
    ]
}

Формат JSON відповіді:
{
    "error_code": 0,
    "filename": "24120034554363J1312004100000000710220222412.XML",
    "message": "Форму 20-ОПП відправлено",
    "status": "success"
}

Отримання відповідей на надсилання форм

Метод: POST 
URI: /api/taxform_messages

Формат JSON запиту:
{
    "key_id": <>, # Ідентифікатор ключа, який має право підпису документів у податковому кабінеті,
    "delete":  <boolean true/false>, необов'язково, якщо не встановлено, визначається true, якщо встановлення значення false, повідомлення не будуть видалятися з сервера податкового кабінету, і їх можна запросити ще раз, наприклад, для налагодження
}

Приклад:
{
    "key_id": 74
}

Формат JSON відповіді:

{
    "error_code": 0,
    "messages": false,
    "status": "success"
}

або
{
    "error_code": 0,
    "messages": [
      {
        "filename": "22272672521631J1391802100000000010220222227.XML",
        "message": "Файл оброблений 01.01.2022 в 11:46:29\r\nДОКУМЕНТ ПРИЙНЯТО",
        "status": 1
      },
    ],
    "status": "success"
}

