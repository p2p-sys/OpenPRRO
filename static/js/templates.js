TEMPLATES = {
	base : 
		'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">'+
		'<html>'+
		'<head>'+
			'<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'+
			'<script src="{{ url_for(\'static\', filename=\'js/jquery.min.js\') }}"></script>'+
			'<style type="text/css">'+
				'body {'+
					'width: 100%;'+
					'/*height: 100%;*/'+
					'margin: 0;'+
					'padding: 0;'+
					'/*background-color: #FAFAFA;*/'+
					'border: 0.5em white solid;'+
					'font: 0.8em "Verdana";'+
				'}'+
				'table {'+
					'line-height: 1.25;'+
					'border: 1px solid #000;'+
					'/*border-collapse: inherit;*/'+
					'margin: 2% auto;'+
					'padding: 0;'+
					'width: 98%;'+
					'font-size: 80%;'+
				'}'+
				'table tr {'+
					'background: #ffffff;'+
					'border: 3px solid #fff;'+
					'padding: 0.25%;'+
				'}'+
				'table th,'+
				'table td {'+
					'border: 1px solid #000;'+
					'padding: 0.5%;'+
					'text-align: center;'+
					'page-break-inside:avoid !important;'+
				'}'+
				'table th {'+
					'overflow:auto;'+
					'letter-spacing: .1em;'+
					'text-transform: uppercase;'+
				'}'+
				'.auto-overflow{'+
					'overflow: auto;'+
				'}'+
				'.left-float{'+
					'float: left;'+
				'}'+
				'.right-float{'+
					'float: right;'+
					'text-align: right;'+
				'}'+
				'.center-align{'+
					'margin-right: auto;'+
					'margin-left: auto;'+
					'text-align: center;'+
				'}'+
				'.left-align{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.right-align{'+
					'margin-left: auto;'+
				'}'+
				'.fullwidth{'+
					'width: 100%'+
				'}'+
				'.two-thirds{'+
					'width:75%;'+
				'}'+
				'.half{'+
					'width:50%;'+
				'}'+
				'.quorter{'+
					'width:25%;'+
				'}'+
				'.padded{'+
					'padding:1%;'+
				'}'+
				'.hr { '+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
				'} '+
				'.underlined{'+
					'text-decoration:underline; '+
				'}'+
				'.centered{'+
					'text-align: center;'+
				'}'+
				'.notation{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.notation-right{'+
					'float:right;'+
					'text-align: right;'+
				'}'+
				'.big-col{'+
					'width:23%;'+
				'}'+
				'.med-col{'+
					'width: 12%;'+
				'}'+
				'.bold{'+
					'font-weight: bold'+
				'}'+
				'.descriptive-field{'+
					'font-size: 60%;'+
				'}'+
				'.annotation-field{'+
					'font-size: 50%;'+
				'}'+
				'.inline-block{'+
					'display: inline-block;  '+
					'vertical-align: middle;'+
					'padding: 2%;'+
				'}'+
				'* {'+
					'box-sizing: border-box;'+
					'-moz-box-sizing: border-box;'+
				'}'+
				'br{'+
					'display: block;'+
					'margin: 0;'+
				'}'+
				'hr {'+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
					'padding-top: 1em'+
				'}'+
				'h4{'+
					'text-align: center;'+
					'margin-top: 1%;'+
					'margin-bottom: 1%;'+
				'}'+
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: auto;'+ // always На новому Хромі не працює, а на старих друкує пусту сторінку
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'.pbreak{'+
						'page-break-after: always;'+
					'}'+
				'}'+
			'</style>',

	cash_book :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{^double}}' +
			'.column{' +
				'padding-top:3%;' +
				'margin-bottom: 5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
            '@media print {'+
                '.page {'+
                    'page-break-before: always;'+
                '}'+
            '}'+
		'{{/double}}' +
		'{{#double}}' +
			'.column{' +
				'float: left;' +
				'padding: 2%;' +
				'width:50%;' +
			'}' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
		'{{/double}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'{{#currencies}}' +
			'<div class="page">' +
				'{{#columns}}' +
                '<div class=\'column{{clas}}\'>' +
                '<div style="text-align:right">№ {{day_of_year}}</div>' +
                '<table style="border-collapse: collapse; border: none;">' +
                    '<thead>' +
                        '<tr style="border: none;">' +
                            '<td style="text-align:left; border: none;">Каса за {{date}}</td>' +
                            '<td style="text-align:left; border: none;">{{full_name}}</td>' +
                            '<td style="text-align:left; border: none;">Валюта {{ strcode }} ({{ code }})</td>' +
                        '</tr>' +
                    '</thead>' +
                '</table>' +
                '<table style="border-collapse: collapse; border: none;">' +
                    '<thead>' +
                        '<tr style="border: none;">' +
                            '<td class=\'med-col\' rowspan=1 style="width:20%">Номер квитанції</td>' +
                            '<td class=\'med-col\' rowspan=1 style="width:30%">Вiд кого отримано чи кому видано</td>' +
                            '<td class=\'med-col\' rowspan=1 style="width:10%">Номер \n кореспонду \n ючого \n рахунку, \n субрахунку</td>' +
                            '<td class=\'med-col\' rowspan=1 style="width:20%">Надходження</td>' +
                            '<td class=\'med-col\' rowspan=1 style="width:20%">Видаток</td>' +
                        '</tr>' +
                        '<tr style="border: none;">' +
                            '<td>1</td>' +
                            '<td>2</td>' +
                            '<td>3</td>' +
                            '<td>4</td>' +
                            '<td>5</td>' +
                        '</tr>' +
                        '<tr style="border: none;">' +
                            '<td style="text-align:right;" colspan="3">Залишок на початок дня</td>' +
                            '<td style="text-align:right;"><b>{{ advance }}</b></td>' +
                            '<td>X</td>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '{{#operations}}' +
                        '<tr style="border: none;">' +
                            '<td style="padding-right:5px">{{ num_eop }}</td>' +
                            '<td class=\'med-col\'>{{client}}</td>' +
                            '<td class=\'med-col\'>{{dt}}</td>' +
                            '<td class=\'med-col\' style="text-align:right;">{{ currency_in }}</td>' +
                            '<td class=\'med-col\' style="text-align:right;">{{ currency_out }}</td>' +
                        '</tr>' +
                        '{{/operations}}' +
                    '</tbody>' +
                    '<tfoot>' +
                        '<tr style="border: none;">' +
                            '<td style="text-align:right;" colspan="3">Разом за день</td>' +
                            '<td style="text-align:right;"><b>{{ bought }}</b></td>' +
                            '<td style="text-align:right;"><b>{{ sold }}</b></td>' +
                        '</tr>' +
                        '<tr style="border: none;">' +
                            '<td style="text-align:right;" colspan="3">Залишок на кiнец дня</td>' +
                            '<td style="text-align:right;"><b>{{ current }}</b></td>' +
                            '<td>X</td>' +
                        '</tr>' +
                        '<tr style="border: none;">' +
                            '<td style="text-align:right;" colspan="3">у том числi на зарплату</td>' +
                            '<td>X</td>' +
                            '<td>X</td>' +
                        '</tr>' +
                    '</tfoot>' +
                '</table>' +
                '<br><br><br>' +
                '<div class=\'notation\'>' +
                    '<div class=\'left-float\'>' +
                        '<span>Касир: _______________________</span>' +
                        '<span>{{ operator }}</span>' +
                    '</div><br>' +
                    '<div class=\'centered\'>' +
                        '<div class=\'left-float centered\'> &nbsp; &nbsp;  &nbsp; &nbsp;  &nbsp;  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;(підпис)</div>' +
                    '</div><br><br>	' +
                    '<div class=\'left-float\'>' +
                        '<span>Записи у касовiй книзi перевiрив i документи у кiлькостi</span>' +
                    '</div><br><br>' +
                    '<table style="border-collapse: collapse; border: none; font-size:13px">' +
                        '<thead>' +
                            '<tr style="border: none;">' +
                                '<td style="text-align:center; border: none; width:20%; border-bottom:1pt solid black;">{{opcount_in}} </td>' +
                                '<td style="text-align:center; border: none; width:20%">прибуткових</td>' +
                                '<td style="text-align:center; border: none; width:30%; border-bottom:1pt solid black;">{{opcount_out}}</td>' +
                                '<td style="text-align:left; border: none; width:30%">видаткових одержав</td>' +
                            '</tr>' +
                        '</thead>' +
                        '<tfoot>' +
                            '<tr style="border: none;">' +
                                '<td style="text-align:center; border: none; width:20%;">(словами)</td>' +
                                '<td style="text-align:center; border: none; width:20%"></td>' +
                                '<td style="text-align:center; border: none; width:30%;">(словами)</td>' +
                                '<td style="text-align:left; border: none; width:30%"></td>' +
                            '</tr>' +
                        '</tfoot>' +
                    '</table>' +
                    '<br><br>' +
                    '<div class=\'left-float\'>' +
                        '<span>Начальник вiддiлення: __________________________  </span>' +
                    '</div><br>' +
                    '<div class=\'centered\'>' +
                        '<div class=\'left-float\'> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;   &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (підпис)</div>' +
                    '</div>	' +
                '</div>' +
			'</div>' +
			'{{/columns}}' +
            '</div>' +
			'{{/currencies}}' +
		'</body>' +
		'</html>',


	accounting_statement :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{^double}}' +
			'.column{' +
				'padding-top:3%;' +
				'margin-bottom: 5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
		'{{/double}}' +
		'{{#double}}' +
			'.column{' +
				'float: left;' +
				'padding: 2%;' +
				'width:50%;' +
			'}' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
		'{{/double}}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
				'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
					// '<div class=\'left-float fullwidth descriptive-field centered\'>'+
					// 	'<div class=\'right-float quorter centered\'>' +
					// 		'Додаток 6 <br>' +
					// 		'до Інструкції про порядок організації та здійснення валютно-обмінних операцій на території України<br>' +
					// 		'(у редакції постанови Правління Національного банку України 07.06.2018 № 63)<br>' +
					// 		'(пункт 8 розділу III)' +
					// 	'</div>' +
					// '</div>' +
					'<div class=\'notation half\'>{{company}}</div>' +
					'<div class=\'notation half\'>{{full_name}}</div>' +
					'<div class=\'notation half\'>{{address}}</div>' +
					'<div class=\'descriptive-field notation half\'><hr>(найменування та місцезнаходження уповноваженої фінансової установи/національного оператора поштового зв\'язку/відокремленого підрозділу, пункту обміну іноземної валюти)</div>' +

					'<h4 class=\'centered\'>Звітна довідка про касові обороти за день і залишки цінностей</h4>' +
					'<div class=\'notation\'>за {{date}}</div>' +
					'<table>' +
						'<thead>' +
							'<tr>' +
								'<td rowspan=2>№ з/п</td>' +
								'<td class=\'med-col\' rowspan=2>Код валюти</td>' +
								'<td class=\'med-col\' rowspan=2>Залишок готівки в касі відокремленого підрозділу, пункті обміну валюти на початок дня</td>' +
								'<td class=\'med-col\' colspan=2>Отримано валюти</td>' +
								'<td class=\'med-col\' rowspan=2>Куплено відокремленим підрозділом, пунктом обміну валюти іноземної валюти</td>' +
								'<td class=\'med-col\' rowspan=2>Продано відокремленим підрозділом, пунктом обміну валюти іноземної валюти</td>' +
								'<td class=\'med-col\' colspan=2>Передано валюти</td>' +
								'<td class=\'med-col\' rowspan=2>Залишок готівки в касі відокремленого підрозділу, пункті обміну валюти на поточний момент часу/кінець робочого дня</td>' +
							'</tr>' +
							'<tr>' +
								'<td class=\'med-col\'>авансу на початок робочого дня</td>' +
								'<td class=\'med-col\'>підкріплення протягом робочого дня</td>' +
								'<td class=\'med-col\'>на кінець робочого дня</td>' +
								'<td class=\'med-col\'>протягом робочого дня</td>' +
							'</tr>' +
							'<tr>' +
								'<td>1</td>' +
								'<td>2</td>' +
								'<td>3</td>' +
								'<td>4</td>' +
								'<td>5</td>' +
								'<td>6</td>' +
								'<td>7</td>' +
								'<td>8</td>' +
								'<td>9</td>' +
								'<td>10</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'{{#currencies}}' +
							'<tr>' +
								'<td style="padding-right:5px">{{ ind }}</td>' +
								'<td class=\'med-col\'>{{ code }}</td>' +//Код валюти
								'<td class=\'med-col\'>{{ advance }}</td>' +//Залишок готівки в касі відокремленого підрозділу, пункті обміну валюти на початок дня
								'<td class=\'med-col\'>{{ initial }}</td>' +
								'<td class=\'med-col\'>{{ income }}</td>' +
								'<td class=\'med-col\'>{{ bought }}</td>' +
								'<td class=\'med-col\'>{{ sold }}</td>' +
								'<td class=\'med-col\'>{{ endday }}</td>' +
								'<td class=\'med-col\'>{{ intraday }}</td>' +
								'<td class=\'med-col\'>{{ current }}</td>' +
							'</tr>' +
							'{{/currencies}}' +
						'</tbody>' +
					'</table>' +
					'<div class=\'notation\'>' +
						'<div class=\'left-float\'>' +
							'<span>Касир: </span>' +
							'<span>{{ operator }}</span>' +
						'</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float quorter descriptive-field centered\'><hr>(підпис)</div>' +
						'</div>	' +
						'<br><br>' +
						'<!-- <div class=\'right-float half descriptive-field centered\'>Мiсце для вiдбитка штампа</div> -->' +
						'<br><br>' +
					'</div>' +
				'</div>' +
			'{{/columns}}' +
		'</div>' +
		'</body>' +
		'</html>',

	accounting_statement_2019 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{^double}}' +
			'.column{' +
				'padding-top:3%;' +
				'margin-bottom: 5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
		'{{/double}}' +
		'{{#double}}' +
			'.column{' +
				'float: left;' +
				'padding: 2%;' +
				'width:50%;' +
			'}' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
		'{{/double}}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
				'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
					// '<div class=\'left-float fullwidth descriptive-field centered\'>'+
					// 	'<div class=\'right-float quorter left\'>' +
					// 		'Додаток 3 <br>' +
					// 		'до Положення про здійснення операцій<br> із валютними цінностями<br>' +
					// 		'(пункт 22 розділу III)' +
					// 	'</div>' +
					// '</div>' +
					'<div class=\'two-thirds\'>{{company}}</div>' +
					'<div class=\'two-thirds\'>{{full_name}}</div>' +
					'<div class=\'two-thirds\'>{{address}}</div>' +
					'<div class=\'descriptive-field two-thirds\'><hr>(найменування та місцезнаходження небанківської фінансової установи, ' +
					'оператора поштового зв\'язку, їх відокремлених підрозділів, пункту обміну ' +
					'іноземної валюти небанківської фінансової установи, оператора поштового зв\'язку)</div>' +

					'<h3 class=\'centered\'>ЗВІТНА ДОВІДКА</h3>' +
					'<h4 class=\'centered\'>про касові обороти за день і залишки цінностей</h4>' +
					'<div class=\'centered\'>за {{date}}</div>' +
					'<table style="border-collapse: collapse; border:2pt solid black;">' +
						'<thead>' +
							'<tr style="border-collapse: collapse; border:1pt solid black;">' +
								'<td rowspan=2 style="width:5%;">№<br>з/п</td>' +
								'<td rowspan=2 style="width:10%;">Код валюти</td>' +
								'<td rowspan=2 style="width:15%;">Залишок готівки в касі на початок дня</td>' +
								'<td colspan=2>Отримано валюти</td>' +
								'<td rowspan=2>Куплено іноземної валюти</td>' +
								'<td rowspan=2>Продано іноземної валюти</td>' +
								'<td colspan=2>Передано валюти{{text_deficit_top}}</td>' +
								'<td rowspan=2 style="width:15%;">Залишок готівки в касі на поточний момент часу/кінець робочого дня</td>' +
							'</tr>' +
							'<tr style="border-collapse: collapse; border:1pt solid black;">' +
								'<td>авансу на початок робочого дня</td>' +
								'<td>підкріплення протягом робочого дня</td>' +
								'<td>на кінець робочого дня</td>' +
								'<td>протягом робочого дня</td>' +
							'</tr>' +
							'<tr style="border-collapse: collapse; border:2pt solid black;">' +
								'<td>1</td>' +
								'<td>2</td>' +
								'<td>3</td>' +
								'<td>4</td>' +
								'<td>5</td>' +
								'<td>6</td>' +
								'<td>7</td>' +
								'<td>8</td>' +
								'<td>9</td>' +
								'<td>10</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'{{#currencies}}' +
							'<tr style="border-collapse: collapse; border:1pt solid black;">' +
								'<td style="padding-right:5px">{{ ind }}</td>' +
								'<td>{{ code }}</td>' +
								'<td>{{ advance }}</td>' +
								'<td>{{ initial }}</td>' +
								'<td>{{ income }}</td>' +
								'<td>{{ bought }}</td>' +
								'<td>{{ sold }}</td>' +
								'<td>{{ endday }}</td>' +
								'<td>{{ intraday }}</td>' +
								'<td>{{ current }}</td>' +
							'</tr>' +
							'{{/currencies}}' +
						'</tbody>' +
					'</table>' +
					'<div class=\'notation\'>' +
						'<div class=\'left-float\'>' +
                            '<span>{{text_deficit_bottom}}</span>' +
						'</div><br><br>' +
					'</div>' +
					'<div class=\'notation\'>' +
						'<div class=\'left-float\'>' +
							'<span>Касир: </span>' +
							'<span>{{ operator }}</span>' +
						'</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float quorter descriptive-field centered\'><hr>(підпис)</div>' +
						'</div>	' +
						'<br><br>' +
						'<!-- <div class=\'right-float half descriptive-field centered\'>Мiсце для вiдбитка штампа</div> -->' +
						'<br><br>' +
					'</div>' +
				'</div>' +
			'{{/columns}}' +
		'</div>' +
		'</body>' +
		'</html>',

	register :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:120%;' +
		'}' +
		'</style>' +
		'</head>' +
			'<div class="page">' +
				'<div class=\'notation two-thirds\'>{{company}}</div>' +
				'<div class=\'notation two-thirds\'>{{full_name}}</div>' +
				'<div class=\'notation two-thirds\'>{{address}}</div>' +
				'{{#buy_register}}' +
				'<h4 class=\'centered\'>РЕЄСТР<br>купленої iноземної валюти<br>за {{date}}</h4>' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<td>№ з/п</td>' +
							'<td class=\'med-col\'>Час здійснення операції</td>' +
							'<td class=\'med-col\'>Назва іноземної валюти (код)</td>' +
							'<td class=\'med-col\'>Сума іноземної валюти</td>' +
							'<td>Курс</td>' +
							'<td class=\'med-col\'>Сума виданих гривень</td>' +
							'<td class=\'big-col\'>Номер виданої довідки/ квитанції/ квитанції платіжного пристрою</td>' +
							'<td class=\'med-col\'>Відмітка про сторно</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'{{#operations}}' +
							'{{#newpage}}' +
					'</tbody>' +
				'</table>' +
			'</div>' +
			'<div class=pbreak></div>' +
			'<div class=\'page\'>' +
				'<br><br>' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<td>№ з/п</td>' +
							'<td class=\'med-col\'>Час здійснення операції</td>' +
							'<td class=\'med-col\'>Назва іноземної валюти (код)</td>' +
							'<td class=\'med-col\'>Сума іноземної валюти</td>' +
							'<td>Курс</td>' +
							'<td class=\'med-col\'>Сума виданих гривень</td>' +
							'<td class=\'big-col\'>Номер виданої довідки/ квитанції/ квитанції платіжного пристрою</td>' +
							'<td class=\'med-col\'>Відмітка про сторно</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
							'{{/newpage}}' +
						'<tr>' +
							'<td>{{num}}</td>' +
							'<td>{{time}}</td>' +
							'<td>{{currency}}({{code}})</td>' +
							'<td>{{amount}}</td>' +
							'<td>{{rate}}</td>' +
							'<td>{{equivalent}}</td>' +
							'<td>{{#certificate_code}}{{{.}}} / {{/certificate_code}}{{num_eop}}</td>' +
							'<td>{{storno}}</td>' +
						'</tr>' +
						'{{/operations}}' +
					'</tbody>' +
				'</table>' +
				'{{/buy_register}}' +


				'{{^buy_register}}' +
				'<h4 class=\'centered\'>РЕЄСТР<br>проданої iноземної валюти<br>за {{date}}</h4>' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<td>№ з/п</td>' +
							'<td class=\'med-col\'>Час здійснення операції</td>' +
							'<td class=\'med-col\'>Номер виданої квитанції</td>' +
							'<td class=\'med-col\'>Сума виданих гривень</td>' +
							'<td class=\'med-col\'>Назва іноземної валюти (код)</td>' +
							'<td class=\'med-col\'>Сума іноземної валюти</td>' +
							'<td class=\'med-col\'>Курс</td>' +
							'<td class=\'med-col\'>Номер одержаної довідки</td>' +
							'<td class=\'med-col\'>Відмітка про сторно</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'{{#operations}}' +
							'{{#newpage}}' +
					'</tbody>' +
				'</table>' +
			'</div>' +
			'<div class=pbreak></div>' +
			'<div class=\'page\'>' +
				'<br><br>' +
				'<table>' +
					'<thead>' +
						'<tr>' +
							'<td>№ з/п</td>' +
							'<td class=\'med-col\'>Час здійснення операції</td>' +
							'<td class=\'med-col\'>Номер виданої квитанції</td>' +
							'<td class=\'med-col\'>Сума виданих гривень</td>' +
							'<td class=\'med-col\'>Назва іноземної валюти (код)</td>' +
							'<td class=\'med-col\'>Сума іноземної валюти</td>' +
							'<td class=\'med-col\'>Курс</td>' +
							'<td class=\'med-col\'>Номер одержаної довідки</td>' +
							'<td class=\'med-col\'>Відмітка про сторно</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
							'{{/newpage}}' +
						'<tr>' +
							'<td>{{num}}</td>' +
							'<td>{{time}}</td>' +
							'<td>{{num_eop}}</td>' +
							'<td>{{equivalent}}</td>' +
							'<td>{{currency}}({{code}})</td>' +
							'<td>{{amount}}</td>' +
							'<td>{{rate}}</td>' +
							'<td>{{certificate_code}}</td>' +
							'<td>{{storno}}</td>' +
						'</tr>' +
						'{{/operations}}' +
					'</tbody>' +
				'</table>' +
				'{{/buy_register}} ' +
				'<br>' +
				'<table>' +
					'<tbody>' +
						'{{ #totals }}' +
						'<tr>' +
							'<td>{{#first_total}}ІТОГО по:{{/first_total}}</td>' +
							'<td>{{ currency }}</td>' +
							'<td>{{ equivalent }} грн.</td>' +
							'<td>{{ amount }} {{ currency }}</td>' +
						'</tr>' +
						'{{ /totals }}' +
						'<tr>' +
							'<td>IТОГО по гривнi:</td>' +
							'<td></td>' +
							'<td>{{ big_total }} грн.</td>' +
							'<td></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
				'<br>' +
				'<div class=\'notation\'>Підпис касира ________________</div>' +
				'<br>' +
				'<div class=\'notation\'>Місце для відбитка штампа*</div>' +
				'<br>' +
				'<div class=\'notation\'>______________________</div>' +
				'<div class=\'notation\'>* Для електронного документа, який має електронний підпис касира, реквізит не проставляється.</div>' +
			'</div>',
	register2019 :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:100%;' +
		'}' +
		'@page  ' +
		'{ ' +
		'    size: auto;   /* auto is the initial value */ ' +
		 '   margin: 10mm 5mm 10mm 5mm;  ' +
		'} ' +
		'</style>' +
		'</head>' +
			'<div class="page">' +
				'<div class=\'notation two-thirds\'>{{company}}</div>' +
				'<div class=\'notation two-thirds\'>{{full_name}}</div>' +
				'<div class=\'notation two-thirds\'>{{address}}</div>' +
				'<div class=\'descriptive-field notation two-thirds\'><hr>(найменування та місцезнаходження банку, небанківської фінансової установи, ' +
				'оператора поштового зв\'язку, їх відокремленого підрозділу)</div>' +
				'{{#buy_register}}' +
				'<h4 class=\'centered\'>РЕЄСТР<br>купленої та/або проданої готівкової іноземної валюти<br>за {{date}}</h4>' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<tbody>' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td style="width:5%; vertical-align:top">№ з/п</td>' +
							'<td style="width:12%; vertical-align:top">Час здійснення операції</td>' +
							'<td style="width:12%; vertical-align:top">Назва іноземної валюти (код)</td>' +
							'<td style="width:12%; vertical-align:top">Сума іноземної валюти</td>' +
							'<td style="width:10%; vertical-align:top">Курс</td>' +
							'<td style="width:12%; vertical-align:top">Сума гривень</td>' +
							'<td style="width:12%; vertical-align:top">Номер виданого касового документа</td>' +
							'<td style="width:10%; vertical-align:top">Вид операції (0 - купівля, 1 - продаж)</td>' +
							'<td style="width:15%; vertical-align:top">Відмітка про проведення операції сторно</td>' +
						'</tr>' +
				// 	'</thead>' +
				// '</table>' +
				// '<table style="border-collapse: collapse; border:2pt solid black;">' +
				// 	'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:12%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">8</td>' +
							'<td style="width:15%; vertical-align:top">9</td>' +
						'</tr>' +
					// '</thead>' +
					// '<tbody>' +
						'{{#operations}}' +
							'{{#newpage}}' +
					'</tbody>' +
				'</table>' +
			'</div>' +
			'<div class=pbreak></div>' +
			'<div class=\'page\'>' +
				'<br><br>' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:12%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">8</td>' +
							'<td style="width:15%; vertical-align:top">9</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
							'{{/newpage}}' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td>{{num}}</td>' +
							'<td>{{time}}</td>' +
							'<td>{{currency}} ({{code}})</td>' +
							'<td>{{amount}}</td>' +
							'<td>{{rate}}</td>' +
							'<td>{{equivalent}}</td>' +
							'<td>{{num_eop}}</td>' +
							'<td>{{type_op}}</td>' +
							'<td>{{storno}}</td>' +
						'</tr>' +
						'{{/operations}}' +
					// '</tbody>' +
					// '<tfoot style="border-collapse: collapse; border:2pt solid black;">' +
						'{{ #totals }}' +
						'<tr style="border-collapse: collapse; {{#first_total}}border:1pt solid black; border-top: 2pt solid black;{{/first_total}}{{#nofirst_total}}border:1pt solid black;{{/nofirst_total}}">' +
							'<td style="border-collapse: collapse; border:1pt solid black;"></td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{#first_total}}Усього{{/first_total}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{currency}} ({{code}})</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{amount_in}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{equivalent_in}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">0</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
						'</tr>' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td style="border-collapse: collapse; border:1pt solid black;"></td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;"></td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{currency}} ({{code}})</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{amount_out}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{equivalent_out}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">1</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
						'</tr>' +
						'{{ /totals }}' +
					'</tbody>'+
				'</table>' +
				'{{/buy_register}}' +


				'{{^buy_register}}' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:12%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">8</td>' +
							'<td style="width:15%; vertical-align:top">9</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'{{#operations}}' +
							'{{#newpage}}' +
					'</tbody>' +
				'</table>' +
			'</div>' +
			'<div class=pbreak></div>' +
			'<div class=\'page\'>' +
				'<br><br>' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:12%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">8</td>' +
							'<td style="width:15%; vertical-align:top">9</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
							'{{/newpage}}' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td>{{num}}</td>' +
							'<td>{{time}}</td>' +
							'<td>{{currency}} ({{code}})</td>' +
							'<td>{{amount}}</td>' +
							'<td>{{rate}}</td>' +
							'<td>{{equivalent}}</td>' +
							'<td>{{num_eop}}</td>' +
							'<td>{{type_op}}</td>' +
							'<td>{{storno}}</td>' +
						'</tr>' +
						'{{/operations}}' +
					'</tbody>' +
					'<tfoot>' +
						'{{ #totals }}' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td></td>' +
							'<td>{{#first_total}}Усього{{/first_total}}</td>' +
							'<td>{{currency}} ({{code}})</td>' +
							'<td>{{amount_in}}</td>' +
							'<td>X</td>' +
							'<td>{{equivalent_in}}</td>' +
							'<td>X</td>' +
							'<td>0</td>' +
							'<td>X</td>' +
						'</tr>' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td></td>' +
							'<td></td>' +
							'<td>{{currency}} ({{code}})</td>' +
							'<td>{{amount_out}}</td>' +
							'<td>X</td>' +
							'<td>{{equivalent_out}}</td>' +
							'<td>X</td>' +
							'<td>1</td>' +
							'<td>X</td>' +
						'</tr>' +
						'{{ /totals }}' +
					'</tfoot>'+
				'</table>' +
				'{{/buy_register}} ' +
				'<br>' +
				'<table style="border-collapse: collapse; border:1pt solid black;">' +
					'<tbody>' +
						'<tr style="border-collapse: collapse; border:none;">' +
							'<td style="width:22%; text-align:left; vertical-align:top; border-collapse: collapse; border:none;">Усього куплено/<br>продано за валютою</td>' +
							'<td style="width:12%; text-align:center; vertical-align:top; border-collapse: collapse; border:1pt solid black;">UAH (980)</td>' +
							'<td style="width:66%; text-align:left; vertical-align:top; border-collapse: collapse; border:1pt solid black;"> {{ big_total_in_txt }} /<br> {{ big_total_out_txt }}</td>' +
						'</tr>' +
						'{{ #totals }}' +
						'<tr style="border-collapse: collapse; border:none;">' +
							'<td style="width:22%; text-align:left; vertical-align:top; border-collapse: collapse; border:none;"></td>' +
							'<td style="width:12%; text-align:center; vertical-align:top; border-collapse: collapse; border:1pt solid black;">{{currency}} ({{code}})</td>' +
							'<td style="width:66%; text-align:left; vertical-align:top; border-collapse: collapse; border:1pt solid black;"> {{ amount_in_txt }} /<br> {{ amount_out_txt }}</td>' +
						'</tr>' +
						'{{ /totals }}' +
					'</tbody>' +
				'</table>' +
				'{{ #show_prro_text }}' +
				'<table style="border-collapse: collapse; border:none">' +
					'<tbody>' +
						'<tr style="border-collapse: collapse; border:none;">' +
							'<td style="width:100%; text-align:left; vertical-align:top; border-collapse: collapse; border:none;">' +
								'Зазначені в реєстрі операції проведені касовим працівником {{ operator }}, підписані ЕП відділення {{ prro_public_key }} та фіскалізовані сервером ДПС. ' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
				'{{ /show_prro_text }}' +
				'<br><br>' +
				'<div class=\'notation\'>' +
						'<div class=\'left-float\'>' +
							'<span>Касир: </span>' +
							'<span>{{ operator }}</span>' +
						'</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float quorter descriptive-field centered\'><hr>(підпис)</div>' +
						'</div>	' +
						'<br><br>' +
						'<!-- <div class=\'right-float half descriptive-field centered\'>Мiсце для вiдбитка штампа</div> -->' +
						'<br><br>' +
				'</div>' +
			'</div>',

	payment_register :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:100%;' +
		'}' +
		'@page  ' +
		'{ ' +
		'    size: auto;   /* auto is the initial value */ ' +
		 '   margin: 10mm 5mm 10mm 5mm;  ' +
		'} ' +
		'</style>' +
		'</head>' +
			'<div class="page">' +
				'<div class=\'notation half\'>{{company}}</div>' +
				'<div class=\'notation half\'>{{full_name}}</div>' +
				'<div class=\'notation half\'>{{address}}</div>' +
				'<div class=\'descriptive-field notation half\'><hr>(найменування та місцезнаходження банку, небанківської фінансової установи, ' +
				'оператора поштового зв\'язку, їх відокремленого підрозділу)</div>' +
				'{{#buy_register}}' +
				'<h4 class=\'centered\'>РЕЄСТР<br>прийнятих платежiв<br>за {{date}}</h4>' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<tbody>' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td style="width:5%; vertical-align:top">№ з/п</td>' +
							'<td style="width:12%; vertical-align:top">Час здійснення операції</td>' +
							'<td style="width:12%; vertical-align:top">Номер квит.</td>' +
							'<td style="width:27%; vertical-align:top">Послуга</td>' +
							'<td style="width:10%; vertical-align:top">Сума переказу</td>' +
							'<td style="width:12%; vertical-align:top">Комісійна винагорода</td>' +
							'<td style="width:12%; vertical-align:top">Прийнята сума</td>' +
							'<td style="width:10%; vertical-align:top">Відмітка про скасування</td>' +
						'</tr>' +
				// 	'</thead>' +
				// '</table>' +
				// '<table style="border-collapse: collapse; border:2pt solid black;">' +
				// 	'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:27%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">8</td>' +
						'</tr>' +
					// '</thead>' +
					// '<tbody>' +
						'{{#operations}}' +
							'{{#newpage}}' +
					'</tbody>' +
				'</table>' +
			'</div>' +
			'<div class=pbreak></div>' +
			'<div class=\'page\'>' +
				'<br><br>' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:27%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">8</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
							'{{/newpage}}' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td>{{num}}</td>' +
							'<td>{{time}}</td>' +
							'<td>{{num_eop}}</td>' +
							'<td>{{service_name}}</td>' +
							'<td>{{currency_amount}}</td>' +
							'<td>{{commission_amount}}</td>' +
							'<td>{{payment_amount}}</td>' +
							'<td>{{cancel}}</td>' +
						'</tr>' +
						'{{/operations}}' +
					// '</tbody>' +
					// '<tfoot style="border-collapse: collapse; border:2pt solid black;">' +
						'<tr style="border-collapse: collapse; border:1pt solid black; border-top: 2pt solid black;">' +
							'<td style="border-collapse: collapse; border:1pt solid black;"></td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">Усього</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{total_currency_amount}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{total_commission_amount}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{total_payment_amount}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
						'</tr>' +
					'</tbody>'+
				'</table>' +
				'{{/buy_register}}' +


				'{{^buy_register}}' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:27%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">7</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
						'{{#operations}}' +
							'{{#newpage}}' +
					'</tbody>' +
				'</table>' +
			'</div>' +
			'<div class=pbreak></div>' +
			'<div class=\'page\'>' +
				'<br><br>' +
				'<table style="border-collapse: collapse; border:2pt solid black;">' +
					'<thead>' +
						'<tr style="border-collapse: collapse; border:2pt solid black;">' +
							'<td style="width:5%; vertical-align:top">1</td>' +
							'<td style="width:12%; vertical-align:top">2</td>' +
							'<td style="width:12%; vertical-align:top">3</td>' +
							'<td style="width:27%; vertical-align:top">4</td>' +
							'<td style="width:10%; vertical-align:top">5</td>' +
							'<td style="width:12%; vertical-align:top">6</td>' +
							'<td style="width:12%; vertical-align:top">7</td>' +
							'<td style="width:10%; vertical-align:top">7</td>' +
						'</tr>' +
					'</thead>' +
					'<tbody>' +
							'{{/newpage}}' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td>{{num}}</td>' +
							'<td>{{time}}</td>' +
							'<td>{{num_eop}}</td>' +
							'<td>{{service_name}}</td>' +
							'<td>{{currency_amount}}</td>' +
							'<td>{{commission_amount}}</td>' +
							'<td>{{payment_amount}}</td>' +
							'<td>{{cancel}}</td>' +
						'</tr>' +
						'{{/operations}}' +
					'</tbody>' +
					'<tfoot>' +
						'<tr style="border-collapse: collapse; border:1pt solid black;">' +
							'<td style="border-collapse: collapse; border:1pt solid black;"></td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">Усього</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{total_currency_amount}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{total_commission_amount}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">{{total_payment_amount}}</td>' +
							'<td style="border-collapse: collapse; border:1pt solid black;">X</td>' +
						'</tr>' +
					'</tfoot>'+
				'</table>' +
				'{{/buy_register}} ' +
				'{{ #show_prro_text }}' +
				'<table style="border-collapse: collapse; border:none">' +
					'<tbody>' +
						'<tr style="border-collapse: collapse; border:none;">' +
							'<td style="width:100%; text-align:left; vertical-align:top; border-collapse: collapse; border:none;">' +
								'Зазначені в реєстрі операції проведені касовим працівником {{ operator }}, підписані ЕП відділення {{ prro_public_key }} та фіскалізовані сервером ДПС. ' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
				'{{ /show_prro_text }}' +
				'<br>' +
				'<br><br>' +
				'<div class=\'notation\'>' +
						'<div class=\'left-float\'>' +
							'<span>Касир: </span>' +
							'<span>{{ operator }}</span>' +
						'</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float quorter descriptive-field centered\'><hr>(підпис)</div>' +
						'</div>	' +
						// '<br><br>' +
                        // '<div class=\'right-float half descriptive-field centered\'>Мiсце для вiдбитка штампа</div>' +
						// '<br><br>' +
				'</div>' +
			'</div>',

	cashflow :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double}}' +
			'.column{' +
				'padding-top:3%;' +
				'margin-bottom: 2%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
		'{{/double}}' +
		'{{^double}}' +
			'.column{' +
				'float: left;' +
				'padding: 2%;' +
				'width:50%;' +
			'}' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
		'{{/double}}' +
		'table {' +
			'font-size: 100%;' +
		'}' +
		'</style>' +
		'<body>' +
			'<div class="page">' +
				'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
					'<div class=\'notation\'>' +
					'</div>' +
					'<h4>' +
						'<span class=\'{{income_class}}\'>ПРИБУТКОВО</span>' +
						'<span> - </span>' +
						'<span class=\'{{outcome_class}}\'>ВИДАТКОВИЙ</span>' +
						'<span> касовий ордер № {{order_num}}</span>' +
					'</h4>' +
					'<div class=\'notation\'>' +
						'<div>{{date}}</div>' +
					'</div>' +
					'<div class=\'two-thirds\'>{{company}}</div>' +
					'<div class=\'two-thirds\'>{{full_name}}</div>' +
					'<div class=\'two-thirds\'>{{address}}</div>' +
					'<table style="border-collapse: collapse; border:1pt solid black;">' +
						'<thead>' +
							'<tr style="border-collapse: collapse; border:1pt solid black;">' +
								'<td class=\'med-col\'>Назва валюти/банкiвського металу*</td>' +
								'<td class=\'med-col\'></td>' +
								'<td class=\'med-col\'>№ рахунку</td>' +
								'<td class=\'med-col\'>Сума/маса*</td>' +
								'<td class=\'med-col\'>Еквівалент у гривнях/вартiсть у гривнях (облiкова)*</td>' +
							'</tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr style="border-collapse: collapse; border:1pt solid black;">' +
								'<td class=\'med-col\'>{{currency}}</td>' +
								'<td class=\'med-col\'>{{up_opname}}</td>' +
								'<td class=\'med-col\'>{{up_acc}}</td>' +
								'<td class=\'med-col\'>{{amount}}</td>' +
								'<td class=\'med-col\'>---------</td>' +
							'</tr>' +
							'<tr style="border-collapse: collapse; border:1pt solid black;">' +
								'<td class=\'med-col\'></td>' +
								'<td class=\'med-col\'>{{low_opname}}</td>' +
								'<td class=\'med-col\'>{{low_acc}}</td>' +
								'<td class=\'med-col\'></td>' +
								'<td class=\'med-col\'></td>' +
							'</tr>' +
							'<tr style="border-collapse: collapse; border:1pt solid black;">' +
								'<td class=\'med-col\' colspan=3>Загальна сума/маса банкiвського металу* (цифрами)</td>' +
								'<td class=\'med-col\'>{{amount}}</td>' +
								'<td class=\'med-col\'>---------</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<div class=\'notation\'>' +
						'<div class=\'left-float\'>' +
							'<span class=\'{{outcome_class}}\'>Отримувач</span>' +
							'<span>/</span>' +
							'<span class=\'{{income_class}}\'>Платник</span>' +
						'</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float hr two-thirds\'>&nbsp;{{ collector }}</div>' +
						'</div>	' +
						'<br><br>' +
						'<div class=\'left-float\'>Загальна сума/маса банкiвського металу*</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float hr\'>&nbsp;{{total_words}}</div>' +
						'</div>	' +
						'<br><br>' +
						'<div class=\'left-float\'>Зміст операції</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float hr two-thirds\'>&nbsp;{{zmist}}</div>' +//
						'</div>	' +
						'<br><br>' +
						'<div class=\'left-float\'>Кiлькiсть iнкасаторських сумок**</div>'+
						'<div class=\'centered\'>' +
							'<div class=\'left-float hr quorter\'>.</div>' +
						'</div>' +
						'<br><br>' +
						'<div class=\'left-float\'>Пред&#39;явлений документ</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float hr two-thirds\'>{{collector_doc}}</div>' +
						'</div>' +
						'<br><br>' +
						'<div class=\'left-float\'>' +
							'<span>Підпис </span>' +
							'<span class=\'{{income_class}}\'>платника</span>' +
							'<span>/</span>' +
							'<span class=\'{{outcome_class}}\'>отримувача</span>' +
						'</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float hr quorter\'>.</div>' +
						'</div>	' +
						'<div class=\'left-float\'>' +
							'<span>&nbsp;&nbsp; Підпис </span>' +
							'<span>касира</span>' +
						'</div>' +
						'<div class=\'centered\'>' +
							'<div class=\'left-float hr quorter\'>.</div>' +
						'</div>	' +
						'<br><br>' +
						// '<div class=\'left-float\'>Підписи банку</div>' +
						// '<div class=\'centered\'>' +
						// 	'<div class=\'left-float hr quorter\'>.</div>' +
						// '</div>' +
						// '<br><br>' +
						'<div class=\'left-float\'>* Зазначається в разі здiйснення операцiй з банкiвськими металами.</div><br>' +
						'<div class=\'left-float\'>** Зазначається в разі видачі інкасаторам інкасаторських сумок iз готівкою для їх перевезення.</div>' +
					'</div>' +
					'<br>' +
				'</div>' +
				'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',
	certificate :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double}}' +
			'.column-cert{' +
				'float: left;' +
				'padding: 2%;' +
				'width:50%;' +
			'}' +
		'{{/double}}' +
		'{{^double}}' +
			'body {' +
				'height: auto;' +
			'}' +
			'.column-cert{' +
				'float: both;' +
				'width:100%;' +
				'padding-top:2%;' +
				'overflow: auto;' +
			'}' +
			'.cut-line{' +
				'border-bottom: 2px dashed black;' +
				'margin: 0%;' +
			'}' +
		'{{/double}}' +
		'div.padded{' +
			'padding: 0 0.5%' +
		'}' +
		'h4 {' +
			'text-align: center;' +
			'margin-top: 0%;' +
			'margin-bottom: 0%;' +
		'}' +
		'hr{' +
			'margin-bottom: 0;' +
		'}' +
		'p{' +
			'margin:0.15% 0;' +
			'text-indent: 1%;' +
		'}' +
		'br{' +
			'content: " ";' +
			'display: block;' +
			'margin: 0 0;' +
		'}' +
		'</style>' +
		'<body>' +
		'<div class="page">' +
		'{{#columns}}' +
			'<div class=\'column-cert\'>' +
				'<div class=\'auto-overflow\'>' +
					'<div class=\'left-float half\'>' +
						'<span>{{company}}</span><br>' +
						'<span>{{full_name}}</span><br>' +
						'<span>{{address}}</span>' +
					'</div>' +
					'<div class=\'right-float half\'>' +
						'<span>Примірник №{{num}}</span><br>' +
						'<span>Форма № 377</span><br>' +
						'<span>(дійсна протягом шести місяців)</span>' +
					'</div>' +
				'</div>' +
				'<h4 class=\'centered\'>ДОВІДКА-CERTIFICATE № {{certificate_number}}</h4>' +
				'<h4 class=\'centered\'>{{ date }} року</h4>' +
				'<div class=\'left-float\'>' +
					'<span>Обміняно</span>' +
					'<br>' +
					'<span>Exchanged</span>' +
				'</div>' +
				'<div class=\'centered auto-overflow\'>' +
					'<div class=\'hr\'>{{amount}}</div>' +
					'<span>(назва валюти, сума цифрами і словами/currency, amount in figures and in words)</span>' +
				'</div><br>' +
				'<div class=\'left-float\'>' +
					'<span>Видано готівкові гривні</span>' +
					'<br>' +
					'<span>Hryvnias paid out</span>' +
				'</div>' +
				'<div class=\'centered auto-overflow\'>' +
					'<div class=\'hr\'>{{equivalent}}</div>' +
					'<span>(сума цифрами і словами/amount in figures and in words)</span>' +
				'</div><br>' +
				'<div class=\'left-float half centered padded auto-overflow\'>' +
					'<div class=\'hr\'>{{client}}</div>' +
					'<span>(прізвище, ім’я/surname, name)</span>' +
				'</div>' +
				'<div class=\'left-float half centered padded auto-overflow\'>' +
					'<div class=\'hr\'>{{country}}</div>' +
					'<span>(громадянство/citizenship)</span>' +
				'</div>' +
				'<div class=\'left-float half centered padded\'>' +
					'<hr>' +
					'<span>(підпис власника)</span>' +
					'<br>' +
					'<span>(holder’s signature) </span>' +
				'</div>' +
				'<div class=\'left-float half centered padded\'>' +
					'<hr>' +
					'<span>(підпис касира)</span>' +
					'<br>' +
					'<span>(cashier’s signature)</span>' +
				'</div>' +
				'<div class=\'right-align half centered auto-overflow\' style=\'padding:1% 0\'>' +
					'<span >Місце для відбитка штампа</span>' +
				'</div>' +
				'<div class=\'left-align\'>' +
					'<span>Обмін невикористаних гривень на іноземну валюту</span>' +
					'<br>' +
					'<span>Exchange of unspent hryvnias for foreign currency </span>' +
				'</div><br>' +
				'' +
				'<div class=\'auto-overflow\'>' +
					'<div class=\'left-float\'>' +
						'<span>Прийнято для обміну готівкові гривні</span>' +
						'<br>' +
						'<span>Hryvnias accepted for exchange</span>' +
					'</div>' +
					'<div class=\'centered\'>' +
						'<hr>' +
						'<span>(сума цифрами і словами/amount in figures and in words)</span>' +
					'</div>' +
				'</div>' +
				'<div class=\'auto-overflow\'>' +
					'<div class=\'left-float\'>' +
						'<span>З них видано готівковою валютою :</span><br>' +
						// '<span></span><br>' +
						'<span>Including paid out in cash:</span><br>' +
						// '<span> paid out in cash</span><br>' +
					'</div>' +
					'<div class=\'centered\'>' +
						'<br>' +
						'<hr>' +
					'</div>' +
				'</div>' +
				'<div class=\'auto-overflow\'>' +
					'<div class=\'left-float half centered padded\'>' +
						'<hr>' +
						'<span>(підпис власника)</span>' +
						'<br>' +
						'<span>(holder’s signature) </span>' +
					'</div>' +
					'<div class=\'left-float half centered padded\'>' +
						'<hr>' +
						'<span>(підпис касира)</span>' +
						'<br>' +
						'<span>(cashier’s signature)</span>' +
					'</div>' +
				'</div>' +
				'<div class=\'left-align\'>' +
					'<p>Заповнюється у двох примірниках (перший – видається клієнту, другий –залишається в уповноваженому банку, або в уповноваженій фінансовій установі, або в національного оператора поштового зв’язку).</p>' +
					'<p>Довідка видається фізичній особі-нерезиденту для підтвердження операцій із купівлі уповноваженим банком, або уповноваженою фінансовою установою, або національним оператором поштового зв’язку іноземної валюти за гривні.</p>' +
					'<p>Перший примірник дає право зворотного обміну невикористаних гривень на іноземну валюту протягом шести місяців.</p>' +
				'</div>' +
			'</div>' +
			'{{^clas}}' +
			'<div class=\'cut-line\'></div>' +
			'{{/clas}}' +
		'{{/columns}}' +
		'</div>' +
		'</body>' +
		'</html>',
	exchange :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 2%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 80%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 70%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{num}}</div>' +
						'<div class=\'notation\'>' +
							'<div class=\'two-thirds\'>{{company}}</div>' +
							'<div class=\'two-thirds\'>{{full_name}}</div>' +
							'<div class=\'two-thirds\'>{{address}}</div>' +
						'</div>' +
						'<h4 class=\'centered\'>КВИТАНЦIЯ № {{rro_id}}</h4>' +
						'<h4 class=\'centered\'>про здiйснення валютно-обмiнної операцiї*</h4>' +
						'<div class=\'notation\'>' +
							'<div>Дата та час здiйснення операцiї {{date}} {{time}}</div>' +
							'<div>Назва операцiї:	{{type}}</div>' +
						'</div>' +
						'<table border=1>' +
							'<thead>' +
								'<tr>' +
									'<td class=\'med-col\'>Прийнято</td>' +
									'<td class=\'med-col\' rowspan=2>Курс, крос-курс</td>' +
									'<td class=\'med-col\'>До видачі</td>' +
								'</tr>' +
								'<tr>' +
									'<td>назва валюти та сума</td>' +
									'<td>назва валюти та сума</td>' +
								'</tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr>' +
									'<td>{{ received }}</td>' +
									'<td>{{ rate }}</td>' +
									'<td>{{ give }}</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
							'<div class=\'left-float\'>Сума комісії</div><hr>' +
							'<div class=\'left-float\'>Клієнт**</div>' +
						'{{#client}}' +
							'<div class=\'centered\'>' +
								'<div class=\'left-float hr two-thirds\'>{{ . }}</div>' +
							'</div>	' +
						'{{/client}}' +
						'{{^client}}' +
							'<div class=\'centered descriptive-field\'>' +
								'<hr>[прізвище, ім’я та по батькові (за наявності) фізичної особи]' +
							'</div>' +
						'{{/client}}' +
							'<div class=\'annotation-field centered\'><hr>(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</div>' +
							'<div class=\'quorter descriptive-field centered\'><hr>(підпис клієнта)</div>' +

							// '<div class="fullwidth" style="display:block">' +
							// 	'<div class=\'two-thirds left-float descriptive-field\'>Надаю згоду на проведення валютно-обмінної операції без оформлення першого примірника квитанції про здійснення валютно-обмінної операції (примірника клієнта)</div>' +
							// 	'<div class=\'right-float quorter annotation-field centered\'><hr>(підпис клієнта проставляється в разі надання такої згоди)</div>' +
							// '</div>' +

							// '<br><br><br>' +
							'<div class=\'two-thirds left-float descriptive-field\'>Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377 </div>' +
							'<div class=\'right-float quorter annotation-field centered\'><hr>(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</div>' +

							'<br><br><br>' +
							'<div class=\'left-float half annotation-field centered\'><hr>(пiдпис працiвника уповноваженого банку/уповноваженої фiнансової установи)</div>' +
							'<div class=\'right-float half annotation-field centered\'>Мiсце для вiдбитка штампа</div>' +
							'<br><br>' +
							'<div class=\'left-float annotation-field\'>*Здiйснення операцiї з купiвлi у фiзичної особи-нерезидента готiвкової iноземної валюти без оформлення довiдки-certificate за формою №377 не дає пiдстав для зворотного обмiну.</div>' +
							'<div class=\'left-float annotation-field\'>** Реквізити заповнюються під час здійснення валютно-обмінної операції на суму, що дорівнює чи перевищує в еквіваленті {{ max_buy }} гривень.</div>' +
					'</div>' +
				'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	quotation :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:70%;' +
		'}' +
		'table td{' +
			'padding: 0;' +
		'}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
		'	<table style="border: none;">' +
		'		<tbody>' +
		'			<tr>' +
		'				<td style="border: none; width:30%;"><img src="{{ LOGO_IMAGE }}" width="{{ LOGO_WIDTH }}" height="{{ LOGO_HEIGHT }}" alt=""></td>' +
		'				<td style="border: none; width:70%;"><h2 class=\'center-align\'>{{company}}</h2><h3 class=\\\'centered\\\'>Витяг з наказу № {{order_num}} вiд {{date}}</h3></td>' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
			'<h4 class=\'center-align\'>Перелік валют, з якими працює {{full_name}} про встановлення </h4>' +
			'<div class=\'center-align\'>' +
                                'на {{date}} з {{time}} наступних курсiв обміну готівкової іноземної' +
                                ' валюти в {{company_short}}' +
			'</div>' +
			'<table style="border-collapse: collapse; border:2pt solid black;{{tablefont}}">' +
				'<thead>' +
					'<tr style="border-collapse: collapse; border:2pt solid black;">' +
						'<td><b>Код цифровий</b></td>' +
						'<td><b>Кількість одиниць</b></td>' +
						'<td><b>Назва валюти</b></td>' +
						'<td><b>КУРС КУПIВЛI</b></td>' +
						'<td><b>КУРС ПРОДАЖУ</b></td>' +
						'<td><b>Офіційний курс НБУ</b></td>' +
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'{{#currencies}}' +
					'<tr style="border-collapse: collapse; border:1pt solid black;">' +
						'<td>{{ numcode }}</td>' +
						'<td>за {{ degree }} {{ code }}</td>' +
						'<td>{{ name }}</td>' +
						'<td>{{ buy }}</td>' +
						'<td>{{ sell }}</td>  ' +
						'<td>{{ nbu }}</td>' +
					'</tr>' +
					'{{/currencies}}' +
				'</tbody>' +
			'</table>' +
		'	<table style="border: none;">' +
				'<tbody>' +
					'<tr style="border-collapse: collapse; border:none;">' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{director_title}}' +
							'<br>' +
							'{{company_short}}' +
						'</td>' +
						'<td style="border: none; width:60%;">' +
							'<img src="{{ STAMP_IMAGE }}" width="{{ STAMP_WIDTH }}" height="{{ STAMP_HEIGHT }}" alt="">' +
						'</td>' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{ director }}' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>' +
		'</div>' +
		'</body>' +
		'</html>',

	quotation_2020 :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:70%;' +
		'}' +
		'table td{' +
			'padding: 0;' +
		'}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
		'	<table style="border: none;">' +
		'		<tbody>' +
		'			<tr>' +
		'				<td style="border: none; width:30%;"><img src="{{ LOGO_IMAGE }}" width="{{ LOGO_WIDTH }}" height="{{ LOGO_HEIGHT }}" alt=""></td>' +
		'				<td style="border: none; width:70%;"><h2 class=\'center-align\'>{{company}}</h2><h3 class=\\\'centered\\\'>Наказ № {{order_num}} вiд {{doc_date}}</h3>' +
		'					<h3 class=\'centered\'>Про перелік та курси валют в структурному підрозділі</h3></td>' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
			// '<h4 class=\'center-align\'>Перелік валют, з якими працює {{full_name}} про встановлення </h4>' +
			// '<div class=\'center-align\'>' +
             //                    'на {{date}} з {{time}} наступних курсiв обміну готівкової іноземної' +
             //                    ' валюти в {{company_short}}' +
			// '</div>' +
						'<div class=\'center-align\'>' +
                                'Встановити з {{time}} {{date}} наступні курси обміну готівкової іноземної' +
                                ' валюти в структурному підрозділі {{company_short}}: {{full_name}}' +
                        '</div>' +
			'<table style="border-collapse: collapse; border:2pt solid black;{{tablefont}}">' +
				'<thead>' +
					'<tr style="border-collapse: collapse; border:2pt solid black;">' +
						'<td><b>Код цифровий</b></td>' +
						'<td><b>Кількість одиниць</b></td>' +
						'<td><b>Назва валюти</b></td>' +
						'<td><b>КУРС КУПIВЛI</b></td>' +
						'<td><b>КУРС ПРОДАЖУ</b></td>' +
						'<td><b>Офіційний курс НБУ</b></td>' +
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'{{#currencies}}' +
					'<tr style="border-collapse: collapse; border:1pt solid black;">' +
						'<td>{{ numcode }}</td>' +
						'<td>за {{ degree }} {{ code }}</td>' +
						'<td>{{ name }}</td>' +
						'<td>{{ buy }}</td>' +
						'<td>{{ sell }}</td>  ' +
						'<td>{{ nbu }}</td>' +
					'</tr>' +
					'{{/currencies}}' +
				'</tbody>' +
			'</table>' +
		'	<table style="border: none;">' +
				'<tbody>' +
					'<tr style="border-collapse: collapse; border:none;">' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{director_title}}' +
							'<br>' +
							'{{company_short}}' +
						'</td>' +
						'<td style="border: none; width:60%;">' +
							'<img src="{{ STAMP_IMAGE }}" width="{{ STAMP_WIDTH }}" height="{{ STAMP_HEIGHT }}" alt="">' +
						'</td>' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{ director }}' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>' +
		'</div>' +
		'</body>' +
		'</html>',
	order :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:60%;' +
		'}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
		'	<table style="border: none;">' +
		'		<tbody>' +
		'			<tr>' +
		'				<td style="border: none; width:30%;"><img src="{{ LOGO_IMAGE }}" width="{{ LOGO_WIDTH }}" height="{{ LOGO_HEIGHT }}" alt=""></td>' +
		'				<td style="border: none; width:70%;"><h2 class=\'center-align\'>{{company}}</h2><h2 class=\\\'centered\\\'>Наказ №{{order_num}} вiд {{doc_date}}</h2></td>' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
			'<div class=\'center-align\'>' +
                                'Встановити на {{date}} з {{time}} наступні курси обміну готівкової іноземної' +
                                ' валюти в {{company_short}} та структурних підрозділах (перелік) '+
                                'згідно Додатку №1 до цього наказу' +
                        '</div>' +
			'<table style="border-collapse: collapse; border:2pt solid black;">' +
				'<thead>' +
					'<tr style="border-collapse: collapse; border:2pt solid black;">' +
						'<td><b>Код цифровий</b></td>' +
						'<td><b>Кількість одиниць</b></td>' +
						'<td><b>Назва валюти</b></td>' +
						'<td><b>КУРС КУПIВЛI</b></td>' +
						'<td><b>КУРС ПРОДАЖУ</b></td>' +
						'<td><b>Офіційний курс НБУ</b></td>' +
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'{{#currencies}}' +
					'<tr style="border-collapse: collapse; border:1pt solid black;">' +
						'<td>{{ numcode }}</td>' +
						'<td>за {{ degree }} {{ code }}</td>' +
						'<td>{{ name }}</td>' +
						'<td>{{ buy }}</td>' +
						'<td>{{ sell }}</td>  ' +
						'<td>{{ nbu }}</td>' +
					'</tr>' +
					'{{/currencies}}' +
				'</tbody>' +
			'</table>' +
		'	<table style="border: none;">' +
				'<tbody>'+
					'<tr style="border-collapse: collapse; border:none;">' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{director_title}}' +
							'<br>' +
							'{{company_short}}' +
						'</td>' +
						'<td style="border: none; width:60%;">' +
							'<img src="{{ STAMP_IMAGE }}" width="{{ STAMP_WIDTH }}" height="{{ STAMP_HEIGHT }}" alt="">' +
						'</td>' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{ director }}' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>' +
		'</div>' +
		'</body>' +
		'</html>',
	dodatok1 :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:70%;' +
		'}' +
		'table td{' +
			'padding: 0;' +
		'}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
		'	<table style="border: none;">' +
		'		<tbody>' +
		'			<tr>' +
		'				<td style="border: none; width:30%;"><img src="{{ LOGO_IMAGE }}" width="{{ LOGO_WIDTH }}" height="{{ LOGO_HEIGHT }}" alt=""></td>' +
		'				<td style="border: none; width:70%;"><h2 class=\'center-align\'>{{company}}</h2><h3 class=\\\'centered\\\'>Додаток №1 до наказу № {{order_num}} вiд {{date}}</h3></td>' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
			'<h4 class=\'center-align\'>Перелік вiддiленнь:</h4>' +
			'<div align=\'justify\'>' +
                                '{{active_departments}}' +
                        '</div>' +
		'	<table style="border: none;">' +
				'<tbody>' +
					'<tr style="border-collapse: collapse; border:none;">' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{director_title}}' +
							'<br>' +
							'{{company_short}}' +
						'</td>' +
						'<td style="border: none; width:60%;">' +
							'<img src="{{ STAMP_IMAGE }}" width="{{ STAMP_WIDTH }}" height="{{ STAMP_HEIGHT }}" alt="">' +
						'</td>' +
						'<td style="border: none; width:20%; font-size:16px">' +
							'{{ director }}' +
						'</td>' +
					'</tr>' +
				'</tbody>' +
			'</table>' +
		'</div>' +
		'</body>' +
		'</html>',
	limits :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:85%;' +
		'}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
			'<h1 class=\'center-align\'>{{company}}</h1><br><br><br><br>' +
			'<h2 class=\'centered\'>Наказ № {{num_rasp}}</h2>' +
			'<table style="border-collapse: collapse; border: none; font-size:16px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">м. Київ</td>' +
						'<td style="text-align:right; border: none; width:50%">{{date}}</td>' +
					'</tr>' +
				'</thead>' +
			'</table><br><br>' +
			'<table style="border-collapse: collapse; border: none; font-size:14px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">Про встановлення ліміту <br>залишку готівки в касі</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<table style="border-collapse: collapse; border: none; font-size:16px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">&nbsp;&nbsp;&nbsp;&nbsp;Відповідно до положення про проведення касових операцій у національній валюті в Україні, затвердженого постановою Правління Національного банку України від 29.12.2017 №148,</td>' +
					'</tr>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">НАКАЗУЮ:</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<table style="border-collapse: collapse; border: none; font-size:16px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:right; border: none; width:10%; vertical-align:top">1.</td>' +
						'<td style="text-align:left; border: none; width:90%;">З {{date}} встановити ліміт залишку готівки в касі на {{full_name}} ({{address}}) у розмірі {{limit}} грн.</td>' +
					'</tr>' +
					'<tr style="border: none;">' +
						'<td style="text-align:right; border: none; width:10%; vertical-align:top">2.</td>' +
						'<td style="text-align:left; border: none; width:90%;">Установити строк здавання готівки – не пізніше наступного робочого дня.</td>' +
					'</tr>' +
					'<tr style="border: none;">' +
						'<td style="text-align:right; border: none; width:10%; vertical-align:top">3.</td>' +
						'<td style="text-align:left; border: none; width:90%;">Контроль за виконанням наказу залишаю за собою.</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<div class=\'centered\'>' +
				'<div class=\'inline-block bold quorter\'>' +
					'<span>{{director_title}}</span>' +
					'<br>' +
					'<span>{{company_short}}</span>' +
				'</div>' +
				'<div class=\'inline-block bold half\'>' +
					'<img src="{{ STAMP_IMAGE }}" width="{{ STAMP_WIDTH }}" height="{{ STAMP_HEIGHT }}" alt="">' +
				'</div>' +
				'<div class=\'inline-block bold quorter\'>' +
					'<span>{{ director }}</span>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'</body>' +
		'</html>',
	limits_currency :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:85%;' +
		'}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page">' +
			'<h3 class=\'center-align\'>{{company}}</h3>' +
			'<h3 class=\'centered\'>Наказ № {{num_rasp}}</h3>' +
			'<table style="border-collapse: collapse; border: none; font-size:14px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">м. Київ</td>' +
						'<td style="text-align:right; border: none; width:50%">{{date}}</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<table style="border-collapse: collapse; border: none; font-size:14px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">Про встановлення ліміту залишку готівки <br>в касі в іноземній валюті</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<table style="border-collapse: collapse; border: none; font-size:14px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">&nbsp;&nbsp;&nbsp;&nbsp;Відповідно до Правил використання готівкової іноземної валюти на території України, затверджених постановою Правління Національного банку України від 30.05.2007 №200,</td>' +
					'</tr>' +
					'<tr style="border: none;">' +
						'<td style="text-align:left; border: none; width:50%;">НАКАЗУЮ:</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<table style="border-collapse: collapse; border: none; font-size:14px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:right; border: none; width:10%; vertical-align:top">1.</td>' +
						'<td style="text-align:left; border: none; width:90%;">З {{date}} встановити ліміт залишку готівки в касі {{full_name}} ({{address}}) в іноземній валюті у наступних розмірах:</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<table style="border-collapse: collapse; border: none; font-size:11px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="border: none; width:10%"></td>' +
						'<td style="border: 1px solid; text-align:center; width:10%">№ з/п</td>' +
						'<td style="border: 1px solid; text-align:left; width:50%">Валюта</td>' +
						'<td style="border: 1px solid; text-align:right; width:20%">Розмір ліміту</td>' +
						'<td style="border: none; width:10%"></td>' +
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'{{#currencies}}' +
					'<tr style="border: none;">' +
						'<td style="border: none; width:10%"></td>' +
						'<td style="border: 1px solid; text-align:center; width:10%">{{ num }}</td>' +
						'<td style="border: 1px solid; text-align:left; width:50%">{{ curr_name }}</td>' +
						'<td style="border: 1px solid; text-align:right; width:20%">{{ limit }}</td>' +
						'<td style="border: none; width:10%"></td>' +
					'</tr>' +
					'{{/currencies}}' +
				'</tbody>' +
			'</table>' +
			'<table style="border-collapse: collapse; border: none; font-size:15px">' +
				'<thead>' +
					'<tr style="border: none;">' +
						'<td style="text-align:right; border: none; width:10%; vertical-align:top">2.</td>' +
						'<td style="text-align:left; border: none; width:90%;">Установити строк здавання готівки – не пізніше наступного робочого дня.</td>' +
					'</tr>' +
					'<tr style="border: none;">' +
						'<td style="text-align:right; border: none; width:10%; vertical-align:top">3.</td>' +
						'<td style="text-align:left; border: none; width:90%;">Контроль за виконанням наказу залишаю за собою.</td>' +
					'</tr>' +
				'</thead>' +
			'</table>' +
			'<div class=\'centered\'>' +
				'<div class=\'inline-block bold quorter\'>' +
					'<span>{{director_title}}</span>' +
					'<br>' +
					'<span>{{company_short}}</span>' +
				'</div>' +
				'<div class=\'inline-block bold half\'>' +
					'<img src="{{ STAMP_IMAGE }}" width="{{ STAMP_WIDTH }}" height="{{ STAMP_HEIGHT }}" alt="">' +
				'</div>' +
				'<div class=\'inline-block bold quorter\'>' +
					'<span>{{ director }}</span>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'</body>' +
		'</html>',

	titlePage :
		'{{>base}}' +
		'<style type="text/css">' +
		'table{' +
			'font-size:85%;' +
		'}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'<div class="page"><br><br><br><br><br><br><br><br><br><br>' +
			'<p class=\'center-align\' style="font-size:42px"><b>{{company_short}}</b></p><br><br><br><br>' +
			'<h2 class=\'center-align\'>{{full_name}}</h2><br><br><br><br>' +
			'<h1 class=\'center-align\'>КАСОВI ДОКУМЕНТИ</h1><br><br><br><br>' +
			'<h3 class=\'center-align\'>За перiод з {{date_from}} по {{date_end}} </h3>' +
		'</div>' +
		'</body>' +
		'</html>',

	anketa :
		'<html>' +
		'<head>' +
		'<meta http-equiv="content-type" content="text/html; charset=utf-8"/>' +
		'<title></title>' +
		'<style type="text/css">' +
		'@page { size: 21cm 29.7cm; margin-left: 2cm; margin-right: 1cm; margin-top: 1cm; margin-bottom: 1cm }' +
		'p { margin-bottom: 0.25cm; direction: ltr; line-height: 90%; text-align: left; orphans: 2; widows: 2; background: transparent }' +
		'p.western { font-family: "Times New Roman", serif; font-size: 12pt; so-language: ru-RU }' +
		'p.cjk { font-family: "Times New Roman"; font-size: 12pt; so-language: ar-SA }' +
		'p.ctl { font-family: "Times New Roman"; font-size: 12pt }' +
		'a:link { color: #000080; so-language: zxx; text-decoration: underline }' +
		'.center-align{'+
			'margin-right: auto;'+
			'margin-left: auto;'+
			'text-align: center;'+
		'}'+
				'table {'+
					'line-height: 0.5;'+
				'}'+
				'table tr {'+
					'line-height: 0.5;'+
				'}'+
				'table th,'+
				'table td {'+
					'line-height: 0.5;'+
				'}'+
				'table th {'+
					'line-height: 0.5;'+
				'}'+

		'</style>' +
		'</head>' +
		'<body lang="uk-UA" link="#000080" vlink="#800000" dir="ltr"><p lang="ru-RU" class="western" style="margin-left: 9.5cm; margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><b>ЗАТВЕРДЖЕНО</b></span></font></p>' +
		'<p lang="ru-RU" class="western" style="margin-left: 9.5cm; margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Наказом {{ company_short }}</span></font></p>' +
		'<p lang="ru-RU" class="western" style="margin-left: 9.5cm; margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">від 30.10.2020 № {{ number }}</span></p>' +
		// '<p lang="ru-RU" class="western" align="center" style="margin-bottom: 0cm; line-height: 150%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA"><b><h4 class="center-align">ВІДОМІСТЬ</h4></b></span></font></p>' +
		'<p lang="ru-RU" class="western" align="center" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA"><b>ознайомлення працівника, що залучений до проведення первинного ' +
		'фінансового моніторингу в </b></span></font><font face="Arial Narrow, serif"><span lang="uk-UA"><b>' +
		'{{ company_short }} </b></span></font><font face="Arial Narrow, serif"><span lang="uk-UA"><b>' +
		'(касовий працівник), із законодавством у сфері запобігання та протидії легалізації (відмиванню) доходів, ' +
		'одержаних злочинним шляхом, фінансуванню ' +
		'тероризму та фінансуванню розповсюдження ' +
		'зброї масового знищення, внутрішніми ' +
		'документами </b></span></font><font face="Arial Narrow, serif"><span lang="uk-UA"><b>' +
		'{{ company_short }}</b></span></font><font face="Arial Narrow, serif"><span lang="uk-UA"><b>' +
		' по фінансовому моніторингу та проведення навчання</b></span></font></p>' +
		'<br/>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-top: 0.21cm; margin-bottom: 0cm; line-height: 100%">' +
		' <font face="Arial Narrow, serif"><span lang="uk-UA">Я, ' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ operator }}</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		', ознайомився(лась) з:</span></font></p>' +
		'<ol>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Законом України </span></font><font face="Arial Narrow, serif"><span lang="uk-UA">&quot;Про ' +
		'запобігання та протидію легалізації ' +
		'(відмиванню) доходів, одержаних злочинним ' +
		'шляхом, фінансуванню тероризму та ' +
		'фінансуванню розповсюдження зброї ' +
		'масового знищення&quot; №361-ІХ від ' +
		'06.12.2019 року;</span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Постановою ' +
		'Правління Національного банку України ' +
		'«Про затвердження Положення про здійснення установами фінансового моніторингу» від 28.07.2020 № 107; </span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Міжнародними ' +
		'документами (рекомендаціями FATF, ' +
		'типологіями міжнародних організацій ' +
		'тощо) з питань запобігання та протидії ' +
		'легалізації (відмиванню) доходів, ' +
		'одержаних злочинним шляхом, фінансуванню ' +
		'тероризму та фінансуванню розповсюдження ' +
		'зброї масового знищення; </span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Правилами ' +
		'фінансового моніторингу ' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ company_short }}</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">;</span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Програмою ' +
		'проведення первинного фінансового моніторингу ' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ company_short }}</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">;</span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Порядком ' +
		'доступу до Правил фінансового ' +
		'моніторингу і Програми проведення первинного ' +
		'фінансового моніторингу; </span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Порядком ' +
		'реалізації персональних спеціальних економічних та інших обмежувальних заходів (санкцій) </span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ company_short }}</span></font><font face="Arial Narrow, serif"><span lang="uk-UA"></span></font><font face="Arial Narrow, serif"><span style="letter-spacing: 0.1pt"><span lang="uk-UA">;</span></span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Програмою ' +
		'</span></font><font face="Arial Narrow, serif"><span style="letter-spacing: 0.1pt"><span lang="uk-UA">навчання ' +
		'працівників </span></span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ company_short }}</span></font><font face="Arial Narrow, serif"><span lang="uk-UA"></span></font><font face="Arial Narrow, serif"><span style="letter-spacing: 0.1pt"><span lang="uk-UA">;</span></span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Обов’язками ' +
		'щодо ідентифікації та верифікації ' +
		'клієнтів (представників клієнтів); </span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%"><a name="_GoBack"></a>' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Заходами, ' +
		'засобами і прийомами належної перевірки клієнтів; </span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Програмою ' +
		'управління ризиками у сфері запобігання ' +
		'та протидії легалізації (відмиванню) ' +
		'доходів, одержаних злочинним шляхом, ' +
		'фінансуванню тероризму та фінансуванню ' +
		'розповсюдження зброї масового знищення; </span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Типологічними ' +
		'дослідженнями Державної служби ' +
		'фінансового моніторингу України;</span></font></p>' +
		'<li><p lang="ru-RU" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Звітами ' +
		'про проведення національної оцінки ' +
		'ризиків;</span></font></p>' +
		'</ol>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Попереджений(на) ' +
		'про відповідальність за порушення ' +
		'законодавства у сфері запобігання та ' +
		'протидії легалізації (відмиванню) ' +
		'доходів, одержаних злочинним шляхом, ' +
		'фінансуванню тероризму та фінансуванню ' +
		'розповсюдження зброї масового знищення. ' +
		'</span></font>' +
		'</p>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Попереджений(на) ' +
		'про наслідки виникнення конфлікту ' +
		'інтересів при </span></font><font face="Arial Narrow, serif"><span lang="uk-UA">вчиненні ' +
		'працівником фінансової установи ' +
		'будь-якого зобов\'язання на свою користь ' +
		'відповідно до вимог ст. 10 Закону України ' +
		'«Про фінансові послуги та державне ' +
		'регулювання ринків фінансових послуг». </span></font></p>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Ознайомлений(на) ' +
		'з наявними каналами комунікацій в ' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ company_short }}</span></font><font face="Arial Narrow, serif"><span lang="uk-UA"></span></font><font face="Arial Narrow, serif"><span style="letter-spacing: 0.1pt"><span lang="uk-UA">;</span></span></font>' +
		'для подання повідомлення про </span></font><font face="Arial Narrow, serif"><span lang="uk-UA">порушення ' +
		'у сфері протидії легалізації (відмиванню) доходів, ' +
		'одержаних злочинним шляхом, ' +
		'фінансуванню тероризму та фінансуванню ' +
		'розповсюдження зброї масового знищення </span></font></p>' +
		'<p lang="ru-RU" class="western" style="margin-top: 0.21cm; margin-bottom: 0.21cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Тривалість ' +
		'освітніх та практичних заходів: </span></font><font face="Arial Narrow, serif"><span lang="uk-UA"><b>2 ' +
		'год., 2 год. відповідно. </b></span></font></p>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Логін та ' +
		'пароль для роботи в програмному ' +
		'забезпеченні </span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ company_short }}</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">,</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		' у тому числі для проходження тестування ' +
		'отримав(ла).</span></font></p>' +
		'<br/>' +
		'<p lang="ru-RU" class="western" style="margin-bottom: 0cm; line-height: 100%">' +
		'   <font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt">{{ created }}</font></font><font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt">' +
		'                                          ' +
		'</font></font><font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA">______________________________' +
		'  </span></font></font><font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA">{{ operator_short }}</span></font></font></p>' +
		'<p lang="ru-RU" class="western" align="justify" style="text-indent: 6cm; margin-bottom: 0cm; line-height: 100%">' +
		' <font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA">(Підпис)</span></font></font></p>' +
		'<div style="page-break-before:always;">'+
		'<p lang="ru-RU" class="western" style="margin-left: 9.5cm; margin-bottom: 0cm; line-height: 70%">' +
		'<font face="Arial Narrow, serif"><b>ЗАТВЕРДЖЕНО</b></span></font></p>' +
		'<p lang="ru-RU" class="western" style="margin-left: 9.5cm; margin-bottom: 0cm; line-height: 70%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">Наказом ' +
		'</span></font><font face="Arial Narrow, serif"><span lang="uk-UA">' +
		'{{ company_short }}</span></font></p>' +
		'<p lang="ru-RU" class="western" style="margin-left: 9.5cm; margin-bottom: 0cm; line-height: 70%">' +
		'<font face="Arial Narrow, serif"><span lang="uk-UA">від 30.10.2020 ' +
		'№ </span></font><font face="Arial Narrow, serif"><span lang="uk-UA">{{ number }}</span></font></p>' +
		'<p lang="ru-RU" class="western" align="center" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA"><b><h4 class="center-align">Тестові питання</h4></b></span></font></font>' +
		'</p>' +
		'<p lang="ru-RU" class="western" align="center" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA"><b>на ' +
		'перевірку знань вимог законодавства у ' +
		'сфері запобігання та протидії легалізації ' +
		'(відмиванню) доходів, одержаних злочинним ' +
		'шляхом, фінансуванню тероризму та ' +
		'фінансуванню розповсюдження зброї ' +
		'масового знищення. </b></span></font></font></p>' +
		'<br/>' +
		'<table width="750" cellpadding="7" cellspacing="0">' +
		'<col width="700"/>' +
		'<col width="14"/>' +
		'<tr valign="top">' +
		'<td width="700" style="border: none; padding: 0cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA"><b>1.' +
		'Належна перевірка - заходи, ' +
		'що включають:</b></span></font></font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">А.' +
		'Ідентифікацію та верифікацію клієнта (його представника). </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm">'+
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Б.' +
		'Встановлення КБВ клієнта або його відсутності, у тому числі отримання структури власності з метою її розуміння, та даних, що дають змогу встановити КБВ, та вжиття заходів з верифікації його особи (за наявності). </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm">' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">В.' +
		'Встановлення (розуміння) мети та характеру майбутніх ділових відносин або проведення фінансової операції. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm">' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="14" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Г. ' +
		'Всі відповіді вірні. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center" style="margin-top: 0.11cm">' +
		'<font size="3" style="font-size: 12pt">+</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border: none; padding: 0cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA"><b>2. ' +
		'Від вчинення яких дій зобов’язаний відмовитись СПФМ?: </b></span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border-top: 1px solid #000000; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding: 0cm"</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">A.' +
		'Від встановлення (підтримання) ділових відносин, проведення фінансової операції якщо здійснення ідентифікації та/або верифікації клієнта, а також встановлення даних, що дають змогу встановити КБВ власників, є неможливим або якщо у СПФМ виникає сумнів стосовно того, що особа виступає від власного імені. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center">' +
		'<font size="3" style="font-size: 12pt">+</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="9" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Б.' +
		'Від проведення фінансової операції у разі, якщо фінансова операція містить ознаки такої, що згідно із Законом підлягає фінансовому моніторингу. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"></td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="4" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">B.' +
		'Від проведення підозрілої фінансової операції. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"></td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="5" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Г.' +
		'Всі відповіді вірні. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm">' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border: none; padding: 0cm"><p lang="ru-RU" align="justify" style="background: #ffffff">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA"><b>3.' +
		'За порушення порядку створення (ведення) та зберігання документів, у тому числі електронних, записів, даних, інформації у випадках, передбачених цим Законом, у тому числі у разі їх втрати або знищення до СПФМ може бути застосований штраф у таких розмірах: </b></span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border-top: 1px solid #000000; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding: 0cm"></td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" align="justify" style="background: #ffffff">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">А.' +
		'До 1 000 неоподатковуваних мінімумів доходів громадян. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center">' +
		'<font size="3" style="font-size: 12pt">{{ answer_3_a }}</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Б.' +
		'До 12 000 неоподатковуваних мінімумів доходів громадян.</span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center">' +
		'<font size="3" style="font-size: 12pt">{{ answer_3_b }}</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">В.' +
		'До 7 000 неоподатковуваних мінімумів доходів громадян.</span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center">' +
		'<font size="3" style="font-size: 12pt">{{ answer_3_c }}</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Г.' +
		'До 20 000 неоподатковуваних мінімумів доходів громадян.</span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center">' +
		'<font size="3" style="font-size: 12pt">{{ answer_3_d }}</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border: none; padding: 0cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA"><b>4.' +
		'Відомості про походження коштів, що використовуються для здійснення фінансових операцій (коштів, що використовувалися для набуття права власності на активи, що є предметом фінансових операцій) за допомогою СПФМ, які дають розуміння про джерела їх походження, підстави володіння/розпорядження ними (прав на них) особою це: ' +
		'</b></span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border-top: 1px solid #000000; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding: 0cm"</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">A.' +
		'Джерело статків (багатства). </span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"></td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Б.' +
		'Джерело коштів, пов’язаних з фінансовими операціями. </span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center">' +
		'<font size="3" style="font-size: 12pt">+</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">B.' +
		'Додаткова інформація. </span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western">' +
		'<br/>' +
		'</p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Г.' +
		'Інформація про активи клієнта.</span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm">' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" style="border: none; padding: 0cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA"><b>5.' +
		'У разі зупинення фінансової операції СПФМ, таке зупинення фінансових операцій здійснюється: </b></span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border-top: 1px solid #000000; border-bottom: 1px solid #000000; border-left: none; border-right: none; padding: 0cm">' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="4" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">A.' +
		'Без попереднього повідомлення клієнта на два робочі дні з дня зупинення включно. </span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western" align="center">' +
		'<font size="3" style="font-size: 12pt">+</font></p>' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="5" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Б.' +
		'З попереднім погодженням з клієнтом на п’ять робочих днів. </span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western">' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="5" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western" align="justify">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">B.' +
		'З попереднім повідомленням клієнта на п’ять робочих днів. </span></font></font>' +
		'</p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western">' +
		'</td>' +
		'</tr>' +
		'<tr valign="top">' +
		'<td width="700" height="7" style="border-top: none; border-bottom: none; border-left: none; border-right: 1px solid #000000; padding-top: 0cm; padding-bottom: 0cm; padding-left: 0cm; padding-right: 0.19cm"><p lang="ru-RU" class="western">' +
		'<font face="Arial Narrow, serif"><font size="1" style="font-size: 9pt"><span lang="uk-UA">Г.' +
		'Без попереднього погодження клієнта на три робочі дні з дня зупинення включно. </span></font></font></p>' +
		'</td>' +
		'<td width="14" style="border: 1px solid #000000; padding: 0cm 0.19cm"><p lang="ru-RU" class="western">' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA"><b>Тест ' +
		'складено: </b></span></font></font><font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA"><b>{{ operator }}</b></span></font></font><font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA"><i><u><b>' +
		'</b></u></i></span></font></font></p>' +
		'<br/>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt">{{ created }}</font></font><font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt">' +
		'                                                                     ' +
		'                      </font></font><font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA">______________________________</span></font></font></p>' +
		'<p lang="ru-RU" class="western" align="justify" style="text-indent: 5cm; margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA">(Підпис)</span></font></font></p>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA">Результат ' +
		'проходження тестування: вірних відповідей ' +
		' </span></font></font><font face="Arial Narrow, serif"><span lang="uk-UA"><u>{{ summ_otvetov }}</u></span></font></p>' +
		'<p lang="ru-RU" class="western" align="justify" style="margin-bottom: 0cm; line-height: 100%">' +
		'<font face="Arial Narrow, serif"><font size="2" style="font-size: 10pt"><span lang="uk-UA">Тест ' +
		'вважається зданим, при наданні працівником ' +
		'4 і більше правильних відповідей на ' +
		'питання тесту.</span></font></font></p>' +
		'</div>' +
		'</body>' +
		'</html>',

}

TEMPLATES.local_order = String(TEMPLATES.order)
	.replaceAll('{{order_num}}', '{{order_num}}/{{legal_number}}/{{update_id}}'),

TEMPLATES.local_dodatok1 = String(TEMPLATES.dodatok1)
	.replaceAll('{{order_num}}', '{{order_num}}/{{legal_number}}/{{update_id}}'),

TEMPLATES.local_quotation = String(TEMPLATES.quotation)
	.replaceAll('{{order_num}}', '{{order_num}}/{{legal_number}}/{{update_id}}'),

TEMPLATES.local_quotation_2020 = String(TEMPLATES.quotation_2020)
	.replaceAll('{{order_num}}', '{{order_num}}/{{legal_number}}/{{update_id}}'),

/////////////////////////////////////
MATRIX_TEMPLATES = {

	accounting_statement :
		'{{{company}}}\n' +
		'{{#full_name}}{{{.}}}\n{{/full_name}}\n' +
		'{{#address}}{{{.}}}\n{{/address}}\n' +
		'______________________________________________________________\n' +
		'(найменування та місцезнаходження уповноваженої фінансової \n' +
		'установи/національного оператора поштового зв\'язку/відокремленого  \n' +
		'підрозділу, пункту обміну іноземної валюти) \n' +


		'                     Звiтна довiдка про касовi обороти за день i залишки цiнностей\n' +
		'                                         за {{{date}}}\n\n' +
		'  +----+----+-----------+---------+---------+---------+---------+-------------------+-----------+\n' +
		'  | №  | Код|Залишок    |  Отримано валюти  |Куплено  |Продано  | Передано валюти   |Залишок    |\n' +
		'  |з/п | ва-|готiвки    |                   |вiдокре- |вiдокрем-|                   |готiвки в  |\n' +
		'  |    | лю-|в касi     +---------+---------+ мленим  |  леним  +---------+---------+касi       |\n' +
		'  |    | ти |вiдокрем-  |авансу на|підкріп- | пiдроз- |пiдроз-  | на      | про-    |вiдокрем-  |\n' +
		'  |    |    |леного     | початок |  лення  | дiлом,  | дiлом,  | кiнець  | тягом   |леного     |\n' +
		'  |    |    |пiдроздiлу,|робочого |протягом | пунктом | пунктом | робо-   | робо-   |пiдроз-    |\n' +
		'  |    |    |пунктi     |   дня   |робочого | обмiну  | обмiну  | чого    | чого    |дiлу,      |\n' +
		'  |    |    |обмiну     |         |   дня   | валюти  | валюти  | дня     | дня     |пунктi     |\n' +
		'  |    |    |валюти на  |         |         | iнозем- |iноземної|         |         |обмiну     |\n' +
		'  |    |    |початок дня|         |         |   ної   | валюти  |         |         |валюти на  |\n' +
		'  |    |    |           |         |         | валюти  |         |         |         |поточний   |\n' +
		'  |    |    |           |         |         |         |         |         |         |момент     |\n' +
		'  |    |    |           |         |         |         |         |         |         |часу/кiнець|\n' +
		'  |    |    |           |         |         |         |         |         |         |робочого   |\n' +
		'  |    |    |           |         |         |         |         |         |         |дня        |\n' +
		'  +----+----+-----------+---------+---------+---------+---------+---------+---------+-----------+\n' +
		'  | 1  | 2  |     3     |    4    |    5    |    6    |    7    |    8    |    9    |     10    |\n' +
		'  +----+----+-----------+---------+---------+---------+---------+---------+---------+-----------+\n' +
		'{{#currencies}}  |{{ind}}|{{code}}|{{initial}}|{{advance}}|{{income}}|{{bought}}|{{sold}}|{{endday}}|{{intraday}}|{{current}}|\n{{/currencies}}\n' +
		'  +----+----+-----------+---------+---------+---------+---------+---------+---------+-----------+\n\n\n' +
		'Касир {{{operator}}}________________\n' +
		'                       (пiдпис)\n\n\n\n\n' +
		'М. П.',
    exchange :
		'{{{company1}}}Примiрник № 1   | {{{company1}}}Примiрник № 2\n' +
		'{{#company2}}{{{.}}}| {{{.}}}\n{{/company2}}\n' +
		'{{#full_name}}{{{.}}}| {{{.}}}\n{{/full_name}}\n' +
		'{{#address}}{{{.}}}\n{{/address}}\n' +
		'                 КВИТАНЦIЯ № {{rro_id}}|                 КВИТАНЦIЯ № {{rro_id}}\n' +
		'          про здiйснення валютно-обмiнної операцiї*           |          про здiйснення валютно-обмiнної операцiї*\n' +
		'{{{datetime}}}| {{{datetime}}}\n' +
		'Назва операцiї:   {{type}}| Назва операцiї:   {{type}}\n' +
		'   +--------------------+------------+--------------------+   |    +--------------------+------------+--------------------+\n' +
		'   |      Прийнято      |    Курс,   |      До видачi     |   |    |      Прийнято      |    Курс,   |      До видачi     |\n' +
		'   +--------------------+  крос-курс +--------------------+   |    +--------------------+  крос-курс +--------------------+\n' +
		'   |назва валюти та сума|            |назва валюти та сума|   |    |назва валюти та сума|            |назва валюти та сума|\n' +
		'   +--------------------+------------+--------------------+   |    +--------------------+------------+--------------------+\n' +
		'   |{{{received}}}|{{{rate}}}|{{{give}}}|   |    |{{{received}}}|{{{rate}}}|{{{give}}}|\n' +
		'   +--------------------+------------+--------------------+   |    +--------------------+------------+--------------------+\n' +
		'Сума комiсiї ____________________                             | Сума комiсiї ______________________\n' +
		'Клiєнт**                                                      | Клiєнт**\n' +
		'{{{client}}} | {{{client}}}\n' +
		'(зазначаються додатковi реквiзити,необхiднi для проведения    | (зазначаються додатковi реквiзити,необхiднi для проведения\n' +
		'валютно-обмiнних операцiй)                                    | валютно-обмiнних операцiй)\n' +
		'______________________________     (Пiдпис клiєнта)           | ______________________________     (Пiдпис клiєнта)\n' +

        // 'Надаю згоду на проведення валютно-обмінної операції без оформ-| Надаю згоду на проведення валютно-обмінної операції без оформ-\n' +
        // 'лення першого примірника квитанції про здійснення валютно-       | лення першого примірника квитанції про здійснення валютно-    \n' +
        // 'обмінної операції (примірника клієнта)_______________________ | обмінної операції (примірника клієнта)_______________________\n' +
        // '(підпис клієнта проставляється в разі надання такої згоди)    | (підпис клієнта проставляється в разі надання такої згоди)\n' +

		'Надаю згоду на проведення операцiї з купiвлi iноземної валюти | Надаю згоду на проведення операцiї з купiвлi iноземної валюти\n' +
		'без оформлення довiдки-certificate за формою №377____________ | без оформлення довiдки-certificate за формою №377____________\n' +
		'                  (пiдпис клiєнта-нерезидента проставляється  |                   (пiдпис клiєнта-нерезидента проставляється\n' +
		'________________________________в разi надання такої згоди)   | ________________________________в разi надання такої згоди)\n' +
		'(пiдпис працiвника уповно-         Мiсце для вiдбитка         | (пiдпис працiвника уповно-         Мiсце для вiдбитка\n' +
		'важеної фiнансової установи)           штампа                 | важеної фiнансової установи)             штампа\n' +
		'*Здiйснення операцiї з купiвлi у фiзичної особи-нерезидента   | *Здiйснення операцiї з купiвлi у фiзичної особи-нерезидента\n' +
		'готiвкової iноземної валюти без оформлення довiдки-certifi-   | готiвкової iноземної валюти без оформлення довiдки-certifi-\n' +
		'cate за формою №377 не дає пiдстав для зворотного обмiну.     | cate за формою №377 не дає пiдстав для зворотного обмiну.\n' +
		'** Реквiзити заповнюються пiд час здiйснення валютно-обмiнної | ** Реквiзити заповнюються пiд час здiйснення валютно-обмiнної\n' +
		'операцiї на суму, що дорiвнює чи перевищує в еквiвалентi      | операцiї на суму, що дорiвнює чи перевищує в еквiвалентi\n' +
		'{{ max_buy }}| {{ max_buy }}',
    certificate :
		'{{#columns}}\n' +
		'                                                        Додаток 6\n' +
		'                                                        до iнструкцiї про порядок органiзацiї та здiйснення \n' +
		'                                                        валютно-обмiнних операцiй на територiї України\n' +
		'                                                        (пункт 10 роздiлу III)\n\n' +
		'                                                        Примiрник № {{num}}\n' +
		'                                                        Форма № 377 (дiйсна протягом шести мiсяцiв)\n' +
		'{{{company}}}\n' +
		'{{{full_name}}}\n' +
		'{{#address}}{{{.}}}\n{{/address}}  \n\n' +
		'(найменування та мiсцезнаходження структурного пiдроздiлу уповноваженого банку/уповноваженої фiнансової установи/\n' +
		'нацiонального оператора поштового зв\'язку)\n' +
		'(name and address of structural unit of authorised bank/financial institution)\n\n' +
		'                                       ДОВIДКА-CERTIFICATE № {{{certificate_number}}}\n' +
		'                                               {{{date}}} року\n\n' +
		'Обмiняно                      {{{amount}}}\n' +
		'Exchanged                     (назва валюти, сума цифрами i словами/currency, amount in figures and in words)\n' +
		'Видано готiвковi гривнi       {{{equivalent}}}\n' +
		'Hryvnias paid out                        (сума цифрами i словами/amount in figures and in words)\n\n' +
		'      {{{client}}}               {{{country}}}\n' +
		'            (прiзвище, iм\'я/surname, name)                        (громадянство/citizenship)\n' +
		'      _________________________________________               _________________________________________ \n' +
		'                  (пiдпис власника)                                        (пiдпис касира)\n' +
		'                 (holder\'s signature)                                   (cashier\'s signature)\n\n' +
		'Обмiн невикористаних гривень на iноземну валюту / Exchange of unspent hryvnias for foreign currency\n\n' +
		'Прийнято для обмiну готiвковi гривнi ______________________________________________________________________\n' +
		'Hryvnias accepted for exchange                (сума цифрами i словами/amount in figures and in words)\n\n' +
		'З них видано: готiвковою валютою __________________________________________________________\n' +
		'Including: paid out in cash\n\n' +
		'      _________________________________________               _________________________________________ \n' +
		'                  (пiдпис власника)                                        (пiдпис касира)\n' +
		'                 (holder\'s signature)                                   (cashier\'s signature)\n\n' +
		'Заповнюється у двох примiрниках (перший - видається клiєнту, другий - залишається в уповноваженому банку, \n' +
		'або в уповноваженiй фiнансовiй установi, або в нацiонального оператора поштового зв\'язку). Довiдка видається \n' +
		'фiзичнiй особi-нерезиденту для пiдтвердження операцiй iз купiвлi уповноваженим банком, або уповноваженою\n' +
		'фiнансовою установою, або нацiональним оператором поштового зв\'язку iноземної валюти за гривнi. Перший\n' +
		'примiрник дає право зворотного обмiну невикористаних гривень на iноземну валюту протягом шести мiсяцiв.\n\n\n{{/columns}}',
    cashflow :
		'                                                                       Додаток 9\n' +
		'                                                                       до Iнструкцiї про ведення \n' +
		'                                                                       касових операцiй банками в Українi    \n' +
		'                                         {{{income_class}}}ПРИБУТКОВО{{{income_class_end}}}    -    {{{outcome_class}}}ВИДАТКОВИЙ{{{outcome_class_end}}}            \n' +
		'                                             касовий ордер № {{order_num}}    \n' +
		'{{{date}}}\n' +
		'{{{company}}}\n' +
		'{{{full_name}}}\n' +
		'{{#address}}{{{.}}}\n{{/address}}  \n\n' +
		'  +----------------+------------+------------------------+------------------------+------------------------+\n' +
		'  |  Назва валюти  |            |       № рахунку        |           Сума         |  Еквівалент у гривнях  |\n' +
		'  +----------------+------------+------------------------+------------------------+------------------------+\n' +
		'  |{{currency}}|{{up_opname}}|{{up_acc}}|{{amount}}|       ---------        |\n' +
		'  +----------------+------------+------------------------+------------------------+------------------------+\n' +
		'  |                |{{low_opname}}|{{low_acc}}|                        |                        |\n' +
		'  +------------------------------------------------------+------------------------+------------------------+\n' +
		'  |                Загальна сума (цифрами)               |{{amount}}|       ---------        |\n' +
		'  +------------------------------------------------------+------------------------+------------------------+\n' +
		'\n' +
		'{{{outcome_class}}}Отримувач{{{outcome_class_end}}} / {{{income_class}}}Платник{{{income_class_end}}}    {{{collector}}}\n' +
		'Загальна сума     {{total_words}}\n' +
		'Зміст операції    {{zmist}}\n' +
		'Кiлькiсть iнкасаторських сумок ______\n' +
		'Пред\'явлений документ {{collector_doc}}\n' +
		'\n' +
		'Пiдпис {{{income_class}}}платника{{{income_class_end}}} / {{{outcome_class}}}Отримувача{{{outcome_class_end}}} _______________________________________________________\n' +
		'\n' +
		'Пiдписи банку              _______________________________________________________',
    register :
		'{{{company}}}\n' +
		'{{{full_name}}}\n' +
		'{{#address}}{{{.}}}\n{{/address}}  \n\n' +
		'                                    РЕЄСТР\n' +
		'{{#buy_register}}\n' +
		'                           купленої iноземної валюти\n' +
		'                                 за {{date}}\n' +
		'  +----+--------+--------+---------+----------+-----------+-------------------------------------+--------+\n' +
		'  |    |        |        |         |          |           |                                     |        |\n' +
		'  |    |  Час   | Назва  |         |          |           |                                     |        |\n' +
		'  |  № |здiйснен| iнозем-|  Сума   |          |   Сума    | Номер виданої довiдки / квитанцiї / |Вiдмiтка|\n' +
		'  | з/п|   ня   |  ної   |iноземної|   Курс   |  виданих  | квитанцiї платiжного пристрою       |  про   |\n' +
		'  |    |операцiї| валюти | валюти  |          |  гривень  |                                     | cторно |\n' +
		'  |    |        |  (код) |         |          |           |                                     |        |\n' +
		'  |    |        |        |         |          |           |                                     |        |\n' +
		'  +----+--------+--------+---------+----------+-----------+-------------------------------------+--------+\n' +
		'{{#operations}}  |{{num}}|{{time}}|{{currency}}({{code}})|{{amount}}|{{rate}}|{{equivalent}}|{{#certificate_code}}{{{.}}} /{{/certificate_code}}{{^certificate_code}}                    {{/certificate_code}}  {{num_eop}}  |{{storno}}|\n{{/operations}}\n' +
		'  +----+--------+--------+---------+----------+-----------+-------------------------------------+--------+\n\n' +
		'{{/buy_register}}\n' +
		'{{^buy_register}}\n' +
		'                           проданої iноземної валюти\n' +
		'                               за {{date}}\n' +
		'  +----+--------+------------------+-----------+--------+---------+----------+-----------------+--------+\n' +
		'  |    |        |                  |           | Назва  |         |          |                 |        |\n' +
		'  |    |  Час   |                  |  Сума     | iнозем-|  Сума   |          |                 |        |\n' +
		'  |  № |здiйснен|  Номер виданої   | виданих   |  ної   | iнозем- |   Курс   | Номер одержаної |Вiдмiтка|\n' +
		'  | з/п|   ня   |    квитанцiї     | гривень   | валюти |  ної    |          | довiдки         |  про   |\n' +
		'  |    |операцiї|                  |           |  (код) | валюти  |          |                 | сторно |\n' +
		'  |    |        |                  |           |        |         |          |                 |        |\n' +
		'  +----+--------+------------------+-----------+--------+---------+----------+-----------------+--------+\n' +
		'{{#operations}}  |{{num}}|{{time}}|  {{num_eop}} |{{equivalent}}|{{currency}}({{code}})|{{amount}}|{{rate}}|{{{certificate_code}}}|{{storno}}|\n{{/operations}}\n' +
		'  +----+--------+------------------+-----------+--------+---------+----------+-----------------+--------+\n' +
		'{{/buy_register}} \n\n' +
		'  +--------------------+------------------------+--------------------------+----------------------------+\n' +


		'{{#totals}}  | {{#first_total}}ІТОГО по:{{/first_total}}{{^first_total}}         {{/first_total}}          |        {{ currency }}       |{{ amount }}{{ currency }} |{{ equivalent }}|\n{{/totals}}\n' +
		'  +--------------------+------------------------+--------------------------+----------------------------+\n' +
		'  | IТОГО по гривнi:   |                        |                          |{{ big_total }}|        \n' +
		'  +--------------------+------------------------+--------------------------+----------------------------+\n\n' +
		'Пiдпис касира ________________                                          Мiсце для вiдбитка штампа*\n' +
		'___________________\n' +
		'* Для електронного документа, який має електронний підпис касира, реквізит не проставляється.',
}

/////////////////////////////////////
TEMPLATES_RKKS = {
	base_html :
			'<html>' +
		'<head>' +
		'	<meta charset="utf-8">' +
		'	<style>' +
		'		table{' +
		'			font-size: 12;' +
		'			line-height: 1;' +
		'			width: 45%;' +
		'			border: 0;' +
		'		}' +
		'		left-align {' +
		'			text-align: left;' +
		'		}' +
		'		td {' +
		'			width: 1;' +
		'			text-align: center;' +
		'		}' +
		'		.right-align {' +
		'			text-align: right;' +
		'		}' +
		'		.column {' +
		'			width: 33%;' +
		'			overflow: auto;' +
		'			float:left;' +
		'			font-size: 70%;' +
		'		}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.body {'+
						'margin: 0;'+
						'border: 0;'+
						'padding: 0;'+
						// '/*border: 5px red solid;*/'+
						// 'border-radius: initial;'+
						// 'width: initial;'+
						// '/*min-height: 330mm;*/'+
						// 'box-shadow: initial;'+
						// 'background: initial;'+
						// 'page-break-after: auto;'+
					'}'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-before: always;'+
					'}'+
					'.page1 {'+
						'page-break-before: avoid;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
				'}'+
		'	</style>	' +
		'</head>' +
		'<body>' +

		'{{ #pages }}' +
			'<div class="page page{{idx}}">' +
			'<br>' +
			'{{ #. }}' +
				'<div class="column">' +
				'<pre>' +
				'{{ #. }}' +
					'{{{ . }}}\n' +
				'{{ /. }}' +
				'</pre>' +
				'</div>' +
			'{{ /. }}' +
			'</div>' +
		'{{ /pages }}' +
		'</body>' +
		'</html>',
	xz_matrix :
		// '{{ company }} \n' +
		// '{{ full_name }} \n' +
		'{{#company}}{{{.}}}\n{{/company}}\n' +
		'{{#full_name}}{{{.}}}\n{{/full_name}}\n' +
		'{{#address}}{{{.}}}\n{{/address}}\n' +
		'{{ TN }}        {{ FN }} \n' + //15+10
		'{{ report_name }}\n' +
		'			за {{ doc_date }} \n' +

		'{{#currency_reports}}' +
			' \n\n' +
			'ЗВІТ ПО ВАЛЮТІ {{ code }}({{ numcode }}) \n' +
			'Курси нац. валюти до {{ code }} за одиницю \n' +

			'{{ #bought_rate }}'+
				'Курс купівлі      {{ bought_rate }} \n' + //20 .8
			'{{ /bought_rate }}'+

			'{{ #sold_rate }}'+
				'Курс продажу      {{ sold_rate }} \n' + //20 .8
			'{{ /sold_rate }}'+

				'Курс НБУ          {{ nbu_rate }} \n' + //20 .8

			'{{ #bought }}'+
				'---- Операції купівлі ін.вал. \n' +
				'Куплено ін.вал.   {{ bought }} \n' + // 20
				'Видано нац.вал.   {{ bought_equivalent }} \n' + //20\
			'{{ /bought }}'+

			'{{ #sold }}'+
				'---- Операції продажу ін.вал. \n' +
				'Продано ін.вал.   {{ sold }} \n' + //20
				'Прийнято нац.вал. {{ sold_equivalent }} \n' + //20
			'{{ /sold }}'+

			'{{ #bought_storno }}'+
				'----Сторно операцій купівлі ін.вал. \n' +
				'Видано ін.вал.    {{ bought_storno }} \n' +
				'Прийнято нац.вал. {{ bought_storno_equivalent }} \n' +
			'{{ /bought_storno }}'+

			'{{ #sold_storno }}'+
				'----Сторно операцій продажу ін.вал. \n' +
				'Прийнято ін.вал.  {{ sold_storno }} \n' +
				'Видано нац.вал.   {{ sold_storno_equivalent }} \n' +
			'{{ /sold_storno }}'+
                'Інкасовано        {{ collected }} \n' + //20
    		    'Підкріплено       {{ reinforced }} \n' + //20
			'---- Отримано за авансами {{ advance }} \n' + //12

		'{{/currency_reports}}' +

		' \n\n' +
		'ЗВІТ ПО ВАЛЮТІ UAH (980) \n' +
		'Інкасовано        {{ collected }} \n' + //20
		'Підкріплено       {{ reinforced }} \n' + //20
		'---- Отримано за авансами {{ advance }} \n' + //12
		' \n' +
		'Кількість розрах.документів {{ doc_num }} \n' + //10
		'{{ z_doc_num }} \n' +
		'{{ ZN }} {{ FSN }} \n' + //15+19
		'ДЧ: {{ doc_date }} {{ doc_time }} \n',

	exchange2018 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>квитанція купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			{{#columns}}' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'				<td class="main-container">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{company}}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{full_name}}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{address}}' +
		'					</div>' +
		'					<div class="identation" style="text-align:right;">' +
		'						Примірник № {{ num }}' +
		'					</div>' +
		'					<div class="Headers">' +
		'						Квитанцiя № {{rro_id}}' +
		'					</div>' +
		'					<div class="Headers">' +
		'						про здiйснення валютно-обмiнної операцiї' +
		'					</div>' +
		'					<table border="0" cellspacing="0" cellpadding="0" style=" width:auto ;border-collapse:collapse;">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td>Дата&nbsp;та&nbsp;час&nbsp;здійснення&nbsp;операції:</td>' +
		'								<td>{{date}} {{time}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Назва операцiї:</td>' +
		'								<td style="border-bottom:1px solid black">{{type}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&nbsp;</td>' +
		'								<td><sup>(купівля, продаж, зворотний обмін, конвертація іноземної валюти)</sup></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'					<br />' +
		'					<table style="border-collapse:collapse;border:1px dashed black;" cellspacing="1" cellpadding="1">' +
		'						<tbody>' +
		'							<tr>' +
		'								<th style="border-right:1px dashed black; border-bottom:1px dashed black;">Прийнято</th>' +
		'								<th rowspan="2" style="border-right:1px dashed black; border-bottom:1px dashed black;">Курс,' +
		'									<br />&nbsp; крос-курс &nbsp;</th>' +
		'								<th style="border-bottom:1px dashed black;">До видачі</th>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-right:1px dashed black; border-bottom:1px dashed black;">&nbsp;назва валюти та сума&nbsp; </td>' +
		'								<td style="border-bottom:1px dashed black;">&nbsp; назва валюти та сума &nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-right:1px dashed black; border-bottom:1px dashed black; text-align: center">{{ received }}</td>' +
		'								<td rowspan="2" style="border-right:1px dashed black; vertical-align:middle; text-align: center;">{{ rate }}</td>' +
		'								<td style="border-bottom:1px dashed black; text-align: center">{{ give }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-right:1px dashed black; text-align: center">Усього:{{ received }}</td>' +
		'								<td style="text-align: center">Усього:{{ give }}</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'					<div class="identation">' +
		'						Сума комiсiї 0.00 UAH' +
		'					</div>' +
		'					<table border="0" cellspacing="0" cellpadding="0" style=" width:auto ;border-collapse:collapse;">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'								<td style="border-bottom:1px solid black">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&nbsp;</td>' +
		'								<td>(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&nbsp; </td>' +
		'								<td style="border-bottom:1px solid black">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&nbsp;</td>' +
		'								<td>(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +

		'							</tr>' +

		// '							<tr>' +
		// '								<td colspan="2">Надаю згоду на проведення валютно-обмінної операції без оформлення першого примірника квитанції про здійснення валютно-обмінної операції (примірника клієнта)</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td>&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2">(підпис клієнта проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +


		'							<tr>' +
		'								<td colspan="2">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		'								<td style=" text-align:right">Місце для відбитка штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2">(підпис працівника уповноваженої фінансової установи)</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'					<br />' +
		'					<div class="identation" style=" margin-right:10px;">' +
		'						*Здійснення операції з купівлі у фізичної особи-нерезидента готівкової іноземної валюти без оформлення довідки-certificate за формою № 377 не дає підстав для зворотного обміну.' +
		'					</div>' +
		'				</td>' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="35%" valign="top" style="border-left: dashed black 1px; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ПРИЙНЯТО&nbsp;{{ received_currency }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ДО&nbsp;ВИДАЧІ&nbsp;{{ give_currency }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px"> &lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=100 src={{ qr_base64_img }} alt="QR" /></div></td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			</tr>' +
		'			{{/columns}}' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

	exchange2019 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>СУМА КОМІСІЇ</td>' +
		'								<td align="right">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +

		// '							<tr>' +
		// '								<td colspan="2">Надаю згоду на проведення валютно-обмінної операції без оформлення першого примірника квитанції про здійснення валютно-обмінної операції (примірника клієнта)</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td>&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2">(підпис клієнта проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +


		'							<tr>' +
		'								<td colspan="2">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',
	exchange2019_2 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>СУМА КОМІСІЇ</td>' +
		'								<td align="right">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +

		// '							<tr>' +
		// '								<td colspan="2">Надаю згоду на проведення валютно-обмінної операції без оформлення першого примірника квитанції про здійснення валютно-обмінної операції (примірника клієнта)</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td>&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2">(підпис клієнта проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +


		// '							<tr>' +
		// '								<td colspan="2">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td>&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
					'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис касира)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

		exchange2020_1 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>СУМА КОМІСІЇ</td>' +
		'								<td align="right">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

		exchange_prro_2020 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table width="100%" style="margin-left: 15px; padding-left: 15px;">' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td align="right">{{ tax_id }}/{{ pid }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">Касир: {{ operator }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{ title_total }}&nbsp;{{ give_currency }}</td>' +
		'								<td align="right">{{ sum_base_before_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ЗАОКРУГЛЕННЯ&nbsp;{{ currency_UAH }}</td>' +
		'								<td align="right">{{ sum_base_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>СУМА КОМІСІЇ&nbsp;{{ currency_UAH }}</td>' +
		'								<td align="right">0.00</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;ПРРО&nbsp;{{ fn }}/{{ zn }}</td>' +
		'								<td align="right">«онлайн»</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div></td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right">АСУ «О.С.А.»</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

	payment_account :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="center">' +
		'						ВПС «FLASHPAY»' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px; padding-bottom: 10px">КВИТАНЦІЯ № {{ num_eop }} вiд {{ date }}&nbsp;{{ time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" >Фінансова послуга: переказ коштів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Назва валюти: {{ currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Отримувач: {{ recipient_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Код отримувача: {{ recipient_ipn }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{recipient_account_title}}: {{ recipient_account }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Банк отримувача: {{ recipient_bank_name }}</td>' +
		'							</tr>' +
		'							{{#has_recipient_bank_code}}<tr>' +
		'								<td colspan="2" align="left">МФО банку отримувача: {{ recipient_bank_code }}</td>' +
		'							</tr>{{/has_recipient_bank_code}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">Призначення платежу: {{ purpose }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Сума переказу:</td>' +
		'								<td align="right">{{ currency_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Комісійна винагорода:</td>' +
		'								<td align="right">{{ commission_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Всього:</td>' +
		'								<td align="right">{{ payment_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Платник:</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
            '{{#has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="padding-bottom: 7px">Адреса платника: {{ client_address }}</td>' +
		'							</tr>' +
            '{{/has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size:9px">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності. Всі вищевикладені дані про переказ відповідають дійсності. З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності.</td>' +
		// '								<td colspan="2" align="left">Всі вищевикладені дані про переказ відповідають дійсності.</td>' +
		// '								<td colspan="2" align="left" >З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис платника)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
					'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис касира)</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '		<td colspan="2" align="left" style="font-size:8px">Унікальний ідентифікатор операції в Платіжній системi (код транзакції):&nbsp;{{ transaction_id}}</td>' +
		// '							</tr>' +
		// // '							<tr>' +
		// // '								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		// // '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left" font-size:8px>Унікальний ідентифікатор операції в Платіжній системi</td>' +
		// '							</tr>' +
					'					<tr>' +
		'								<td style="font-size:8px">Унікальний ідентифікатор операції в Платіжній системi (код транзакції):</td>' +
		'								<td align="right">{{ transaction_id}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

	payment_validate :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя</title>' +
		'	<style type="text/css">' +
        '		table{' +
		'			width: 100%;' +
		'		}' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						// 'margin-left: auto;' +
						// 'margin-right: auto;' +
						'width:45%;' +
        '			border: 0;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<tr>' +
        '{{#columns}}' +
		'				<td valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="center">' +
		'						ВПС «FLASHPAY»' +
		'					</div>' +

		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px; padding-bottom: 10px">Попередня КВИТАНЦІЯ для уточнення реквізитів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" >Фінансова послуга: переказ коштів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Назва валюти: {{ currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Сума переказу:</td>' +
		'								<td align="right">{{ currency_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Комісійна винагорода:</td>' +
		'								<td align="right">{{ commission_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Всього:</td>' +
		'								<td align="right">{{ payment_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Платник:</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size:9px">Будь-ласка, перевірте правильність введених даних співробітником компанії.\n' +
        'Якщо всі дані введено вірно і зауважень Ви не маєте, просимо Вас нижче поставити свій підпис.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис платника)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

	storno2018 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>квитанція купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px;font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'body table{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
					// 	'line-height: 90%;' +
					// 	'font-size:10px;' +
					// 	'width:70%;' +
					// 	'font-family:"Times New Roman";' +
					// 	'padding: 0px 0px;' +
					// 	'text-align:justify;' +
					// 	'size:portrait;' +
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<tr>' +
		'				{{#columns}}' +
		'				<td width="50%" valign="top" style="padding-right: 15px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="15pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ПРИЙНЯТО&nbsp;{{ give_currency }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ДО&nbsp;ВИДАЧІ&nbsp;{{ received_currency }} </td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px"> &lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo }}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=100 src={{ qr_base64_img }} alt="QR" /></td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

	storno2019 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_storno_received}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_storno_give}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>СУМА КОМІСІЇ</td>' +
		'								<td align="right">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

	storno2019_2 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_storno_received}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_storno_give}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>СУМА КОМІСІЇ</td>' +
		'								<td align="right">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td>&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
					'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис касира)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

	storno2020_1 :
		'<html>' +
		'<head>' +
		'	<meta charset="Windows-1251" />' +
		'	<title>Квитанцiя купівлі/продажу валюти</title>' +
		'	<style type="text/css">' +
		'		body, table {line-height: 90%;font-size:10px; margin-left:[margin-left]px;margin-top:[margin-top]px;font-weight: [font-weight];font-family:"Times New Roman";padding: 0px 0px;text-align:justify;size:portrait;}' +
		'		.Headers{font-weight:normal;text-align : center;}' +
		'		.identation{text-indent : 30px;}' +
		'		.identation1{text-indent : 60px;}' +
		'		.Cell1{border: dashed black 1px; text-align: center}' +
		'		.per_table td, th { text-align:center;}' +
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'body{'+
						'margin-top: 30px;' +
						'margin-left: auto;' +
						'margin-right: auto;' +
						'width:90%;' +
					'}'+
					'.main-container{' +
						'padding-right: 15px;' +
						'padding-bottom: 20px;' +
						'border-bottom: dashed black 1px;' +
					'}'+
				'}'+
		'	</style>' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tbody>' +
		'			<!-- Примірник {{ num }} -->' +
		'			<tr>' +
		'			{{#columns}}' +
		'				<!-- Чек Справа Экземпляр {{ num }} -->' +
		'				<td width="50%" valign="top" style="border-left: {{leftborder}}; margin-left: 15px; padding-left: 15px; border-bottom: dashed black 1px ">' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ num }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px">КВИТАНЦІЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-bottom: 10px">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_storno_received}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="width:70%">{{title_storno_give}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>СУМА КОМІСІЇ</td>' +
		'								<td align="right">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td>Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">(підпис клієнта)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		// '							<tr>' +
		// '								<td colspan="2">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td>&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border-bottom:1px solid black">&nbsp;</td>' +
		// 			'								<td align="center" style="padding-bottom: 10px">місце для' +
		// '									<br /> штампа</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td align="center">(підпис касира)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=50 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
		'				</td>' +
		'			{{/columns}}' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</body>' +
		'</html>',

}

TEMPLATES_THERMO = {
	base :
		'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">'+
		'<html>'+
		'<head>'+
			'<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'+
			'<script src="{{ url_for(\'static\', filename=\'js/jquery.min.js\') }}"></script>'+
			'<title></title>'+
			'<style type="text/css">'+
				'body {'+
					'width: 100%;'+
					'/*height: 100%;*/'+
					'margin: 0;'+
					'padding: 0;'+
					'/*background-color: #FAFAFA;*/'+
					'border: 0.0em white solid;'+
					'font: 0.5em "Verdana";'+
				'}'+
				'table {'+
					'line-height: 1.25;'+
					'border: 1px solid #000;'+
					'/*border-collapse: inherit;*/'+
					'margin: 2% auto;'+
					'padding: 0;'+
					'width: 100%;'+
					'font-size: 80%;'+
				'}'+
				'table tr {'+
					'background: #ffffff;'+
					'border: 0px solid #fff;'+
					'padding: 0%;'+
				'}'+
				'table th,'+
				'table td {'+
					'border: 1px solid #000;'+
					'padding: 0.5%;'+
					'text-align: center;'+
					'page-break-inside:avoid !important;'+
				'}'+
				'table th {'+
					'overflow:auto;'+
					'letter-spacing: .1em;'+
					'text-transform: uppercase;'+
				'}'+
				'.auto-overflow{'+
					'overflow: auto;'+
				'}'+
				'.left-float{'+
					'float: left;'+
				'}'+
				'.right-float{'+
					'float: right;'+
					'text-align: right;'+
				'}'+
				'.center-align{'+
					'margin-right: auto;'+
					'margin-left: auto;'+
					'text-align: center;'+
				'}'+
				'.left-align{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.right-align{'+
					'margin-left: auto;'+
				'}'+
				'.fullwidth{'+
					'width: 100%'+
				'}'+
				'.two-thirds{'+
					'width:75%;'+
				'}'+
				'.half{'+
					'width:50%;'+
				'}'+
				'.quorter{'+
					'width:25%;'+
				'}'+
				'.padded{'+
					'padding:1%;'+
				'}'+
				'.hr { '+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
				'} '+
				'.underlined{'+
					'text-decoration:underline; '+
				'}'+
				'.centered{'+
					'text-align: center;'+
				'}'+
				'.notation{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.notation-right{'+
					'float:right;'+
					'text-align: right;'+
				'}'+
				'.big-col{'+
					'width:23%;'+
				'}'+
				'.med-col{'+
					'width: 12%;'+
				'}'+
				'.bold{'+
					'font-weight: bold'+
				'}'+
				'.descriptive-field{'+
					'font-size: 75%;'+
				'}'+
				'.annotation-field{'+
					'font-size: 75%;'+
				'}'+
				'.inline-block{'+
					'display: inline-block;  '+
					'vertical-align: middle;'+
					'padding: 2%;'+
				'}'+
				'* {'+
					'box-sizing: border-box;'+
					'-moz-box-sizing: border-box;'+
				'}'+
				'br{'+
					'display: block;'+
					'margin: 0;'+
				'}'+
				'hr {'+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
					'padding-top: 1em'+
				'}'+
				'h4{'+
					'text-align: center;'+
					'margin-top: 1%;'+
					'margin-bottom: 1%;'+
				'}'+
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: auto;'+ // always На новому Хромі не працює, а на старих друкує пусту сторінку
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'.pbreak{'+
						'page-break-after: always;'+
					'}'+
				'}'+
			'</style>',

	base_payment :
		'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">'+
		'<html>'+
		'<head>'+
			'<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'+
			'<script src="{{ url_for(\'static\', filename=\'js/jquery.min.js\') }}"></script>'+
			'<title></title>'+
			'<style type="text/css">'+
				'body {'+
					'width: 100%;'+
					'/*height: 100%;*/'+
					'margin: 0;'+
					'padding: 0;'+
					'/*background-color: #FAFAFA;*/'+
					'border: 0.0em white solid;'+
					'font: 0.5em "Verdana";'+
				'}'+
				'table {'+
					'line-height: 1.25;'+
					'border: 1px solid #000;'+
					'/*border-collapse: inherit;*/'+
					'margin: 2% auto;'+
					'padding: 0;'+
					'width: 100%;'+
					'font-size: 80%;'+
				'}'+
				'table tr {'+
					'background: #ffffff;'+
					'border: none;'+
					'padding: 0%;'+
				'}'+
				'table th,'+
				'table td {'+
					'border: none;'+
					'padding: 0.5%;'+
					'text-align: left;'+
					'page-break-inside:avoid !important;'+
				'}'+
				'table th {'+
					'overflow:auto;'+
					'letter-spacing: .1em;'+
					'text-transform: uppercase;'+
				'}'+
				'.auto-overflow{'+
					'overflow: auto;'+
				'}'+
				'.left-float{'+
					'float: left;'+
				'}'+
				'.right-float{'+
					'float: right;'+
					'text-align: right;'+
				'}'+
				'.center-align{'+
					'margin-right: auto;'+
					'margin-left: auto;'+
					'text-align: center;'+
				'}'+
				'.left-align{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.right-align{'+
					'margin-left: auto;'+
				'}'+
				'.fullwidth{'+
					'width: 100%'+
				'}'+
				'.two-thirds{'+
					'width:75%;'+
				'}'+
				'.half{'+
					'width:50%;'+
				'}'+
				'.quorter{'+
					'width:25%;'+
				'}'+
				'.padded{'+
					'padding:1%;'+
				'}'+
				'.hr { '+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
				'} '+
				'.underlined{'+
					'text-decoration:underline; '+
				'}'+
				'.centered{'+
					'text-align: center;'+
				'}'+
				'.notation{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.notation-right{'+
					'float:right;'+
					'text-align: right;'+
				'}'+
				'.big-col{'+
					'width:23%;'+
				'}'+
				'.med-col{'+
					'width: 12%;'+
				'}'+
				'.bold{'+
					'font-weight: bold'+
				'}'+
				'.descriptive-field{'+
					'font-size: 75%;'+
				'}'+
				'.annotation-field{'+
					'font-size: 75%;'+
				'}'+
				'.inline-block{'+
					'display: inline-block;  '+
					'vertical-align: middle;'+
					'padding: 2%;'+
				'}'+
				'* {'+
					'box-sizing: border-box;'+
					'-moz-box-sizing: border-box;'+
				'}'+
				'br{'+
					'display: block;'+
					'margin: 0;'+
				'}'+
				'hr {'+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
					'padding-top: 1em'+
				'}'+
				'h4{'+
					'text-align: center;'+
					'margin-top: 1%;'+
					'margin-bottom: 1%;'+
				'}'+
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: auto;'+ // always На новому Хромі не працює, а на старих друкує пусту сторінку
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'.pbreak{'+
						'page-break-after: always;'+
					'}'+
				'}'+
			'</style>',

	base_xz :
		'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">'+
		'<html>'+
		'<head>'+
			'<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'+
			'<script src="{{ url_for(\'static\', filename=\'js/jquery.min.js\') }}"></script>'+
			'<title></title>'+
			'<style type="text/css">'+
				'body {'+
					'width: 100%;'+
					'/*height: 100%;*/'+
					'margin: 0;'+
					'padding: 0;'+
					'/*background-color: #FAFAFA;*/'+
					'border: 0.0em white solid;'+
					'font: 0.6em "Verdana";'+
				'}'+
				'table {'+
					'line-height: 1.25;'+
					'border: 1px solid #000;'+
					'/*border-collapse: inherit;*/'+
					'margin: 2% auto;'+
					'padding: 0;'+
					'width: 100%;'+
					'font-size: 100%;'+
				'}'+
				'table tr {'+
					'background: #ffffff;'+
					'border: 0px solid #fff;'+
					'padding: 0%;'+
				'}'+
				'table th,'+
				'table td {'+
					'border: 1px solid #000;'+
					'padding: 0.5%;'+
					'text-align: center;'+
					'page-break-inside:avoid !important;'+
				'}'+
				'table th {'+
					'overflow:auto;'+
					'letter-spacing: .1em;'+
					'text-transform: uppercase;'+
				'}'+
				'.auto-overflow{'+
					'overflow: auto;'+
				'}'+
				'.left-float{'+
					'float: left;'+
				'}'+
				'.right-float{'+
					'float: right;'+
					'text-align: right;'+
				'}'+
				'.center-align{'+
					'margin-right: auto;'+
					'margin-left: auto;'+
					'text-align: center;'+
				'}'+
				'.left-align{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.right-align{'+
					'margin-left: auto;'+
				'}'+
				'.fullwidth{'+
					'width: 100%'+
				'}'+
				'.two-thirds{'+
					'width:75%;'+
				'}'+
				'.half{'+
					'width:50%;'+
				'}'+
				'.quorter{'+
					'width:25%;'+
				'}'+
				'.padded{'+
					'padding:1%;'+
				'}'+
				'.hr { '+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
				'} '+
				'.underlined{'+
					'text-decoration:underline; '+
				'}'+
				'.centered{'+
					'text-align: center;'+
				'}'+
				'.notation{'+
					'margin-right: auto;'+
					'text-align: left;'+
				'}'+
				'.notation-right{'+
					'float:right;'+
					'text-align: right;'+
				'}'+
				'.big-col{'+
					'width:23%;'+
				'}'+
				'.med-col{'+
					'width: 12%;'+
				'}'+
				'.bold{'+
					'font-weight: bold'+
				'}'+
				'.descriptive-field{'+
					'font-size: 100%;'+
				'}'+
				'.annotation-field{'+
					'font-size: 100%;'+
				'}'+
				'.inline-block{'+
					'display: inline-block;  '+
					'vertical-align: middle;'+
					'padding: 2%;'+
				'}'+
				'* {'+
					'box-sizing: border-box;'+
					'-moz-box-sizing: border-box;'+
				'}'+
				'br{'+
					'display: block;'+
					'margin: 0;'+
				'}'+
				'hr {'+
					'border:0px;'+
					'border-bottom: 1px dashed #8c8b8b;'+
					'padding-top: 1em'+
				'}'+
				'h4{'+
					'text-align: center;'+
					'margin-top: 1%;'+
					'margin-bottom: 1%;'+
				'}'+
				'@page {'+
					'size: A4;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: auto;'+ // always На новому Хромі не працює, а на старих друкує пусту сторінку
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
					'.pbreak{'+
						'page-break-after: always;'+
					'}'+
				'}'+
			'</style>' +
		'</head>' +
		'<body>' +

		'{{ #pages }}' +
			'<div class="page page{{idx}}">' +
			'<br><b>' +
			'{{ #. }}' +
				'<div class="column">' +
				'<pre>' +
				'{{ #. }}' +
					'{{{ . }}}\n' +
				'{{ /. }}' +
				'</pre>' +
				'</div>' +
			'{{ /. }}' +
			'</b></div>' +
		'{{ /pages }}' +
		'</body>' +
		'</html>',

	exchange2019 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		'								<td style="border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAWAEgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+7j4s/C3wJ8cfhZ8S/gp8UtC/4Sj4ZfGD4f8AjL4W/EXwz/aesaJ/wkXgT4geHNS8J+LtC/tnw7qGkeINI/tfw/q+oaf/AGnoWq6ZrFh9o+1aZqFlexQXMX+OL+wV+y58Cf8Agol/wWr+FP7PfwU8Df8ACL/si/GD9r/x14y8M/Cj4peJvGOiaxY/sbfD/XvGPxt1n4T674q8J+IfG3jO2+IFz+zl4J1XwHpmpaf471O+m8d3GntdfEuyhlufHNp/pOf8HJ/7Xmnfsg/8Efv2p75L3w/H42/aP8Pp+yH8OdH8TaD4q1vTvEmo/H6y1Tw98SrK2l8Ly2ceg+INC/Z8s/jN468J694n1TTvCtt4q8I6NZ6jF4iub6w8HeJP5wf+DI/9kPUZ/FX7Y/7e2uWXiCz0jS/D+g/sh/DDUbbXvCreFfEeo69qPhr4zfHay1nwwsV142g8QeC7bw5+zpP4Z16afQvCt1p3j3xZp9vF4s1ezun8FgH7ff8ABaz9iP8A4J1fsof8ECPjd8Ir79n3xAf2fP2S/D/iPxz+y74C8M/EL4oaxqPwx/af+NXiTxr8MvhP8SbnXvEfxWsPEni7w/4b+Mn7TuqeKvFmh+OvFXjDw/F4VvtZFn4J8TSaN4b8Lt/KF/waGf8ABPH4Z/tfftofF39oz40eFfD/AI08E/sR+H/g345+H2l3PjH4heFvFXhv9p/xH8VrPx18DfiTo1j4Ku9F0jxR4f8ABukfAv4o2/ibQ/G2uXXh+51HxD4Thn8E+K7ae+vPDf6f/wDB7h+15p0HhX9jj9gnQ73w/eavqniDXv2vPifp1zoPipfFXhzTtB07xL8GfgTe6N4naW18Ez+H/Glz4j/aLg8TaDDBrviq11HwF4T1C4l8J6ReWqeNOf8A+CWP/Bpb+yB+1l/wT7/Ze/aZ/aw+IH7X/wANfjb8d/h/P8UtV8J/C34o/s/x+BIfAnjHxPr+s/BTXdCttQ+CHxK1Ow/4TH4JXXw78Y6npmreML/WNL1jX9Q07WNP8Oana3XhnRwD84P+DlT/AIKG/sBf8FT/AI+/s+eF/wBgD4S+IP2lP2g7zw/8KPAul/tVeE7r9ovQvFWvadceNPjvp9j+xl4Z/ZM8dfDjwrbeJ/EGqeNviH4M+I2jfFfw/Yal4q1rUddtvhrpMN5HDeQ2/wDT9/wR0/4JP/Br/ghR+wZ8QP29v2nPhx4gvP23vCf7MHx4+Jf7Uuo+BviJP49n8LfBrQksfjNdfs9fDbwwmueDvg3qXiDQ/Dfwh8Ez65rV3Pr0958ZW8baf4d+OOqfCG88Nva/xhf8EJf2hviZ/wAEyv8Agsz8M/gB8Tf2fPg/408beNP2n9C/Yh+KemeO/D3w98R/Ez4BfEzxH8SNR/Z51rxx8DfjrpOmeL9X8E+IPBOr+L/FGieN9O8BeI7r4e/HL4e3Wv8AhDXmnuZ/h98RfAH9fv8AweOftead8Ff+CaPhX9lrTr3w/J42/bU+MHh3RrzQtZ0HxVe6ifg18AdW0D4v+OvFnhPX9Lls/C2heINB+K1n+z54bubbxXdajPrPhXx14mTw74ZvbmxvvEvg8A/iC/Yv+E/7XH/Bfz/gqN8IPh5+0Z8YfjB8Z9X8c+IL3xN8dvivr+t63qE/wg/Zq8NeJtY+InxPtvBFxa+DfHHgn4J+Hzc+Jdc8JfA7wnb+B9E+CGg/GX4l+BPBkOjeHtI8TrGv9X3/AAW4/wCDcr/gj9+yD+xL+0l+3N8PPC/7T/wTufgn8H9N0bwX8KPg38WbLxx8PfEnxl8ceOLX4d/CrxZ4+t/2iLD4j/ESXw/L8RPiP4Hs/ihbeEvix4agtvhn4avb3wZ4ZPjY3MniQ/4Mj/2X/Cul/AL9sf8AbRvH8P6t428cfGDQf2X/AA9Hc+C9OHirwF4V+Ffgvw18V/GL6N8RJb651dvD/wAXNX+MfgVfE3gux0zRtOXUfgn4T1zVL7xLcvo9v4T/ALHfjp+1j+yx+y//AMIt/wANL/tLfs//ALO//Ccf23/whX/C9PjJ8OvhJ/wmH/CM/wBkf8JJ/wAIt/wn/iPw/wD8JB/wj/8AwkGg/wBt/wBk/a/7K/tvSPt/2f8AtKz84A/iC/4Mlvix+1P4v1j9s34W6r8S/wDhKP2Rfg/8P/g//Y3w68Z+MviLresfC74p/EDx38WfEXhn/hRHhG51K5+GXgn4f+NrK2+Neu/Hn7Lp+meI/Enju3+EGp6f9thi8WTqV/d58Lfix8LPjj4E0L4pfBT4l/D/AOMHwy8Uf2n/AMIz8Rfhb4y8OfEDwJ4i/sTWNQ8O6z/YXi7wnqWr+H9X/sjxBpGq6Fqf9n6hcfYNY0zUNMuvKvbK5giKAP8ANk/4PDP+Cifir43/ALYWkf8ABPCz8J+IPBXgn9ifxBD4s8Q61bfE/UdW8K/HbxV8dPgZ8DviD4O8Taz8LIvDWiaR4Y8QfBjSPEvjrwZ4Z1m+1/xzqN1p3j3xZPpdz4Tttd1jSdR/b7/gzR/a78K/Fj9iX4ufsg+HvgR4f+G2r/sg+IPC3izx18X9G13TrnUf2jPFX7Tnjj476/Z+JvFnhqx8EaBc6P4g+HXgn4Z+DvhfbazrHi/x9qPiHwr4b8M2cVz4b0jw5pehQlFAH8If/BWD/gon4q/4Kl/ttfEf9r7xD4T8QfDTSPFfh/4d+E/Avwg1n4n6j8WdO+E3hXwN4H0PQLzwz4T8S33hrwXbWvh/xH42g8Y/FC50bR/CHh7TrbxV8QfE15Lbahq+oaprurf6XfhP/gtF4V8Bf8G/3hn/AIK4+Bf2N/D/AIL8E+C/D+jeE/B37HHhP4p6d4c8K+E/Cvhz9rK2/Y28PeGfDPxE0f4NWekaD4f0LSLOz8VaNo2l/B+107S9OtbbwRY20FtBFrylFAH+YJ+xf+2Fp37On7efwg/bj+P/AMN/EH7X2r/DT4wXvx+8Q+FfFnxj8VeBvFXxJ+Mts+seKvB3xC8TfF2LSvGniS68QeHPjJP4c+LOsza3pPiSDx/qPh658P8Ai+31DSPEmsGT+/z/AIPLv2IfFXx0/Yl+Ef7aPh7xx4f0jSP2EPEHim28deAtZ07URqPjXwr+1L44+BHwys9Z8J69YtdW0HiDwX428OeDlufDOsaZaadrvhXxN4m1yLxZpWr+DdL8L+OSigD+aH/gmx/wdBftHf8ABNP/AIJ9t+xX4C+Afw/+L3i3wd8QPFHiL4EfFT4peKrq18CfC3wJ438T6L4z8U/DrXfhD4A8KeDvFvxK+1eLb/4t+KNM8Xal8edC1jTNY+JWn2kkF/4S8B6X4U1PgPg7Yf8ABRz/AIOsv2+rX4dfGf8AaX+H/hX/AIVR8P8Axh8VrPT9b0HVND+FnwK+BOo/Gj4faF4/0X4F/C3wVpN1/wAJj8QLD/hZXheDSJfiZ4u07xj8S/DngHwt4d+KH7QD/wDCK+HNTtCigD/T7/YD/Y68Cf8ABP8A/Y2/Z7/Y8+HV5/a/h/4HfD+z8O6h4m+z6xYf8Jx471e+v/FnxS+Iv9ja74n8Z3vhr/hZHxN8QeLvHn/CIweJ9X0fwf8A8JF/wi/h2eLw/pGmW0JRRQB//9k=" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	exchange2019_2 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAWAEgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+7j4s/C3wJ8cfhZ8S/gp8UtC/4Sj4ZfGD4f8AjL4W/EXwz/aesaJ/wkXgT4geHNS8J+LtC/tnw7qGkeINI/tfw/q+oaf/AGnoWq6ZrFh9o+1aZqFlexQXMX+OL+wV+y58Cf8Agol/wWr+FP7PfwU8Df8ACL/si/GD9r/x14y8M/Cj4peJvGOiaxY/sbfD/XvGPxt1n4T674q8J+IfG3jO2+IFz+zl4J1XwHpmpaf471O+m8d3GntdfEuyhlufHNp/pOf8HJ/7Xmnfsg/8Efv2p75L3w/H42/aP8Pp+yH8OdH8TaD4q1vTvEmo/H6y1Tw98SrK2l8Ly2ceg+INC/Z8s/jN468J694n1TTvCtt4q8I6NZ6jF4iub6w8HeJP5wf+DI/9kPUZ/FX7Y/7e2uWXiCz0jS/D+g/sh/DDUbbXvCreFfEeo69qPhr4zfHay1nwwsV142g8QeC7bw5+zpP4Z16afQvCt1p3j3xZp9vF4s1ezun8FgH7ff8ABaz9iP8A4J1fsof8ECPjd8Ir79n3xAf2fP2S/D/iPxz+y74C8M/EL4oaxqPwx/af+NXiTxr8MvhP8SbnXvEfxWsPEni7w/4b+Mn7TuqeKvFmh+OvFXjDw/F4VvtZFn4J8TSaN4b8Lt/KF/waGf8ABPH4Z/tfftofF39oz40eFfD/AI08E/sR+H/g345+H2l3PjH4heFvFXhv9p/xH8VrPx18DfiTo1j4Ku9F0jxR4f8ABukfAv4o2/ibQ/G2uXXh+51HxD4Thn8E+K7ae+vPDf6f/wDB7h+15p0HhX9jj9gnQ73w/eavqniDXv2vPifp1zoPipfFXhzTtB07xL8GfgTe6N4naW18Ez+H/Glz4j/aLg8TaDDBrviq11HwF4T1C4l8J6ReWqeNOf8A+CWP/Bpb+yB+1l/wT7/Ze/aZ/aw+IH7X/wANfjb8d/h/P8UtV8J/C34o/s/x+BIfAnjHxPr+s/BTXdCttQ+CHxK1Ow/4TH4JXXw78Y6npmreML/WNL1jX9Q07WNP8Oana3XhnRwD84P+DlT/AIKG/sBf8FT/AI+/s+eF/wBgD4S+IP2lP2g7zw/8KPAul/tVeE7r9ovQvFWvadceNPjvp9j+xl4Z/ZM8dfDjwrbeJ/EGqeNviH4M+I2jfFfw/Yal4q1rUddtvhrpMN5HDeQ2/wDT9/wR0/4JP/Br/ghR+wZ8QP29v2nPhx4gvP23vCf7MHx4+Jf7Uuo+BviJP49n8LfBrQksfjNdfs9fDbwwmueDvg3qXiDQ/Dfwh8Ez65rV3Pr0958ZW8baf4d+OOqfCG88Nva/xhf8EJf2hviZ/wAEyv8Agsz8M/gB8Tf2fPg/408beNP2n9C/Yh+KemeO/D3w98R/Ez4BfEzxH8SNR/Z51rxx8DfjrpOmeL9X8E+IPBOr+L/FGieN9O8BeI7r4e/HL4e3Wv8AhDXmnuZ/h98RfAH9fv8AweOftead8Ff+CaPhX9lrTr3w/J42/bU+MHh3RrzQtZ0HxVe6ifg18AdW0D4v+OvFnhPX9Lls/C2heINB+K1n+z54bubbxXdajPrPhXx14mTw74ZvbmxvvEvg8A/iC/Yv+E/7XH/Bfz/gqN8IPh5+0Z8YfjB8Z9X8c+IL3xN8dvivr+t63qE/wg/Zq8NeJtY+InxPtvBFxa+DfHHgn4J+Hzc+Jdc8JfA7wnb+B9E+CGg/GX4l+BPBkOjeHtI8TrGv9X3/AAW4/wCDcr/gj9+yD+xL+0l+3N8PPC/7T/wTufgn8H9N0bwX8KPg38WbLxx8PfEnxl8ceOLX4d/CrxZ4+t/2iLD4j/ESXw/L8RPiP4Hs/ihbeEvix4agtvhn4avb3wZ4ZPjY3MniQ/4Mj/2X/Cul/AL9sf8AbRvH8P6t428cfGDQf2X/AA9Hc+C9OHirwF4V+Ffgvw18V/GL6N8RJb651dvD/wAXNX+MfgVfE3gux0zRtOXUfgn4T1zVL7xLcvo9v4T/ALHfjp+1j+yx+y//AMIt/wANL/tLfs//ALO//Ccf23/whX/C9PjJ8OvhJ/wmH/CM/wBkf8JJ/wAIt/wn/iPw/wD8JB/wj/8AwkGg/wBt/wBk/a/7K/tvSPt/2f8AtKz84A/iC/4Mlvix+1P4v1j9s34W6r8S/wDhKP2Rfg/8P/g//Y3w68Z+MviLresfC74p/EDx38WfEXhn/hRHhG51K5+GXgn4f+NrK2+Neu/Hn7Lp+meI/Enju3+EGp6f9thi8WTqV/d58Lfix8LPjj4E0L4pfBT4l/D/AOMHwy8Uf2n/AMIz8Rfhb4y8OfEDwJ4i/sTWNQ8O6z/YXi7wnqWr+H9X/sjxBpGq6Fqf9n6hcfYNY0zUNMuvKvbK5giKAP8ANk/4PDP+Cifir43/ALYWkf8ABPCz8J+IPBXgn9ifxBD4s8Q61bfE/UdW8K/HbxV8dPgZ8DviD4O8Taz8LIvDWiaR4Y8QfBjSPEvjrwZ4Z1m+1/xzqN1p3j3xZPpdz4Tttd1jSdR/b7/gzR/a78K/Fj9iX4ufsg+HvgR4f+G2r/sg+IPC3izx18X9G13TrnUf2jPFX7Tnjj476/Z+JvFnhqx8EaBc6P4g+HXgn4Z+DvhfbazrHi/x9qPiHwr4b8M2cVz4b0jw5pehQlFAH8If/BWD/gon4q/4Kl/ttfEf9r7xD4T8QfDTSPFfh/4d+E/Avwg1n4n6j8WdO+E3hXwN4H0PQLzwz4T8S33hrwXbWvh/xH42g8Y/FC50bR/CHh7TrbxV8QfE15Lbahq+oaprurf6XfhP/gtF4V8Bf8G/3hn/AIK4+Bf2N/D/AIL8E+C/D+jeE/B37HHhP4p6d4c8K+E/Cvhz9rK2/Y28PeGfDPxE0f4NWekaD4f0LSLOz8VaNo2l/B+107S9OtbbwRY20FtBFrylFAH+YJ+xf+2Fp37On7efwg/bj+P/AMN/EH7X2r/DT4wXvx+8Q+FfFnxj8VeBvFXxJ+Mts+seKvB3xC8TfF2LSvGniS68QeHPjJP4c+LOsza3pPiSDx/qPh658P8Ai+31DSPEmsGT+/z/AIPLv2IfFXx0/Yl+Ef7aPh7xx4f0jSP2EPEHim28deAtZ07URqPjXwr+1L44+BHwys9Z8J69YtdW0HiDwX428OeDlufDOsaZaadrvhXxN4m1yLxZpWr+DdL8L+OSigD+aH/gmx/wdBftHf8ABNP/AIJ9t+xX4C+Afw/+L3i3wd8QPFHiL4EfFT4peKrq18CfC3wJ438T6L4z8U/DrXfhD4A8KeDvFvxK+1eLb/4t+KNM8Xal8edC1jTNY+JWn2kkF/4S8B6X4U1PgPg7Yf8ABRz/AIOsv2+rX4dfGf8AaX+H/hX/AIVR8P8Axh8VrPT9b0HVND+FnwK+BOo/Gj4faF4/0X4F/C3wVpN1/wAJj8QLD/hZXheDSJfiZ4u07xj8S/DngHwt4d+KH7QD/wDCK+HNTtCigD/T7/YD/Y68Cf8ABP8A/Y2/Z7/Y8+HV5/a/h/4HfD+z8O6h4m+z6xYf8Jx471e+v/FnxS+Iv9ja74n8Z3vhr/hZHxN8QeLvHn/CIweJ9X0fwf8A8JF/wi/h2eLw/pGmW0JRRQB//9k=" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	exchange2020_1 :
		'{{>base}}' +
		'<style type="text/css">' +
		// 'div {'+
  		// '	padding: 35px;'+
		// '}'+
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0" padding-right: 10px;">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

		exchange2020_2 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							{{#tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							{{/tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	exchange2019_2_pages :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		'								<td style="border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
					'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			// '</div>' +
			// '<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		'								<td style="border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	exchange2019_2_pages_2 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
					'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			// '</div>' +
			// '<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	exchange2020_2_pages_2 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'{{/tag_client}}' +
		'							{{#tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							{{/tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
					'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			// '</div>' +
			// '<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'{{/tag_client}}' +
		'							{{#tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							{{/tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	exchange2020_2_pages_1 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
					'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			// '</div>' +
			// '<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	exchange_prro_2020 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">{{ tax_id }}/{{ pid }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Касир: {{ operator }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">КУРС</td>' +
		'								<td style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{ title_total }}&nbsp;{{ give_currency }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ sum_base_before_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">ЗАОКРУГЛЕННЯ&nbsp;{{ currency_UAH }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ sum_base_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">СУМА КОМІСІЇ&nbsp;{{ currency_UAH }}</td>' +
		'								<td style="border: none; text-align:right; ">0.00</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;" align="center">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">ФН&nbsp;ПРРО&nbsp;{{ fn }}/{{ zn }}</td>' +
		'								<td style="border: none; text-align:right;">«онлайн»</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:center;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div></td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td style="border: none; text-align:right;">АСУ «О.С.А.»</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
			'</div>' +
		'</body>' +
		'</html>',

		exchange_prro_2020_2_pages :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">{{ tax_id }}/{{ pid }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Касир: {{ operator }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">КУРС</td>' +
		'								<td style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{ title_total }}&nbsp;{{ give_currency }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ sum_base_before_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">ЗАОКРУГЛЕННЯ&nbsp;{{ currency_UAH }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ sum_base_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">СУМА КОМІСІЇ&nbsp;{{ currency_UAH }}</td>' +
		'								<td style="border: none; text-align:right; ">0.00</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;" align="center">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">ФН&nbsp;ПРРО&nbsp;{{ fn }}/{{ zn }}</td>' +
		'								<td style="border: none; text-align:right;">«онлайн»</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:center;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div></td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td style="border: none; text-align:right;">АСУ «О.С.А.»</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
					'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">{{ tax_id }}/{{ pid }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Касир: {{ operator }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{title_received}}&nbsp;{{ received_currency }}&nbsp;({{ received_currency_numcode }}) {{ received_currency_name }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">КУРС</td>' +
		'								<td style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{ title_total }}&nbsp;{{ give_currency }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ sum_base_before_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">ЗАОКРУГЛЕННЯ&nbsp;{{ currency_UAH }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ sum_base_round }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; ">СУМА КОМІСІЇ&nbsp;{{ currency_UAH }}</td>' +
		'								<td style="border: none; text-align:right; ">0.00</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left; width:70%">{{title_give}}&nbsp;{{ give_currency }}&nbsp;({{ give_currency_numcode }}) {{ give_currency_name }}</td>' +
		'								<td style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;" align="center">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">ФН&nbsp;ПРРО&nbsp;{{ fn }}/{{ zn }}</td>' +
		'								<td style="border: none; text-align:right;">«онлайн»</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:center;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div></td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td style="border: none; text-align:right;">АСУ «О.С.А.»</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',
	
	payment_account :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
                'text-align: left;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
                'text-align: left;' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="center">' +
		'						ВПС «FLASHPAY»' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;{{ copy }}' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: none;">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px; padding-bottom: 10px; text-align: center">КВИТАНЦІЯ № {{ num_eop }} вiд {{ date }}&nbsp;{{ time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" >Фінансова послуга: переказ коштів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Назва валюти: {{ currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Отримувач: {{ recipient_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Код отримувача: {{ recipient_ipn }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{recipient_account_title}}: {{ recipient_account }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Банк отримувача: {{ recipient_bank_name }}</td>' +
		'							</tr>' +
		'							{{#has_recipient_bank_code}}<tr>' +
		'								<td colspan="2" align="left">МФО банку отримувача: {{ recipient_bank_code }}</td>' +
		'							</tr>{{/has_recipient_bank_code}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">Призначення платежу: {{ purpose }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Сума переказу:</td>' +
		'								<td align="right" style="text-align: right">{{ currency_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Комісійна винагорода:</td>' +
		'								<td align="right" style="text-align: right">{{ commission_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Всього:</td>' +
		'								<td align="right" style="text-align: right">{{ payment_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Платник:</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black; text-align: center" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
            '{{#has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="padding-bottom: 7px">Адреса платника: {{ client_address }}</td>' +
		'							</tr>' +
            '{{/has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності. Всі вищевикладені дані про переказ відповідають дійсності. З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності.</td>' +
		// '								<td colspan="2" align="left">Всі вищевикладені дані про переказ відповідають дійсності.</td>' +
		// '								<td colspan="2" align="left" >З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="text-align: center">(підпис платника)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
					'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="text-align: center">(підпис касира)</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '		<td colspan="2" align="left" style="font-size:8px">Унікальний ідентифікатор операції в Платіжній системi (код транзакції):&nbsp;{{ transaction_id}}</td>' +
		// '							</tr>' +
		// // '							<tr>' +
		// // '								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		// // '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left" font-size:8px>Унікальний ідентифікатор операції в Платіжній системi</td>' +
		// '							</tr>' +
					'					<tr>' +
		'								<td>Унікальний ідентифікатор операції в Платіжній системi (код транзакції):</td>' +
		'								<td align="right">{{ transaction_id}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

    payment_account_2_pages :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
                'text-align: left;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
                'text-align: left;' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="center">' +
		'						ВПС «FLASHPAY»' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;1' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: none;">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px; padding-bottom: 10px; text-align: center">КВИТАНЦІЯ № {{ num_eop }} вiд {{ date }}&nbsp;{{ time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" >Фінансова послуга: переказ коштів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Назва валюти: {{ currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Отримувач: {{ recipient_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Код отримувача: {{ recipient_ipn }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{recipient_account_title}}: {{ recipient_account }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Банк отримувача: {{ recipient_bank_name }}</td>' +
		'							</tr>' +
		'							{{#has_recipient_bank_code}}<tr>' +
		'								<td colspan="2" align="left">МФО банку отримувача: {{ recipient_bank_code }}</td>' +
		'							</tr>{{/has_recipient_bank_code}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">Призначення платежу: {{ purpose }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Сума переказу:</td>' +
		'								<td align="right" style="text-align: right">{{ currency_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Комісійна винагорода:</td>' +
		'								<td align="right" style="text-align: right">{{ commission_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Всього:</td>' +
		'								<td align="right" style="text-align: right">{{ payment_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Платник:</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black; text-align: center" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
            '{{#has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="padding-bottom: 7px">Адреса платника: {{ client_address }}</td>' +
		'							</tr>' +
            '{{/has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності. Всі вищевикладені дані про переказ відповідають дійсності. З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності.</td>' +
		// '								<td colspan="2" align="left">Всі вищевикладені дані про переказ відповідають дійсності.</td>' +
		// '								<td colspan="2" align="left" >З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="text-align: center">(підпис платника)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
					'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="text-align: center">(підпис касира)</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '		<td colspan="2" align="left" style="font-size:8px">Унікальний ідентифікатор операції в Платіжній системi (код транзакції):&nbsp;{{ transaction_id}}</td>' +
		// '							</tr>' +
		// // '							<tr>' +
		// // '								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		// // '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left" font-size:8px>Унікальний ідентифікатор операції в Платіжній системi</td>' +
		// '							</tr>' +
					'					<tr>' +
		'								<td>Унікальний ідентифікатор операції в Платіжній системi (код транзакції):</td>' +
		'								<td align="right">{{ transaction_id}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
					'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
					'<div class=\'column{{clas}}\'>' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="center">' +
		'						ВПС «FLASHPAY»' +
		'					</div>' +
		'					<div align="right">' +
		'						Примірник&nbsp;№&nbsp;2' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: none;">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px; padding-bottom: 10px; text-align: center">КВИТАНЦІЯ № {{ num_eop }} вiд {{ date }}&nbsp;{{ time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" >Фінансова послуга: переказ коштів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Назва валюти: {{ currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Отримувач: {{ recipient_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Код отримувача: {{ recipient_ipn }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{recipient_account_title}}: {{ recipient_account }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Банк отримувача: {{ recipient_bank_name }}</td>' +
		'							</tr>' +
		'							{{#has_recipient_bank_code}}<tr>' +
		'								<td colspan="2" align="left">МФО банку отримувача: {{ recipient_bank_code }}</td>' +
		'							</tr>{{/has_recipient_bank_code}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">Призначення платежу: {{ purpose }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Сума переказу:</td>' +
		'								<td align="right" style="text-align: right">{{ currency_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Комісійна винагорода:</td>' +
		'								<td align="right" style="text-align: right">{{ commission_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Всього:</td>' +
		'								<td align="right" style="text-align: right">{{ payment_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Платник:</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black; text-align: center" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
            '{{#has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="padding-bottom: 7px">Адреса платника: {{ client_address }}</td>' +
		'							</tr>' +
            '{{/has_payment_address}}' +
		'							<tr>' +
		'								<td colspan="2" align="left">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності. Всі вищевикладені дані про переказ відповідають дійсності. З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left">Ця операція не пов’язана зі здійсненням підприємницької та інвестиційної діяльності.</td>' +
		// '								<td colspan="2" align="left">Всі вищевикладені дані про переказ відповідають дійсності.</td>' +
		// '								<td colspan="2" align="left" >З умовами здійснення переказів у ВПС «FLASHPAY» ознайомлений та погоджуюсь. </td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="text-align: center">(підпис платника)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black">&nbsp;</td>' +
					'								<td align="center" style="padding-bottom: 10px">місце для' +
		'									<br /> штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="text-align: center">(підпис касира)</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '		<td colspan="2" align="left" style="font-size:8px">Унікальний ідентифікатор операції в Платіжній системi (код транзакції):&nbsp;{{ transaction_id}}</td>' +
		// '							</tr>' +
		// // '							<tr>' +
		// // '								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		// // '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" align="left" font-size:8px>Унікальний ідентифікатор операції в Платіжній системi</td>' +
		// '							</tr>' +
					'					<tr>' +
		'								<td>Унікальний ідентифікатор операції в Платіжній системi (код транзакції):</td>' +
		'								<td align="right">{{ transaction_id}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
			'</div>' +
		'</body>' +
		'</html>',

    payment_validate :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
                'text-align: left;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
                'text-align: left;' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
		'					<div style="font-weight: bolder; text-align:left; margin-top:10px">' +
		'						{{ company }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ full_name }}' +
		'					</div>' +
		'					<div style="font-weight: bolder; text-align: left">' +
		'						{{ address }}' +
		'					</div>' +
		'					<div align="center">' +
		'						ВПС «FLASHPAY»' +
		'					</div>' +
		'					<table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: none;">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding-top: 10px; padding-bottom: 10px; text-align: center; font-size:8px">Попередня КВИТАНЦІЯ для уточнення реквізитів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" >Фінансова послуга: переказ коштів</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">Назва валюти: {{ currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Сума переказу:</td>' +
		'								<td align="right" style="text-align: right;">{{ currency_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Комісійна винагорода:</td>' +
		'								<td align="right" style="text-align: right;">{{ commission_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Всього:</td>' +
		'								<td align="right" style="text-align: right;">{{ payment_amount }} грн.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Платник:</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black; text-align: center; font-size:8px" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="padding-top: 10px; padding-bottom: 10px; text-align: center; font-size:7px">Будь-ласка, перевірте правильність введених даних співробітником компанії.\n' +
        'Якщо всі дані введено вірно і зауважень Ви не маєте, просимо Вас нижче поставити свій підпис.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border-bottom:1px solid black" style="padding-top: 20px;">&nbsp;</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="text-align: center; font-size:8px" align="center">(підпис платника)</td>' +
		'								<td>&nbsp;</td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
			'</div></div>' +
		'</body>' +
		'</html>',

	//Черный квадрат для тестирования
	exchange_test :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
		'	<img width=100% src="data:image/jpeg;base64,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" alt="test" />' +
		'</body>' +
		'</html>',

	exchange2018 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
						'<div class=\'notation\'>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
 						'</div>' +
						'<h4 class=\'centered\'><b>КВИТАНЦIЯ № {{rro_id}}</b></h4>' +
						'<h4 class=\'centered\'>про здiйснення валютно-обмiнної операцiї*</h4>' +
						'<div class=\'notation\'>' +
							'<div>Дата та час здiйснення операцiї {{date}} {{time}}</div>' +
							'<div>Назва операцiї:	{{type}}</div>' +
						'</div>' +
						'<div class=\'notation\'>' +
							'<div>Прийнято: {{received}}</div>' +
							'<div>Курс: {{rate}}</div>' +
							'<div>До видачі: {{give}}</div>' +
 						'</div>' +
						'<div class=\'left-float\'>Сума комісії</div><hr>' +
						'<div class=\'left-float\'>Клієнт**</div>' +
						'{{#client}}' +
							'<div class=\'centered\'>' +
								'<div class=\'left-float hr two-thirds\'>{{ . }}</div>' +
							'</div>	' +
						'{{/client}}' +
						'{{^client}}' +
							'<div class=\'centered descriptive-field\'>' +
								'<hr>[прізвище, ім’я та по батькові (за наявності) фізичної особи]' +
							'</div>' +
						'{{/client}}' +
							'<div class=\'annotation-field centered\'><hr>(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</div>' +
							'<div class=\'quorter descriptive-field centered\'><hr>(підпис клієнта)</div>' +

							// '<div class="fullwidth" style="display:block">' +
							// 	'<div class=\'two-thirds left-float descriptive-field\'>Надаю згоду на проведення валютно-обмінної операції без оформлення першого примірника квитанції про здійснення валютно-обмінної операції (примірника клієнта)</div>' +
							// 	'<div class=\'right-float quorter annotation-field centered\'><hr>(підпис клієнта проставляється в разі надання такої згоди)</div>' +
							// '</div>' +

							// '<br><br><br>' +
							// '<div class=\'two-thirds left-float descriptive-field\'>Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377 </div>' +
							// '<div class=\'right-float quorter annotation-field centered\'><hr>(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</div>' +

							// '<br><br><br>' +
							// '<div class=\'left-float half annotation-field centered\'><hr>(пiдпис працiвника уповноваженого банку/уповноваженої фiнансової установи)</div>' +
							// '<div class=\'right-float half annotation-field centered\'>Мiсце для вiдбитка штампа</div>' +
							// '<br><br>' +
							'<div class=\'left-float annotation-field\'>*Здiйснення операцiї з купiвлi у фiзичної особи-нерезидента готiвкової iноземної валюти без оформлення довiдки-certificate за формою №377 не дає пiдстав для зворотного обмiну.</div>' +
							'<div class=\'left-float annotation-field\'>** Реквізити заповнюються під час здійснення валютно-обмінної операції на суму, що дорівнює чи перевищує в еквіваленті {{ max_buy }} гривень.</div>' +
					'</div>' +
							'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">ЧЕК № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">{{ type }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ПРИЙНЯТО&nbsp;{{ received_currency }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ДО&nbsp;ВИДАЧІ&nbsp;{{ give_currency }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none; border-right:1pt solid black;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none; border-right:1pt solid black;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
				//	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2018 :
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ПРИЙНЯТО&nbsp;{{ give_currency }}</td>' +
		'								<td align="right">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ДО&nbsp;ВИДАЧІ&nbsp;{{ received_currency }}</td>' +
		'								<td align="right">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>КУРС</td>' +
		'								<td align="right">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none; border-right:1pt solid black;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none; border-right:1pt solid black;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td>ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2019:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}}nbsp;{{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		'								<td style="border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2019_2:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAWAEgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+7j4s/C3wJ8cfhZ8S/gp8UtC/4Sj4ZfGD4f8AjL4W/EXwz/aesaJ/wkXgT4geHNS8J+LtC/tnw7qGkeINI/tfw/q+oaf/AGnoWq6ZrFh9o+1aZqFlexQXMX+OL+wV+y58Cf8Agol/wWr+FP7PfwU8Df8ACL/si/GD9r/x14y8M/Cj4peJvGOiaxY/sbfD/XvGPxt1n4T674q8J+IfG3jO2+IFz+zl4J1XwHpmpaf471O+m8d3GntdfEuyhlufHNp/pOf8HJ/7Xmnfsg/8Efv2p75L3w/H42/aP8Pp+yH8OdH8TaD4q1vTvEmo/H6y1Tw98SrK2l8Ly2ceg+INC/Z8s/jN468J694n1TTvCtt4q8I6NZ6jF4iub6w8HeJP5wf+DI/9kPUZ/FX7Y/7e2uWXiCz0jS/D+g/sh/DDUbbXvCreFfEeo69qPhr4zfHay1nwwsV142g8QeC7bw5+zpP4Z16afQvCt1p3j3xZp9vF4s1ezun8FgH7ff8ABaz9iP8A4J1fsof8ECPjd8Ir79n3xAf2fP2S/D/iPxz+y74C8M/EL4oaxqPwx/af+NXiTxr8MvhP8SbnXvEfxWsPEni7w/4b+Mn7TuqeKvFmh+OvFXjDw/F4VvtZFn4J8TSaN4b8Lt/KF/waGf8ABPH4Z/tfftofF39oz40eFfD/AI08E/sR+H/g345+H2l3PjH4heFvFXhv9p/xH8VrPx18DfiTo1j4Ku9F0jxR4f8ABukfAv4o2/ibQ/G2uXXh+51HxD4Thn8E+K7ae+vPDf6f/wDB7h+15p0HhX9jj9gnQ73w/eavqniDXv2vPifp1zoPipfFXhzTtB07xL8GfgTe6N4naW18Ez+H/Glz4j/aLg8TaDDBrviq11HwF4T1C4l8J6ReWqeNOf8A+CWP/Bpb+yB+1l/wT7/Ze/aZ/aw+IH7X/wANfjb8d/h/P8UtV8J/C34o/s/x+BIfAnjHxPr+s/BTXdCttQ+CHxK1Ow/4TH4JXXw78Y6npmreML/WNL1jX9Q07WNP8Oana3XhnRwD84P+DlT/AIKG/sBf8FT/AI+/s+eF/wBgD4S+IP2lP2g7zw/8KPAul/tVeE7r9ovQvFWvadceNPjvp9j+xl4Z/ZM8dfDjwrbeJ/EGqeNviH4M+I2jfFfw/Yal4q1rUddtvhrpMN5HDeQ2/wDT9/wR0/4JP/Br/ghR+wZ8QP29v2nPhx4gvP23vCf7MHx4+Jf7Uuo+BviJP49n8LfBrQksfjNdfs9fDbwwmueDvg3qXiDQ/Dfwh8Ez65rV3Pr0958ZW8baf4d+OOqfCG88Nva/xhf8EJf2hviZ/wAEyv8Agsz8M/gB8Tf2fPg/408beNP2n9C/Yh+KemeO/D3w98R/Ez4BfEzxH8SNR/Z51rxx8DfjrpOmeL9X8E+IPBOr+L/FGieN9O8BeI7r4e/HL4e3Wv8AhDXmnuZ/h98RfAH9fv8AweOftead8Ff+CaPhX9lrTr3w/J42/bU+MHh3RrzQtZ0HxVe6ifg18AdW0D4v+OvFnhPX9Lls/C2heINB+K1n+z54bubbxXdajPrPhXx14mTw74ZvbmxvvEvg8A/iC/Yv+E/7XH/Bfz/gqN8IPh5+0Z8YfjB8Z9X8c+IL3xN8dvivr+t63qE/wg/Zq8NeJtY+InxPtvBFxa+DfHHgn4J+Hzc+Jdc8JfA7wnb+B9E+CGg/GX4l+BPBkOjeHtI8TrGv9X3/AAW4/wCDcr/gj9+yD+xL+0l+3N8PPC/7T/wTufgn8H9N0bwX8KPg38WbLxx8PfEnxl8ceOLX4d/CrxZ4+t/2iLD4j/ESXw/L8RPiP4Hs/ihbeEvix4agtvhn4avb3wZ4ZPjY3MniQ/4Mj/2X/Cul/AL9sf8AbRvH8P6t428cfGDQf2X/AA9Hc+C9OHirwF4V+Ffgvw18V/GL6N8RJb651dvD/wAXNX+MfgVfE3gux0zRtOXUfgn4T1zVL7xLcvo9v4T/ALHfjp+1j+yx+y//AMIt/wANL/tLfs//ALO//Ccf23/whX/C9PjJ8OvhJ/wmH/CM/wBkf8JJ/wAIt/wn/iPw/wD8JB/wj/8AwkGg/wBt/wBk/a/7K/tvSPt/2f8AtKz84A/iC/4Mlvix+1P4v1j9s34W6r8S/wDhKP2Rfg/8P/g//Y3w68Z+MviLresfC74p/EDx38WfEXhn/hRHhG51K5+GXgn4f+NrK2+Neu/Hn7Lp+meI/Enju3+EGp6f9thi8WTqV/d58Lfix8LPjj4E0L4pfBT4l/D/AOMHwy8Uf2n/AMIz8Rfhb4y8OfEDwJ4i/sTWNQ8O6z/YXi7wnqWr+H9X/sjxBpGq6Fqf9n6hcfYNY0zUNMuvKvbK5giKAP8ANk/4PDP+Cifir43/ALYWkf8ABPCz8J+IPBXgn9ifxBD4s8Q61bfE/UdW8K/HbxV8dPgZ8DviD4O8Taz8LIvDWiaR4Y8QfBjSPEvjrwZ4Z1m+1/xzqN1p3j3xZPpdz4Tttd1jSdR/b7/gzR/a78K/Fj9iX4ufsg+HvgR4f+G2r/sg+IPC3izx18X9G13TrnUf2jPFX7Tnjj476/Z+JvFnhqx8EaBc6P4g+HXgn4Z+DvhfbazrHi/x9qPiHwr4b8M2cVz4b0jw5pehQlFAH8If/BWD/gon4q/4Kl/ttfEf9r7xD4T8QfDTSPFfh/4d+E/Avwg1n4n6j8WdO+E3hXwN4H0PQLzwz4T8S33hrwXbWvh/xH42g8Y/FC50bR/CHh7TrbxV8QfE15Lbahq+oaprurf6XfhP/gtF4V8Bf8G/3hn/AIK4+Bf2N/D/AIL8E+C/D+jeE/B37HHhP4p6d4c8K+E/Cvhz9rK2/Y28PeGfDPxE0f4NWekaD4f0LSLOz8VaNo2l/B+107S9OtbbwRY20FtBFrylFAH+YJ+xf+2Fp37On7efwg/bj+P/AMN/EH7X2r/DT4wXvx+8Q+FfFnxj8VeBvFXxJ+Mts+seKvB3xC8TfF2LSvGniS68QeHPjJP4c+LOsza3pPiSDx/qPh658P8Ai+31DSPEmsGT+/z/AIPLv2IfFXx0/Yl+Ef7aPh7xx4f0jSP2EPEHim28deAtZ07URqPjXwr+1L44+BHwys9Z8J69YtdW0HiDwX428OeDlufDOsaZaadrvhXxN4m1yLxZpWr+DdL8L+OSigD+aH/gmx/wdBftHf8ABNP/AIJ9t+xX4C+Afw/+L3i3wd8QPFHiL4EfFT4peKrq18CfC3wJ438T6L4z8U/DrXfhD4A8KeDvFvxK+1eLb/4t+KNM8Xal8edC1jTNY+JWn2kkF/4S8B6X4U1PgPg7Yf8ABRz/AIOsv2+rX4dfGf8AaX+H/hX/AIVR8P8Axh8VrPT9b0HVND+FnwK+BOo/Gj4faF4/0X4F/C3wVpN1/wAJj8QLD/hZXheDSJfiZ4u07xj8S/DngHwt4d+KH7QD/wDCK+HNTtCigD/T7/YD/Y68Cf8ABP8A/Y2/Z7/Y8+HV5/a/h/4HfD+z8O6h4m+z6xYf8Jx471e+v/FnxS+Iv9ja74n8Z3vhr/hZHxN8QeLvHn/CIweJ9X0fwf8A8JF/wi/h2eLw/pGmW0JRRQB//9k=" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2020_2:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'{{/tag_client}}' +
		'							{{#tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							{{/tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAWAEgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+7j4s/C3wJ8cfhZ8S/gp8UtC/4Sj4ZfGD4f8AjL4W/EXwz/aesaJ/wkXgT4geHNS8J+LtC/tnw7qGkeINI/tfw/q+oaf/AGnoWq6ZrFh9o+1aZqFlexQXMX+OL+wV+y58Cf8Agol/wWr+FP7PfwU8Df8ACL/si/GD9r/x14y8M/Cj4peJvGOiaxY/sbfD/XvGPxt1n4T674q8J+IfG3jO2+IFz+zl4J1XwHpmpaf471O+m8d3GntdfEuyhlufHNp/pOf8HJ/7Xmnfsg/8Efv2p75L3w/H42/aP8Pp+yH8OdH8TaD4q1vTvEmo/H6y1Tw98SrK2l8Ly2ceg+INC/Z8s/jN468J694n1TTvCtt4q8I6NZ6jF4iub6w8HeJP5wf+DI/9kPUZ/FX7Y/7e2uWXiCz0jS/D+g/sh/DDUbbXvCreFfEeo69qPhr4zfHay1nwwsV142g8QeC7bw5+zpP4Z16afQvCt1p3j3xZp9vF4s1ezun8FgH7ff8ABaz9iP8A4J1fsof8ECPjd8Ir79n3xAf2fP2S/D/iPxz+y74C8M/EL4oaxqPwx/af+NXiTxr8MvhP8SbnXvEfxWsPEni7w/4b+Mn7TuqeKvFmh+OvFXjDw/F4VvtZFn4J8TSaN4b8Lt/KF/waGf8ABPH4Z/tfftofF39oz40eFfD/AI08E/sR+H/g345+H2l3PjH4heFvFXhv9p/xH8VrPx18DfiTo1j4Ku9F0jxR4f8ABukfAv4o2/ibQ/G2uXXh+51HxD4Thn8E+K7ae+vPDf6f/wDB7h+15p0HhX9jj9gnQ73w/eavqniDXv2vPifp1zoPipfFXhzTtB07xL8GfgTe6N4naW18Ez+H/Glz4j/aLg8TaDDBrviq11HwF4T1C4l8J6ReWqeNOf8A+CWP/Bpb+yB+1l/wT7/Ze/aZ/aw+IH7X/wANfjb8d/h/P8UtV8J/C34o/s/x+BIfAnjHxPr+s/BTXdCttQ+CHxK1Ow/4TH4JXXw78Y6npmreML/WNL1jX9Q07WNP8Oana3XhnRwD84P+DlT/AIKG/sBf8FT/AI+/s+eF/wBgD4S+IP2lP2g7zw/8KPAul/tVeE7r9ovQvFWvadceNPjvp9j+xl4Z/ZM8dfDjwrbeJ/EGqeNviH4M+I2jfFfw/Yal4q1rUddtvhrpMN5HDeQ2/wDT9/wR0/4JP/Br/ghR+wZ8QP29v2nPhx4gvP23vCf7MHx4+Jf7Uuo+BviJP49n8LfBrQksfjNdfs9fDbwwmueDvg3qXiDQ/Dfwh8Ez65rV3Pr0958ZW8baf4d+OOqfCG88Nva/xhf8EJf2hviZ/wAEyv8Agsz8M/gB8Tf2fPg/408beNP2n9C/Yh+KemeO/D3w98R/Ez4BfEzxH8SNR/Z51rxx8DfjrpOmeL9X8E+IPBOr+L/FGieN9O8BeI7r4e/HL4e3Wv8AhDXmnuZ/h98RfAH9fv8AweOftead8Ff+CaPhX9lrTr3w/J42/bU+MHh3RrzQtZ0HxVe6ifg18AdW0D4v+OvFnhPX9Lls/C2heINB+K1n+z54bubbxXdajPrPhXx14mTw74ZvbmxvvEvg8A/iC/Yv+E/7XH/Bfz/gqN8IPh5+0Z8YfjB8Z9X8c+IL3xN8dvivr+t63qE/wg/Zq8NeJtY+InxPtvBFxa+DfHHgn4J+Hzc+Jdc8JfA7wnb+B9E+CGg/GX4l+BPBkOjeHtI8TrGv9X3/AAW4/wCDcr/gj9+yD+xL+0l+3N8PPC/7T/wTufgn8H9N0bwX8KPg38WbLxx8PfEnxl8ceOLX4d/CrxZ4+t/2iLD4j/ESXw/L8RPiP4Hs/ihbeEvix4agtvhn4avb3wZ4ZPjY3MniQ/4Mj/2X/Cul/AL9sf8AbRvH8P6t428cfGDQf2X/AA9Hc+C9OHirwF4V+Ffgvw18V/GL6N8RJb651dvD/wAXNX+MfgVfE3gux0zRtOXUfgn4T1zVL7xLcvo9v4T/ALHfjp+1j+yx+y//AMIt/wANL/tLfs//ALO//Ccf23/whX/C9PjJ8OvhJ/wmH/CM/wBkf8JJ/wAIt/wn/iPw/wD8JB/wj/8AwkGg/wBt/wBk/a/7K/tvSPt/2f8AtKz84A/iC/4Mlvix+1P4v1j9s34W6r8S/wDhKP2Rfg/8P/g//Y3w68Z+MviLresfC74p/EDx38WfEXhn/hRHhG51K5+GXgn4f+NrK2+Neu/Hn7Lp+meI/Enju3+EGp6f9thi8WTqV/d58Lfix8LPjj4E0L4pfBT4l/D/AOMHwy8Uf2n/AMIz8Rfhb4y8OfEDwJ4i/sTWNQ8O6z/YXi7wnqWr+H9X/sjxBpGq6Fqf9n6hcfYNY0zUNMuvKvbK5giKAP8ANk/4PDP+Cifir43/ALYWkf8ABPCz8J+IPBXgn9ifxBD4s8Q61bfE/UdW8K/HbxV8dPgZ8DviD4O8Taz8LIvDWiaR4Y8QfBjSPEvjrwZ4Z1m+1/xzqN1p3j3xZPpdz4Tttd1jSdR/b7/gzR/a78K/Fj9iX4ufsg+HvgR4f+G2r/sg+IPC3izx18X9G13TrnUf2jPFX7Tnjj476/Z+JvFnhqx8EaBc6P4g+HXgn4Z+DvhfbazrHi/x9qPiHwr4b8M2cVz4b0jw5pehQlFAH8If/BWD/gon4q/4Kl/ttfEf9r7xD4T8QfDTSPFfh/4d+E/Avwg1n4n6j8WdO+E3hXwN4H0PQLzwz4T8S33hrwXbWvh/xH42g8Y/FC50bR/CHh7TrbxV8QfE15Lbahq+oaprurf6XfhP/gtF4V8Bf8G/3hn/AIK4+Bf2N/D/AIL8E+C/D+jeE/B37HHhP4p6d4c8K+E/Cvhz9rK2/Y28PeGfDPxE0f4NWekaD4f0LSLOz8VaNo2l/B+107S9OtbbwRY20FtBFrylFAH+YJ+xf+2Fp37On7efwg/bj+P/AMN/EH7X2r/DT4wXvx+8Q+FfFnxj8VeBvFXxJ+Mts+seKvB3xC8TfF2LSvGniS68QeHPjJP4c+LOsza3pPiSDx/qPh658P8Ai+31DSPEmsGT+/z/AIPLv2IfFXx0/Yl+Ef7aPh7xx4f0jSP2EPEHim28deAtZ07URqPjXwr+1L44+BHwys9Z8J69YtdW0HiDwX428OeDlufDOsaZaadrvhXxN4m1yLxZpWr+DdL8L+OSigD+aH/gmx/wdBftHf8ABNP/AIJ9t+xX4C+Afw/+L3i3wd8QPFHiL4EfFT4peKrq18CfC3wJ438T6L4z8U/DrXfhD4A8KeDvFvxK+1eLb/4t+KNM8Xal8edC1jTNY+JWn2kkF/4S8B6X4U1PgPg7Yf8ABRz/AIOsv2+rX4dfGf8AaX+H/hX/AIVR8P8Axh8VrPT9b0HVND+FnwK+BOo/Gj4faF4/0X4F/C3wVpN1/wAJj8QLD/hZXheDSJfiZ4u07xj8S/DngHwt4d+KH7QD/wDCK+HNTtCigD/T7/YD/Y68Cf8ABP8A/Y2/Z7/Y8+HV5/a/h/4HfD+z8O6h4m+z6xYf8Jx471e+v/FnxS+Iv9ja74n8Z3vhr/hZHxN8QeLvHn/CIweJ9X0fwf8A8JF/wi/h2eLw/pGmW0JRRQB//9k=" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

    storno2019_2_pages:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		'								<td style="border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				    '<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		'								<td style="border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2019_2_pages_2:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				    '<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td align="center" style="border: none;">&nbsp;</td>' +
		'								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		'							</tr>' +
		'								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		'								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2020_2_pages_2:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'{{#tag_client}}'+
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'{{/tag_client}}'+
		'							{{#tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							{{/tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAWAEgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+7j4s/C3wJ8cfhZ8S/gp8UtC/4Sj4ZfGD4f8AjL4W/EXwz/aesaJ/wkXgT4geHNS8J+LtC/tnw7qGkeINI/tfw/q+oaf/AGnoWq6ZrFh9o+1aZqFlexQXMX+OL+wV+y58Cf8Agol/wWr+FP7PfwU8Df8ACL/si/GD9r/x14y8M/Cj4peJvGOiaxY/sbfD/XvGPxt1n4T674q8J+IfG3jO2+IFz+zl4J1XwHpmpaf471O+m8d3GntdfEuyhlufHNp/pOf8HJ/7Xmnfsg/8Efv2p75L3w/H42/aP8Pp+yH8OdH8TaD4q1vTvEmo/H6y1Tw98SrK2l8Ly2ceg+INC/Z8s/jN468J694n1TTvCtt4q8I6NZ6jF4iub6w8HeJP5wf+DI/9kPUZ/FX7Y/7e2uWXiCz0jS/D+g/sh/DDUbbXvCreFfEeo69qPhr4zfHay1nwwsV142g8QeC7bw5+zpP4Z16afQvCt1p3j3xZp9vF4s1ezun8FgH7ff8ABaz9iP8A4J1fsof8ECPjd8Ir79n3xAf2fP2S/D/iPxz+y74C8M/EL4oaxqPwx/af+NXiTxr8MvhP8SbnXvEfxWsPEni7w/4b+Mn7TuqeKvFmh+OvFXjDw/F4VvtZFn4J8TSaN4b8Lt/KF/waGf8ABPH4Z/tfftofF39oz40eFfD/AI08E/sR+H/g345+H2l3PjH4heFvFXhv9p/xH8VrPx18DfiTo1j4Ku9F0jxR4f8ABukfAv4o2/ibQ/G2uXXh+51HxD4Thn8E+K7ae+vPDf6f/wDB7h+15p0HhX9jj9gnQ73w/eavqniDXv2vPifp1zoPipfFXhzTtB07xL8GfgTe6N4naW18Ez+H/Glz4j/aLg8TaDDBrviq11HwF4T1C4l8J6ReWqeNOf8A+CWP/Bpb+yB+1l/wT7/Ze/aZ/aw+IH7X/wANfjb8d/h/P8UtV8J/C34o/s/x+BIfAnjHxPr+s/BTXdCttQ+CHxK1Ow/4TH4JXXw78Y6npmreML/WNL1jX9Q07WNP8Oana3XhnRwD84P+DlT/AIKG/sBf8FT/AI+/s+eF/wBgD4S+IP2lP2g7zw/8KPAul/tVeE7r9ovQvFWvadceNPjvp9j+xl4Z/ZM8dfDjwrbeJ/EGqeNviH4M+I2jfFfw/Yal4q1rUddtvhrpMN5HDeQ2/wDT9/wR0/4JP/Br/ghR+wZ8QP29v2nPhx4gvP23vCf7MHx4+Jf7Uuo+BviJP49n8LfBrQksfjNdfs9fDbwwmueDvg3qXiDQ/Dfwh8Ez65rV3Pr0958ZW8baf4d+OOqfCG88Nva/xhf8EJf2hviZ/wAEyv8Agsz8M/gB8Tf2fPg/408beNP2n9C/Yh+KemeO/D3w98R/Ez4BfEzxH8SNR/Z51rxx8DfjrpOmeL9X8E+IPBOr+L/FGieN9O8BeI7r4e/HL4e3Wv8AhDXmnuZ/h98RfAH9fv8AweOftead8Ff+CaPhX9lrTr3w/J42/bU+MHh3RrzQtZ0HxVe6ifg18AdW0D4v+OvFnhPX9Lls/C2heINB+K1n+z54bubbxXdajPrPhXx14mTw74ZvbmxvvEvg8A/iC/Yv+E/7XH/Bfz/gqN8IPh5+0Z8YfjB8Z9X8c+IL3xN8dvivr+t63qE/wg/Zq8NeJtY+InxPtvBFxa+DfHHgn4J+Hzc+Jdc8JfA7wnb+B9E+CGg/GX4l+BPBkOjeHtI8TrGv9X3/AAW4/wCDcr/gj9+yD+xL+0l+3N8PPC/7T/wTufgn8H9N0bwX8KPg38WbLxx8PfEnxl8ceOLX4d/CrxZ4+t/2iLD4j/ESXw/L8RPiP4Hs/ihbeEvix4agtvhn4avb3wZ4ZPjY3MniQ/4Mj/2X/Cul/AL9sf8AbRvH8P6t428cfGDQf2X/AA9Hc+C9OHirwF4V+Ffgvw18V/GL6N8RJb651dvD/wAXNX+MfgVfE3gux0zRtOXUfgn4T1zVL7xLcvo9v4T/ALHfjp+1j+yx+y//AMIt/wANL/tLfs//ALO//Ccf23/whX/C9PjJ8OvhJ/wmH/CM/wBkf8JJ/wAIt/wn/iPw/wD8JB/wj/8AwkGg/wBt/wBk/a/7K/tvSPt/2f8AtKz84A/iC/4Mlvix+1P4v1j9s34W6r8S/wDhKP2Rfg/8P/g//Y3w68Z+MviLresfC74p/EDx38WfEXhn/hRHhG51K5+GXgn4f+NrK2+Neu/Hn7Lp+meI/Enju3+EGp6f9thi8WTqV/d58Lfix8LPjj4E0L4pfBT4l/D/AOMHwy8Uf2n/AMIz8Rfhb4y8OfEDwJ4i/sTWNQ8O6z/YXi7wnqWr+H9X/sjxBpGq6Fqf9n6hcfYNY0zUNMuvKvbK5giKAP8ANk/4PDP+Cifir43/ALYWkf8ABPCz8J+IPBXgn9ifxBD4s8Q61bfE/UdW8K/HbxV8dPgZ8DviD4O8Taz8LIvDWiaR4Y8QfBjSPEvjrwZ4Z1m+1/xzqN1p3j3xZPpdz4Tttd1jSdR/b7/gzR/a78K/Fj9iX4ufsg+HvgR4f+G2r/sg+IPC3izx18X9G13TrnUf2jPFX7Tnjj476/Z+JvFnhqx8EaBc6P4g+HXgn4Z+DvhfbazrHi/x9qPiHwr4b8M2cVz4b0jw5pehQlFAH8If/BWD/gon4q/4Kl/ttfEf9r7xD4T8QfDTSPFfh/4d+E/Avwg1n4n6j8WdO+E3hXwN4H0PQLzwz4T8S33hrwXbWvh/xH42g8Y/FC50bR/CHh7TrbxV8QfE15Lbahq+oaprurf6XfhP/gtF4V8Bf8G/3hn/AIK4+Bf2N/D/AIL8E+C/D+jeE/B37HHhP4p6d4c8K+E/Cvhz9rK2/Y28PeGfDPxE0f4NWekaD4f0LSLOz8VaNo2l/B+107S9OtbbwRY20FtBFrylFAH+YJ+xf+2Fp37On7efwg/bj+P/AMN/EH7X2r/DT4wXvx+8Q+FfFnxj8VeBvFXxJ+Mts+seKvB3xC8TfF2LSvGniS68QeHPjJP4c+LOsza3pPiSDx/qPh658P8Ai+31DSPEmsGT+/z/AIPLv2IfFXx0/Yl+Ef7aPh7xx4f0jSP2EPEHim28deAtZ07URqPjXwr+1L44+BHwys9Z8J69YtdW0HiDwX428OeDlufDOsaZaadrvhXxN4m1yLxZpWr+DdL8L+OSigD+aH/gmx/wdBftHf8ABNP/AIJ9t+xX4C+Afw/+L3i3wd8QPFHiL4EfFT4peKrq18CfC3wJ438T6L4z8U/DrXfhD4A8KeDvFvxK+1eLb/4t+KNM8Xal8edC1jTNY+JWn2kkF/4S8B6X4U1PgPg7Yf8ABRz/AIOsv2+rX4dfGf8AaX+H/hX/AIVR8P8Axh8VrPT9b0HVND+FnwK+BOo/Gj4faF4/0X4F/C3wVpN1/wAJj8QLD/hZXheDSJfiZ4u07xj8S/DngHwt4d+KH7QD/wDCK+HNTtCigD/T7/YD/Y68Cf8ABP8A/Y2/Z7/Y8+HV5/a/h/4HfD+z8O6h4m+z6xYf8Jx471e+v/FnxS+Iv9ja74n8Z3vhr/hZHxN8QeLvHn/CIweJ9X0fwf8A8JF/wi/h2eLw/pGmW0JRRQB//9k=" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				    '<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ rro_data.Records.3.DocNo}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'{{#tag_client}}'+
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'{{/tag_client}}'+
		'							{{#tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							{{/tag_no_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">.</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2020_1:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник {{copy}}</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none; padding-right: 20px;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td align="center" style="border: none;">&nbsp;</td>' +
		// '								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		// '							</tr>' +
		// '								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		// '								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				//;	'<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{/columns}}' +
			'</div>' +
		'</body>' +
		'</html>',

	storno2020_2_pages_1:
		'{{>base}}' +
		'<style type="text/css">' +
		'{{#double_page}}' +
			'.column{' +
				'float: left;' +
				'padding: 0%;' +
				'width:50%;' +
			'} ' +
			'.right-column{' +
				'border-left: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'body, .notation{' +
				'font-size: 100%' +
			'}' +
			'.descriptive-field{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'{{^double_page}}' +
			'.column{' +
				'overflow:hidden;' +
				'padding-top:3%;' +
				'padding-left:5%;' +
				'padding-right:5%;' +
			'}' +
			'.right-column{' +
				'border-top: 2px dashed black;' +
			'}' +
			'body, table{' +
				'font-weight: bold;' +
			'}' +
			'table{' +
				'font-size: 100%' +
			'}' +
		'{{/double_page}}' +
		'</style>' +
		'</head>' +
		'<body>' +
			'<div class="page">' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 1</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td align="center" style="border: none;">&nbsp;</td>' +
		// '								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		// '							</tr>' +
		// '								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		// '								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
				    '<br><h4 class=\'centered\'><b>------------------------------------</b></h4>' +
				//'{{#columns}}' +
					'<div class=\'column{{clas}}\'>' +
						'<div class=\'notation-right\'>Примірник 2</div><br>' +
							'<div>{{company}}</div>' +
							'<div>{{full_name}}</div>' +
							'<div>{{address}}</div>' +
		'					<table style="border-collapse: collapse; border: none;" width="100%" cellspacing="0" cellpadding="0">' +
		'						<tbody>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">IД&nbsp;{{ edrpou }}</td>' +
		'								<td width="18pt" align="right" style="border: none; text-align:right;">ЗН&nbsp;{{ rro_data.Records.0.ZN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">КВИТАНЦIЯ № {{ num_eop }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none;">Сторно {{ type_storno }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_give}} {{ received_currency }} ({{ received_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ received_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ received_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{title_storno_received}} {{ give_currency }} ({{ give_currency_numcode }})</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ give_amount }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none; text-align:left; ">{{ give_currency_name }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left" style="border: none;  text-align:left; ">КУРС</td>' +
		'								<td align="right" style="border: none; text-align:right; ">{{ rate }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">СУМА КОМІСІЇ</td>' +
		'								<td align="right" style="border: none; text-align:right; ">0.00 UAH</td>' +
		'							</tr>' +
		'							{{#tag_client}}' +
		'							<tr>' +
		'								<td style="border: none;  text-align:left; ">Клієнт</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black;" colspan="2" align="center">{{ client }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(прізвище,ім\'я, по батькові (за наявності) фізичної особи)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td style="border: none; border-bottom:1px solid black" colspan="2" align="center">{{ passport }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="border: none; ">(зазначаються додаткові реквізити, необхідні для проведення валютно-обмінних операцій)</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center" style="padding: 10px; border: none;">&nbsp;</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="font-size: 80%; border: none; border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КЛІЄНТА&gt;</td>' +
		'							</tr>' +
		'							{{/tag_client}}' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none; text-align:left;">Надаю згоду на проведення операції з купівлі іноземної валюти без оформлення довідки-certificate за формою № 377</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td style="border: none; border-bottom:1px solid black">&nbsp;</td>' +
		// '								<td style="border: none;">&nbsp;</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td colspan="2" style="border: none;">(підпис клієнта-нерезидента проставляється в разі надання такої згоди)</td>' +
		// '							</tr>' +
		// '							<tr>' +
		// '								<td align="center" style="border: none;">&nbsp;</td>' +
		// '								<td align="center" style="padding-top: 10px; border: none;">місце для</td>' +
		// '							</tr>' +
		// '								<td style="font-size: 80%; border: none;  border-top:1pt solid black;">&lt;ПІДПИС&nbsp;КАСИРА&gt;</td>' +
		// '								<td align="center" style="padding-bottom: 10px; border: none;">штампа</td>' +
		// '							</tr>' +
		'							<tr>' +
		'								<td style="border: none; text-align:left;">Номер:&nbsp;{{ rro_data.Records.3.DocNo}}</td>' +
		'								<td align="right" style="border: none; text-align:right;">PID:&nbsp;{{ rro_data.Records.3.PID}}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="left" style="border: none; text-align:left;">{{ rro_date }}&nbsp;{{ rro_time }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td  style="border: none; text-align:left;">ФН&nbsp;{{ rro_data.Records.0.FN }}</td>' +
		'								<td align="right"  style="border: none;">{{ rro_data.Records.0.FSN }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td colspan="2" align="center"  style="border: none;"><img width=75 src={{ qr_base64_img }} alt="QR" /></div><br>{{ qrlink1 }}<br>{{ qrlink2 }}</td>' +
		'							</tr>' +
		'							<tr>' +
		'								<td align="left"  style="border: none; text-align:left;">ФІСКАЛЬНИЙ ЧЕК</td>' +
		'								<td align="right"  style="border: none;"><img width=25 src="data:image/jpeg;base64,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" alt="IKS" /></td>' +
		'							</tr>' +
		'						</tbody>' +
		'					</table>' +
					'</div>' +
			'</div>' +
		'</body>' +
		'</html>',

	xreport :
		'{{>base}}' +
		'	<style>' +
		'		table{' +
		'			font-size: 12;' +
		'			line-height: 1;' +
		'			width: 45%;' +
		'			border: 0;' +
		'		}' +
		'		left-align {' +
		'			text-align: left;' +
		'		}' +
		'		td {' +
		'			width: 1;' +
		'			text-align: center;' +
		'		}' +
		'		.right-align {' +
		'			text-align: right;' +
		'		}' +
				'@page {'+
					'size: A6;'+
					'margin: 0;'+
				'}'+
				'@media print {'+
					'.page {'+
						'margin: 2% 2%;'+
						'border: initial;'+
						'padding: 0%;'+
						'/*border: 5px red solid;*/'+
						'border-radius: initial;'+
						'width: initial;'+
						'/*min-height: 330mm;*/'+
						'box-shadow: initial;'+
						'background: initial;'+
						'page-break-after: always;'+
					'}'+
					'.column{'+
						'page-break-inside: avoid;'+
					'}'+
				'}'+
		'	</style>	' +
		'</head>' +
		'<body>' +
		'<div class="page col-sm-3">' +
		'	<table>' +
		'		<tr><td colspan="4">{{ company }}</td></tr>' +
		'		<tr><td colspan="4">{{ full_name }}</td></tr>' +
		'		<tr><td colspan="4">{{ address }}</td></tr>' +
		'		<tr><td colspan="4">РККС обміну валют</td></tr>' +
		'		<tr><td colspan="2">{{ resp.Records.0.TN }}</td><td colspan="2">ФН {{ resp.Records.0.FN }}</td></tr>' +
		'		<tr><td colspan="4">X-ЗВІТ</td></tr>' +
		'		<tr><td colspan="4">за {{ doc_date }}</td></tr>' +

		'		{{#currency_reports}}' +
		'		<tr><td class="left-align">ЗВІТ ПО ВАЛЮТІ</td><td>{{ code }}({{ numcode }})</td></tr>' +
		'		<tr><td class="left-align">Курси нац. валюти до USD за одиницю</td><td>{{ code }}({{ numcode }})</td></tr>' +
		'		<tr><td class="left-align">КУРС КУПІВЛІ</td><td class="right-align">{{ bought_rate }}</td></tr>' +
		'		<tr><td class="left-align">КУРС ПРОДАЖУ</td><td class="right-align">{{ sold_rate }}</td></tr>' +
		'		<tr><td class="left-align">КУРС НБУ</td><td class="right-align">{{ nbu_rate }}</td></tr>' +
		'		<tr><td class="left-align">КУПІВЛЯ</td><td class="right-align">{{ bought }}</td>' +
		'		<td class="right-align">{{ bought_equivalent }} грн.</td></tr>' +
		'		<tr><td class="left-align">ПРОДАЖ</td><td class="right-align">{{ sold }}</td>' +
		'		<td class="right-align">{{ sold_equivalent }} грн.</td></tr>' +
		'		<tr><td class="left-align">ВХ.ЗАЛИШОК</td><td class="right-align">{{ advance }}</td></tr>	' +
		'		{{/currency_reports}}' +

		'		<tr><td class="left-align">ВХ.ЗАЛИШОК UAH</td><td class="right-align">{{ advance }} грн.</td></tr>' +
		'		<tr><td class="left-align">ПІДКР.UAH</td><td class="right-align">{{ reinforcements }} грн.</td></tr>' +
		'		<tr><td class="left-align">ІНКАС.UAH</td><td class="right-align">{{ collected }} грн.</td></tr>' +
		'		<tr><td class="left-align">ВСЬОГО ДОКУМЕНТІВ</td><td class="right-align">{{ doc_num }}</td></tr>' +

		'		<tr><td colspan="4">{{ doc_date }} {{ doc_time }}</td></tr>' +
		'		<tr><td>ЗН: {{ resp.Records.0.ZN }}</td><td colspan="2">{{ resp.Records.0.FSN }}</td></tr>' +
		'		<tr><td colspan="4">СЛУЖБОВИЙ ЧЕК</td></tr>' +
		'	</table>' +
		'</div>' +
		'</body>' +
		'</html>',
	zreport :
		'{{>base}}' +
		'	<style>' +
		'		table{' +
		'			font-size: 12;' +
		'			line-height: 1;' +
		'			width: 45%;' +
		'			border: 0;' +
		'		}' +
		'		td {' +
		'			width: 1' +
		'		}' +
		'		#rkks, #doc_type, #recipe_type {' +
		'			text-align: center;' +
		'		}' +
		'		#fn {' +
		'			text-align: right;' +
		'		}' +
		'		.sufix {' +
		'			text-align: right;' +
		'			width: 1' +
		'		}' +
		'		.values {' +
		'			text-align: right;' +
		'		}' +
		'	</style>	' +
		'</head>' +
		'<body>' +
		'	<table>' +
		'		<tr><td id="company_name" colspan="5">ТОВ "ФІНАНСОВА КОМПАНІЯ ФІНАНС"</td></tr>' +
		'		<tr><td id="department_number" colspan="5">КИЇВСЬКЕ ВІДДІЛЕННЯ № 998</td></tr>' +
		'		<tr><td id="department_address" colspan="5">01187, м. Київ Велика Васильківська 42</td></tr>' +
		'		<tr><td id="rkks" colspan="5">РККС обміну валют</td></tr>' +
		'		<tr><td id="pn" colspan="2">ПН 000000000005</td><td id="fn" colspan="3">ФН 0000000005</td></tr>' +
		'		<tr><td id="doc_type" colspan="5">Z-ЗВІТ ДЕННИЙ</td></tr>' +
		'		<tr><td colspan="2">ЗВІТ ПО ВАЛЮТІ</td><td id="currency_name" colspan="3">USD(840)</td></tr>' +
		'		<tr><td colspan="3">КУРС КУПІВЛІ</td><td id="usd_buy_rate" class="values" colspan="2">25.00</td></tr>' +
		'		<tr><td colspan="3">КУРС ПРОДАЖУ</td><td id="usd_sell_rate" class="values" colspan="2">26.00</td></tr>' +
		'		<tr><td colspan="3">КУРС НБУ</td><td id="usd_nbu_rate" class="values" colspan="2">25.50</td></tr>' +
		'		<tr><td colspan="4">КУПІВЛЯ</td><td id="usd_buy_amount" class="values">100.00</td><td id="usd_buy_amount_equivalent" class="values">2500</td><td class="suffix">грн.</td></tr>' +
		'		<tr><td colspan="4">ПРОДАЖ</td><td id="usd_sell_amount" class="values">200.00</td><td id="usd_sell_amount_equivalent" class="values">5200</td><td class="suffix">грн.</td></tr>' +
		'		<tr><td colspan="3">ВХ.ЗАЛИШОК</td><td id="usd_initial_amount" class="values" colspan="2">150.00</td></tr>	' +
		'		<tr><td colspan="2">ЗВІТ ПО ВАЛЮТІ</td><td id="currency_name" colspan="3">EUR(978)</td></tr>	' +
		'		<tr><td colspan="3">КУРС КУПІВЛІ</td><td id="eur_buy_rate" class="values" colspan="2">29.00</td></tr>' +
		'		<tr><td colspan="3">КУРС ПРОДАЖУ</td><td id="eur_sell_rate" class="values" colspan="2">31.00</td></tr>' +
		'		<tr><td colspan="3">КУРС НБУ</td><td id="eur_nbu_rate" class="values" colspan="2">39.00</td></tr>' +
		'		<tr><td colspan="4">КУПІВЛЯ</td><td id="eur_buy_amount" class="values">1000.00</td><td id="eur_buy_amount_equivalent" class="values">29000</td><td class="suffix">грн.</td></tr>' +
		'		<tr><td colspan="4">ПРОДАЖ</td><td id="eur_sell_amount" class="values">1300.00</td><td id="eur_sell_amount_equivalent" class="values">40300</td><td class="suffix">грн.</td></tr>' +
		'		<tr><td colspan="3">ВХ.ЗАЛИШОК</td><td id="eur_initial_amount" class="values" colspan="2">1000.00</td></tr>	' +
		'		<tr><td colspan="5">ВХ.ЗАЛИШОК UAH</td><td id="uah_initial_amount" class="values">640000.00</td><td class="sufix"> грн.</td></tr>' +
		'		<tr><td colspan="5">ПІДКР.UAH</td><td id="uah_pdkr_amount" class="values">0.00</td><td class="sufix"> грн.</td></tr>' +
		'		<tr><td colspan="5">ІНКАС.UAH</td><td id="uah_inkas_amount" class="values">0.00</td><td class="sufix"> грн.</td></tr>		' +
		'		<tr><td colspan="5">ВСЬОГО ДОКУМЕНТІВ</td><td id="total_documents_amount" class="values">2</td></tr>			' +
		'		<tr><td>НОМЕР:</td><td id="doc_number">86</td><td>PID:</td><td id="pid_number" colspan="2">715</td></tr>' +
		'		<tr><td id="YA_HZ_CHE _ETO" colspan="5">ОБНУЛЕННЯ РЕГІСТРІВ</td></tr>' +
		'		<tr><td id="I_ETO_TOZHE" colspan="5">Z ЗВІТ ДІЙСНИЙ</td></tr>' +
		'		<tr><td id="doc_date">15.02.18</td><td id="doc_time">17:43:39</td><td colspan="3"></td></tr>' +
		'		<tr><td>ЗН:</td><td id="zh_number" >FK80130020</td><td>ФС:</td><td id="fs_type" colspan="2">ФС валютний</td></tr>' +
		'		<tr><td id="recipe_type" colspan="5">ФІСКАЛЬНИЙ ЧЕК</td></tr>' +
		'	</table>' +
		'</body>' +
		'</html>',

}
