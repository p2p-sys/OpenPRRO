ActualTime = moment

feroksoft = {
	deSerialize : function(data){
		return JSON.parse('{"' + decodeURI(data.replace(/&/g, "\",\"").replace(/=/g,"\":\"").replace(/\+/g," ")) + '"}')
	},
	detectIE : function() {
	    var ua = window.navigator.userAgent;

	    var msie = ua.indexOf('MSIE ');
	    if (msie > 0) {
	        // IE 10 or older => return version number
	        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	    }

	    var trident = ua.indexOf('Trident/');
	    if (trident > 0) {
	        // IE 11 => return version number
	        var rv = ua.indexOf('rv:');
	        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	    }

	    var edge = ua.indexOf('Edge/');
	    if (edge > 0) {
	       // Edge (IE 12+) => return version number
	       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	    }

	    // other browser
	    return false;
	},
	money_round : function(float_num, digits){
		// 0.00000000009 because 1003335.78999999999 == 1003335.79 and != 1003335.7899999999
		// 1003335.78999999999 && 1003335.7899999999
		// var summ = Math.floor(Math.abs(float_num+0.00000000009)*100)/100
		// 1258037.41
		// -810
		if (float_num >= 0){
			var summ = Math.floor(Math.abs(float_num+0.00009)*100)/100
		}else{
			var summ = -Math.floor(Math.abs(float_num-0.00009)*100)/100
		}
		return summ
	},
	money_round1 : function(float_num, digits){
		// 0.00000000009 because 1003335.78999999999 == 1003335.79 and != 1003335.7899999999
		// 1003335.78999999999 && 1003335.7899999999
		// var summ = Math.floor(Math.abs(float_num+0.00000000009)*100)/100
		// 1258037.41
		// -810
		if (float_num >= 0){
			var summ = Math.floor(Math.abs(float_num+0.00009)*10)/10
		}else{
			var summ = -Math.floor(Math.abs(float_num-0.00009)*10)/10
		}
		return summ
	},
	coin_round : function(coins){
		if (typeof coins == 'string'){coins = parseInt(coins)}
		if (typeof coins == 'undefined'){coins = 0}
		return (coins/100).toFixed(2)
	},
	money_round3 : function(coins){
		if (typeof coins == 'string'){coins = parseInt(coins)}
		if (typeof coins == 'undefined'){coins = 0}
		if (coins == 'null'){coins = 0}
		console.log(coins)
		return (coins).toFixed(2)
	},
	rates_round : function(float_num){
		return parseFloat(Math.abs(float_num).toFixed(8))
	},
	numberToWords : function(a, first_order, second_order) {
		function __declOfNum(n, t, o) {  
			// склонение именительных рядом с числительным: число (typeof = string), корень (не пустой), окончание
			var k = [2,0,1,1,1,2,2,2,2,2];
			return (t == '' ? '' : ' ' + t + (n[n.length-2] == "1"?o[2]:o[k[n[n.length-1]]]));}

		function __num_letters(k, d) { 
			// целое число прописью, если второй аргумент true, то в женском роде
			var i = ''
			var e = [
				['','тисяч','мільйон','мільярд','трильйон','квадрильйон','квінтильйон','секстильйон','септильйон','октильйон','нонільйон','децильйон'],
				['а','і',''],
				['','и','ів']
			];
			if (k == '' || k == '0' || k == '00') return ' нуль';
			// разбить число в массив с трёхзначными числами
			k = k.split(/(?=(?:\d{3})+$)/);  
			if (k[0].length == 1) k[0] = '00'+k[0];
			if (k[0].length == 2) k[0] = '0'+k[0];
			// преобразовать трёхзначные числа
			function t(k, d) {  
				var e = [
				['',' один',' два',' три',' чотири',' п\'ять',' шість',' сім',' вісім',' дев\'ять'],
				[' десять',' одинадцять',' дванадцять',' тринадцять',' чотирнадцять',' п\'ятнадцять',' шістнадцять',' сімнадцять',' вісімнадцять',' дев\'ятнадцять'],
				['','',' двадцять',' тридцять',' сорок',' п\'ятдесят',' шістдесят',' сімдесят',' вісімдесят',' дев\'яносто'],
				['',' сто',' двісті',' триста',' чотириста',' п\'ятсот',' шістсот',' сімсот',' вісімсот',' дев\'ятсот'],
				['',' одна',' дві']
				];
				return e[3][k[0]] + (k[1] == 1 ? e[1][k[2]] : e[2][k[1]] + (d ? e[4][k[2]] : e[0][k[2]]));
			}
			// соединить трёхзначные числа в одно число, добавив названия разрядов с окончаниями
			for (var j = (k.length - 1); j >= 0; j--) {  
				if (k[j] != '000') {
				i = (((d && j == (k.length - 1)) || j == (k.length - 2)) && (k[j][2] == '1' || k[j][2] == '2') ? t(k[j],1) : t(k[j])) + __declOfNum(k[j], e[0][k.length - 1 - j], (j == (k.length - 2) ? e[1] : e[2])) + i;
				}
			}
			return i.substring(1);}

		first_order = first_order ? first_order : ['грив', ['ня','ні','ень'], 'f']
		second_order = second_order ? second_order : ['копій', ['ка','ки','ок'], 'f']

		// округлить до сотых и сделать массив двух чисел: до точки и после неё
		//sum_letters('1231231231.23', first_order=['долар',['',"а", "ів"],'m'], second_order=['цент',['','а','ів',],'m'])
		a = Number(a).toFixed(2).split('.');
		x = __num_letters(a[0], first_order[2]=='f') 
			+ __declOfNum(a[0], first_order[0], first_order[1]) + ' '
			+ __num_letters(a[1], second_order[2]=='f')
			+ __declOfNum(a[1], second_order[0], second_order[1]);

		//return x;
		return x[0].toUpperCase() + x.substring(1);
	},
	intToWords : function(a) {
		function __declOfNum(n, t, o) {
			// склонение именительных рядом с числительным: число (typeof = string), корень (не пустой), окончание
			var k = [2,0,1,1,1,2,2,2,2,2];
			return (t == '' ? '' : ' ' + t + (n[n.length-2] == "1"?o[2]:o[k[n[n.length-1]]]));}

		function __num_letters(k, d) {
			// целое число прописью, если второй аргумент true, то в женском роде
			var i = ''
			var e = [
				['','тисяч','мільйон','мільярд','трильйон','квадрильйон','квінтильйон','секстильйон','септильйон','октильйон','нонільйон','децильйон'],
				['а','і',''],
				['','и','ів']
			];
			if (k == '' || k == '0' || k == '00') return '-';
			// разбить число в массив с трёхзначными числами
			k = k.split(/(?=(?:\d{3})+$)/);
			if (k[0].length == 1) k[0] = '00'+k[0];
			if (k[0].length == 2) k[0] = '0'+k[0];
			// преобразовать трёхзначные числа
			function t(k, d) {
				var e = [
				['',' один',' два',' три',' чотири',' п\'ять',' шість',' сім',' вісім',' дев\'ять'],
				[' десять',' одинадцять',' дванадцять',' тринадцять',' чотирнадцять',' п\'ятнадцять',' шістнадцять',' сімнадцять',' вісімнадцять',' дев\'ятнадцять'],
				['','',' двадцять',' тридцять',' сорок',' п\'ятдесят',' шістдесят',' сімдесят',' вісімдесят',' дев\'яносто'],
				['',' сто',' двісті',' триста',' чотириста',' п\'ятсот',' шістсот',' сімсот',' вісімсот',' дев\'ятсот'],
				['',' одна',' дві']
				];
				return e[3][k[0]] + (k[1] == 1 ? e[1][k[2]] : e[2][k[1]] + (d ? e[4][k[2]] : e[0][k[2]]));
			}
			// соединить трёхзначные числа в одно число, добавив названия разрядов с окончаниями
			for (var j = (k.length - 1); j >= 0; j--) {
				if (k[j] != '000') {
				i = (((d && j == (k.length - 1)) || j == (k.length - 2)) && (k[j][2] == '1' || k[j][2] == '2') ? t(k[j],1) : t(k[j])) + __declOfNum(k[j], e[0][k.length - 1 - j], (j == (k.length - 2) ? e[1] : e[2])) + i;
				}
			}
			return i.substring(1);}

		a = Number(a).toFixed(2).split('.');
		x = __num_letters(a[0]);
		return x[0].toUpperCase() + x.substring(1);
	},
}

$.round = function(float_num, digits){
	return parseFloat(Math.abs(float_num).toFixed(digits))
}
$.urlParam = function(name){
	// Returns GET params sent to this page
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null){
	   return null;
	}
	else{
	   return results[1] || 0;
	}
}
$.date = function(dateObject) {
	var d = new Date(dateObject);
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	var date = day + "/" + month + "/" + year;

	return date;
};
$.isoDateToTime = function(pythonDateString){
	if (pythonDateString){
		var d = moment(pythonDateString);
		var time = 
			("0"+d.hour()).slice(-2) + ':' + 
			("0"+d.minute()).slice(-2) + ':' + 
			("0"+d.second()).slice(-2);
		return time
	}else{
		return pythonDateString
	}
}
$.isoDateToUADate = function(pythonDateString, suffix){
	suffix = suffix ? suffix :' року'
	var d = moment(pythonDateString);
    ua_dic = {
        0:('Jan','січня'),
        1:('Feb','лютого'),
        2:('Mar','березня'),
        3:('Apr','квітня'),
        4:('May','травня'),
        5:('Jun','червня'),
        6:('Jul','липня'),
        7:('Aug','серпня'),
        8:('Sep','вересня'),
        9:('Oct','жовтня'),
        10:('Nov','листопада'),
        11:('Dec','грудня'),
    }
    date = d.date() + ' ' + ua_dic[d.month()] + ' ' + d.year() + suffix
    return date
}
$.isoDateToUSADate = function(jsDateObj){
	var d = jsDateObj;
    date = ("0"+d.getDate()).slice(-2) + '.' + ("0"+(d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear()
    return date
}
$.jsDateToWTForms = function(jsDateObj){
	d = jsDateObj
	date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
	time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
	return date + ' ' + time
}
$.getMovement = function(currency_id, operations, income, key, check_currency, fiscal_only, check_confirmation){
    var income = typeof income !== 'undefined' ? income : true;
    var key = typeof key !== 'undefined' ? key : 'money_amount';
    var check_currency = typeof check_currency !== 'undefined' ? check_currency : true;
    var fiscal_only = typeof fiscal_only !== 'undefined' ? fiscal_only : true;
    var check_confirmation = typeof check_confirmation !== 'undefined' ? check_confirmation : false;

    summ = 0
    $.each(operations, function(i,v){
        cond = income ? (v[key] > 0) : (v[key] < 0)
        cond2 = ((v.storno_time == null) || (v.fiscal_storno_time == null))
        cond3 = check_currency ? (v.currency_id==currency_id) : true
        // cond4 = fiscal_only ? (v.fiscal_time != null): true
        cond4 = fiscal_only ? (v.fiscal_time != null): (v.fiscal_time == null)
        cond5 = check_confirmation ? (v.confirmation_time != null) && (v.confirmation_time) : true
        // cond5 = check_confirmation ? (v.confirmation_time != null) && (v.confirmation_time) : (v.confirmation_time == null)

        if(cond&&cond2&&cond3&&cond4&&cond5){
            summ += v[key]
            // console.log(summ)
        }
    })
    return feroksoft.rates_round((income ? summ : -summ), 2)
}
$.getPaymentMovement = function(currency_id, operations, income, key, check_currency, fiscal_only, check_confirmation){
    var income = typeof income !== 'undefined' ? income : true;
    var key = typeof key !== 'undefined' ? key : 'money_amount';
    var check_currency = typeof check_currency !== 'undefined' ? check_currency : true;
    var fiscal_only = typeof fiscal_only !== 'undefined' ? fiscal_only : true;
    var check_confirmation = typeof check_confirmation !== 'undefined' ? check_confirmation : false;

    summ = 0
    $.each(operations, function(i,v){
        cond = income ? (v[key] > 0) : (v[key] < 0)
        cond2 = (v.cancel_time != null)
        cond3 = check_currency ? (v.currency_id==currency_id) : true
        // cond4 = fiscal_only ? (v.fiscal_time != null): true
        cond4 = fiscal_only ? (v.fiscal_time != null): (v.fiscal_time == null)
        cond5 = check_confirmation ? (v.confirmation_time != null) && (v.confirmation_time) : true
        // cond5 = check_confirmation ? (v.confirmation_time != null) && (v.confirmation_time) : (v.confirmation_time == null)
        cond6 = v.payment_time != null

        if(cond&&cond2&&cond3&&cond4&&cond5&&cond6){
            summ += v[key]
            // console.log(summ)
        }
    })
    return feroksoft.rates_round((income ? summ : -summ), 2)
}

$.getPaymentCancelMovement = function(currency_id, operations, income, key, check_currency, fiscal_only, check_confirmation){
    var income = typeof income !== 'undefined' ? income : true;
    var key = typeof key !== 'undefined' ? key : 'money_amount';
    var check_currency = typeof check_currency !== 'undefined' ? check_currency : true;
    var fiscal_only = typeof fiscal_only !== 'undefined' ? fiscal_only : true;
    var check_confirmation = typeof check_confirmation !== 'undefined' ? check_confirmation : false;

    summ = 0
    $.each(operations, function(i,v){
        cond = income ? (v[key] > 0) : (v[key] < 0)
        cond2 = ((v.cancel_time != null))
        cond3 = check_currency ? (v.currency_id==currency_id) : true
        // cond4 = fiscal_only ? (v.fiscal_time != null): true
        cond4 = fiscal_only ? (v.fiscal_time != null): (v.fiscal_time == null)
        cond5 = check_confirmation ? (v.confirmation_time != null) && (v.confirmation_time) : true
        // cond5 = check_confirmation ? (v.confirmation_time != null) && (v.confirmation_time) : (v.confirmation_time == null)

        if(cond&&cond2&&cond3&&cond4&&cond5){
            summ += v[key]
            // console.log(summ)
        }
    })
    return feroksoft.rates_round((income ? summ : -summ), 2)
}
$.toStringHex = function(arrayBuffer){
	return btoa(arrayBuffer.match(/\w{2}/g).map(function(a){return String.fromCharCode(parseInt(a, 16));}).join(''))
}
$.splitList = function(list, size, first_chunk){
	var size = size ? size :  3
	var first_chunk = first_chunk ? first_chunk :  3
	var x = list.slice()
	var y = []
	
	y.push(x.splice(0, first_chunk))
    while (x.length > 0)
        y.push(x.splice(0, size))
    return y
}
$.pad = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}


function preload_images() {
	var images = [];
    for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = preload_images.arguments[i];
    }
}

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}
function printZpl(zpl) {
  var printWindow = window.open();
  printWindow.document.open('text/plain')
  printWindow.document.write(zpl);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
function getFormData(tag){
	form = $(tag)
    var unindexed_array = form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}
function populateTable(data, parent){
	theader=$('<tr>')
	$.each(data.header, function( key, header ) {
		th = $('<th>')
		th.addClass('centered')
		th.html(header['name'])
		theader.append(th)
	});
	parent.find('thead').append(theader)

	parent.find('tbody').html('')
	$.each(data.data, function( key, line ) {
		tr = $('<tr>')
		$.each(data.header, function( key, header ) {
			td = $('<td>');
			td.html(line[header['name']])
			td.addClass(header['classes']);
			tr.append(td);			
		});
		parent.find('tbody').prepend(tr)
	});
	return true
}
function goHome(){
	window.location.href='/';
}
function markNormal(x){
	// if (x.parent().find('.alert-warning').html == 0) {
	x.removeClass('alert-danger');
	x.on('focus', function(){})
	x.parent().find('.alert-danger').remove()
	if (x.parent().find('.alert-warning').length != 0) {
        x.parent().find('.alert-warning').html('')
    }
}

function markError(x, msg){
	var msg = msg ? msg : 'Помилка заповнення поля'
	// x.setCustomValidity(msg)
	if (x.is(":visible")) {
		x.addClass('alert-danger');
		x.on('focus', function(){markNormal(x)})
        if (x.parent().find('.alert-warning').length == 0) {
            x.parent().append('<div class="alert-warning">' + msg + '</div>')
        } else {
            x.parent().find('.alert-warning').html(msg)
        }
    }
}


function displayModal(selector){
	selector.modal({
		backdrop:true,
		show: true,
		keyboard:true,
	})
	selector.find("#performOperation").prop('disabled', false)
}
function hideModal(selector){
	selector.modal({
		backdrop:true,
		show: false,
		keyboard:false,
	})
}
function sortTable(table_id, sortColumn){
    var tableData = document.getElementById(table_id).getElementsByTagName('tbody').item(0);
    var rowData = tableData.getElementsByTagName('tr');            
    for(var i = 0; i < rowData.length - 1; i++){
        for(var j = 0; j < rowData.length - (i + 1); j++){
            if(Number(rowData.item(j).getElementsByTagName('td').item(sortColumn).innerHTML.replace(/[^0-9\.]+/g, "")) < Number(rowData.item(j+1).getElementsByTagName('td').item(sortColumn).innerHTML.replace(/[^0-9\.]+/g, ""))){
                tableData.insertBefore(rowData.item(j+1),rowData.item(j));
            }
        }
    }
}
function addInput(insertAfterElement, label_name, ident){
	var label_name = label_name ? label_name : 'Отримано'
	var ident = ident ? ident : 'received'

	field = $('<div>').addClass('col-sm-9')
	input = $('<input>')
		.addClass('form-control')
		.attr("id", ident)
		.attr('name', ident)
		.attr('placeholder', "0")
		.attr('step', '0.01')
		.attr('type',"number")
		.val(0)
	field.append(input)
	field.insertAfter(insertAfterElement)
	label = $('<label>').addClass('col-sm-3 control-label').attr("for", ident).html(label_name)
	label.insertAfter(insertAfterElement)
	return input
}

$.actualRates = function(){
	var rates = JSON.parse(localStorage.getItem('today_rates')).reverse()[0]
	var company_rates = JSON.parse(localStorage.getItem('company_rates')).data
	var balances = JSON.parse(localStorage.getItem('balance'))
	if (!rates){rates = company_rates}

	$.each(balances, function(i, bal){
		var cid = bal.currency_id

		if(rates[cid]){
			var r = rates[cid]
			rates[cid].buy_rate = feroksoft.rates_round(r.buy_rate)
			rates[cid].sell_rate = feroksoft.rates_round(r.sell_rate)
        }else if(company_rates[cid]){
        	var r = company_rates[cid]
        	rates[cid] = {
        		buy_rate : feroksoft.rates_round(r.buy_rate),
        		sell_rate : feroksoft.rates_round(r.sell_rate)
        	}
		}else{
        	rates[cid] = {'buy_rate':'-', 'sell_rate':'-'}
		}
	})

	return rates}
$.addNavButton = function(btn_id, caption, hotkey_code){
	a = $('<a>')
		.attr('href', '#')
		.addClass("btn btn-md btn-default action-btn")
		.attr('id', btn_id)
		.html(caption)
	p = $('<p>').addClass('navbar-btn').append(a)
   	$('#navbar ul').append($('<li>').append(p))

   	// console.log(hotkey_code)

	///////// Hotkey
	if (hotkey_code){
		$('html').on('keydown', function(event) {
			if (event.keyCode == hotkey_code) {	
				event.preventDefault()
				$('#'+btn_id).trigger('click');
			}
		})
	}
	return a}
$.addNavTopButton = function(btn_id, caption, hotkey_code){
	a = $('<a>')
		.attr('href', '#')
		.addClass("btn btn-md btn-default action-btn")
		.attr('id', btn_id)
		.html(caption)
	p = $('<p>').addClass('navbar-btn').append(a)
   	$('#staticpanel ul').append($('<li>').append(p))

   	// console.log(hotkey_code)

	///////// Hotkey
	if (hotkey_code){
		$('html').on('keydown', function(event) {
			if (event.keyCode == hotkey_code) {
				event.preventDefault()
				$('#'+btn_id).trigger('click');
			}
		})
	}
	return a}
$.createModal = function(modal_id, btn_id, has_footer, bnt_caption, title){
	var has_footer = (typeof has_footer !== typeof undefined) ? has_footer : true
	var btn_id = (typeof btn_id !== typeof undefined) ? btn_id : 'performOperation'
	var bnt_caption = (typeof bnt_caption !== typeof undefined) ? bnt_caption : 'Провести'
	var title = (typeof title !== typeof undefined) ? title : 'Модальне вікно'

	p = $('<div>').attr('id', modal_id).addClass('modal fade').attr('role', 'dialog')
	c1 = $('<div>').addClass('modal-dialog')
	c2 = $('<div>').addClass('modal-content')
	header = $('<div>').addClass('modal-header')
		.append(
			$('<button>')
				.attr('type', 'button')
				.addClass('close')
				.attr('data-dismiss', "modal")
				.attr('aria-hidden', "true")
				.html('&times;'))
		.append(
			$('<h4>')
				.addClass('modal-title text-center')
				.html(title))
	body = $('<div>').addClass('modal-body')
	footer = $('<div>').addClass('modal-footer')
		.append(
			$('<button>')
				.attr('type', 'button')
				.addClass('btn btn-default')
				.attr('data-dismiss', "modal")
				.html('Відміна'))
		.append(
			$('<button>')
				.attr('type', 'button')
				.addClass('btn btn-primary')
				.attr('id', btn_id)
				.attr('data-dismiss', "modal")
				.html(bnt_caption))
	$('body').append(p)
	return p
		.append(c1
			.append(c2
				.append(header)
				.append(body)
				.append(has_footer ? footer:null)))}
$.check_connection = function(url){
	var url = url ? url : '/'
	return $.ajax({url: url,
        type: "HEAD",
        timeout:1000,
        statusCode: {
            200: function (response) {
                // alert('Working!');
            },
            400: function (response) {
                // alert('Not working!');
            },
            0: function (response) {
                // alert('Not working!');
            }              
        }
	});}

function select2pills(form, source){
	// Функція впливає лише на зовнішній вигляд
	form.parent().prepend($('<div>').addClass('nav nav-pills nav-stacked'))
	form.wrap($('<div>').addClass('col-md-9'))
	$('.nav-pills').wrap($('<div>').addClass('col-md-3'))
	$.each(source.find('option'), function(){
		$('.nav-pills')
		.append(
			$('<li>')
			.addClass(!!$(this).attr('selected') ? 'active' : '')
			.attr('value', $(this).val())
			.append(
				$('<a>')
				.html($(this).html())
			)
		)
	})
	// Ховаємо селект типу звіта
	source.parent().toggle()
	$('.nav.nav-pills.nav-stacked li').click(function(){
		$('.nav.nav-pills.nav-stacked li').removeClass('active')
		$(this).addClass('active')
		source.val($(this).val()).trigger('change')
	})}

// Додаткові функції для вибору дат
function cb_single(start, end) {
	$('#start').val(start.format('YYYY/MM/DD'))}
function cb_period(start, end) {
	$('#start').val(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'))   }
function cb_period_time(start, end) {
	$('#start').val(start.hour(OPEN_HOUR).minute(OPEN_MIN).second(0).format('YYYY/MM/DD HH:mm:ss') + ' - ' + end.hour(OPEN_HOUR).minute(OPEN_MIN).second(0).format('YYYY/MM/DD HH:mm:ss'))   }

RANGES_MONTHLY = {
		'Цього місяця': [ActualTime().startOf('month'), ActualTime()],
	    'Минулого місяця': [ActualTime().subtract(1, 'month').startOf('month'), ActualTime().subtract(1, 'month').endOf('month')]
	};for (var n = 2; n < 15; ++ n){
		m = ActualTime().subtract(n, 'month')
		mname = m.format('MMMM YYYY')
		mname = mname.substr(0,1).toUpperCase() + mname.substr(1)
		RANGES_MONTHLY[mname] = [ActualTime().subtract(n, 'month').startOf('month'), m.endOf('month')]}

RANGES_NORMAL = {
	'Сьогодні': [ActualTime(), ActualTime()],
	'Вчора': [ActualTime().subtract(1, 'days'), ActualTime().subtract(1, 'days')],
	'7 днів': [ActualTime().subtract(6, 'days'), ActualTime()],
	'Останні 30 днів': [ActualTime().subtract(29, 'days'), ActualTime()],
	'Цього місяця': [ActualTime().startOf('month'), ActualTime().endOf('month')],
	'Минулого місяця': [ActualTime().subtract(1, 'month').startOf('month'), ActualTime().subtract(1, 'month').endOf('month')]}

datepicker_types = {
	'monthly' : {
		singleDatePicker: false,
		timePicker:false,
		autoApply:true,
		// locale: { format: "YYYY-MM-DD" },
		ranges: RANGES_MONTHLY
	},
	'daily_single' : {
		singleDatePicker: true,
		timePicker: false,
		autoApply: true,
		// locale: { format: "YYYY-MM-DD" },
		startDate:ActualTime().format("YYYY-MM-DD" ),
		ranges: {}
	},
	'daily_custom' : {
		singleDatePicker: false,
		timePicker:false,
		autoApply:false,
		ranges: {}
	},
	'custom_with_time' :{
		singleDatePicker: false,
		timePicker:true,
		autoApply:false,
		ranges:false,
		showCustomRangeLabel:false,
	}}
	
dirty_drp = {
	case_datepicker : function(el){
		el.daterangepicker({
			timePicker: false,
			showDropdowns: true,
			singleDatePicker: true,
			format: 'YYYY-MM-DD'
			// format: el.attr('data-date-format')
		})
	},
	case_daterangepicker : function(el){
		el.daterangepicker({
			timePicker: false,
			showDropdowns: true,
			separator: ' до ',
			// format: el.attr('data-date-format')
			format: 'YYYY-MM-DD'
		})
	},
	case_datetimepicker : function(el){
		el.daterangepicker({
			timePicker: true,
			showDropdowns: true,
			singleDatePicker: true,
			timePickerIncrement: 1,
			timePicker12Hour: false,
			format: el.attr('data-date-format')
		})
		el.on('show.daterangepicker', function (event, data) {
			if (el.val() == "") {
				var now = ActualTime().seconds(0); // set seconds to 0
				// change datetime to current time if field is blank
				el.data('daterangepicker').setCustomDates(now, now);
			}
		});
	},
	case_datetimerangepicker : function(el){
		el.daterangepicker({
			timePicker: true,
			showDropdowns: true,
			timePickerIncrement: 1,
			timePicker12Hour: false,
			separator: ' до ',
			format: el.attr('data-date-format')
		})
	},
	case_timepicker : function(el){
		el.daterangepicker({
			timePicker: true,
			showDropdowns: true,
			format: el.attr('data-date-format'),
			timePicker12Hour: false,
			timePickerIncrement: 1,
			singleDatePicker: true
		})
		// hack to hide calendar to create a time-only picker
		el.data('daterangepicker').container.find('.calendar-date').hide();
		el.on('showCalendar.daterangepicker', function (event, data) {
			var $container = data.container;
			$container.find('.calendar-date').remove();
		})
	},
	case_timerangepicker : function(el){
		el.daterangepicker({
			// Bootstrap 2 option
			timePicker: true,
			showDropdowns: true,
			format: el.attr('data-date-format'),
			timePicker12Hour: false,
			separator: ' to ',
			timePickerIncrement: 1
		})
		// hack - hide calendar + range inputs
		el.data('daterangepicker').container.find('.calendar-date').hide();
		el.data('daterangepicker').container.find('.daterangepicker_start_input').hide();
		el.data('daterangepicker').container.find('.daterangepicker_end_input').hide();
		// hack - add TO between time inputs
		el.data('daterangepicker').container.find('.left').before($('<div style="float: right; margin-top: 20px; padding-left: 5px; padding-right: 5px;"> to </span>'));
		el.on('showCalendar.daterangepicker', function (event, data) {
		    var $container = data.container;
		    $container.find('.calendar-date').remove();
		})
	},
}

function remote_call(method, params){
	var params = params ? params : {}
	LOCAL_RPC_URL = JSON.parse(localStorage.getItem('general_settings')).LOCAL_RPC_URL
	//console.log(LOCAL_RPC_URL)
	return $.xmlrpc({
		url: (typeof LOCAL_RPC_URL !== typeof undefined) ? LOCAL_RPC_URL : 'http://127.0.0.1:5725/RPC2',
		methodName: method,
		params: params,
		success: function(response, status, jqXHR) { 
			// console.log('Sending: ' + method + '('+params+')')
			// console.log(response)
		},
		error: function(jqXHR, status, error) {} // alert(error.msg) }
	}).then(function(data){
		// console.log(method)
		if(['FSC'].indexOf(method) != -1){	return JSON.parse(data)	}
		else if(['directRKKS', 'directole', 'printerList', 'printThermo'].indexOf(method) != -1){return data}
		else{	return JSON.parse(data)	}
	});
}

checkLimits = function() {
	return $.ajax({
		type: "GET",
		url: 'api/department/check_limit',
		async: false,
		success: function (ret) {
			if (typeof ret.errors !== 'undefined') {
				if (typeof ret.errors.general !== 'undefined') {
					alert(ret.errors.general)
					if (typeof ret.errors.redirect !== 'undefined') {
						window.location = ret.errors.redirect;
					}
				}
			} else {
				localStorage.setItem('check_limits', JSON.stringify(ret))
			}
		}
	})
}

activeDepartments = function() {
	return $.ajax({
		type: "GET",
		url: 'api/department/active_departments',
		async: false,
		success: function (ret) {
			if (typeof ret.errors !== 'undefined') {
				if (typeof ret.errors.general !== 'undefined') {
					alert(ret.errors.general)
					if (typeof ret.errors.redirect !== 'undefined') {
						window.location = ret.errors.redirect;
					}
				}
			} else {
				localStorage.setItem('active_departments', JSON.stringify(ret))
			}
		}
	})
};

update_last_z = function() {
	return $.ajax({
		type: "GET",
		url: 'api/department/last_z',
		async: false,
		success: function (ret) {
			if (typeof ret.errors !== 'undefined') {
				if (typeof ret.errors.general !== 'undefined') {
					alert(ret.errors.general)
					if (typeof ret.errors.redirect !== 'undefined') {
						window.location = ret.errors.redirect;
					}
				}
			} else {
				localStorage.setItem('last_z', JSON.stringify(ret))
			}
		}
	})
};

check_z = function() {
	last_z = JSON.parse(localStorage.getItem('last_z'))
	if (last_z == 'undefined') {
		update_last_z()
    }

	if (last_z !== 'undefined') {
		if (last_z.status == "success") {
			if (moment(last_z.data.next_z).diff(ActualTime(), 'seconds') < 0) {
				update_last_z()
				last_z = JSON.parse(localStorage.getItem('last_z'))
				if (moment(last_z.data.next_z).diff(ActualTime(), 'seconds') < 0) {
                    return true
                }
			}
		}
	}
	return false
}

update_last_operation = function() {
	return $.ajax({
		type: "GET",
		url: 'api/department/last_operation',
		async: false,
		success: function (ret) {
			if (typeof ret.errors !== 'undefined') {
				if (typeof ret.errors.general !== 'undefined') {
					alert(ret.errors.general)
					if (typeof ret.errors.redirect !== 'undefined') {
						window.location = ret.errors.redirect;
					}
				}
			} else {
				localStorage.setItem('last_operation', JSON.stringify(ret))
			}
		}
	})
};

check_last_operation_z = function() {
	update_last_operation()
	last_operation = JSON.parse(localStorage.getItem('last_operation'))
	if (last_operation !== 'undefined') {
		if (last_operation.status == "success") {
			if (moment(last_operation.data.next_z).diff(ActualTime(), 'seconds') < 0) {
				console.log('Последний Z отчет был более 23:59, печатаем новый, даже если пустой');
				return false
			}
			if (last_operation.data.last_operation == "z_report") {
				console.log('Последняя операция - Z отчет, не печатаем новый пустой');
				return true
			}
		}
	}
	return false
}

check_last_operator = function() {
	last_operation = JSON.parse(localStorage.getItem('last_operation'))
	//console.log(last_operation)

	operator = JSON.parse(localStorage.getItem('operator'))
	//console.log(operator)
	if (last_operation == 'undefined') {
		update_last_operation()
    }

    try {
		if (last_operation !== 'undefined') {
            if (last_operation.status !== 'undefined') {
                if (last_operation.status == "success") {
                    if (last_operation.data.last_operation != "z_report") {
                        //console.log(last_operation.data)
                        if (last_operation.data.operator_id != operator.operator_id) {
                            update_last_operation()
                            if (last_operation.data.operator_id != operator.operator_id) {
                                return false
                            }
                        }
                    }
                }
            }
        }
	} catch(err) {

	}
    return true
}

function inform_server_advances(x){
	// if(x.data=='exists'){
	// 	return $.Deferred().resolve()
	// }else{
		return $.ajax({type: "POST", url: 'inform_day_opened', data:{} }).done(function(ret){
			if (typeof ret.errors !== 'undefined') {
				//modal_win.find('.alert-warning').remove()
				if (typeof ret.errors.general !== 'undefined') {
					console.log('alert'); alert(ret.errors.general)
					if (typeof ret.errors.redirect !== 'undefined') {
						window.location = ret.errors.redirect;
					}
				}
			} else if (ret.status == 'success'){
				var msg = 'Сервер повідомлено про відкриття нового дня...'
				__serverLog(msg)
				console.log(msg)
				localStorage.setItem('department_details', JSON.stringify(ret.department_details))
			}else if(ret.status == 'error'){
				console.log('alert'); alert(JSON.stringify(ret.errors))
			}
		})
	// }
}

String.prototype.replaceAll = function(find, replacement) {
	var x = new RegExp(find, 'g')
    return this.replace(x, replacement);
}
String.prototype.replace_all = function(replace, with_this){
    var str_hasil ="";
    var temp;

    for(var i=0;i<this.length;i++) // not need to be equal. it causes the last change: undefined..
    {
        if (this[i] == replace)
        {
            temp = with_this;
        }
        else
        {
                temp = this[i];
        }

        str_hasil += temp;
    }

    return str_hasil;
}

String.prototype.hexEncodeUTF = function(){
    var hex, i;
    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);}
    return result}
String.prototype.hexDecodeUTF = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));}
    return back;}
String.prototype.hexEncode = function(){
    var hex, i;
    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("0"+hex).slice(-2);}
    return result}
String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,2}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));}
    return back;}
String.prototype.ljust = function(width, filler){
	var filler = filler ? filler : ' '
	return (this + Array(width).join(filler)).slice(0,width)}
String.prototype.rjust = function(width, filler){
	var filler = filler ? filler : ' '
	return (Array(width).join(filler) + this).slice(this.length-1)}
String.prototype.cjust = function(width, filler){
	var width = width ? width : 20
	var filler = filler ? filler : ' '
	var half_text = Math.ceil(this.length/2)
	var half_width = Math.ceil(width/2)
	var field =  half_width - half_text
	return this.ljust(field+this.length, filler).rjust(width, filler)};
String.prototype.wrapText = function(width, delimiter, filler, justifyer_fns){
	var filler = filler ? filler : ' '
	var delimiter = delimiter ? delimiter : ','
	var justifyer_fns = justifyer_fns ? justifyer_fns : 'ljust'
	if(this.length <= width){
    	return [this[justifyer_fns](width, filler)]
	}
	var next_delimiter_index = this.lastIndexOf(delimiter, width)
	if (next_delimiter_index < 0){return [this]}

	var cutted_part = this.substr(0, next_delimiter_index)[justifyer_fns](width, filler)
	var leftover = this.substr(next_delimiter_index+1)

	return [cutted_part].concat(leftover.wrapText(width, delimiter, filler, justifyer_fns))}
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}



$.base64 = ( function( $ ) {
  
  var _PADCHAR = "=",
    _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    _VERSION = "1.0";


  function _getbyte64( s, i ) {
    // This is oddly fast, except on Chrome/V8.
    // Minimal or no improvement in performance by using a
    // object with properties mapping chars to value (eg. 'A': 0)

    var idx = _ALPHA.indexOf( s.charAt( i ) );

    if ( idx === -1 ) {
      throw "Cannot decode base64";
    }

    return idx;
  }
  
  
  function _decode( s ) {
    var pads = 0,
      i,
      b10,
      imax = s.length,
      x = [];

    s = String( s );
    
    if ( imax === 0 ) {
      return s;
    }

    if ( imax % 4 !== 0 ) {
      throw "Cannot decode base64";
    }

    if ( s.charAt( imax - 1 ) === _PADCHAR ) {
      pads = 1;

      if ( s.charAt( imax - 2 ) === _PADCHAR ) {
        pads = 2;
      }

      // either way, we want to ignore this last block
      imax -= 4;
    }

    for ( i = 0; i < imax; i += 4 ) {
      b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 ) | _getbyte64( s, i + 3 );
      x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff ) );
    }

    switch ( pads ) {
      case 1:
        b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 );
        x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff ) );
        break;

      case 2:
        b10 = ( _getbyte64( s, i ) << 18) | ( _getbyte64( s, i + 1 ) << 12 );
        x.push( String.fromCharCode( b10 >> 16 ) );
        break;
    }

    return x.join( "" );
  }
  
  
  function _getbyte( s, i ) {
    var x = s.charCodeAt( i );

    if ( x > 255 ) {
      throw "INVALID_CHARACTER_ERR: DOM Exception 5";
    }
    
    return x;
  }


  function _encode( s ) {
    if ( arguments.length !== 1 ) {
      throw "SyntaxError: exactly one argument required";
    }

    s = String( s );

    var i,
      b10,
      x = [],
      imax = s.length - s.length % 3;

    if ( s.length === 0 ) {
      return s;
    }

    for ( i = 0; i < imax; i += 3 ) {
      b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 ) | _getbyte( s, i + 2 );
      x.push( _ALPHA.charAt( b10 >> 18 ) );
      x.push( _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) );
      x.push( _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) );
      x.push( _ALPHA.charAt( b10 & 0x3f ) );
    }

    switch ( s.length - imax ) {
      case 1:
        b10 = _getbyte( s, i ) << 16;
        x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _PADCHAR + _PADCHAR );
        break;

      case 2:
        b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 );
        x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) + _PADCHAR );
        break;
    }

    return x.join( "" );
  }


  return {
    decode: _decode,
    encode: _encode,
    VERSION: _VERSION
  };
}( $ ) );

$.prototype.pySort = function(getCmpValueFns){
    return this.sort(function(a,b){
        var a = getCmpValueFns(a)
        var b = getCmpValueFns(b)
        if (a<b) {return 1;}
        if (a>b) {return -1;}
        else{return 0;}
    })
}
Array.prototype.pySort = function(getCmpValueFns){
    if(typeof this.sort !== 'function'){return this}
    return this.sort(function(a,b){
        var a = getCmpValueFns(a)
        var b = getCmpValueFns(b)
        if (a<b) {return 1;}
        if (a>b) {return -1;}
        else{return 0;}
    })
}
Array.prototype.groupIn = function(group_size){
	var blocks = [];
	while (this.length > 0)
		blocks.push(this.splice(0, group_size));
	return blocks
}

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

// Source: http://stackoverflow.com/questions/497790
var dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp)
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}


// var BrowserDetect = {
//   init: function () {
//   this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
//   this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
//   this.OS = this.searchString(this.dataOS) || "an unknown OS";
//   },
//   searchString: function (data) {
//   for (var i=0;i<data.length;i++) {
//   var dataString = data[i].string;
//   var dataProp = data[i].prop;
//   this.versionSearchString = data[i].versionSearch || data[i].identity;
//   if (dataString) {
//   if (dataString.indexOf(data[i].subString) != -1)
//   return data[i].identity;
//   }
//   else if (dataProp)
//   return data[i].identity;
//   }
//   },
//   searchVersion: function (dataString) {
//   var index = dataString.indexOf(this.versionSearchString);
//   if (index == -1) return;
//   return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
//   },
//   dataBrowser: [
//   {
//   string: navigator.userAgent,
//   subString: "Chrome",
//   identity: "Chrome"
//   },
//   { string: navigator.userAgent,
//   subString: "OmniWeb",
//   versionSearch: "OmniWeb/",
//   identity: "OmniWeb"
//   },
//   {
//   string: navigator.vendor,
//   subString: "Apple",
//   identity: "Safari",
//   versionSearch: "Version"
//   },
//   {
//   prop: window.opera,
//   identity: "Opera",
//   versionSearch: "Version"
//   },
//   {
//   string: navigator.vendor,
//   subString: "iCab",
//   identity: "iCab"
//   },
//   {
//   string: navigator.vendor,
//   subString: "KDE",
//   identity: "Konqueror"
//   },
//   {
//   string: navigator.userAgent,
//   subString: "Firefox",
//   identity: "Firefox"
//   },
//   {
//   string: navigator.vendor,
//   subString: "Camino",
//   identity: "Camino"
//   },
//   {
//   /* For Newer Netscapes (6+) */
//   string: navigator.userAgent,
//   subString: "Netscape",
//   identity: "Netscape"
//   },
//   {
//   string: navigator.userAgent,
//   subString: "MSIE",
//   identity: "Internet Explorer",
//   versionSearch: "MSIE"
//   },
//   {
//   string: navigator.userAgent,
//   subString: "Gecko",
//   identity: "Mozilla",
//   versionSearch: "rv"
//   },
//   {
//   /* For Older Netscapes (4-) */
//   string: navigator.userAgent,
//   subString: "Mozilla",
//   identity: "Netscape",
//   versionSearch: "Mozilla"
//   }
//   ],
//   dataOS : [
//   {
//   string: navigator.platform,
//   subString: "Win",
//   identity: "Windows"
//   },
//   {
//   string: navigator.platform,
//   subString: "Mac",
//   identity: "Mac"
//   },
//   {
//   string: navigator.userAgent,
//   subString: "iPhone",
//   identity: "iPhone/iPod"
//   },
//   {
//   string: navigator.platform,
//   subString: "Linux",
//   identity: "Linux"
//   }
//   ]
//
// };