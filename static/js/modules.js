FiscalCommonsLib = {
    sync_storno_operation: function (exchange_operation_data, fiscal_device) {
        var storno_max_seconds = JSON.parse(localStorage.getItem('general_settings')).STORNO_MAX_DELAY
        var rro_max_time_diff = JSON.parse(localStorage.getItem('general_settings')).OPERATION_RRO_MAX_DIFF
        var is_too_old = ActualTime().diff(moment(exchange_operation_data.storno_time), 'seconds') >= rro_max_time_diff
        var is_stornabile = ActualTime().diff(moment(exchange_operation_data.operation_time), 'seconds') < storno_max_seconds

        var rate_type = exchange_operation_data.currency_amount > 0 ? 'buy_rate' : 'sell_rate'
        var rate_now = $.actualRates()[exchange_operation_data.currency_id][rate_type]
        var rate_then = exchange_operation_data.exchange_rate
        var is_rate_same = (rate_then == rate_now)

        if (is_stornabile && !is_too_old && is_rate_same) {
            console.log('Проводимо сторно на ' + fiscal_device)
            x = perform_storno()
        } else if (!is_stornabile) {
            x = cancelStorno(exchange_operation_data.virtual_id).done(function () {
                console.log('alert');
                alert('Не встигли сторнувати операцію №' + exchange_operation_data.num_eop + ' на ' + fiscal_device + ' за 15 хвилин, операцію сторно скасовано')
            })
        } else if (is_too_old) {
            x = cancelStorno(exchange_operation_data.virtual_id).done(function () {
                console.log('alert');
                alert('Не встигли сторнувати операцію №' + exchange_operation_data.num_eop + ' на ' + fiscal_device + ', операцію сторно скасовано')
            })
        } else if (!is_rate_same) {
            x = cancelStorno(exchange_operation_data.virtual_id).done(function () {
                console.log('alert');
                alert('Не можливо сторнувати операцію №' + exchange_operation_data.num_eop + ' на ' + fiscal_device + ', курс операції не співпадає з поточним курсом данної валюти. Змініть курс на той, що був під час операції і спробуйте знову.')
            })
        }
        return x
    }
}

var limit_block = false

DataUtilsModule = function () {
    __getCurrency = function (currency_id) {
        return $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == currency_id;
        })[0]
    }
    __getCurrencyByCode = function (currency_code) {
        return $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.code == currency_code;
        })[0]
    }
    __getAllCurrencies = function () {
        var bal = JSON.parse(localStorage.getItem('balance'))
        var currs = []
        $.each(bal, function (k, v) {
            c = __getCurrency(v.currency_id)
            currs.push({
                'numcode': c.numcode,
                'code': c.code,
                'name': c.name
            })
        })
        return currs
    }
    __getCurrencyCode = function (currency_id) {
        var curr = $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == currency_id;
        })[0]
        return curr ? curr.code : null
    }
    __getNumCode = function (currency_id) {
        return $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == currency_id;
        })[0].numcode
    }
    __convCurrNumToCode = function (currency_numcode) {
        var curr = $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.numcode == currency_numcode;
        })[0]
        return curr ? curr.code : null
    }
    __getCurrDegree = function (currency_id) {
        return $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == currency_id;
        })[0].degree
    }
    __getCurrencyNBURate = function (currency_id) {
        return JSON.parse(localStorage.getItem('nbu_rates'))[currency_id]
    }
    __getExOpById = function (operation_id) {
        return $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
            return n.id == operation_id;
        })[0]
    }
    __getExOpRealId = function (virtual_id) {
        return $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
            return n.virtual_id == virtual_id;
        })[0].id
    }
    __getCfOpById = function (operation_id) {
        return $.grep(JSON.parse(localStorage.getItem('cashflow_operations')), function (n, i) {
            return n.id == operation_id;
        })[0]
    }
    __getPrintingSettings = function () {
        var psettings = JSON.parse(localStorage.getItem('settings'))['printer_settings']
        psettings = psettings ? JSON.parse(psettings) : {}
        return psettings
    }
    __getUserExchanges = function (eops) {
        eops = typeof eops !== 'undefined' ? eops : JSON.parse(localStorage.getItem('exchange_operations'))
        return eops.filter(function (index, value) {
            return index.operator_id == operator.operator_id
        })
    }
    __getUserCashflows = function (eops) {
        eops = typeof eops !== 'undefined' ? eops : JSON.parse(localStorage.getItem('cashflow_operations'))
        return eops.filter(function (index, value) {
            return index.operator_id == operator.operator_id
        })
    }
    __getNotRefusedCashflows = function () {
        cashflow_operations = JSON.parse(localStorage.getItem('cashflow_operations'))
        return $.grep(cashflow_operations, function (n, i) {
            return n.refusal_time === null
        })
    }
    __getUserPayments = function (eops) {
        eops = typeof eops !== 'undefined' ? eops : JSON.parse(localStorage.getItem('payment_operations'))
        return eops.filter(function (index, value) {
            return index.operator_id == operator.operator_id
        })
    }
    __serverLog = function (msg) {
        return $.ajax({
            type: "POST",
            url: 'log_message',
            data: {msg: msg},
        }).done(function (ret) {
            if (typeof ret.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
            }
        })
    }

    __bank_day_started = function () {
        var config = JSON.parse(localStorage.getItem('general_settings'))
        var x = ActualTime()
        var y = ActualTime().hour(config.OPER_DATE_HOUR).minute(config.OPER_DATE_MINUTE).second(0)
        if (x < y) {
            return y.subtract(1, 'days')
        } else {
            return y
        }
    }
    __getWebRates = function () {
        var nbu_rates = JSON.parse(localStorage.getItem('nbu_rates'))
        var settings = JSON.parse(localStorage.getItem('general_settings'))
        var actual_rates = $.actualRates()
        var department_rates = []
        $.each(JSON.parse(localStorage.getItem('balance')), function (k, v) {
            var currency_id = parseInt(v['currency_id'])
            var numcode = __getNumCode(currency_id)
            if (numcode != __getNumCode(settings.UAH_ID)) {
                var tmp_dict = {num_code: numcode}
                if (nbu_rates[currency_id]) {
                    tmp_dict.nbu_rate = nbu_rates[currency_id].rate
                } else {
                    var msg = 'Відсутній курс НБУ для валюти: ' + __getCurrencyCode(currency_id)
                    console.log(msg)
                    __serverLog(msg)
                    tmp_dict.nbu_rate = 1
                }

                if (actual_rates[currency_id]) {
                    tmp_dict.buy_rate = actual_rates[currency_id].buy_rate
                    tmp_dict.sell_rate = actual_rates[currency_id].sell_rate
                } else {
                    var msg = 'Не встановлено курс для валюти: ' + __getCurrencyCode(currency_id)
                    console.log(msg)
                    console.log('alert');
                    alert(msg)
                    __serverLog(msg)
                    tmp_dict.buy_rate = 1
                    tmp_dict.sell_rate = 1
                }
                department_rates.push(tmp_dict)
            }
        })
        return department_rates
    }

    addZero = function (digits_length, source) {
        var text = source + '';
        while (text.length < digits_length)
            text = '0' + text;
        return text;
    }

    // __getDepVolUSD = function () {
    //     var config = JSON.parse(localStorage.getItem('general_settings'))
    //     var acc_statement = report['accounting_statement']({}, true).currencies
    //
    //
    //     var uah_volumes = acc_statement.filter(function (element, value) {
    //         return element.currency_id == config.UAH_ID
    //     })[0]
    //     var uah_volumes = uah_volumes.bought + uah_volumes.sold
    //     var usd_nbu = __getCurrencyNBURate(__getCurrencyByCode('USD').id)
    //     return feroksoft.money_round(uah_volumes / usd_nbu.rate)
    // }
    // __getDepLeftUAH = function () {
    //     var acc_statement = report['accounting_statement']({}, true).currencies
    //     var total_left = 0
    //     $.each(acc_statement, function (k, v) {
    //         var nbu = __getCurrencyNBURate(v.currency_id).rate
    //         var left = nbu * v.current
    //         total_left += left
    //     })
    //     return feroksoft.money_round(total_left)
    // }

    // __getAccResult = function () {
    //     var config = JSON.parse(localStorage.getItem('general_settings'))
    //     var acc_statement = report['accounting_statement']({}, true).currencies
    //     var total_sold_nbu = 0
    //     var total_bought_nbu = 0
    //     $.each(acc_statement, function (k, v) {
    //         if (v.currency_id == config.UAH_ID) {
    //             sold_equiv = v.bought
    //             bought_equiv = v.sold
    //             return;
    //         }
    //         var nbu = __getCurrencyNBURate(v.currency_id).rate
    //         total_sold_nbu += nbu * v.sold
    //         total_bought_nbu += nbu * v.bought
    //     })
    //     return feroksoft.money_round(sold_equiv - total_sold_nbu + total_bought_nbu - bought_equiv)
    // }
}


InterfacePopulatorsModule = function () {
    updateStatusTable = function () {
        var rates = $.actualRates()
        var balance = JSON.parse(localStorage.getItem('balance'))
        // var exchange_operations = JSON.parse(localStorage.getItem('exchange_operations'))
        // var cashflow_operations = JSON.parse(localStorage.getItem('cashflow_operations'))
        // var currencies = JSON.parse(localStorage.getItem('currencies'))
        var settings = JSON.parse(localStorage.getItem('general_settings'))
        var limits = JSON.parse(localStorage.getItem('department_limits')).data

        tbody = $('.status-table tbody').eq(0)
        tbody.html('')

        rates[settings.UAH_ID] = {buy_rate: '-', sell_rate: '-'}
        dic = {}
        in_equivalent = 0
        out_equivalent = 0

        $.each(balance, function (bid, balance) {
            cid = balance.currency_id
            rate = rates[cid]
            if (!rate) {
                rate = {buy_rate: 1, sell_rate: 1}
            }

            // if (cid == 'rates_time') {
            //     return true
            // }

            var leftover_suffix = balance.frozen_balance > 0 ? '\n(-' + balance.frozen_balance + ')' : ''

            // acc_data = report['accounting_statement']({}, true).currencies
            //     .filter(function (element, value) {
            //         return element.currency_id == cid
            //     })[0]

            // curr_limit = $.grep(limits, function (n, i) {
            //     return n.currency_id == cid
            // })[0]
            // if (typeof curr_limit == 'undefined') {
            //     limit = 0
            // } else {
            //     limit = curr_limit.limit
            // }
            // dic[cid] = {
            //     limit: limit,
            //     ccode: acc_data.strcode,
            //     buy: feroksoft.rates_round(rate.buy_rate),
            //     sell: feroksoft.rates_round(rate.sell_rate),
            //     bought: acc_data.bought,
            //     sold: acc_data.sold,
            //     leftover: acc_data.current + leftover_suffix
            // }
            // console.log(rate)

            if (settings.DESIGN == 1) {
                dic[cid] = {
                    limit: balance.limit,
                    ccode: balance.curr_code,
                    buy: feroksoft.rates_round(rate.buy_rate),
                    sell: feroksoft.rates_round(rate.sell_rate),
                    bought: balance.bought,
                    sold: balance.sold,
                    leftover: balance.balance + leftover_suffix
                }
            } else {
                dic[cid] = {
                    ccode: balance.curr_code,
                    buy: feroksoft.rates_round(rate.buy_rate),
                    sell: feroksoft.rates_round(rate.sell_rate),
                    bought: balance.bought,
                    sold: balance.sold,
                    leftover: balance.balance + leftover_suffix,
                    // limit: balance.limit,
                }
            }
        })

        $.each(dic, function (k, v) {
            tr = $('<tr>')
            if ((parseInt(v.limit) > 0) && (parseInt(v.leftover) > parseInt(v.limit))) {
                $.each(v, function (k2, v2) {
                    td = $('<td>');
                    td.html(v2)
                    td.addClass('centered')
                    if (k2 == "leftover") {
                        td.addClass('red-colored')
                    }
                    tr.append(td)
                    if (settings.DESIGN == 2) {
                        if (k2 == "bought") {
                            td.addClass('buy-colored')
                        }
                        if (k2 == "sold") {
                            td.addClass('sell-colored')
                        }
                    }
                })
            } else {
                $.each(v, function (k2, v2) {
                    td = $('<td>');
                    td.html(v2)
                    td.addClass('centered')
                    tr.append(td)
                    if (settings.DESIGN == 2) {
                        if (k2 == "bought") {
                            td.addClass('buy-colored')
                        }
                        if (k2 == "sold") {
                            td.addClass('sell-colored')
                        }
                    }
                })
            }
            tbody.append(tr)
        })

        sortTable('status-table', 3)
        $.each([].concat(CURRENCY_ORDER).reverse(), function (i, ccode) {
            $('.status-table').prepend($('.status-table tr td:contains("' + ccode + '")').parent())
        })
    }

    updateOperationsTable = function () {
        operator = JSON.parse(localStorage.getItem('operator'))
        exchange_operations = __getUserExchanges()

        currencies = JSON.parse(localStorage.getItem('currencies'))
        var settings = JSON.parse(localStorage.getItem('general_settings'))

        tbody = $('.oper-table tbody').eq(0)
        tbody.html('')

        if (__getPrintingSettings().doc_printer_double == 'n') {
            $('#oper-table-th-number').attr("style", "display:none");
            var hide_number = true;
        } else {
            var hide_number = false;
        }

        function compare(a, b) {
            if (a.operation_time < b.operation_time) {
                return -1;
            } else if (a.operation_time > b.operation_time) {
                return 1;
            } else {
                return 0;
            }
        }

        //
        // exchange_operations.sort(compare)

        var max_eop = 1000;
        var count_eop = 0;

        $.each(exchange_operations, function (i, op) {
            tr = $('<tr>').addClass((op.currency_amount > 0) ? 'buy-colored' : 'sell-colored')
            //console.log(op)

            if (count_eop < max_eop) {
                new2019 = new Date("2019-01-01T09:00")

                if (new Date(op.fiscal_time) >= new2019) {
                    num_eop = op.num_eop < 1 ? op.virtual_id : op.num_eop
                } else {
                    num_eop = op.virtual_id
                }

                if (settings.DESIGN == 1) {
                    dic = [
                        exchange_operations.length - i,
                        op.virtual_id,
                        num_eop,
                        $.grep(currencies, function (n, i) {
                            return n.id == op.currency_id;
                        })[0].code,
                        // (op.currency_amount > 0) ? 'Купівля' : 'Продаж',
                        $.isoDateToUSADate(new Date(op.operation_time)),
                        $.isoDateToTime(op.operation_time),
                        feroksoft.rates_round(op.exchange_rate),
                        feroksoft.money_round(Math.abs(op.currency_amount), 2).toFixed(2),
                        feroksoft.money_round(Math.abs(op.equivalent), 2).toFixed(2),
                        '',
                        op.storno_time, //fiscal_storno_time
                    ]
                } else {
                    dic = [
                        exchange_operations.length - i,
                        op.virtual_id,
                        num_eop,
                        $.isoDateToUSADate(new Date(op.operation_time)),
                        $.isoDateToTime(op.operation_time),
                        $.grep(currencies, function (n, i) {
                            return n.id == op.currency_id;
                        })[0].code,
                        // (op.currency_amount > 0) ? 'Купівля' : 'Продаж',
                        feroksoft.rates_round(op.exchange_rate),
                        feroksoft.money_round(Math.abs(op.currency_amount), 2).toFixed(2),
                        feroksoft.money_round(Math.abs(op.equivalent), 2).toFixed(2),
                        '',
                        op.storno_time, //fiscal_storno_time
                    ]
                }
                m = 0
                $.each(dic, function (k, v) {
                    m++;
                    td = $('<td>');
                    td.html(v)
                    td.addClass('centered')
                    if (hide_number) {
                        if (m == 1) {
                            td.attr("style", "display:none")
                        }
                    }
                    if (m == 2) {
                        td.attr("style", "display:none")
                    }
                    tr.append(td)
                })
                tbody.append(tr)

                count_eop++;

            }


        })
        if (LOADED_MODULES.indexOf('storno') > -1) {
            stornoAfterPopulate($('.oper-table'))
        }

        var cashier_archive = JSON.parse(localStorage.getItem('department_details')).cashier_archive

        if (cashier_archive == true) {

            if (LOADED_MODULES.indexOf('printing') > -1) {

                if (LOADED_MODULES.indexOf('rkks') > -1) {

                    elements = $('.oper-table tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + EXOPS_ID_COLNUM + ')').html()
                            var op = __getExOpById(opid)
                            return op.fiscal_time != null
                        }).find('td:nth-child(' + PRINT_COLNUM + ')')

                    printAfterPopulate(elements, function (opid) {
                        // console.log('printReceipt_2');
                        return printReceipt(opid)
                    }, EXOPS_ID_COLNUM)

                    // printing storno COPY
                    elements = $('.oper-table tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + EXOPS_ID_COLNUM + ')').html()
                            var op = __getExOpById(opid)
                            return op.storno_time != null && op.fiscal_time != null && op.fiscal_storno_time != null
                        }).find('td:nth-child(' + STORNO_COLNUM + ')')

                    printAfterPopulateStorno(elements, function (opid) {
                        return printStorno(opid)
                    }, EXOPS_ID_COLNUM)

                } else if (LOADED_MODULES.indexOf('prro') > -1) {

                    elements = $('.oper-table tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + EXOPS_ID_COLNUM + ')').html()
                            var op = __getExOpById(opid)
                            return op.fiscal_time != null
                        }).find('td:nth-child(' + PRINT_COLNUM + ')')

                    printAfterPopulate(elements, function (opid) {
                        // console.log('printReceipt_2');
                        return printReceipt(opid)//gre
                    }, EXOPS_ID_COLNUM)

                    // printing storno COPY
                    elements = $('.oper-table tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + EXOPS_ID_COLNUM + ')').html()
                            var op = __getExOpById(opid)
                            return op.storno_time != null && op.fiscal_time != null && op.fiscal_storno_time != null
                        }).find('td:nth-child(' + STORNO_COLNUM + ')')

                    printAfterPopulateStorno(elements, function (opid) {
                        // return printStorno(opid)
                        return printStorno(opid)//gre
                    }, EXOPS_ID_COLNUM)

                } else {//RRO

                    elements = $('.oper-table tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + EXOPS_ID_COLNUM + ')').html()
                            var op = __getExOpById(opid)
                            return op.fiscal_time != null
                        }).find('td:nth-child(' + PRINT_COLNUM + ')')

                    printAfterPopulate(elements, function (opid) {
                        new2019 = new Date("2019-01-01T09:00")
                        var exchange = $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
                            return n.id == opid
                        })[0];
                        if (new Date(exchange.operation_time) < new2019) {
                            console.log('printReceipt_3');
                            return printReceipt(opid)
                        } else {
                            //console.log(exchange)
                            remote_call('directole', ['Passthrough', 'GLCN'])
                                .done(function (data) {
                                    resp = data[0]
                                    if (resp == 'None') {
                                        remote_call('restartScript').always(function () {
                                            var msg = 'Не знайдено підключеного РРО намагаємося перезапустити Oleweb...'
                                            console.log(msg)
                                            setTimeout(rro_identify, 5000)
                                        })
                                    } else {
                                        var num_last_eop = parseInt(resp.substr(6, 10))
                                        var num_eop = exchange.num_eop
                                        if (num_last_eop == num_eop) {
                                            //rro_check_copy()
                                            remote_call('directole', ['Passthrough', 'COPY'])
                                                .then(function (responce) {
                                                    if (responce[0] == "('SOFTPROTOC', 'READY')") {
                                                        // console.log('alert');
                                                        // alert('Можна надрукувати тільки одну копію останнього чека')
                                                        var num_eop = String('0000000000' + exchange.num_eop).slice(-10)
                                                        //console.log(num_eop)
                                                        //PCNS
                                                        remote_call('directole', ['Passthrough', 'PCNS' + num_eop + '1'])
                                                    }
                                                })

                                        } else {
                                            if (num_eop > 0) { //gre20190708
                                                var num_eop = String('0000000000' + exchange.num_eop).slice(-10)
                                                //console.log(num_eop)
                                                //PCNS
                                                remote_call('directole', ['Passthrough', 'PCNS' + num_eop + '1'])
                                            }
                                        }
                                    }
                                })
                        }
                    }, EXOPS_ID_COLNUM)

                    elements = $('.oper-table tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + EXOPS_ID_COLNUM + ')').html()
                            var op = __getExOpById(opid)
                            return op.storno_time != null && op.fiscal_time != null && op.fiscal_storno_time != null
                        }).find('td:nth-child(' + STORNO_COLNUM + ')')

                    printAfterPopulateStorno(elements, function (opid) {
                        new2019 = new Date("2019-01-01T09:00")
                        var exchange = $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
                            return n.id == opid
                        })[0];
                        if (new Date(exchange.operation_time) >= new2019) {
                            //console.log(exchange)
                            var num_storno = exchange.num_storno
                            if (num_storno > 0) {
                                var num_storno = String('0000000000' + exchange.num_storno).slice(-10)
                                //console.log(num_storno)
                                //PCNS
                                remote_call('directole', ['Passthrough', 'PCNS' + num_storno + '1'])
                            }
                        }
                    }, EXOPS_ID_COLNUM)

                    // printAfterPopulate(elements.find('td:nth-child(' + STORNO_COLNUM + ')'), function (opid) {
                    // 	return printStorno(opid)
                    // }, EXOPS_ID_COLNUM)

                }
            }
        }

        var department_details = JSON.parse(localStorage.getItem('department_details'))
        if (typeof department_details.payments !== 'undefined') {
            if (department_details.payments) {

                payment_operations = __getUserPayments()
                payment_operations.sort(compare)

                tbody = $('.payment-table tbody').eq(0)
                tbody.html('')

                $.each(payment_operations.reverse(), function (i, op) {
                    // tr = $('<tr>').addClass((op.payment_amount > 0) ? 'buy-colored' : 'sell-colored')

                    if (op.cancel_time != null) {
                        tr = $('<tr>').addClass('storno-colored')
                    } else if (op.fiscal_time != null) {
                        tr = $('<tr>').addClass((op.currency_amount > 0) ? 'buy-colored' : 'sell-colored')
                    } else {
                        tr = $('<tr>')
                    }

                    num_eop = op.real_id

                    dic = [
                        payment_operations.length - i,
                        op.virtual_id,
                        num_eop,
                        // (op.currency_amount > 0) ? 'Купівля' : 'Продаж',
                        $.isoDateToUSADate(new Date(op.operation_time)),
                        $.isoDateToTime(op.operation_time),
                        feroksoft.money_round(Math.abs(op.currency_amount), 2).toFixed(2),
                        feroksoft.money_round(Math.abs(op.commission_amount), 2).toFixed(2),
                        feroksoft.money_round(Math.abs(op.payment_amount), 2).toFixed(2),
                        '',
                    ]
                    m = 0
                    $.each(dic, function (k, v) {
                        m++;
                        td = $('<td>');
                        td.html(v)
                        td.addClass('centered')
                        if (m == 2) {
                            td.attr("style", "display:none")
                        }
                        tr.append(td)
                    })
                    tbody.append(tr)
                })

                if (LOADED_MODULES.indexOf('printing') > -1) {
                    elements = $('.payment-table tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + (EXOPS_ID_COLNUM) + ')').html()
                            //console.log(opid)
                            //var op = __getExOpById(opid)
                            var op = $.grep(payment_operations, function (n, i) {
                                return n.id == opid;
                            })[0];

                            return (op.transaction_id != null) && (op.cancel_time === null) && (op.fiscal_time != null)
                        }).find('td:nth-child(' + (9) + ')')

                    printAfterPopulate(elements, function (opid) {
                        return printPaymentAccountArchive(opid, payment_operations)
                    }, EXOPS_ID_COLNUM)

                }

                $('.oper-table-name').removeClass('hide')
                $('.payments-name').removeClass('hide')
                $('.payment-table').removeClass('hide')

            }
        }
    }

    updateOperatorName = function () {

        var user = JSON.parse(localStorage.getItem('operator'))
        var config = JSON.parse(localStorage.getItem('general_settings'))
        var department = JSON.parse(localStorage.getItem('department_details'))
        // $('#department_code').html(department.af_id)money_limit
        var cost = department.cost;

        var balance = $.grep(JSON.parse(localStorage.getItem('balance')), function (n, i) {
            return n.currency_id == config.UAH_ID
        })[0];
        acc_result = balance.acc_result
        balance_limit = balance.limit

        if ((cost > 0) & (acc_result >= cost)) {
            acc_result = '<span style="color:red">' + acc_result + '</span>'
        } else {
            acc_result = acc_result
        }

        $('#company_name').html(config.COMPANY_SHORT_NAME)
        $('#department_name').html(department.full_name)
        $('#department_address').html(department.address)
        $('#operator_name').html(user.person)
        $('#operator_login').html(user.login)
        $('#money_limit').html(balance_limit + ' грн.')

        // $('#department_volumes').html(__getDepVolUSD() + ' USD')
        // $('#uah_equivalent').html(__getDepLeftUAH() + ' грн.')

        $('#department_volumes').html(balance.equivalent_usd + ' USD')
        $('#uah_equivalent').html(balance.equivalent_uah + ' грн.')

        $('#acc_result').html(acc_result + ' грн.')
        // $('#acc_result').html(__getAccResult() + ' грн.')
        $('#cost').html(cost + ' грн.')

    }

    updateFront = function () {
        updateOperationsTable()
        updateStatusTable()
        updateOperatorName()
    }

    updateFront()

}


InoutModule = function () {
    LOADED_MODULES.push('inout')
    var inout = new inoutClass($("#inoutModal"));
    var settings = JSON.parse(localStorage.getItem('general_settings'))

    if (settings.DESIGN == 1) {
        $.addNavButton('incomeBtn', 'Інкасація [F3]', 114).click(inout.outcome)
        $.addNavButton('outcomeBtn', 'Підкріплення [F4]', 115).click(inout.income)
    } else {
        $.addNavButton('incomeBtn', 'Інкасація [F3]', 114).click(inout.outcome).addClass('btn-info')
        $.addNavButton('outcomeBtn', 'Підкріплення [F4]', 115).click(inout.income).addClass('btn-info')
    }
}

refuseAllCashflows = function () {
    var prom = $.Deferred()
    $.ajax({
        type: "GET",
        url: 'refuse_all_cashflows',
        data: {},
        success: function (ret) {
            if (typeof ret.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
            } else if (ret.status == 'success') {
                localStorage.setItem('cashflow_operations', JSON.stringify(ret.cashflow_operations))
                localStorage.setItem('balance', JSON.stringify(ret.balance))
                updateFront()
                prom.resolve()
            } else {
                prom.reject()
                $.each(ret.errors, function (key, value) {
                    console.log('alert');
                    alert(key + ': ' + value)
                })
            }
        }
    })
    return prom
}

PaymentsModuleService = function () {
    // LOADED_MODULES.push('payment');
    // var payment = new paymentClass($("#paymentModal"));
    //$.addNavButton('paymentBtn', 'Платежі [F7]', 118).click(payment.income)

    LOADED_MODULES.push('payment')
    var payment = new paymentClass($("#paymentModal"));
    $.addNavButton('paymentBtn', 'Платiж [F7]', 118).click(payment.income)

}


PaymentsModule = function () {

    LOADED_MODULES.push('payment')
    var paymentAccount = new paymentAccountClass($("#paymentAccountModal"));
    var paymentService = new paymentServiceClass($("#paymentServiceModal"));
    var paymentCashflow = new paymentCashflowClass($("#paymentCashflowModal"));

    // LOADED_MODULES.push('payments')
    var payments_html =
        '<div class = "row">' +
        '<div class="col-sm-12">' +
        // '<div class="btn-group">' +
        // '<button type="button" class="btn btn-lg btn-info" id="paymentServices">Платіж по сервісу</button>' +
        // '</div>' +
        '<p class="payments-name"><b>Платіжний сейф: </b><span id="modal_payment_balance"></span></p>' +
        // '<p class="payments-name"><b>Повернуті платежі: </b><span id="modal_payment_returned_balance"></span></p>' +
        '<p class="payments-name"><b>Ліміт платежів: </b><span id="modal_payment_limit"></span></p>' +
        '<p class="payments-name"><b>Залишок ліміту: </b><span id="modal_payment_limit_cost"></span></p>' +
        '<div class="btn-group"><button type="button" class="btn btn-md btn-primary action-btn" id="paymentAccounts">Платіж за реквізитами</button></div>' +
        '<div class="btn-group"><button type="button" class="btn btn-md btn-primary action-btn" id="paymentTemplates">Платіж за шаблоном</button></div>' +
        '<div class="btn-group"><button type="button" class="btn btn-md btn-primary action-btn" id="paymentServices">Платіж по сервісу</button></div>' +
        '<div class="btn-group"><button type="button" class="btn btn-md btn-primary action-btn" id="paymentCashflow">Платіжна інкасація</button></div>' +
        '</div></div>'

    modal = $.createModal(
        'paymentsModal',
        'performOperation', // btn_id
        false,	//has_footer
        'Відобразити', // bnt_caption
        title = 'Платежі')
        .on('shown.bs.modal', function () {
            $(this).find('select').eq(0).focus()
        });
    modal.find('.modal-body').html(payments_html)

    populatePaymentsBtns = function () {
        modal.find("#paymentServices").off('click')
        modal.find("#paymentAccounts").off('click')
        modal.find("#paymentCashflow").off('click')

        modal.find("#paymentServices").click(paymentService.services_income);

        modal.find("#paymentAccounts").click(paymentAccount.accounts_income);

        modal.find("#paymentTemplates").click(function () {
            displayModal($("#paymentTemplatesModal"))
        });

        modal.find("#paymentCashflow").click(paymentCashflow.outcome);

    }

    $("#paymentsModal").on('shown.bs.modal', function () {
        // $("#txtname").focus();
        //console.log('show!');
        var settings = JSON.parse(localStorage.getItem('general_settings'))
        var payment_balance = $.grep(JSON.parse(localStorage.getItem('balance')), function (n, i) {
            return n.currency_id == settings.UAH_ID
        })[0];

        payment_limit = 0;
        department_limits = JSON.parse(localStorage.getItem('department_limits'))
        if (department_limits.status == "success") {
            data = department_limits.data
            uah_limit = $.grep(data, function (n, i) {
                return n.currency_id == 186
            })

            if ((uah_limit.length > 0) && (uah_limit[0].limit_type > 0)) {
                payment_limit = parseInt(uah_limit[0].payment_limit)
            }
        }
        payment_limit_cost = feroksoft.money_round(payment_limit - payment_balance.payment_balance);

        payment_returned_balance = payment_balance.payment_returned_balance

        payment_limit_warning = ''

        if (payment_limit_cost <= 0) {
            payment_limit_warning = '<b><span style="color:red">Необхідно зробити платіжну інкассацію!</span></b>'
        } else if (payment_limit_cost < payment_limit * 0.1) {
            payment_limit_warning = '<b><span style="color:black">Рекомендуємо зробити платіжну інкассацію!</span></b>'
        }

        $("#modal_payment_balance").html(payment_balance.payment_balance + ' грн.');
        $("#modal_payment_returned_balance").html(payment_returned_balance + ' грн.');
        $("#modal_payment_limit").html(payment_limit + ' грн.');
        $("#modal_payment_limit_cost").html(payment_limit_cost + ' грн. ' + payment_limit_warning);

    })

    // LOADED_MODULES.push('payment_templates')
    var payment_templates_html =
        '<div class = "row">' +
        '<div class="col-sm-12">' +
        // '<div class="btn-group">' +
        // '<button type="button" class="btn btn-lg btn-info" id="paymentServices">Платіж по сервісу</button>' +
        // '</div>' +
        '<div class="btn-group">' +
        // '<p class="payments-name"><b>Платіжний сейф: </b><span id="modal_payment_balance"></span></p>' +
        // // '<p class="payments-name"><b>Повернуті платежі: </b><span id="modal_payment_returned_balance"></span></p>' +
        // '<p class="payments-name"><b>Ліміт платежів: </b><span id="modal_payment_limit"></span></p>' +
        // '<p class="payments-name"><b>Залишок ліміту: </b><span id="modal_payment_limit_cost"></span></p>' +
        '<button type="button" class="btn btn-md btn-success" id="paymentTemplate">Додати шаблон</button>' +
        // '<button type="button" class="btn btn-lg btn-warning" id="paymentTemplates">Платіж за шаблоном</button>' +
        // '<button type="button" class="btn btn-lg btn-warning" id="paymentServices">Платіж по сервісу</button>' +
        // '<button type="button" class="btn btn-lg btn-info" id="paymentCashflow">Платіжна інкасація</button>' +
        '</div>' +
        '<p><b>Перелік збережених шаблонів:</b></p>' +
        '<table class="table table-bordered payment-templates-table" id="payment-templates-table">	' +
        '<thead></thead>' +
        '<tbody></tbody>' +
        '</table></div></div>' +
        ''

    modal_templates = $.createModal(
        'paymentTemplatesModal',
        'performOperation', // btn_id
        false,	//has_footer
        'Відобразити', // bnt_caption
        title = 'Платіж за шаблоном')
        .on('shown.bs.modal', function () {
            $(this).find('select').eq(0).focus()
        });
    modal_templates.find('.modal-body').addClass('payment-templates-table-scroll').html(payment_templates_html)

    // console.log('paymentTemplatesModal')
    populatePaymentTemplatesBtns = function () {
        modal_templates.find("#paymentTemplate").off('click')

        LOADED_MODULES.push('payment_templates')
        var paymentTemplate = new paymentTemplateClass($("#paymentTemplateModal"));

        modal_templates.find("#paymentTemplate").click(paymentTemplate.template_add);

    }

    $("#paymentTemplatesModal").on('shown.bs.modal', function () {
        $('#paymentsModal').modal('hide')

        updateTablePaymentsTemplates('#payment-templates-table')

        // $("#txtname").focus();
        //console.log('show!');

    })

    createPaymentAccountAfterPopulate = function (elements, action, id_colnum) {
        createBtn = $('<button>')
            .addClass("btn btn-sm btn-default btn-secondary glyphicon glyphicon-new-window")
            .click(function () {
                row = $(this).parent().parent()
                opid = row.children().eq(id_colnum - 1).html()
                num_eop = row.children().eq(id_colnum).html()
                // if (confirm("Створити платіж на основі шаблону " + num_eop + "?")) {
                action(opid)
                // }
            })
        elements.append(createBtn);

        deleteBtn = $('<button>')
            .addClass("btn btn-sm btn-default btn-secondary glyphicon glyphicon-remove-circle")
            .click(function () {
                row = $(this).parent().parent()
                opid = row.children().eq(id_colnum - 1).html()
                num_eop = row.children().eq(id_colnum).html()
                if (confirm("Видалити шаблон " + num_eop + "?")) {
                    removeTemplate(opid)
                }
            })
        elements.append(deleteBtn);

    }

    function removeTemplate(id) {

        var data = {
            id: id,
        }

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof data.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(data.errors.general)
                    if (typeof data.errors.redirect !== 'undefined') {
                        window.location = data.errors.redirect;
                    }
                }
            } else {
                if (typeof data.status !== 'undefined') {
                    if (data.status == 'success') {
                        updateTablePaymentsTemplates('#payment-templates-table')
                    } else {
                        alert('На жаль, не вдалося видалити шаблон');
                    }
                }
                // console.log(data)

            }
        }

        $.ajax({
            type: "POST",
            url: "api/payment_templates_remove",
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: onSuccess
        });

    }

    function updateTablePaymentsTemplates(tableClass) {

        var data = {}

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof data.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(data.errors.general)
                    if (typeof data.errors.redirect !== 'undefined') {
                        window.location = data.errors.redirect;
                    }
                }
            } else {

                var payment_templates = data

                console.log(payment_templates)

                thead = $(tableClass + ' thead').eq(0).html('<tr>' +
                    '<th class="centered">Номер</th>' +
                    // '<th class="centered">Номер</th>' +
                    '<th class="centered">Назва шаблону</th>' +
                    '<th class="centered">Платник</th>' +
                    '<th class="centered">Отримувач</th>' +
                    '<th class="centered">№ рахунку (р/р)</th>' +
                    // '<th class="centered">Комісійна винагорода</th>' +
                    // '<th class="centered">Прийнята сума</th>' +
                    // '<th class="centered">ID транзакції</th>' +
                    '<th class="centered">Дія</th>' +
                    '</tr>')

                tbody = $(tableClass + ' tbody').eq(0).html('')

                $.each(payment_templates.reverse(), function (i, op) {
                    tr = $('<tr>')

                    dic = [
                        op.id,
                        op.name,
                        op.person_surname + ' ' + op.person_name + ' ' + op.person_father_name,
                        op.recipient_name,
                        op.recipient_account,
                        ''
                    ]
                    m = 0
                    $.each(dic, function (k, v) {
                        m++;
                        td = $('<td>');
                        td.html(v)
                        td.addClass('centered')
                        tr.append(td)
                    })
                    tbody.append(tr)
                })
                elements = $(tableClass + ' tbody tr').find('td:nth-child(' + (6) + ')')

                createPaymentAccountAfterPopulate(elements, function (opid) {
                    // var paymentAccount = new paymentAccountClass($("#paymentAccountModal"));
                    paymentAccount.accounts_template_income(opid, payment_templates)
                }, 1)

            }
        }

        $.ajax({
            type: "GET",
            url: "api/payment_templates",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

    }


    btn = $.addNavButton('paymentsMenu', 'Платiж [П] &nbsp&nbsp', 71) //F7
        .click(function () {
            displayModal($("#paymentsModal"))
        }).addClass('sell-colored').append($('<i>').addClass("glyphicon glyphicon-credit-card"))

    populatePaymentsBtns()

    populatePaymentTemplatesBtns()

}

DocsModule = function () {

    LOADED_MODULES.push('docs')

    department = JSON.parse(localStorage.getItem('department_details'))
    config = JSON.parse(localStorage.getItem('general_settings'))

    company = config.COMPANY_FULL_NAME
    // company_short =  config.COMPANY_SHORT_NAME
    // full_name = department.full_name
    // data.director = config.COMPANY_CEO
    // data.director_title = config.COMPANY_CEO_TITLE
    DOCS_LOGO_IMAGE = config.DOCS_LOGO_IMAGE //config.LOGO_IMAGE
    LOGO_IMAGE = config.LOGO_IMAGE //config.LOGO_IMAGE
    LOGO_WIDTH = config.LOGO_WIDTH
    LOGO_HEIGHT = config.LOGO_HEIGHT

    DOCS_FK_CLOUD_URL = config.DOCS_FK_CLOUD_URL
    INSTRUCTION_URL = config.INSTRUCTION_URL
    VIDEO_INSTRUCTION_URL = config.VIDEO_INSTRUCTION_URL

    cloud_url = department.cloud_url

    var docs_html =
        '<div class = "row">' +
        // '<p><img src="' + LOGO_IMAGE + '" width="' + LOGO_WIDTH + '" height="' + LOGO_HEIGHT + '" alt="" class="center"></p>' +
        '<p><img src="' + LOGO_IMAGE + '" width=400 height=auto alt="" class="center"></p>' +
        '<div class="col-sm-12">' +
        '<div class="btn-group">' +
        // '<p><img src="' + DOCS_LOGO_IMAGE + '" width="' + LOGO_WIDTH + '" height="auto" alt=""><p>' +
        '<div class="btn-group"><a target="_blank" href="' + DOCS_FK_CLOUD_URL + '"><button type="button" class="btn btn-md btn-primary action-btn" id="docFK"><i class="glyphicon glyphicon-briefcase"></i>&nbsp&nbsp Документи ФК</button></a></div>' +
        '<div class="btn-group"><a target="_blank" href="' + cloud_url + '"><button type="button" class="btn btn-md btn-primary action-btn" id="docDepartment"><i class="glyphicon glyphicon-folder-open"></i>&nbsp&nbsp Документи відділення</button></a></div>' +
        '<div class="btn-group"><a target="_blank" href="' + INSTRUCTION_URL + '"><button class="btn btn-md btn-primary action-btn"><i class="glyphicon glyphicon-book"></i>&nbsp&nbsp Інструкція</button></a></div>' +
        '<div class="btn-group"><a target="_blank" href="' + VIDEO_INSTRUCTION_URL + '"><button class="btn btn-md btn-primary action-btn"><i class="glyphicon glyphicon-book"></i>&nbsp&nbsp Відео-інструкції</button></a></div>' +
        '</div>' +
        '</div>' +
        '</div>'

    //{{config['INSTRUCTION_URL']}}
    modal = $.createModal(
        'docsModal',
        'performOperation', // btn_id
        false,	//has_footer
        'Відобразити', // bnt_caption
        title = 'Документообіг')
        .on('shown.bs.modal', function () {
            $(this).find('select').eq(0).focus()
        });
    modal.find('.modal-body').html(docs_html)

    btn = $.addNavButton('docsMenu', 'Документообіг &nbsp&nbsp') //F7
        .click(function () {
            displayModal($("#docsModal"))
        }).removeClass('btn-default').addClass('btn-info').append($('<i>').addClass("glyphicon glyphicon-folder-open"))

}

InfoModule = function () {

    LOADED_MODULES.push('info')

    department = JSON.parse(localStorage.getItem('department_details'))
    config = JSON.parse(localStorage.getItem('general_settings'))

    company = config.COMPANY_FULL_NAME
    // company_short =  config.COMPANY_SHORT_NAME
    // full_name = department.full_name
    // data.director = config.COMPANY_CEO
    // data.director_title = config.COMPANY_CEO_TITLE
    DOCS_LOGO_IMAGE = config.DOCS_LOGO_IMAGE //config.LOGO_IMAGE
    LOGO_IMAGE = config.LOGO_IMAGE //config.LOGO_IMAGE
    LOGO_WIDTH = config.LOGO_WIDTH
    LOGO_HEIGHT = config.LOGO_HEIGHT

    DOCS_FK_CLOUD_URL = config.DOCS_FK_CLOUD_URL
    INSTRUCTION_URL = config.INSTRUCTION_URL
    VIDEO_INSTRUCTION_URL = config.VIDEO_INSTRUCTION_URL

    cloud_url = department.cloud_url

    var docs_html =
        '		<div id="info-container"> '+
		'	<p><b>Логін:</b> <span id="operator_login"></span></p> '+
		'	<p><b>Гривневий еквівалент:</b> <span id="uah_equivalent"></span></p> '+
		'	<p><b>Оборотність:</b> <span id="department_volumes"></span></p> '+
		'	<p><b>Бухгалтерський результат:</b> <span id="acc_result"></span></p> '+
		'	<p><b>Видаткова частина:</b> <span id="cost"></span></p> '+
        '	<p><b>Ліміт залишку готівки в касі:</b> <span id="money_limit"></span></p> '+
		'</div>'

    //{{config['INSTRUCTION_URL']}}
    modal = $.createModal(
        'infoModal',
        'performOperation', // btn_id
        false,	//has_footer
        'Відобразити', // bnt_caption
        title = 'Робочі показники')
        .on('shown.bs.modal', function () {
            $(this).find('select').eq(0).focus()
        });
    modal.find('.modal-body').html(docs_html)

    btn = $.addNavButton('info', 'Робочі показники [F7]', 118) //F7
        .click(function () {
            displayModal($("#infoModal"))
        }).removeClass('btn-default').addClass('btn-warning')

}

RatesModule = function () {
    LOADED_MODULES.push('rates_change')
    var rates_form = new ratesClass($("#ratesModal"));

    var settings = JSON.parse(localStorage.getItem('general_settings'))

    if (settings.DESIGN == 1) {
        $.addNavButton('ratesBtn', 'Курси [F6]', 117).click(rates_form.activate)
    } else {
        $.addNavButton('ratesBtn', 'Встановлення курсiв [F6]', 117).click(rates_form.activate).addClass('btn-info')
    }

    var print_local_order = function (ruid, rates_time) {

        date_20200201 = new Date("2020-02-01T00:00")
        // console.log(rates_time)

        if (rates_time < date_20200201) {
            return getPrintFnsByDoctype('local_order')('local_order', {update_id: ruid})
                .then(function () {
                    getPrintFnsByDoctype('local_quotation')('local_quotation', {update_id: ruid})
                })
        } else {
            getPrintFnsByDoctype('local_quotation_2020')('local_quotation_2020', {update_id: ruid})
        }
    }

    var sync_all_rates = function () {
        console.log('Синхронізуємо курси ...')
        //console.log(opened_day)
        var HEARTBEAT_PERIOD = JSON.parse(localStorage.getItem('general_settings')).HEARTBEAT_PERIOD * 1000
        // var HEARTBEAT_PERIOD = 3000
        var chain = $.Deferred().resolve()

        chain = chain.then(function () {
            $.getJSON('api/department/today_rates', function (backend_rates) {
                if (typeof backend_rates.errors !== 'undefined') {
                    if (typeof backend_rates.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(backend_rates.errors.general)
                        if (typeof backend_rates.errors.redirect !== 'undefined') {
                            window.location = backend_rates.errors.redirect;
                        }
                    }
                } else {
                    var current_rates = JSON.parse(localStorage.getItem('today_rates'))
                    localStorage.setItem('today_rates', JSON.stringify(backend_rates))

                    var new_rates_qn = backend_rates.length - current_rates.length
                    for (var i = 0; i < new_rates_qn; i++) {
                        var rates_index = backend_rates.length - i
                        dt = backend_rates[rates_index - 1].rates_time.split('T')
                        console.log('alert');
                        alert('На сервері було виявлено нові курси від ' + dt[1] + ' ' + dt[0] + '(скоріш за все вони встановлені куратором Вашого відділення). Друкуємо новий наказ')
                        print_local_order(rates_index, backend_rates[rates_index - 1].rates_time);
                    }
                }
            })
        }).then(function () {
            console.log('Синхронізуємо повідомлення...')
            $.ajax({
                type: "GET",
                url: 'api/department/messages',
                data: {},
                success: function (ret) {
                    if (typeof ret.errors !== 'undefined') {
                        //modal_win.find('.alert-warning').remove()
                        if (typeof ret.errors.general !== 'undefined') {
                            console.log('alert');
                            alert(ret.errors.general)
                            if (typeof ret.errors.redirect !== 'undefined') {
                                window.location = ret.errors.redirect;
                            }
                        }
                    } else if (ret.status == 'success') {
                        //console.log(ret.data)
                        var message = '';
                        var ids = []
                        $.each(ret.data, function (cid, line) {
                            //console.log(data)
                            message = message + '<b>Повідомлення вiд ' + $.isoDateToUADate(line.datetime) + ': </b>' + line.message + '<br><br>';
                            ids.push(line.id);
                        });
                        //console.log(ids)

                        var messagesModal = $.createModal(
                            'messagesModal',
                            btn_id = 'performOperation',
                            footer = true,
                            bnt_caption = 'Відобразити',
                            title = 'Повідомлення')
                            .on('shown.bs.modal', function () {
                                $(this).find('.close').eq(0).focus()
                            });

                        messagesModal.find('.modal-body')
                            .html(
                                '<p>' + message.substr(0, (message.length - 8)) + '</p>')
                        messagesModal.find('.modal-footer').html('<button type="button" class="btn btn-primary" id="messagesPageOkButton">Ознайомлений</button>')

                        messagesModal.find("#messagesPageOkButton").off('click').click(function () {
                            $.ajax({
                                type: "POST",
                                url: 'confirm_messages',
                                data: {
                                    confirms: JSON.stringify(ids)
                                },
                                success: function (ret) {
                                    $('#messagesModal').modal('hide')
                                }
                            })
                        })
                        displayModal($("#messagesModal"))
                    }
                }
            })
        }).then(function () {
            if (LOADED_MODULES.indexOf('printing') !== -1) {
                console.log('Синхронізуємо друк...')
                $.ajax({
                    type: "GET",
                    url: 'api/department/printercrons',
                    data: {},
                    success: function (ret) {
                        if (typeof ret.errors !== 'undefined') {
                            //modal_win.find('.alert-warning').remove()
                            if (typeof ret.errors.general !== 'undefined') {
                                console.log('alert');
                                alert(ret.errors.general)
                                if (typeof ret.errors.redirect !== 'undefined') {
                                    window.location = ret.errors.redirect;
                                }
                            }
                        } else if (ret.status === 'success') {

                            if (typeof ret.data !== 'undefined') {
                                var dfd = $.Deferred().resolve();
                                $.each(ret.data, function (cid, line) {
                                    dfd = dfd.then(function () {
                                        if (line.print_type === 1) {
                                            return printReceipt(null, line)
                                        } else if (line.print_type === 2) {
                                            return printStorno(null, line)
                                        } else if (line.print_type === 3) {
                                            // console.log(line.cashflow_data)
                                            return getPrintFnsByDoctype('cashflow')('cashflow', line.cashflow_data)
                                                .then(function () {
                                                    $.ajax({
                                                        type: "POST",
                                                        url: 'cashflow_printed',
                                                        data: {
                                                            id: line.id
                                                        },
                                                        success: function (ret) {

                                                        }
                                                    })
                                                })
                                        } else if (line.print_type === 5) {
                                            return printZreport(line)
                                        }
                                    });
                                });
                            }
                        }
                    }
                })
            }
        })

        chain.then(
            function () {
                setTimeout(sync_all_rates, HEARTBEAT_PERIOD)
            },
            function () {
                setTimeout(sync_all_rates, HEARTBEAT_PERIOD)
            }
        )
    }
    sync_all_rates()
}

BuysellModule = function () {
    LOADED_MODULES.push('buysell')

    cancelExchange = function (virtual_opid) {
        var prom = $.Deferred()
        $.ajax({
            type: "GET",
            url: 'cancel_exchange',
            data: {'operation_id': __getExOpRealId(virtual_opid)},
            success: function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    prom.resolve()
                    //console.log('alert'); alert('Операцію #' + virtual_opid + ' було відмінено на сервері!')
                    // console.log('alert'); alert('Операція #' + virtual_opid + ' не пройшла по РРО (РККС) та буде відмінена на сервері!' +
                    //     'Зробіть х-звіт, перевірте залишки та повторіть операцію.' +
                    //     'Якщо х-звіт не сформувався, перепідключіть РРО (РККС) та ' +
                    //     'перезавантажте программу, після чого повторіть операцію. ' +
                    //     'У разі повторної помилки зв`яжіться з технічною підтримкою ФК.!')
                } else {
                    prom.reject()
                    $.each(ret.errors, function (key, value) {
                        console.log('alert');
                        alert(key + ': ' + value)
                    })
                }
            }
        }).fail(function () {
            __serverLog('FAILED TO CANCEL EXCHANGE, WHICH DO NOT PASSED TO RRO2: ' + exchange_operation_data.virtual_id)
        })
        return prom
    }

    var buysell = new buysellClass($("#buysellModal"));
    var settings = JSON.parse(localStorage.getItem('general_settings'))

    if (settings.DESIGN == 1) {
        $.addNavButton('buyBtn', 'Купити [F1]', 112).click(buysell.buy)
        $.addNavButton('sellBtn', 'Продати [F2]', 113).click(buysell.sell)
    } else {
        $.addNavButton('buyBtn', 'Купити [F1]', 112).click(buysell.buy).addClass('buy-colored')
        $.addNavButton('sellBtn', 'Продати [F2]', 113).click(buysell.sell).addClass('sell-colored')
    }
}

ExitBtnModule = function () {
    LOADED_MODULES.push('exit_btn')
    //__serverLog('test')
    $.addNavButton('logOut', 'Вийти [F10]', 121) // F10
        .click(function () {
            return $.ajax({
                type: "GET",
                url: 'api/department/check_limit',
                success: function (ret) {
                    if (typeof ret.errors !== 'undefined') {
                        if (typeof ret.errors.general !== 'undefined') {
                            console.log('alert');
                            alert(ret.errors.general)
                            if (typeof ret.errors.redirect !== 'undefined') {
                                window.location = ret.errors.redirect;
                            }
                        }
                    } else if (ret.status == 'success') {
                        if (confirm("Ви впевнені, що хочете вийти?") == true) {
                            return $.ajax({
                                type: "GET",
                                url: 'login/logout',
                                data: {},
                                success: function (ret) {
                                    window.location = '/'
                                },
                                error: function (ret) {
                                    window.location = '/'
                                }
                            })
                        }
                    } else if (ret.status == 'excess') {
                        msg = ''
                        $.each(ret.data, function (k, v) {
                            // msg = msg + v.currency + ": " + v.excess + "\n"
                            msg = v.message
                        })
                        console.log('alert');
                        // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                        //     msg)
                        alert(msg)

                        // $.each(ret.data, function (k, v) {
                        //     msg = msg + v.currency + ": " + v.excess + "\n"
                        // })
                        // console.log('alert');
                        // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                        //     msg)
                    } else {
                        console.log('alert');
                        alert("Не вдалося перевірити ліміту каси, спробуйте ще раз!")
                    }
                }
            })
        }).removeClass('btn-default').addClass('btn-danger')
}

RefreshBtnModule = function () {
    LOADED_MODULES.push('refresh_btn')
    $.addNavButton('refreshPage', 'Оновити [F5]') // 121 F10
        .click(function () {
                return $.ajax({
                    type: "GET",
                    url: 'api/department/actual_time',
                    success: function (ret) {
                        if (typeof ret.errors !== 'undefined') {
                            if (typeof ret.errors.general !== 'undefined') {
                                console.log('alert');
                                alert(ret.errors.general)
                                if (typeof ret.errors.redirect !== 'undefined') {
                                    window.location = ret.errors.redirect;
                                }
                            }
                        } else {
                            localStorage.clear();
                            window.location = '/'
                        }
                    }
                })
            }
        )
        .removeClass('btn-default').addClass('btn-success')
}

MoneyTableModule = function () {
    LOADED_MODULES.push('money_table')

    function updateMoneyTable(tableClass) {
        cashflow_operations = __getNotRefusedCashflows()

        currencies = JSON.parse(localStorage.getItem('currencies'))

        thead = $(tableClass + ' thead').eq(0).html('<tr>' +
            '<th class="centered" style="display:none;">ID</th>' +
            '<th class="centered">Номер</th>' +
            '<th class="centered">Валюта</th>' +
            '<th class="centered">Тип</th>' +
            '<th class="centered">Дата</th>' +
            '<th class="centered">Час</th>' +
            '<th class="centered">Сумма</th>' +
            '<th class="centered">Інкасатор</th>' +
            '<th class="centered">Друк</th>' +
            '</tr>')

        tbody = $(tableClass + ' tbody').eq(0).html('')

        function compare(a, b) {
            if (a.operation_time < b.operation_time) {
                return -1;
            } else if (a.operation_time > b.operation_time) {
                return 1;
            } else {
                return 0;
            }
        }

        cashflow_operations.sort(compare)

        $.each(cashflow_operations.reverse(), function (i, op) {
            tr = $('<tr>')

            if (op.confirmation_time && op.fiscal_time) {
                tr.addClass((op.money_amount > 0) ? 'buy-colored' : 'sell-colored')
            }

            dic = [
                op.id,
                op.id,
                $.grep(currencies, function (n, i) {
                    return n.id == op.currency_id;
                })[0].code,
                (op.money_amount > 0) ? 'Підкріплення' : 'Інкасація',
                $.isoDateToUSADate(new Date(op.operation_time)),
                $.isoDateToTime(op.operation_time),
                feroksoft.money_round(op.money_amount),
                op.collector,
                '',
            ]
            m = 0
            $.each(dic, function (k, v) {
                m++;
                td = $('<td>');
                td.html(v)
                td.addClass('centered')
                if (m == 2) {
                    td.attr("style", "display:none")
                }
                tr.append(td)
            })
            tbody.append(tr)
        })

        if (LOADED_MODULES.indexOf('printing') > -1) {
            // $(tableClass).find('tbody tr td:nth-child('+CF_PRINT_COLNUM+')')
            elements = $(tableClass)
                .find('tbody tr')
                .filter(function (index) {
                    var x = $(this).find('td:nth-child(' + CFOPS_ID_COLNUM + ')').html()
                    var op = __getCfOpById(x)
                    return op.confirmation_time != null && op.fiscal_time != null
                }).find('td:nth-child(' + CF_PRINT_COLNUM + ')')

            printAfterPopulate(
                elements,
                function (opid) {
                    getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id': opid})
                },
                CFOPS_ID_COLNUM
            )
        }
    }

    function updateMoneyTableCashflowArchive(tableClass, start, end) {

        var data = {
            startDate: start.format('YYYY-MM-DD HH:mm:ss'),
            endDate: end.format('YYYY-MM-DD HH:mm:ss'),
        }

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof data.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(data.errors.general)
                    if (typeof data.errors.redirect !== 'undefined') {
                        window.location = data.errors.redirect;
                    }
                }
            } else {

                //cashflow_operations = $.grep(data['cashflow_operations'], function( n, i ) { return (n.refusal_time === null) && (n.fiscal_time != null)})
                cashflow_operations = $.grep(data['cashflow_operations'], function (n, i) {
                    return (n.operation_time != null)
                })

                currencies = JSON.parse(localStorage.getItem('currencies'))

                thead = $(tableClass + ' thead').eq(0).html('<tr>' +
                    '<th class="centered" style="display:none;">ID</th>' +
                    '<th class="centered">Номер</th>' +
                    '<th class="centered">Валюта</th>' +
                    '<th class="centered">Тип</th>' +
                    '<th class="centered">Дата</th>' +
                    '<th class="centered">Час</th>' +
                    '<th class="centered">Сумма</th>' +
                    '<th class="centered">Інкасатор</th>' +
                    '<th class="centered">Друк</th>' +
                    '</tr>')

                tbody = $(tableClass + ' tbody').eq(0).html('')

                function compare(a, b) {
                    if (a.operation_time < b.operation_time) {
                        return -1;
                    } else if (a.operation_time > b.operation_time) {
                        return 1;
                    } else {
                        return 0;
                    }
                }

                cashflow_operations.sort(compare)

                $.each(cashflow_operations.reverse(), function (i, op) {
                    tr = $('<tr>')
                    if (op.refusal_time != null) {
                        tr.addClass('storno-colored')//gregregre
                    } else if (op.confirmation_time && op.fiscal_time) {
                        tr.addClass((op.money_amount > 0) ? 'sell-colored' : 'buy-colored')
                    }

                    dic = [
                        op.real_id,
                        op.id,
                        $.grep(currencies, function (n, i) {
                            return n.id == op.currency_id;
                        })[0].code,
                        (op.money_amount > 0) ? 'Підкріплення' : 'Інкасація',
                        $.isoDateToUSADate(new Date(op.operation_time)),
                        $.isoDateToTime(op.operation_time),
                        feroksoft.money_round(op.money_amount),
                        op.collector,
                        '',
                    ]
                    m = 0
                    $.each(dic, function (k, v) {
                        m++;
                        td = $('<td>');
                        td.html(v)
                        td.addClass('centered')
                        if (m == 2) {
                            td.attr("style", "display:none")
                        }
                        tr.append(td)
                    })
                    tbody.append(tr)
                })

                if (LOADED_MODULES.indexOf('printing') > -1) {
                    // $(tableClass).find('tbody tr td:nth-child('+CF_PRINT_COLNUM+')')
                    elements = $(tableClass)
                        .find('tbody tr')
                        .filter(function (index) {
                            var x = $(this).find('td:nth-child(' + CFOPS_ID_COLNUM + ')').html()
                            //var op = __getCfOpById(x)
                            var op = $.grep(cashflow_operations, function (n, i) {
                                return n.id == x;
                            })[0];
                            return op.confirmation_time != null && op.fiscal_time != null
                        }).find('td:nth-child(' + CF_PRINT_COLNUM + ')')

                    printAfterPopulate(
                        elements,
                        function (opid) {
                            getPrintFnsByDoctype('cashflow')('cashflow', {
                                'operation_id': opid,
                                'cashflow_operations': cashflow_operations
                            })
                        },
                        CFOPS_ID_COLNUM
                    )
                }

            }
        }

        $.ajax({
            type: "GET",
            url: "api/archive_cashflow_operations_period",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

    }

    function updateMoneyTableExchangeOperationsArchive(tableClass, start, end) {

        var data = {
            startDate: start.format('YYYY-MM-DD HH:mm:ss'),
            endDate: end.format('YYYY-MM-DD HH:mm:ss'),
        }

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof data.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(data.errors.general)
                    if (typeof data.errors.redirect !== 'undefined') {
                        window.location = data.errors.redirect;
                    }
                }
            } else {

                exchange_operations = $.grep(data['exchange_operations'], function (n, i) {
                    return (n.fiscal_time != null)
                })

                currencies = JSON.parse(localStorage.getItem('currencies'))

                thead = $(tableClass + ' thead').eq(0).html('<tr>' +
                    '<th class="centered" style="display:none;">ID</th>' +
                    '<th class="centered">Номер</th>' +
                    '<th class="centered">Валюта </th>' +
                    '<th class="centered">Дата</th>' +
                    '<th class="centered">Час</th>' +
                    '<th class="centered">Курс</th>' +
                    '<th class="centered">Сумма</th>' +
                    '<th class="centered">Еквів</th>' +
                    '<th class="centered">Тип</th>' +
                    '<th class="centered">Друк</th>' +
                    '<th class="centered">Сторно</th>' +
                    '</tr>')

                tbody = $(tableClass + ' tbody').eq(0).html('')

                function compare(a, b) {
                    if (a.operation_time < b.operation_time) {
                        return -1;
                    } else if (a.operation_time > b.operation_time) {
                        return 1;
                    } else {
                        return 0;
                    }
                }

                exchange_operations.sort(compare)
                $.each(exchange_operations.reverse(), function (i, op) {
                    if (op.storno_time != null && op.fiscal_storno_time != null) {
                        tr = $('<tr>').addClass('storno-colored')
                    } else {
                        tr = $('<tr>').addClass((op.currency_amount > 0) ? 'buy-colored' : 'sell-colored')
                    }
                    //console.log(op)
                    new2019 = new Date("2018-01-01T09:00")

                    if (new Date(op.fiscal_time) >= new2019) {
                        num_eop = op.num_eop < 1 ? op.virtual_id : op.num_eop
                    } else {
                        num_eop = op.virtual_id
                    }

                    dic = [
                        op.virtual_id,
                        num_eop,
                        $.grep(currencies, function (n, i) {
                            return n.id == op.currency_id;
                        })[0].code,
                        // (op.currency_amount > 0) ? 'Купівля' : 'Продаж',
                        $.isoDateToUSADate(new Date(op.operation_time)),
                        $.isoDateToTime(op.operation_time),
                        feroksoft.rates_round(op.exchange_rate),
                        feroksoft.money_round(Math.abs(op.currency_amount), 2).toFixed(2),
                        feroksoft.money_round(Math.abs(op.equivalent), 2).toFixed(2),
                        (op.rro_id > 0) ? 'РККС' : 'РРО',
                        '',
                        '', //fiscal_storno_time
                    ]
                    m = 0
                    $.each(dic, function (k, v) {
                        m++;
                        td = $('<td>');
                        td.html(v)
                        td.addClass('centered')
                        if (m == 1) {
                            td.attr("style", "display:none")
                        }
                        tr.append(td)
                    })
                    tbody.append(tr)
                })

                if (LOADED_MODULES.indexOf('printing') > -1) {
                    elements = $(tableClass + ' tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + (EXOPS_ID_COLNUM - 1) + ')').html()
                            //var op = __getExOpById(opid)
                            var op = $.grep(exchange_operations, function (n, i) {
                                return n.id == opid;
                            })[0];

                            return op.fiscal_time != null
                        }).find('td:nth-child(' + (PRINT_COLNUM) + ')')

                    printAfterPopulate(elements, function (opid) {
                        if (LOADED_MODULES.indexOf('prro') > -1) {
                            return printReceipt(opid)
                        } else {
                            return printReceiptArchive(opid, exchange_operations)
                        }
                    }, EXOPS_ID_COLNUM - 1)

                    // printing storno COPY
                    elements = $(tableClass + ' tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + (EXOPS_ID_COLNUM - 1) + ')').html()
                            var op = $.grep(exchange_operations, function (n, i) {
                                return n.id == opid;
                            })[0];
                            return op.storno_time != null && op.fiscal_time != null && op.fiscal_storno_time != null
                        }).find('td:nth-child(' + (STORNO_COLNUM) + ')')

                    printAfterPopulateStorno(elements, function (opid) {
                        if (LOADED_MODULES.indexOf('prro') > -1) {
                            return printStorno(opid)
                        } else {
                            return printStornoArchive(opid, exchange_operations)
                        }
                    }, EXOPS_ID_COLNUM - 1)
                }
            }
        }

        $.ajax({
            type: "GET",
            url: "api/archive_exchange_operations_period",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

    }

    function updateMoneyTablePaymentsAccountOperationsArchive(tableClass, start, end) {

        var data = {
            startDate: start.format('YYYY-MM-DD HH:mm:ss'),
            endDate: end.format('YYYY-MM-DD HH:mm:ss'),
        }

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof data.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(data.errors.general)
                    if (typeof data.errors.redirect !== 'undefined') {
                        window.location = data.errors.redirect;
                    }
                }
            } else {

                payment_operations = $.grep(data['payment_operations'], function (n, i) {
                    return (n.operation_time != null)
                    //return (n.fiscal_time != null)
                })

                currencies = JSON.parse(localStorage.getItem('currencies'))

                thead = $(tableClass + ' thead').eq(0).html('<tr>' +
                    '<th class="centered" style="display:none;">ID</th>' +
                    '<th class="centered">Номер</th>' +
                    '<th class="centered">Дата</th>' +
                    '<th class="centered">Час</th>' +
                    '<th class="centered">Сума переказу</th>' +
                    '<th class="centered">Комісійна винагорода</th>' +
                    '<th class="centered">Прийнята сума</th>' +
                    '<th class="centered">№ тел.</th>' +
                    '<th class="centered">ID транзакції</th>' +
                    '<th class="centered">Друк</th>' +
                    '</tr>')

                tbody = $(tableClass + ' tbody').eq(0).html('')

                function compare(a, b) {
                    if (a.operation_time < b.operation_time) {
                        return -1;
                    } else if (a.operation_time > b.operation_time) {
                        return 1;
                    } else {
                        return 0;
                    }
                }

                payment_operations.sort(compare)
                $.each(payment_operations.reverse(), function (i, op) {
                    if (op.cancel_time != null) {
                        tr = $('<tr>').addClass('storno-colored')
                    } else if (op.fiscal_time != null) {
                        tr = $('<tr>').addClass((op.currency_amount > 0) ? 'buy-colored' : 'sell-colored')
                    } else {
                        tr = $('<tr>')
                    }
                    //console.log(op)

                    num_eop = op.real_id

                    dic = [
                        op.virtual_id,
                        num_eop,
                        $.isoDateToUSADate(new Date(op.operation_time)),
                        $.isoDateToTime(op.operation_time),
                        feroksoft.money_round(Math.abs(op.currency_amount), 2).toFixed(2),
                        feroksoft.money_round(Math.abs(op.commission_amount), 2).toFixed(2),
                        feroksoft.money_round(Math.abs(op.payment_amount), 2).toFixed(2),
                        op.phone,
                        op.transaction_id,
                        '',
                    ]
                    m = 0
                    $.each(dic, function (k, v) {
                        m++;
                        td = $('<td>');
                        td.html(v)
                        td.addClass('centered')
                        if (m == 1) {
                            td.attr("style", "display:none")
                        }
                        tr.append(td)
                    })
                    tbody.append(tr)
                })

                if (LOADED_MODULES.indexOf('printing') > -1) {
                    elements = $(tableClass + ' tbody tr')
                        .filter(function (index) {
                            var opid = $(this).find('td:nth-child(' + (EXOPS_ID_COLNUM - 1) + ')').html()
                            //var op = __getExOpById(opid)
                            var op = $.grep(payment_operations, function (n, i) {
                                return n.id == opid;
                            })[0];

                            return (op.transaction_id != null) && (op.cancel_time === null)
                        }).find('td:nth-child(' + (10) + ')')

                    printAfterPopulate(elements, function (opid) {
                        return printPaymentAccountArchive(opid, payment_operations)
                    }, EXOPS_ID_COLNUM - 1)

                }
            }
        }

        $.ajax({
            type: "GET",
            url: "api/archive_payment_account_operations_period",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

    }

    printReceiptArchive = function (opid, doc_data) {// Override
        //console.log(doc_data)
        if (typeof doc_data !== 'undefined') {
            var exchange = $.grep(doc_data, function (n, i) {
                return n.id == opid;
            })[0];
        } else {
            var exchange = $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
                return n.id == opid
            })[0];
        }
        if (exchange.rro_id > 0) {
            //console.log(exchange)
            var docparams = {
                operation_id: opid,
                exchange_operation: exchange,
            }
            var print_doc = function (response) {
                // console.log(response)
                var data = report['exchange'](docparams)
                var current_settings = __getPrintingSettings()

                // console.log(current_settings);

                data.double_page = false

                data.rro_data = response
                data.rro_date = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('DD.MM.YYYY')
                data.rro_time = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('HH:mm')

                var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

                var link = qr2link(response.Records[3].QR)
                data.qrlink = link.replace(re, "");
                data.qrlink1 = (data.qrlink.split("/qr/")[0] + "/qr/");
                data.qrlink2 = data.qrlink.split("/qr/")[1];

                data.qr_base64_img = $('<div>').qrcode(link).find('canvas').get(0).toDataURL("image/png");
                //console.log(data);

                //var html = Mustache.render(TEMPLATES_RKKS['exchange_thermo'], data)//, {base:TEMPLATES.base})
                var html = '';

                // data.qr_base64_img = $('<div>').qrcode(response.Records[3].QR).find('canvas').get(0).toDataURL("image/png");
                return $.Deferred().resolve(html)
                    .then(function (html) {

                        // if (data.region_id == 72) {
                        //    new2019 = new Date("2019-01-01T09:00")
                        // } else {
                        new2019 = new Date("2019-01-01T09:00")
                        //}

                        if (new Date(data.operation_time) < new2019) {
                            if (current_settings['receipt_printer_type'].includes("thermo58_1")) {

                                data.copy = 1;

                                var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                                data.copy = 2;

                                var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                if (needs_certificate) {
                                    PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                }
                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)

                            } else if (current_settings['receipt_printer_type'].includes("thermo58_2")) {

                                data.copy = 1;

                                var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                                data.copy = 2;

                                var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                if (needs_certificate) {
                                    PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                }
                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)

                            } else if (current_settings['receipt_printer_type'].includes("thermo80")) {

                                data.copy = 1;

                                var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                                data.copy = 2;

                                var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                if (needs_certificate) {
                                    PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                }

                            } else {
                                var html = Mustache.render(TEMPLATES_RKKS['exchange2018'], data)//, {base:TEMPLATES.base})
                                return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                                    .always(function () {
                                        var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                        if (needs_certificate) {
                                            PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                        }
                                    })
                            }

                        } else {

                            new20190207 = new Date("2019-02-07T09:00")
                            new20200419 = new Date("2020-08-01T00:00")

                            if (new Date(data.operation_time) < new20190207) {
                                exchange2019 = 'exchange2019'
                                exchange2019_2_pages = 'exchange2019_2_pages'
                            } else if (new Date(data.operation_time) >= new20200419) {
                                if (current_settings['receipt_printer_type'].includes("2_thermo")) {
                                    exchange2019 = 'exchange2020_2'
                                    exchange2019_2_pages = 'exchange2020_2_pages_2'
                                } else {
                                    exchange2019 = 'exchange2020_1'
                                    exchange2019_2_pages = 'exchange2020_2_pages_1'
                                }
                            } else {
                                exchange2019 = 'exchange2019_2'
                                exchange2019_2_pages = 'exchange2019_2_pages_2'
                            }

                            if (current_settings['receipt_printer_type'].includes("thermo58_1")) {

                                data.copy = 1;

                                var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                                data.copy = 2;

                                var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                if (needs_certificate) {
                                    PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                }

                            } else if (current_settings['receipt_printer_type'].includes("thermo58_2")) {

                                //console.log(data)
                                var html = Mustache.render(TEMPLATES_THERMO[exchange2019_2_pages], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)

                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                if (needs_certificate) {
                                    PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                }

                            } else if (current_settings['receipt_printer_type'].includes("thermo80")) {

                                data.copy = 1;

                                var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                                data.copy = 2;

                                var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                                PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                if (needs_certificate) {
                                    PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                }
                            } else {
                                var html = Mustache.render(TEMPLATES_RKKS[exchange2019], data)//, {base:TEMPLATES.base})
                                return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                                    .always(function () {
                                        var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                        if (needs_certificate) {
                                            PRINTING_SYSTEMS['chrome']('certificate', docparams)
                                        }
                                    })
                            }

                        }

                    })
            }
            // if (typeof doc_data !== 'undefined'){
            //     print_doc(doc_data)
            // }else{
            return remote_call('FSC', ['DocInfo', parseInt(exchange.rro_id)])
                .then(
                    print_doc,
                    function (xhr, err, XmlRpcFault) {
                        // console.log(err)
                        // console.log(XmlRpcFault.msg)
                        if (XmlRpcFault.msg == "<class 'ValueError'>:cannot convert float NaN to integer") {
                            console.log('alert');
                            alert('Схоже що дана операція не отримала ідентифікатор РККС, зверніться до техпідтримки.')
                        }
                    }
                )
        } else {
            new2019 = new Date("2019-01-01T09:00")
            if (new Date(exchange.operation_time) < new2019) {
                var docparams = {
                    operation_id: opid,
                    exchange_operation: exchange
                }

                getPrintFnsByDoctype('exchange')('exchange', docparams)
                    .always(function () {
                        var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                        if (needs_certificate) {
                            getPrintFnsByDoctype('certificate')('certificate', docparams)
                        }
                    })
            }
            var num_eop = exchange.num_eop
            if (num_eop > 0) {
                var num_eop = String('0000000000' + exchange.num_eop).slice(-10)
                remote_call('directole', ['Passthrough', 'PCNS' + num_eop + '1'])
            } else {
                console.log('alert');
                alert('Схоже що дана операція не отримала ідентифікатор РРО, зверніться до техпідтримки.')
            }
        }
    }

    printStornoArchive = function (opid, doc_data) {
        if (typeof doc_data !== 'undefined') {
            var exchange = $.grep(doc_data, function (n, i) {
                return n.id == opid;
            })[0];
        } else {
            var exchange = $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
                return n.id == opid
            })[0];
        }
        if (exchange.rro_id > 0) {
            var docparams = {
                operation_id: opid,
                exchange_operation: exchange,
            }
            var print_doc = function (response) {
                var data = report['exchange'](docparams)
                var current_settings = __getPrintingSettings()

                data.double_page = false

                data.rro_data = response
                data.rro_date = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('DD.MM.YYYY')
                data.rro_time = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('HH:mm')

                var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

                var link = qr2link(response.Records[3].QR)
                data.qrlink = link.replace(re, "");

                //console.log(data.qrlink.split("/qr/")[0]+"/qr/");

                data.qrlink1 = (data.qrlink.split("/qr/")[0] + "/qr/");
                data.qrlink2 = data.qrlink.split("/qr/")[1];
                data.qr_base64_img = $('<div>').qrcode(link).find('canvas').get(0).toDataURL("image/png");

                // if (data.region_id == 72) {
                //    new2019 = new Date("2019-01-01T09:00")
                // } else {
                new2019 = new Date("2019-01-01T09:00")
                //                }
                if (new Date(data.operation_time) < new2019) {

                    if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                        var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})//, {base:TEMPLATES.base})
                        return PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman
                    } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                        var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})
                        return PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman
                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS['storno2018'], data)//, {base:TEMPLATES.base})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                    }

                } else {

                    new20190207 = new Date("2019-02-07T09:00")
                    new20200419 = new Date("2020-08-01T00:00")

                    if (new Date(data.operation_time) < new20190207) {
                        storno2019 = 'storno2019'
                        storno2019_2_pages = 'storno2019_2_pages'
                    } else if (new Date(data.operation_time) >= new20200419) {
                    if (current_settings['receipt_printer_type'].includes("2_thermo")) {
                        storno2019 = 'storno2020_2'
                        storno2019_2_pages = 'storno2020_2_pages_2'
                    } else {
                        storno2019 = 'storno2020_1'
                        storno2019_2_pages = 'storno2020_2_pages_1'
                    }
                    } else {
                        storno2019 = 'storno2019_2'
                        storno2019_2_pages = 'storno2019_2_pages_2'
                    }

                    if (current_settings['receipt_printer_type'].includes('thermo58_1')) {

                        data.copy = 1;

                        var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})

                        PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                        data.copy = 2;

                        var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})

                        PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                    } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {

                        var html = Mustache.render(TEMPLATES_THERMO[storno2019_2_pages], data, {base: TEMPLATES_THERMO.base})

                        PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                    } else if (current_settings['receipt_printer_type'].includes('thermo80')) {

                        data.copy = 1;

                        var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})

                        PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                        data.copy = 2;

                        var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})

                        PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS[storno2019], data)//, {base:TEMPLATES.base})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                    }

                }
            }
            return remote_call('FSC', ['DocInfo', parseInt(exchange.rro_id)]).then(print_doc)
        } else {
            var num_eop = exchange.num_storno
            if (num_eop > 0) {
                var num_eop = String('0000000000' + exchange.num_storno).slice(-10)
                remote_call('directole', ['Passthrough', 'PCNS' + num_eop + '1'])
            } else {
                console.log('alert');
                alert('Схоже що дана операція не отримала ідентифікатор РРО, зверніться до техпідтримки.')
            }
        }
    }

    printPaymentAccountArchive = function (opid, doc_data) {// Override
        //console.log(doc_data)
        if (typeof doc_data !== 'undefined') {
            var payment = $.grep(doc_data, function (n, i) {
                return n.id == opid;
            })[0];
        } else {
            var payment = $.grep(JSON.parse(localStorage.getItem('payment_operations')), function (n, i) {
                return n.id == opid
            })[0];
        }

        var docparams = {
            operation_id: opid,
            payment_operation: payment,
        }
        var print_doc = function (response) {
            var data = report['payment_account'](docparams)

            data.double_page = false

            payment_account = 'payment_account'

            // var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
            // return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
            var current_settings = __getPrintingSettings()

            // if (current_settings['receipt_printer_type'] == 'thermo58') {
            //         var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})//, {base:TEMPLATES.base})
            //         return PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman
            //     } else if (current_settings['receipt_printer_type'] == 'thermo80') {
            //         var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})
            //         return PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman
            //     } else {
            //         var html = Mustache.render(TEMPLATES_RKKS['storno2018'], data)//, {base:TEMPLATES.base})
            //         return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
            //     }

            if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                data.copy = 1;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                data.copy = 2;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
            } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                var html = Mustache.render(TEMPLATES_THERMO['payment_account_2_pages'], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
            } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                data.copy = 1;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                data.copy = 2;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
            } else {
                var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
            }
        }
        return print_doc()
    }

    cashier_archive = JSON.parse(localStorage.getItem('department_details')).cashier_archive
    var settings = JSON.parse(localStorage.getItem('general_settings'))
    var today = ActualTime().subtract({hours: settings.OPER_DATE_HOUR, minutes: settings.OPER_DATE_MINUTE})

    if (cashier_archive == true) {
        var modal = $.createModal(
            'moneyTableModal',
            btn_id = 'performOperation',
            footer = false,
            bnt_caption = 'Відобразити',
            title = 'Архів операцій')
            .on('shown.bs.modal', function () {
                $(this).find('.close').eq(0).focus()
            });
        var html_oper_table = '<div class="col-sm-12">' +
            '<div class="form-group">' +
            '<label class="col-sm-1 control-label" for="doc_date_archive" style="text-align:right;">Перiод</label>' +
            '<div class="col-sm-3">' +
            '<input class="form-control" data-date-format="YYYY-MM-DD HH:mm:ss" data-role="datetimepicker" id="doc_date_archive" name="doc_date_archive" type="text" value="">' +
            '</div>' +
            '<label class="col-sm-2 control-label" for="operations_type" style="text-align:right;">Тип операції</label>' +
            '<div class="col-sm-2">' +
            '<select type="button" class="btn btn-default" id="operations_type">' +
            '<option value="0">Iнкасації/підкріплення</option>' +
            '<option value="1">Купівля/продаж</option>'


        var department_details = JSON.parse(localStorage.getItem('department_details'))
        if (typeof department_details.payments !== 'undefined') {
            if (department_details.payments) {
                html_oper_table = html_oper_table + '<option value="2">Платежі</option>'
            }
        }
        html_oper_table = html_oper_table + '</select>' +
            '</div>' +
            '</div><br>' +
            '<table class="table table-bordered money-table" id=\'moneyflow-table\'>	' +
            '<thead></thead>' +
            '<tbody></tbody>' +
            '</table>' +
            '</div>'

        modal.find('.modal-body').addClass('oper-table-scroll')
            .html(html_oper_table)

        var updateMoneyTableArchive = function () {
            var operations_type = $('#moneyTableModal #operations_type option:selected').eq(0).val()
            var date_from = $('#doc_date_archive').data('daterangepicker').startDate
            var date_end = $('#doc_date_archive').data('daterangepicker').endDate

            if (operations_type == 0) {
                return updateLS(['cashflow_operations', 'balance'], separately = false).done(function (ret) {
                    updateFront()
                    updateMoneyTableCashflowArchive('.money-table', date_from, date_end)
                })
            } else if (operations_type == 1) {
                return updateLS(['cashflow_operations', 'balance'], separately = false).done(function (ret) {
                    updateFront()
                    updateMoneyTableExchangeOperationsArchive('.money-table', date_from, date_end)
                })
            } else if (operations_type == 2) {
                return updateLS(['cashflow_operations', 'balance'], separately = false).done(function (ret) {
                    updateFront()
                    updateMoneyTablePaymentsAccountOperationsArchive('.money-table', date_from, date_end)
                })
            }
        }
        $('#doc_date_archive').daterangepicker({
            locale: {format: 'YYYY-MM-DD'},
            startDate: today.format('YYYY-MM-DD HH:mm:ss'),
            endDate: today.format('YYYY-MM-DD HH:mm:ss'),
            // maxDate: today.format('YYYY-MM-DD'),
            //minDate: today.subtract({days: settings.ARCHIVE_MAX_DAYS}).format('YYYY-MM-DD'),
            singleDatePicker: false,
            timePicker: false,
            autoApply: true,
            ranges: false
        })
        x = $('<button>')
            .addClass('btn btn-primary pull-right refresh-btn')
            .html('Пошук')
            .click(function (event) {
                updateMoneyTableArchive()
            })
        var btn = $.addNavButton('moneyTableBtn', 'Архів [F9]', 120) // F10

        modal.find('.oper-table-scroll').children().eq(0).prepend(x)

        btn.click(function () {
            displayModal($("#moneyTableModal"))
            updateMoneyTableArchive()
        }).removeClass('btn-default').addClass('btn-warning')

    } else {
        var modal = $.createModal(
            'moneyTableModal',
            btn_id = 'performOperation',
            footer = false,
            bnt_caption = 'Відобразити',
            title = 'Рух коштів')
            .on('shown.bs.modal', function () {
                $(this).find('.close').eq(0).focus()
            });

        modal.find('.modal-body').addClass('oper-table-scroll')
            .html(
                '<div class="col-sm-12">' +
                '<table class="table table-bordered money-table" id=\'moneyflow-table\'>	' +
                '<thead></thead>' +
                '<tbody></tbody>' +
                '</table>' +
                '</div>'
            )

        x = $('<button>')
            .addClass('btn btn-primary pull-right refresh-btn')
            .html('Пошук')
            .click(function (event) {
                return updateLS(['cashflow_operations', 'balance'], separately = false).done(function (ret) {
                    updateFront()
                    //updateMoneyTable('.money-table')
                    updateMoneyTableCashflowArchive('.money-table', today, today)
                })
            })
        var btn = $.addNavButton('moneyTableBtn', 'Рух коштів [F9]', 120) // F10

        modal.find('.oper-table-scroll').children().eq(0).prepend(x)

        btn.click(function () {
            displayModal($("#moneyTableModal"))
            //updateMoneyTable('.money-table')
            updateMoneyTableCashflowArchive('.money-table', today, today)
        }).removeClass('btn-default').addClass('btn-info')

    }

}

StornoModule = function () {
    LOADED_MODULES.push('storno')
    storno_url = 'storno'
    cancel_storno_url = 'cancel_storno'
    stornoAfterPopulate = function (parent) {
        parent.find('tbody tr td:nth-child(' + STORNO_COLNUM + ')')
            .each(function (key) {
                // var op_c = $(this).parent().find('td:nth-child(' + EXOPS_ID_COLNUM + ')')
                var opid = $(this).parent().find('td:nth-child(' + EXOPS_ID_COLNUM + ')').html()
                var op = __getExOpById(opid)

                //console.log(op)
                //opid = row.children().eq(id_colnum-1).html()
                //num_eop = row.children().eq(id_colnum).html()
                //if (confirm("Надрукувати копію документа №"+num_eop+"?")) {print_fns(opid)}
                // new2019 = new Date("2019-01-01T09:00")
                // if (new Date(op.fiscal_time) < new2019) {
                //     num_eop = op.virtual_id
                // } else {
                //     num_eop = op.num_eop
                // }
                // console.log(num_eop)

                if (op.storno_time != null && op.fiscal_storno_time != null) {
                    $(this).html('')
                    $(this).parent().addClass('storno-colored')
                } else if (op.fiscal_storno_time == null && op.storno_time == null && op.fiscal_time != null) {
                    stornoBtn = $('<button>')
                    stornoBtn.addClass("btn btn-sm btn-default btn-secondary glyphicon glyphicon-remove")
                    stornoBtn.click(function () {
                        //console.log('confirm')
                        var op = __getExOpById(opid)

                        // console.log(op_c)
                        if (confirm("Сторнувати операцію №" + op.num_eop + "?") == true) {
                            $(this).removeClass("btn btn-sm btn-default btn-secondary glyphicon glyphicon-remove")
                            $(this).addClass("glyphicon glyphicon-time")
                            $(this).prop('disabled', true)//ggg
                            sendStorno(opid)
                        }
                    })
                    $(this).append(stornoBtn)
                } else {

                }
            })
    }

    sendStorno = function (virtual_opid) {
        opid = __getExOpRealId(virtual_opid)
        var x = $.Deferred().resolve()
        if (LOADED_MODULES.indexOf('rro') != -1) {
            x = x.then(function () {
                return check_rro_connection()
            })
        }
        x = x.then(function () {
            return $.ajax({
                type: "GET",
                url: storno_url,
                data: {'operation_id': opid},
                // contentType : 'application/json',
                success: function (ret) {
                    //console.log('test')
                    //console.log(ret.errors)
                    if (typeof ret.errors !== 'undefined') {
                        //    //modal_win.find('.alert-warning').remove()
                        //    if (typeof ret.errors.general !== 'undefined') {
                        //        //console.log('alert'); alert(ret.errors.general)
                        //        if (typeof ret.errors.redirect !== 'undefined') {
                        //            window.location = ret.errors.redirect;
                        //        }
                        //    }sdfsdf
                        //modal_win.find('.alert-warning').remove()
                        if (typeof ret.errors.general !== 'undefined') {
                            console.log('alert');
                            alert(ret.errors.general)
                            if (typeof ret.errors.redirect !== 'undefined') {
                                window.location = ret.errors.redirect;
                            }
                        }
                    } else if (ret.status == 'success') {
                        localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                        localStorage.setItem('balance', JSON.stringify(ret.balance))
                        // console.log('123123')
                        updateStatusTable()
                        updateOperationsTable()
                        updateFront()
                        if (typeof ret.exchange_data !== 'undefined') {
                            return printStorno(null, ret.exchange_data).then(function () {
                                window.location = '/'
                                //                         updateStatusTable()
                                // updateOperationsTable()
                                // updateFront()
                            })
                        }
                    } else {
                        $.each(ret.errors, function (key, value) {
                            console.log('alert');
                            alert(key + ': ' + value)
                        })
                    }
                }
            })
        })
        return x
    }

    cancelStorno = function (virtual_opid) {
        var prom = $.Deferred()
        $.ajax({
            type: "GET",
            url: cancel_storno_url,
            data: {'operation_id': __getExOpRealId(virtual_opid)},
            success: function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    prom.resolve()
                } else {
                    prom.reject()
                    $.each(ret.errors, function (key, value) {
                        console.log('alert');
                        alert(key + ': ' + value)
                    })
                }
            }
        })
        return prom
    }
}

HotKeysModule = function () {
    LOADED_MODULES.push('hotkeys')
    $('html').on('keydown', function (event) {
        if (event.keyCode == 112) {		 // F1
            event.preventDefault()
            $('#buyBtn').trigger('click');
        } else if (event.keyCode == 113) { // F2
            event.preventDefault()
            $('#sellBtn').trigger('click');
        } else if (event.keyCode == 114) { // F3
            event.preventDefault()
            $('#outcomeBtn').trigger('click');
        } else if (event.keyCode == 115) { // F4
            event.preventDefault()
            $('#incomeBtn').trigger('click');
        } else if (event.keyCode == 119) { // F8
            event.preventDefault()
            $('#ratesBtn').trigger('click');
        }
    })
}

MariaRROModule = function () {
    LOADED_MODULES.push('rro')
    BLOCK_SYNC_EXCHANGE = false
    BLOCK_SYNC_STORNO = false

    __assertNotExists = function (optype, opid, fiscalize_fns) {
        return remote_call('CheckExistance', [optype, opid]).then(
            function (data) {
                if (data == 'exists') {
                    console.log('CheckExistance')
                    fiscalize_fns(opid).then(function (ret) {
                        if (LOADED_MODULES.indexOf('printing') != -1) {
                            console.log('printReceipt_4');
                            return printReceipt(ret.id)
                        }
                    })
                    var msg = 'Вже проведено на РРО, фіскалізуємо'
                    console.log(msg)
                    __serverLog(msg)
                    return $.Deferred().reject(msg)
                } else {
                    var msg = 'Операція не пройшла по РРО та буде відмінена на сервері!\n' +
                        'Зробіть х-звіт, перевірте залишки та повторіть операцію.\n' +
                        'Якщо х-звіт не сформувався, перезавантажте РРО та программу,\n' +
                        'після чого повторіть операцію. \n' +
                        'У разі повторної помилки зв`яжіться з технічною підтримкою ФК.'
                    console.log(msg)
                    __serverLog(msg)
                    return $.Deferred().resolve()
                }
            }
            // function(data){
            // 	// var msg = 'Помилка зв\'язку з РРО...'
            // 	// console.log(msg);__serverLog(msg)
            // 	check_rro_connection(function(){__assertNotExists(optype, opid, fiscalize_fns)})
            // 	// return $.Deferred().reject('connection error')
            // }
        )
    }

    sync_rro_time_promise = function () {
        return remote_call('directole', ['GetPrinterTime']).then(function (data) {
            var seconds_diff = Math.abs(moment(data[0], 'YYYYMMDDHHmmss').diff(ActualTime(), 'seconds'))
            console.log('Різниця секунд з годинником РРО: ' + seconds_diff)
            if (seconds_diff > 15) { // розходження в менше аніж 3 секунди не критичне
                if (seconds_diff > (5400 - 10)) { // Десять секунд на можливу затримку в зв"язку з РРО
                    imposeBlock('rro_time', "Час на РРО збився більше ніж на 90 хвилин, зверніться в технічну підтримку!")
                    return $.Deferred().reject()
                } else {
                    console.log('Виявлено закриту зміну і розбіжність часу РРО і сервера більше 3 секунд, синхронізуємо годинники ...')
                    return remote_call('directole', ['Passthrough', 'CTIM' + ActualTime().format('HHmmss')])
                }
            } else {
                return $.Deferred().resolve(seconds_diff)
            }
        })
    }
    sync_currencies = function () {
        //console.log(3)
        return remote_call('updCurrencies', [__getAllCurrencies()])
    }
    var check_rro_responce = function (rro_response, cancel_server_fns) {
        //console.log(rro_response)
        var resp_has = function (cmd) {
            return rro_response.data.indexOf(cmd) !== -1
        }
        if (rro_response.status == 'success' || (resp_has('DONE') && resp_has('READY'))) {
            console.log('Операція успішно пройшла на РРО')
            //__serverLog(msg)
            return $.Deferred().resolve(rro_response)
        } else if (rro_response.status == 'exists' || rro_response.data == 'exists') {
            var msg = 'Така операція вже існує в РРО'
            console.log(msg)
            __serverLog(msg)
            return $.Deferred().resolve(rro_response)
        } else if (resp_has('SOFT24HOUR') && resp_has('SOFTNREP') && resp_has('READY')) {
            var msg = 'Невдалося провести операцію на РРО, Z звіт не відправлявся більше 24 годин. Надрукуйте Z звіт і спробуйте ще раз.\n' + JSON.stringify(rro_response)
            __serverLog(msg)
            return $.Deferred().reject(msg)
        } else if (resp_has('SOFTPROTOC') && resp_has('SOFTpOVER72HSOFTpNRKSEF') && resp_has('READY')) {
            var msg = 'РРО було заблоковано через 72 години роботи без відправки на сервер екваєра. Намагаємося відправити дані. Коли Таймер РРО оновиться, проведіть ще раз операцію.\n' + JSON.stringify(rro_response)
            __serverLog(msg)
            do_settlement()
            return $.Deferred().reject(msg)
        } else if (resp_has('SOFTPAPER') && resp_has('READY')) { // resp_has('HARDPAPER') &&
            var msg = 'На РРО скінчився папір, замініть бабіну і проведіть ще раз операцію.\n' + JSON.stringify(rro_response)
            __serverLog(msg)
            return $.Deferred().reject(msg)
        } else if (resp_has('SOFT24HOUR') && resp_has('SOFTPROTOC') && resp_has('READY')) {
            var msg = 'Невдалося провести операцію на РРО, Z звіт не відправлявся більше 24 годин. Надрукуйте Z звіт і спробуйте ще раз.\n' + JSON.stringify(rro_response)
            __serverLog(msg)
            return $.Deferred().reject(msg)
        } else {
            var msg = 'Отримано неочікувану відповідь від РРО: ' + rro_response.data + '\nМожливо РРО не підключено.'
            __serverLog(msg)
            return $.Deferred().reject(msg)
        }
    }

    function do_settlement() {
        // return remote_call('directole', ['Settlement'])
        return remote_call('Settlement')

        // return remote_call('directole', ['SettlementAsync'])
        // remote_call('directole', ['AbortSettlementAsync', true]) //if false don't wait for answer
        // remote_call('directole', ['SettlementState'])
        // 0 операция SettlementAsync не запускалась,
        // 1 операция в процессе выполнения,
        // 2 операция завершена успешно,
        // 3 операция завершена с ошибкой,
        // 4 операция отменена вызовом AbortSettlementAsync
    }

    function do_settlement_async() {
        return remote_call('SettlementAsync')
    }

    function refresh_settlement_timer() {
        // Returns settlement state
        return remote_call('directole', ['GetTimeToPendingLock'])
            .done(function (data) {
                var timer = $('#rro-timer')
                var seconds_to_lock = parseInt(data[0])// + 9999
                var locktime = ActualTime().add(seconds_to_lock, 'seconds').format('YYYY/MM/DD HH:mm:ss')
                if (seconds_to_lock > 0) {
                    timer.countdown(locktime, function (event) {
                        $(this).text(
                            event.strftime('%D дні %H:%M:%S')
                        );
                    });
                } else {
                    timer.html('заблоковано' + locktime)
                    var msg = 'Намагаємося оновити таймер після Сеттлменту'
                    console.log(msg)
                    __serverLog(msg)
                    do_settlement().then(function () {
                        setTimeout(refresh_settlement_timer, SYNC_PERIOD * 1000)
                    })
                }
            })
    }

    function deployRROConnectionIndicator() {
        // var btn = $('<button>')
        //     .addClass("btn btn-md btn-default action-btn")
        //     .attr('id', 'rro_connection')
        //     .append($('<i>').addClass("glyphicon glyphicon-inbox"))
        //
        // var before_element = $('#info-container p i.glyphicon-book').parent().parent()
        // btn.insertBefore(before_element)
        var btn = $.addNavButton('rro_connection', 'РРО')
        //console.log('Привет')

        btn.on('greenify', function () {
            $(this).removeClass('disabled btn-danger btn-warning').addClass('disabled btn-success')
            $(this).find('span').addClass('glyphicon-ok').removeClass('glyphicon-refresh glyphicon-time')
        })
            .on('redify', function () {
                $(this).removeClass('disabled btn-success btn-warning').addClass('btn-danger')
                $(this).find('span').addClass('glyphicon-refresh').removeClass('glyphicon-ok glyphicon-time')
            })
            .on('warnify', function () {
                $(this).removeClass('disabled btn-danger btn-success').addClass('disabled btn-warning')
                $(this).find('span').addClass('glyphicon-time').removeClass('glyphicon-ok glyphicon-refresh')
            })
            .on('click', function () {
                check_rro_connection()
            })
            .trigger('greenify')
    }

    function deployBlockTime() {
        var next_elem = $('#info-container p i.glyphicon-book').parent().parent()
        $('<p>')
            .append($('<b>').html('Блокування РРО:'))
            .append(' ')
            .append($('<span>').attr('id', 'rro-timer'))
            .insertBefore(next_elem)
        return refresh_settlement_timer()
    }

    updateCashierName = function (actual_name) {
        // var cmd = 'UPAS'+RRO_PASSWORD+JSON.parse(localStorage.getItem('operator')).person
        // return remote_call('directole', ['Passthrough', cmd])
        var cashier_name = JSON.parse(localStorage.getItem('operator')).person
        return remote_call('changeCashier', [cashier_name])
            .then(function (resp) {
                return {data: resp[0]}
            })
            .then(check_rro_responce)
            .then(
                function (data) {
                    return $.Deferred().resolve()
                },
                function (data) {
                    console.log('alert');
                    alert(data)
                }
            )
    }

    check_rro_connection = function (CALLBACK) {
        CALLBACK = typeof CALLBACK !== 'undefined' ? CALLBACK : function () {
            console.log('empty callback')
        };
        // 2DO: перевірка на достатність прав для запису json
        var reconnect_ole2rro = function () {
            console.log('Намагаємося перезапустити РРО. Якщо будуть з"являтися віконця з помилками, обов"язково натискайте "ОК"')
            return remote_call('Reconnect', [JSON.parse(localStorage.getItem('operator')).person]).then(function (data) {
                if (typeof data.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof data.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(data.errors.general)
                        if (typeof data.errors.redirect !== 'undefined') {
                            window.location = data.errors.redirect;
                        }
                    }
                } else if (data[0] == 'success') {
                    console.log('Спроба перезапуску завершена')
                    return $.Deferred().resolve()
                } else if (data[0] == null) {
                    console.log('Не вдалося перезапустити. РРО не доступне.')
                    return $.Deferred().reject()
                }
            })
        }
        var check_ole2rro_connection = function () {
            var prom = new $.Deferred()
            remote_call('directole', ['Passthrough', 'SYNC23'])
                .done(function (data) {
                    if (data[0].substr(2, 6) == 'SYNC23') {
                        console.log('РРО працює в нормальному режимі')
                        prom.resolve()
                    } else if (data[0] == 'None') {
                        console.log('РРО не доступне')
                        prom.reject()
                    }
                })
            return prom.promise()
        }
        var check_rpc2ole_connection = function () {
            return remote_call('directole', ['Version']).then(function (data) {//["4.1.20161206"]
                if (data.length == 1) {
                    console.log('Ole manager працює: ' + data[0])
                    return $.Deferred().resolve()
                } else {
                    console.log('Помилка зв"язку з Ole manager' + data[0])
                    return $.Deferred().reject()
                }
            }, function (data, y, z) {
                if (z.msg == "<class 'Exception'>:method \"directole\" is not supported") {
                    console.log('Клієнтська частина не знайшла підключеного РРО при запуску, чекаємо на підключення РРО')
                    return $.Deferred().reject()
                }
            })
        }
        var check_chrome2rpc_connection = function () {
            var prom = new $.Deferred()

            $.ajax({
                url: JSON.parse(localStorage.getItem('general_settings')).LOCAL_RPC_URL,
                type: "HEAD",
                timeout: 200,
            }).complete(function (jqXHR, status) {
                if (status == 'timeout') {
                    console.log('Не вдалося встановити зв"язок з клієнтською частиною програми. Можливо у вас з\'явилося вікно з помилкою РРО і Ви не натиснули ОК.')
                    prom.reject()
                } else if (status == 'error') {
                    console.log('Немає підключення до клієнтської частини')
                    prom.reject()
                    // setTimeout(check_rpc2ole_connection, 1000)
                } else if (status == 'nocontent') {
                    console.log('Клієнтська частина працює')
                    prom.resolve()
                } else if (jqXHR.statusText == "Unsupported method ('HEAD')") {
                    console.log('alert');
                    alert('Відправка заголовків не підтримується клієнтською программою, зверніться в підтримку')
                    prom.reject()
                } else {
                    console.log('alert');
                    alert('Виникла невідома помилка, зверніться в техпідтримку')
                    prom.reject()
                }
            })
            return prom.promise()
        }


        var fail_to_connect = function () {
            msg = 'Немає з\'єднання з РРО, роботу заблоковано.\n Намагаємося відновити з\'єднання...'
            if (LOADED_MODULES.indexOf('global_block') > -1) {
                imposeBlock('rro', msg)
            }
            $('#rro_connection').trigger('redify')
            setTimeout(function () {
                return check_rro_connection(CALLBACK)
            }, 3000)
            return $.Deferred().reject()
        }
        var connected = function () {
            if (LOADED_MODULES.indexOf('global_block') > -1) {
                releaseBlock('rro')
            }
            $('#rro_connection').trigger('greenify')
            return $.Deferred().resolve()
        }

        $('#rro_connection').trigger('warnify')

        return check_rpc2ole_connection()// return check_chrome2rpc_connection()
            .then(
                function () {
                    return check_ole2rro_connection().then(
                        $.Deferred().resolve,
                        function () {
                            return reconnect_ole2rro().then(check_ole2rro_connection)
                        })
                }
            )
            .then(connected, fail_to_connect)
            .then(CALLBACK)
    }
    checkRROConnectionOnClick = function () {
        // Add rro_connection_check to each button
        var binded_fns = $._data(this, 'events').click
        var orig_fnss = []
        for (var i = 0; i < binded_fns.length; i++) {
            orig_fnss.push(binded_fns[i].handler)
        }

        $(this).off('click').on('click', function () {
            // return $.each(orig_fnss, function(k, fns){ fns() })
            check_rro_connection(function () {
                get_closed_day()
                    // $.Deferred().resolve()
                    .then(function () {
                        $.each(orig_fnss, function (k, fns) {
                            fns()
                        })
                    })
            })
        })
    }
    rro_check_copy = function () {
        return remote_call('directole', ['Passthrough', 'COPY'])
            .then(function (responce) {
                if (responce[0] == "('SOFTPROTOC', 'READY')") {
                    console.log('alert');
                    alert('Можна надрукувати тільки одну копію останнього чека')
                }
            })
    }
    sync_rro_rates = function () {
        // Просто оновлюємо курси РРО до поточних
        var compareWebAndRRORates = function (rro_rates) {
            web_rates = __getWebRates()
            $.each(web_rates, function (wk, wv) {
                var exists_in_rro = false
                $.each(rro_rates, function (rk, rv) {
                    if (wv.num_code == rv.num_code) {
                        exists_in_rro = true
                    }
                })
                if (!exists_in_rro) {
                    msg = 'На РРО відсутня валюта з кодом ' + ('000' + wv.num_code).substr(-3) + '. Подальша робота неможлива, зверніться до технічної підтримки (098-845-53-34, 098-845-53-44, 066-480-39-63, 050-840-37-01)'
                    if (LOADED_MODULES.indexOf('global_block') > -1) {
                        imposeBlock('rro_rates_error', msg)
                    }
                    return false
                }
            })
            return true
        }
        return remote_call('setRates', [__getWebRates()])
    }
    sync_exchange_operation = function (exchange_operation_data) {
        if (BLOCK_SYNC_EXCHANGE) {
            return $.Deferred().resolve()
        }
        BLOCK_SYNC_EXCHANGE = true

        var send_exchange_rro = function (eop) {

            client = eop.client.length < 1 ? ' ________________________________________' : eop.client
            if (client.length > 53) {
                while (client.length < 114) {
                    client += ' ';
                }
            } else {
                while (client.length < 53) {
                    client += ' ';
                }
            }

            client = client + 'СУМА КОМІСІЇ 0.00 UAH'

            data = {
                id: eop.id,
                currency_code: __getNumCode(eop.currency_id),
                optype: eop.currency_amount > 0 ? 1 : 3,
                amount: Math.abs(parseInt(eop.currency_amount)),
                client: client,
            }
            //console.log(data)
            return updateCashierName().then(function () {
                return remote_call('Exchange', [data])
            })
        }

        var fiscalize_exchange = function (op_id, num_eop) {
            return $.ajax({
                type: "POST",
                url: 'fiscalize_exchange',
                data: {operation_id: op_id, num_eop: num_eop},
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція exchange була успішно фіскалізована')
                    localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(JSON.stringify(ret.errors))
                    // fiscalize_exchange(eop_id)
                }
            }).fail(function () {
                if (confirm('Операція не була фіскалізована на сервері після відправки на РРО, перевірте з\'єднання з інтернетом і спробуйте ще раз. Якщо це вікно продовжує з\'являтися, зверніться в техпідтримку. Спробувати ще?')) {
                    fiscalize_exchange(op_id, num_eop)
                } else {
                    // Сторно на РРО
                    // Перевірка чи зай
                    // console.log('alert'); alert('Зверніться в техпідтримку, якщо ви цього не зробите, при оновленні сторінки у Вас задвоїться операція на РРО!')
                }
            })
        }

        var rro_max_time_diff = JSON.parse(localStorage.getItem('general_settings')).OPERATION_RRO_MAX_DIFF
        var is_too_old = ActualTime().diff(moment(exchange_operation_data.operation_time), 'seconds') >= rro_max_time_diff
        if (!is_too_old) {
            console.log('Проводимо операцію на РРО')
            x = sync_rro_rates()
                .then(sync_advances_rro_bulk)
                .then(function () {
                    return send_exchange_rro(exchange_operation_data)
                })
                .then(check_rro_responce)
                .then(function () {
                        remote_call('directole', ['Passthrough', 'GLCN'])
                            .done(function (data) {
                                resp = data[0]
                                if (resp == 'None') {
                                    remote_call('restartScript').always(function () {
                                        var msg = 'Не знайдено підключеного РРО намагаємося перезапустити Oleweb...'
                                        console.log(msg)
                                        setTimeout(rro_identify, 5000)
                                    })
                                } else {
                                    var num_eop = parseInt(resp.substr(6, 10))
                                    return fiscalize_exchange(exchange_operation_data.id, num_eop).then(function (ret) {
                                        new2019 = new Date("2019-01-01T09:00")
                                        if (new Date(exchange_operation_data.operation_time) < new2019) {
                                            if (LOADED_MODULES.indexOf('printing') != -1) {
                                                console.log('printReceipt_5');
                                                return printReceipt(ret.id)
                                            }
                                        }
                                    })
                                }
                            })
                    },
                    function (reject_data) {
                        return __assertNotExists('exchange', exchange_operation_data.virtual_id, fiscalize_exchange)
                            .then(function (data) {
                                return cancelExchange(exchange_operation_data.virtual_id)
                            })
                    }
                )
        } else {
            new2019 = new Date("2019-01-01T09:00")
            if (new Date(exchange_operation_data.fiscal_time) >= new2019) {
                num_eop = exchange_operation_data.num_eop < 1 ? exchange_operation_data.virtual_id : exchange_operation_data.num_eop
            } else {
                num_eop = exchange_operation_data.virtual_id
            }

            var msg = 'Не встигли провести операцію № ' + num_eop + ' на РРО, намагаємося скасувати...'
            __serverLog(msg)
            x = __assertNotExists('exchange', exchange_operation_data.virtual_id, fiscalize_exchange)
                .then(function (data) {
                    return cancelExchange(exchange_operation_data.virtual_id)
                })
        }
        return x.always(function () {
            BLOCK_SYNC_EXCHANGE = false
        })
    }
    sync_storno_operation = function (exchange_operation_data) {
        if (BLOCK_SYNC_STORNO) {
            return $.Deferred().resolve()
        }
        BLOCK_SYNC_STORNO = true

        var send_rro = function (eop) {

            client = eop.client.length < 1 ? ' ________________________________________' : eop.client
            if (client.length > 53) {
                while (client.length < 114) {
                    client += ' ';
                }
            } else {
                while (client.length < 53) {
                    client += ' ';
                }
            }

            client = client + 'СУМА КОМІСІЇ 0.00 UAH';

            // client = '* * *';

            optype = eop.currency_amount > 0 ? 2 : 4;

            currency_code = addZero(3, __getNumCode(parseInt(eop.currency_id)));

            amount = addZero(10, Math.abs(feroksoft.money_round(eop.currency_amount * 100)))
            console.log('amount='+amount)

            rate = addZero(15, addZero(15, feroksoft.money_round(eop.exchange_rate * 100000000)))
            console.log('rate='+rate)

            equiv = addZero(10, Math.abs(feroksoft.money_round(eop.equivalent * 100)))
            console.log('equiv='+equiv)

            client_len = addZero(3, client.length);
            console.log('client_len='+client_len)

            cmd = 'VLOP' + optype + currency_code + amount + equiv + rate + client_len + client;
            console.log(cmd)
            __serverLog(cmd)

            // var data = {
            //     id: eop.id,
            //     currency_code: __getNumCode(parseInt(eop.currency_id)),
            //     optype: eop.currency_amount > 0 ? 2 : 4,
            //     amount: Math.abs(parseFloat(eop.currency_amount)),
            //     client: client,
            // }
            return updateCashierName().then(function () {
                return remote_call('directole', ['Passthrough', cmd])
                // return remote_call('ExchangeStorno', [data])
            })
        }
        var fiscalize = function (eop, num_storno) {
            return $.ajax({
                type: "POST",
                url: 'fiscalize_exchange_storno',
                data: {operation_id: eop.id, num_storno: num_storno},
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція exchange була успішно фіскалізована')
                    localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(JSON.stringify(ret.errors))
                    fiscalize(eop)
                }
            }).fail(function () {
                if (confirm('Операція не була фіскалізована на сервері після відправки на РРО, перевірте з\'єднання з інтернетом і спробуйте ще раз. Якщо це вікно продовжує з\'являтися, зверніться в техпідтримку. Спробувати ще?')) {
                    fiscalize(eop)
                } else {
                    console.log('alert');
                    alert('Зверніться в техпідтримку, якщо ви цього не зробите, при оновленні сторінки у Вас задвоїться операція на РРО!')
                }
            })
        }
        console.log('Проводимо операцію на РРО')
        x = sync_rro_rates()
            .then(function () {
                return send_rro(exchange_operation_data)
            })
            .then(
                function (rro_response) {
                    //console.log(rro_response)
                    __serverLog(rro_response[0])
                    var resp_has = function (cmd) {
                        return rro_response[0].indexOf(cmd) !== -1
                    }
                    if ((resp_has('DONE') && resp_has('READY'))) {
                        console.log('Операція успішно пройшла на РРО')
                        remote_call('directole', ['Passthrough', 'GLCN'])
                            .done(function (data) {
                                resp = data[0]
                                if (resp == 'None') {
                                    remote_call('restartScript').always(function () {
                                        var msg = 'Не знайдено підключеного РРО намагаємося перезапустити Oleweb...'
                                        console.log(msg)
                                        setTimeout(rro_identify, 5000)
                                    })
                                } else {
                                    var num_storno = parseInt(resp.substr(6, 10))
                                    return fiscalize(exchange_operation_data, num_storno)
                                }
                            }),
                            function (jqXHR, status, resp) {
                                return cancelStorno(exchange_operation_data.virtual_id).then(function (data) {
                                    var err = (resp.statusText != "error") ? resp : 'РРО не доступне'
                                    var msg = 'Не вдалося сторнувати операцію №' + exchange_operation_data.num_eop + '\n' + err + '\nCпробуйте ще раз'
                                    __serverLog(msg)
                                    console.log('alert');
                                    alert(msg)
                                })
                            }
                    }
                }
            )
        //return FiscalCommonsLib.sync_storno_operation(exchange_operation_data, 'РРО')
        return x.always(function () {
            BLOCK_SYNC_STORNO = false
        })
    }

    sync_cashflow_operation = function (cashflow_operation_data) {
        var send_rro = function (cfop) {
            var data = {
                id: cfop.id,
                currency_code: __getNumCode(cfop.currency_id),
                optype: cfop.money_amount > 0 ? 2 : 3,
                amount: Math.abs(parseFloat(cfop.money_amount))
            }

            return updateCashierName().then(function () {
                return remote_call('Cashflow', [data])
            })
        }

        var fiscalize = function (cfop) {
            return $.ajax({
                type: "POST",
                url: 'fiscalize_cashflow',
                data: {operation_id: cfop.id},
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція cashflow була успішно фіскалізована')
                    localStorage.setItem('cashflow_operations', JSON.stringify(ret.cashflow_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    if (LOADED_MODULES.indexOf('printing') != -1) {
                        getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id': ret.id})
                    }

                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(ret.error)
                }
            })
        }

        return send_rro(cashflow_operation_data).then(check_rro_responce).then(
            function () {
                return fiscalize(cashflow_operation_data)
            }, function (reject_data) {
                var msg = 'Не вдалося передати на РРО ордер №' + cashflow_operation_data.id + '.\n' + reject_data
                __serverLog(msg)
                //console.log('alert'); alert(msg)
            }
        )
    }

    sync_payment_operation = function (payment_operation_data) {

        printPaymentAccount = function (opid) {// Override
            //console.log(doc_data)
            var payment = $.grep(JSON.parse(localStorage.getItem('payment_operations')), function (n, i) {
                return n.id == opid
            })[0];

            // console.log(payment)
            var docparams = {
                operation_id: opid,
                payment_operation: payment,
            }

            var data = report['payment_account'](docparams)

            data.double_page = false

            var html = '';

            return $.Deferred().resolve(html)
                .then(function (html) {
                    payment_account = 'payment_account'
                    var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                    return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                })
        }

        var send_rro = function (cfop) {
            var data = {
                id: cfop.id,
                currency_code: __getNumCode(cfop.currency_id),
                optype: 2,
                amount: parseFloat(cfop.payment_amount)
            }
            // console.log(data)

            return updateCashierName().then(function () {
                return remote_call('Cashflow', [data])
            })
        }

        var fiscalize = function (cfop, num_eop) {
            return $.ajax({
                type: "POST",
                url: 'fiscalize_payment',
                data: {
                    operation_id: cfop.id,
                    num_eop: num_eop
                },
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція payment була успішно фіскалізована')
                    localStorage.setItem('payment_operations', JSON.stringify(ret.payment_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    if (LOADED_MODULES.indexOf('printing') != -1) {
                        return printPaymentAccount(cfop.id)
                    }

                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(ret.error)
                }
            })
        }

        return send_rro(payment_operation_data).then(check_rro_responce).then(
            function () {
                remote_call('directole', ['Passthrough', 'GLCN'])
                    .done(function (data) {
                        resp = data[0]
                        if (resp == 'None') {
                            remote_call('restartScript').always(function () {
                                var msg = 'Не знайдено підключеного РРО намагаємося перезапустити Oleweb...'
                                console.log(msg)
                                setTimeout(rro_identify, 5000)
                            })
                        } else {
                            var num_eop = parseInt(resp.substr(26, 10))//20190703
                            console.log(num_eop)
                            return fiscalize(payment_operation_data, num_eop)
                        }
                    })
            }, function (reject_data) {
                var msg = 'Не вдалося передати на РРО ордер №' + payment_operation_data.real_id + '.\n' + reject_data
                __serverLog(msg)
                //console.log('alert'); alert(msg)
            }
        )
    }

    sync_canceled_payment_operation = function (payment_operation_data) {

        var send_rro = function (cfop) {
            var data = {
                id: cfop.id + '9',
                currency_code: __getNumCode(cfop.currency_id),
                optype: 3,
                amount: parseFloat(cfop.payment_amount)
            }
            console.log(data)

            return updateCashierName().then(function () {
                return remote_call('Cashflow', [data])
            })
        }

        var fiscalize = function (cfop, num_eop) {
            return $.ajax({
                type: "POST",
                url: 'fiscalize_canceled_payment',
                data: {
                    operation_id: cfop.id,
                    num_eop: num_eop
                },
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція canceled payment була успішно фіскалізована')

                    //alert('Платіжна операція '+ payment_operation_data.real_id +' була скасована')

                    localStorage.setItem('payment_operations', JSON.stringify(ret.payment_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    // if (LOADED_MODULES.indexOf('printing') != -1) {
                    //     return printPaymentAccount(cfop.id)
                    // }

                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(ret.error)
                }
            })
        }

        return send_rro(payment_operation_data).then(check_rro_responce).then(
            function () {
                remote_call('directole', ['Passthrough', 'GLCN'])
                    .done(function (data) {
                        resp = data[0]
                        if (resp == 'None') {
                            remote_call('restartScript').always(function () {
                                var msg = 'Не знайдено підключеного РРО намагаємося перезапустити Oleweb...'
                                console.log(msg)
                                setTimeout(rro_identify, 5000)
                            })
                        } else {
                            var num_eop = parseInt(resp.substr(26, 10))//20190703
                            console.log(num_eop)
                            return fiscalize(payment_operation_data, num_eop)
                        }
                    })
            }, function (reject_data) {
                var msg = 'Не вдалося передати на РРО ордер №' + payment_operation_data.real_id + '.\n' + reject_data
                __serverLog(msg)
                //console.log('alert'); alert(msg)
            }
        )
    }

    sync_all_operations = function () {
        console.log('Синхронізуємося ...')

        var not_fiscalized_exchanges = JSON
            .parse(localStorage.getItem('exchange_operations'))
            .filter(function (element, value) {
                return !element.fiscal_time
            })
        var chain = $.Deferred().resolve()
        $.each(not_fiscalized_exchanges, function (k, v) {
            chain = chain.then(function () {
                return sync_exchange_operation(v)
            })
        })

        var not_fiscalized_stornos = JSON
            .parse(localStorage.getItem('exchange_operations'))
            .filter(function (element, value) {
                return !element.fiscal_storno_time && element.storno_time
            })
        $.each(not_fiscalized_stornos, function (k, v) {
            chain = chain.then(function () {
                return sync_storno_operation(v)
            })
        })

        not_fiscalized_cashflows = JSON
            .parse(localStorage.getItem('cashflow_operations'))
            .filter(function (element, value) {
                return !element.fiscal_time && element.confirmation_time
            })
        $.each(not_fiscalized_cashflows, function (k, v) {
            chain = chain.then(function () {
                return sync_cashflow_operation(v)
            })
        })

        not_confirmed_cashflows = JSON
            .parse(localStorage.getItem('cashflow_operations'))
            .filter(function (element, value) {
                return !element.confirmation_time && !element.refusal_time
            })
        if (not_confirmed_cashflows.length > 0) {
            console.log('Оновлюємо інформацію про інкасації та підкріплення з серверу')
            chain = chain.then(function () {
                return updateLS(['cashflow_operations', 'balance'], separately = false)
            })
        }

        not_fiscalized_payments = JSON
            .parse(localStorage.getItem('payment_operations'))
            .filter(function (element, value) {
                return !element.fiscal_time && !element.cancel_time && element.payment_time != null && element.transaction_id != null
            })
        $.each(not_fiscalized_payments, function (k, v) {
            chain = chain.then(function () {
                return sync_payment_operation(v)
            })
        })
        if (not_fiscalized_payments.length > 0) {
            console.log('Оновлюємо інформацію про платежи з серверу')
            chain = chain.then(function () {
                return updateLS(['payment_operations', 'balance'], separately = false)
            })
        }

        not_fiscalized_canceled_payments = JSON
            .parse(localStorage.getItem('payment_operations'))
            .filter(function (element, value) {
                return element.fiscal_time && !element.fiscal_cancel_time && element.cancel_time && element.payment_time != null && element.transaction_id != null
            })
        $.each(not_fiscalized_canceled_payments, function (k, v) {
            chain = chain.then(function () {
                return sync_canceled_payment_operation(v)
            })
        })
        if (not_fiscalized_canceled_payments.length > 0) {
            console.log('Оновлюємо інформацію про платежи з серверу')
            chain = chain.then(function () {
                return updateLS(['payment_operations', 'balance'], separately = false)
            })
        }

        chain.then(
            function () {
                setTimeout(sync_all_operations, SYNC_PERIOD * 1000)
            },
            function () {
                setTimeout(sync_all_operations, SYNC_PERIOD * 1000)
            }
        )

    }
    sync_advances_rro_bulk = function () {
        data = []
        // $.each(report['accounting_statement']({}, true).currencies, function (k, v) {
        //     //advance = v['balance'] + v['frozen_balance']
        //     if (v.current > 0) {// v.initial
        //         data.push({
        //             currency_code: parseInt(v.code), //__getNumCode(parseInt(v['currency_id'])),
        //             optype: 1,
        //             amount: v.current,//initial,
        //         })
        //     }
        // })
        var balance = JSON.parse(localStorage.getItem('balance'))

        $.each(balance, function (bid, balance) {
            if (balance.balance > 0) {// v.initial
                data.push({
                    currency_code: parseInt(balance.curr_numcode), //__getNumCode(parseInt(v['currency_id'])),
                    optype: 1,
                    amount: balance.balance
                })
            }
        })

        if (data.length != 0) {
            return remote_call('directole', ['NextZNumber'])
                .then(function (znumber) {
                    // Check to accel requests to directole
                    if (localStorage.getItem('last_z_report') == znumber) {
                        console.log('exists in LS')
                        return $.Deferred().resolve()
                    } else {
                        return remote_call('Advances', [{'id': znumber[0], 'data': data}])
                            .then(function (adv_resp) {
                                localStorage.setItem('last_z_report', znumber);
                                return adv_resp
                            })
                            .then(inform_server_advances)
                    }

                })
        } else {
            return $.Deferred().resolve()
        }
    }
    // send_zreport = function(){
    // 	// var CALLBACK = typeof CALLBACK !== 'undefined' ? CALLBACK : function(){console.log('empty callback')};
    // 	return refuseAllCashflows()
    // 		.then(function(){return remote_call('directole', ['NextZNumber'])})
    // 		.then(function(znumber){
    // 			return remote_call('ZReport', [{'id':znumber[0]}])
    // 		})
    // 		.then(check_rro_responce)
    // }


    // .then(function(response){
    // 							if (response.status == 'exists'){ return $.Deferred().resolve(response) }
    // 							else{ return $.Deferred().reject() }
    // 						})

    send_zreport = function (exit) {
        // var CALLBACK = typeof CALLBACK !== 'undefined' ? CALLBACK : function(){console.log('empty callback')};
        return refuseAllCashflows()
            .then(function () {
                return remote_call('directole', ['Passthrough', 'CANC'])
            })
            .then(
                function (resp) {
                    console.log(resp)
                    return remote_call('directole', ['Passthrough', 'NREP'])
                })
            .then(
                function (rro_response) {
                    //console.log(rro_response)
                    var resp_has = function (cmd) {
                        return rro_response[0].indexOf(cmd) !== -1
                    }
                    if ((resp_has('DONE') && resp_has('READY'))) {
                        console.log('Операція успішно пройшла на РРО')
                        remote_call('directole', ['Passthrough', 'GLCN'])
                            .done(function (data) {
                                resp = data[0]
                                var status_z = parseInt(resp.substr(38, 1))
                                var z_number = parseInt(resp.substr(39, 4))
                                if (status_z > 0) {
                                    send_z_number(z_number).always(function (ret) {
                                        if (exit) {
                                            return $.ajax({
                                                type: "GET",
                                                url: 'login/logout',
                                                data: {}
                                            })
                                                .always(function (ret) {
                                                    window.location = '/'
                                                })
                                        }
                                    })
                                }
                            })
                    } else {
                        console.log('alert');
                        alert('Помилка відправки Z звіту. Зверніться до техпідтримки')
                    }
                }
            )
    }

    var rro_decorate = function (send_server, sync_rro, __getById) {
        return function (data) {
            var p = send_server(data)
            return p.then(
                function (ret) {
                    if (typeof ret.errors !== 'undefined') {
                        //modal_win.find('.alert-warning').remove()
                        if (typeof ret.errors.general !== 'undefined') {
                            console.log('alert');
                            alert(ret.errors.general)
                            if (typeof ret.errors.redirect !== 'undefined') {
                                window.location = ret.errors.redirect;
                            }
                        } else {
                            console.log('Операція не пройшла на сервері:\n. Спробуйте ще раз.')
                            console.log(ret.errors)
                            return $.Deferred().reject()
                        }
                    } else {
                        return sync_rro(__getById(ret.id))
                        // .fail(function(){
                        // 	var msg = 'Операція #' +ret.id+ ' не була передана на РРО, оновіть сторінку'
                        // 	console.log(msg)
                        // 	__serverLog(msg)
                        // 	window.location = '/'
                        // })
                    }
                }, function () {
                    console.log('alert');
                    alert('Перевірте з"єднання з інтернетом')
                    return $.Deferred().reject()
                })
        }
    }
    buysellClass.prototype.send = rro_decorate(buysellClass.prototype.send, sync_exchange_operation, __getExOpById)
    ratesClass.prototype.send = rro_decorate(ratesClass.prototype.send, sync_rro_rates, function () {
    })
    sendStorno = rro_decorate(sendStorno, sync_storno_operation, __getExOpById)

    var send_z_number = function (z_number) {
        return $.ajax({
            type: "POST",
            url: 'z_number',
            data: {z_number: z_number},
        })
    }

    if (LOADED_MODULES.indexOf('reports') != -1) {
        var zbtn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-danger').prop('id', 'zreport')
            .html('Z звіт')
            .click(function () {
                $.ajax({
                    type: "GET",
                    url: 'api/department/check_limit',
                    success: function (ret) {
                        if (typeof ret.errors !== 'undefined') {
                            if (typeof ret.errors.general !== 'undefined') {
                                console.log('alert');
                                alert(ret.errors.general)
                                if (typeof ret.errors.redirect !== 'undefined') {
                                    window.location = ret.errors.redirect;
                                }
                            }
                        } else if (ret.status == 'success') {
                            if (confirm("Ви впевнені, що хочете відправити Z-звіт?") == true) {
                                check_rro_connection().then(send_zreport(true))
                            }
                        } else if (ret.status == 'excess') {
                            // msg = ''
                            // $.each(ret.data, function (k, v) {
                            //     msg = msg + v.currency + ": " + v.excess + "\n"
                            // })
                            // console.log('alert');
                            // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                            //     msg)
                            msg = ''
                            $.each(ret.data, function (k, v) {
                                // msg = msg + v.currency + ": " + v.excess + "\n"
                                msg = v.message
                            })
                            console.log('alert');
                            // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                            //     msg)
                            alert(msg)
                        } else {
                            console.log('alert');
                            alert("Не вдалося перевірити ліміту каси, спробуйте ще раз!")
                        }
                    }
                })
                $('#reportsModal').modal('hide')
            })

        var xbtn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-info').prop('id', 'xreport')
            .html('X звіт')
            .click(function () {
                remote_call('directole', ['XReport']).always(function () {
                    return $('#reportsModal').modal('hide');
                })
            })

        var z_number_input = $('<input>')
            .addClass('form-control')
            .prop('id', 'z_number_input')
            .prop('type', 'number')
            .prop('step', '1')
            .prop('placeholder', '0')
            .prop('min', '1')
            .val(1)

        var zcopy_btn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-success').prop('id', 'zcopy_btn')
            .html('копія Z')
            .click(function () {
                var znum = String('0000000000' + parseInt($('#z_number_input').val())).slice(-10)
                //console.log(num_eop)
                //PCNS
                remote_call('directole', ['Passthrough', 'PCNS' + znum + '2'])
                    .always(function () {
                        $('#reportsModal').modal('hide')
                    })
            })

        $('#reportsModal').find('.modal-body').append(
            $('<div>').addClass('row')
                .append($('<h3>').addClass('col-sm-2').append(xbtn))
                .append($('<h3>').addClass('col-sm-2').append(zbtn))
                .append($('<h3>').addClass('col-sm-2').append(z_number_input))
                .append($('<h3>').addClass('col-sm-2').append(zcopy_btn))
        )
    }

    function print_z_if_forgot() {
        if (!check_last_operator()) {
            var msg = 'Виявлено операції з минулої зміни, яка не була закрита!\n' +
                'Друкуємо Z-звіт та відкриваємо Вашу зміну, після натиснення кнопки "ОК" можете працювати у звичному режимі.'
            __serverLog(msg)
            console.log('alert');
            alert(msg)
            return send_zreport(false)
        }

        if (check_z()) {
            console.log('Необходимо сделать Z')
            checkLimits()
            var check_limits = JSON.parse(localStorage.getItem('check_limits'))
            if (check_limits.status == 'success') {
                limit_block = false
                if (LOADED_MODULES.indexOf('global_block') > -1) {
                    releaseBlock('limit_block')
                }
                var msg = 'З момента відкриття Вашої зміни минуло більше 24 годин!\n' +
                    'Друкуємо Z-звіт та виходимо з програми, для подальшої роботи необхідно повторно авторизуватися.'
                __serverLog(msg)
                console.log('alert');
                alert(msg)
                return send_zreport(true)
                    .then(function () {
                        return $.Deferred().resolve('skip new day')
                    })
            } else if (check_limits.status == 'excess') {
                msg = ''
                $.each(check_limits.data, function (k, v) {
                    msg = msg + v.currency + ": " + v.excess + ", "
                })
                message = 'З момента відкриття Вашої зміни минуло більше 24 годин! Неможливо відкрити нову операційну дату, на відділені виявлено переліміт по наступним валютам: ' +
                    msg + 'зверніться до відділу технічної підтримки ФК!'
                __serverLog(message)
                limit_block = true
                if (LOADED_MODULES.indexOf('global_block') > -1) {
                    imposeBlock('limit_block', message)
                }
            } else {
                //console.log('alert'); alert("Не вдалося перевірити ліміту каси, спробуйте ще раз!")
            }
        } else {
            console.log('Фіскальний день було відкрито сьогодні, продовжуємо роботу ... ')
            // When kashier refuses to open day, advances must not proceed, because they will open new day
            return $.Deferred().resolve()
                .then(sync_advances_rro_bulk)
                .then(sync_rro_rates)
                .then(function () {
                    return $.Deferred().resolve('skip new day')
                })
        }
    }

    get_closed_day = function () {
        return updateCashierName()
            .then(function () {
                return remote_call('directole', ['GetBusinessDayState'])
            })
            .then(function (openday_state) {
                if (openday_state[0] == 0) {
                    var msg = "Виникла помилка при отриманні стану робочого дня на РРО. Зверніться в технічну підтримку"
                    __serverLog(msg)
                    console.log('alert');
                    alert(msg)
                    return $.Deferred().reject(msg)
                } else if (openday_state[0] == 1) {
                    var msg = 'Робочий день закрито'
                    console.log(msg)
                    __serverLog(msg)
                    return $.Deferred().resolve()
                } else if (openday_state[0] == 2) {
                    console.log("Робочий день на РРО вже відкрито, можна продовжувати роботу")
                    return print_z_if_forgot()
                }
            })
            .then(function (data) {
                if (data == 'skip new day') {
                    console.log(data)
                    return $.Deferred().resolve()
                }
                var msg = 'Операційний день на РРО закрито, отправляемо аванси'
                console.log(msg)
                __serverLog(msg)
                return $.Deferred().resolve()
                    .then(sync_rro_time_promise)
                    .then(sync_advances_rro_bulk)
                    .then(sync_rro_rates)
                    .then(update_last_operation)
            })
    }

    $('ul.nav.navbar-nav .btn-default').each(checkRROConnectionOnClick)
    var SYNC_PERIOD = JSON.parse(localStorage.getItem('general_settings')).OPERATION_SYNC_PERIOD
    // setInterval(sync_all_operations, SYNC_PERIOD*10)
    sync_all_operations()
    check_rro_connection(function () {
        get_closed_day()
            .always(function () {
                deployBlockTime()
                //deployRROCheckCopyBtn()
                //deployRROConnectionIndicator()
            })
    })
}

function deployRROConnectionIndicator() {
    // <button class="btn btn-md btn-info action-btn"><i class=" glyphicon glyphicon-book"></i>&nbsp;&nbsp; Інструкція</button>
    // var btn = $('<li><li><button></li></li>')
    //     .addClass("btn btn-md btn-default action-btn")
    //     .attr('id', 'rro_connection')
    //     .append($('<i>').addClass("glyphicon glyphicon-inbox"))
    //
    // var before_element = $('#buyBtn').parent().parent()
    //
    // btn.insertBefore(before_element)

    var btn = $.addNavButton('rro_connection', '').append($('<i>').addClass("glyphicon glyphicon-inbox")).removeClass('btn-default').addClass('btn-success')

    var settings = JSON.parse(localStorage.getItem('general_settings'))

    if (settings.DESIGN == 2) {
        btn.addClass('hide') // F10
    }

    btn.on('greenify', function () {
        $(this).removeClass('disabled btn-danger btn-warning').addClass('disabled btn-success')
        $(this).find('span').addClass('glyphicon-ok').removeClass('glyphicon-refresh glyphicon-time')
    })
        .on('redify', function () {
            $(this).removeClass('disabled btn-success btn-warning').addClass('btn-danger')
            $(this).find('span').addClass('glyphicon-refresh').removeClass('glyphicon-ok glyphicon-time')
        })
        .on('warnify', function () {
            $(this).removeClass('disabled btn-danger btn-success').addClass('disabled btn-warning')
            $(this).find('span').addClass('glyphicon-time').removeClass('glyphicon-ok glyphicon-refresh')
        })
        .on('click', function () {
            check_rro_connection()
        })
}

RKKSModule = function () {
    // On advances: temp1 = "{"status": "error", "data": "(-2147352567, '\u041e\u0448\u0438\u0431\u043a\u0430.', (0, 'DoFiscal', '(CRP_ERR_DENIED=023)\\n\u0414\u043e\u0441\u0442\u0443\u043f \u0437\u0430\u0431\u043e\u0440\u043e\u043d\u0435\u043d\u043e', None, 0, -1610341865), None)"}"
    LOADED_MODULES.push('rkks')
    LINES_PER_PAGE = 100
    BLOCK_SYNC_EXCHANGE = false
    BLOCK_SYNC_STORNO = false
    var SYNC_PERIOD = JSON.parse(localStorage.getItem('general_settings')).OPERATION_SYNC_PERIOD

    qr2link = function (qr_string) {
        var x = $.base64.decode(qr_string)
        var tail = $.base64.encode(x.substr(16)).replace_all('+', '-').replace_all('/', '_').replace_all('=', '')
        link = "http://" + x.substr(0, 16) + "/qr/" + tail
        return link
    }

    printStorno = function (opid, doc_data) {
        var exchange = $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
            return n.id == opid
        })[0];
        //console.log(exchange);
        var docparams = {
            operation_id: opid,
        }
        var print_doc = function (response) {
            var data = report['exchange'](docparams)
            var current_settings = __getPrintingSettings()

            data.double_page = false

            data.rro_data = response
            data.rro_date = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('DD.MM.YYYY')
            data.rro_time = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('HH:mm')

            var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

            var link = qr2link(response.Records[3].QR)
            data.qrlink = link.replace(re, "");

            //console.log(data.qrlink.split("/qr/")[0]+"/qr/");

            data.qrlink1 = (data.qrlink.split("/qr/")[0] + "/qr/");
            data.qrlink2 = data.qrlink.split("/qr/")[1];
            data.qr_base64_img = $('<div>').qrcode(link).find('canvas').get(0).toDataURL("image/png");

            // if (data.region_id == 72) {
            //    new2019 = new Date("2019-01-01T09:00")
            // } else {
            new2019 = new Date("2019-01-01T09:00")
//                }
            if (new Date(data.operation_time) < new2019) {

                if (current_settings['receipt_printer_type'] == 'thermo58') {
                    var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})//, {base:TEMPLATES.base})
                    return PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman
                } else if (current_settings['receipt_printer_type'] == 'thermo80') {
                    var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})
                    return PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman
                } else {
                    var html = Mustache.render(TEMPLATES_RKKS['storno2018'], data)//, {base:TEMPLATES.base})
                    return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                }

            } else {

                new20190207 = new Date("2019-02-07T09:00")
                new20200419 = new Date("2020-08-01T00:00")

                if (new Date(data.operation_time) < new20190207) {
                    storno2019 = 'storno2019'
                    storno2019_2_pages = 'storno2019_2_pages'
                } else if (new Date(data.operation_time) >= new20200419) {
                    if (current_settings['receipt_printer_type'].includes("2_thermo")) {
                        storno2019 = 'storno2020_2'
                        storno2019_2_pages = 'storno2020_2_pages_2'
                    } else {
                        storno2019 = 'storno2020_1'
                        storno2019_2_pages = 'storno2020_2_pages_1'
                    }
                } else {
                    storno2019 = 'storno2019_2'
                    storno2019_2_pages = 'storno2019_2_pages_2'
                }

                if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                    //var html = Mustache.render(TEMPLATES_THERMO['storno2019'], data, {base:TEMPLATES_THERMO.base})//, {base:TEMPLATES.base})
                    data.copy = 1;

                    var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})
                    //var html = Mustache.render(TEMPLATES_THERMO['exchange_test'], data, {base:TEMPLATES_THERMO.base})

                    PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                    data.copy = 2;

                    var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})
                    //var html = Mustache.render(TEMPLATES_THERMO['exchange_test'], data, {base:TEMPLATES_THERMO.base})

                    PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {

                    var html = Mustache.render(TEMPLATES_THERMO[storno2019_2_pages], data, {base: TEMPLATES_THERMO.base})

                    PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                } else if (current_settings['receipt_printer_type'].includes('thermo80')) {

                    data.copy = 1;

                    var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})
                    //var html = Mustache.render(TEMPLATES_THERMO['exchange_test'], data, {base:TEMPLATES_THERMO.base})

                    PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                    data.copy = 2;

                    var html = Mustache.render(TEMPLATES_THERMO[storno2019], data, {base: TEMPLATES_THERMO.base})
                    //var html = Mustache.render(TEMPLATES_THERMO['exchange_test'], data, {base:TEMPLATES_THERMO.base})

                    PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                } else {
                    var html = Mustache.render(TEMPLATES_RKKS[storno2019], data)//, {base:TEMPLATES.base})
                    return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                }

            }

            //return PRINTING_SYSTEMS['chrome'](0,0,0, html)
            // data.qr_base64_img = $('<div>').qrcode(response.Records[3].QR).find('canvas').get(0).toDataURL("image/png");
        }
        if (typeof doc_data !== 'undefined') {
            print_doc(doc_data)
        } else {
            return remote_call('FSC', ['DocInfo', parseInt(exchange.rro_id)]).then(print_doc)
        }
    }
    printReceipt = function (opid, doc_data) {// Override

        // console.log('printReceipt')

        var exchange = $.grep(JSON.parse(localStorage.getItem('exchange_operations')), function (n, i) {
            return n.id == opid
        })[0];
        // console.log(exchange)
        var docparams = {
            operation_id: opid
        }
        var print_doc = function (response) {
            // console.log(response)
            var data = report['exchange'](docparams)
            var current_settings = __getPrintingSettings()

            //console.log(current_settings);

            data.double_page = false

            data.rro_data = response
            data.rro_date = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('DD.MM.YYYY')
            data.rro_time = moment(response.Records[3].DateTime, 'DDMMYYHHmmss').format('HH:mm')

            var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

            var link = qr2link(response.Records[3].QR)
            data.qrlink = link.replace(re, "");
            data.qrlink1 = (data.qrlink.split("/qr/")[0] + "/qr/");
            data.qrlink2 = data.qrlink.split("/qr/")[1];

            data.qr_base64_img = $('<div>').qrcode(link).find('canvas').get(0).toDataURL("image/png");
            //console.log(data);

            //var html = Mustache.render(TEMPLATES_RKKS['exchange_thermo'], data)//, {base:TEMPLATES.base})
            var html = '';

            // data.qr_base64_img = $('<div>').qrcode(response.Records[3].QR).find('canvas').get(0).toDataURL("image/png");
            return $.Deferred().resolve(html)
                .then(function (html) {

                    // if (data.region_id == 72) {
                    //    new2019 = new Date("2019-01-01T09:00")
                    // } else {
                    new2019 = new Date("2019-01-01T09:00")
                    //}

                    if (new Date(data.operation_time) < new2019) {
                        if (current_settings['receipt_printer_type'] == 'thermo58') {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                            if (needs_certificate) {
                                PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                            }
                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)

                        } else if (current_settings['receipt_printer_type'] == 'thermo58_2') {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                            if (needs_certificate) {
                                PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                            }
                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)

                        } else if (current_settings['receipt_printer_type'] == 'thermo80') {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO['exchange2018'], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                            if (needs_certificate) {
                                PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                            }

                        } else {
                            var html = Mustache.render(TEMPLATES_RKKS['exchange2018'], data)//, {base:TEMPLATES.base})
                            return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                                .always(function () {
                                    var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                    if (needs_certificate) {
                                        PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                    }
                                })
                        }

                    } else {

                        new20190207 = new Date("2019-02-07T09:00")
                        new20200419 = new Date("2020-08-01T00:00")

                        if (new Date(data.operation_time) < new20190207) {
                            exchange2019 = 'exchange2019'
                            exchange2019_2_pages = 'exchange2019_2_pages'
                        } else if (new Date(data.operation_time) >= new20200419) {
                            if (current_settings['receipt_printer_type'].includes("2_thermo")) {
                                exchange2019 = 'exchange2020_2'
                                exchange2019_2_pages = 'exchange2020_2_pages_2'
                            } else {
                                exchange2019 = 'exchange2020_1'
                                exchange2019_2_pages = 'exchange2020_2_pages_1'
                            }
                        } else {
                            exchange2019 = 'exchange2019_2'
                            exchange2019_2_pages = 'exchange2019_2_pages_2'
                        }

                        if (current_settings['receipt_printer_type'].includes('thermo58_1')) {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                            if (needs_certificate) {
                                PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                            }

                        } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {

                            var html = Mustache.render(TEMPLATES_THERMO[exchange2019_2_pages], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                            if (needs_certificate) {
                                PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                            }

                        } else if (current_settings['receipt_printer_type'].includes('thermo80')) {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                            if (needs_certificate) {
                                PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                            }
                        } else {
                            var html = Mustache.render(TEMPLATES_RKKS[exchange2019], data)//, {base:TEMPLATES.base})
                            // console.log(html);
                            return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
                                .always(function () {
                                    var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                                    if (needs_certificate) {
                                        PRINTING_SYSTEMS['chrome']('certificate', {operation_id: opid})
                                    }
                                })
                        }

                    }

                })
        }
        if (typeof doc_data !== 'undefined') {
            print_doc(doc_data)
        } else {
            return remote_call('FSC', ['DocInfo', parseInt(exchange.rro_id)])
                .then(
                    print_doc,
                    function (xhr, err, XmlRpcFault) {
                        // console.log(err)
                        // console.log(XmlRpcFault.msg)
                        if (XmlRpcFault.msg == "<class 'ValueError'>:cannot convert float NaN to integer") {
                            console.log('alert');
                            alert('Схоже що дана операція не отримала ідентифікатор РККС, зверніться до техпідтримки.')
                        }
                    }
                )
        }
    }


    printPaymentAccount = function (opid) {// Override
        //console.log(doc_data)
        var payment = $.grep(JSON.parse(localStorage.getItem('payment_operations')), function (n, i) {
            return n.id == opid
        })[0];

        console.log(payment)
        var docparams = {
            operation_id: opid,
            payment_operation: payment,
        }

        // console.log(response)
        var data = report['payment_account'](docparams)
        var current_settings = __getPrintingSettings()

        //console.log(current_settings);

        data.double_page = false

        var html = '';

        return $.Deferred().resolve(html)
            .then(function (html) {

                payment_account = 'payment_account'

                var current_settings = __getPrintingSettings()

                //                 var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})
                //
                // PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman
                //

                if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                    data.copy = 1;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                    data.copy = 2;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                    var html = Mustache.render(TEMPLATES_THERMO['payment_account_2_pages'], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                    data.copy = 1;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                    data.copy = 2;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                } else {
                    var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                    PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                }

            })
    }

    printPaymentAccount2 = function (opid, doc_data) {// Override
        //console.log(doc_data)
        if (typeof doc_data !== 'undefined') {
            var payment = $.grep(doc_data, function (n, i) {
                return n.id == opid;
            })[0];
        } else {
            var payment = $.grep(JSON.parse(localStorage.getItem('payment_operations')), function (n, i) {
                return n.id == opid
            })[0];
        }

        var docparams = {
            operation_id: opid,
            payment_operation: payment,
        }
        var print_doc = function (response) {
            var data = report['payment_account'](docparams)

            data.double_page = false

            payment_account = 'payment_account'

            // var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
            // return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
            var current_settings = __getPrintingSettings()

            // if (current_settings['receipt_printer_type'] == 'thermo58') {
            //         var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})//, {base:TEMPLATES.base})
            //         return PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman
            //     } else if (current_settings['receipt_printer_type'] == 'thermo80') {
            //         var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})
            //         return PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman
            //     } else {
            //         var html = Mustache.render(TEMPLATES_RKKS['storno2018'], data)//, {base:TEMPLATES.base})
            //         return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
            //     }

            if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                data.copy = 1;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                data.copy = 2;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
            } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                var html = Mustache.render(TEMPLATES_THERMO['payment_account_2_pages'], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
            } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                data.copy = 1;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                data.copy = 2;
                var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
            } else {
                var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
            }
        }
        return print_doc()
    }

    print_zreport = function (znum) {
        return remote_call('FSC', ['DocByZ', {zrep: znum, offset: znum, mask: 1}])
            .then(
                function (zrep) {

                    var current_settings = __getPrintingSettings()

                    var pages = Mustache.render(TEMPLATES_RKKS['xz_matrix'], report.xz_report_rkks(zrep))
                        .split('\n').groupIn(LINES_PER_PAGE).groupIn(3)

                    for (var i = 0; i < pages.length; i++) {
                        pages[i].idx = (function (in_i) {
                            return in_i + 1;
                        })(i);
                    }

                    if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                        return PRINTING_SYSTEMS['thermoXZ58'](html)
                    } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                        return PRINTING_SYSTEMS['thermoXZ58'](html)
                    } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                        return PRINTING_SYSTEMS['thermoXZ80'](html)
                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: pages})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }

                },
                function (data, status, xhr) {
                    console.log('alert');
                    msg = xhr.msg
                    alert(msg)
                    __serverLog(msg)
                }
            )
    }
    print_xreport = function () {

        return remote_call('FSC', ['DocInfo', -1])
            .then(
                function (resp) {
                    var blocks = Mustache.render(TEMPLATES_RKKS['xz_matrix'], report.xz_report_rkks(resp))
                    // TESTING:
                    // blocks += blocks+blocks+blocks+blocks+blocks+blocks+blocks+blocks+blocks+blocks

                    var pages = blocks.split('\n').groupIn(LINES_PER_PAGE).groupIn(3)

                    // Adding indexes for mustache
                    for (var i = 0; i < pages.length; i++) {
                        pages[i].idx = (function (in_i) {
                            return in_i + 1;
                        })(i);
                    }

                    var current_settings = __getPrintingSettings()

                    if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                        return PRINTING_SYSTEMS['thermoXZ58'](html)
                    } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                        return PRINTING_SYSTEMS['thermoXZ58'](html)
                    } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                        return PRINTING_SYSTEMS['thermoXZ80'](html)
                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: pages})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }

                },
                function (data, status, xhr) {
                    console.log('alert');
                    msg = xhr.msg
                    __serverLog(msg)
                    msg = 'Поточний звіт недоступний - зміна не відкрита! \n Необхідно зробити Z-звіт, заново зайти у програму \n та спробувати сформувати Х-звіт ще раз.'
                    alert(msg)
                }
            )
    }

    __summXZ = function (records) {//used in reports
        var exeptions = ['CurrCode', 'Rate', 'RateBuy', 'RateSell', 'RecType', 'RecTypeReadable']
        var currList = {}
        $.each(records, function (i, value) {
            var cc = value.CurrCode
            if (value.RecType == 46) {
                if (!currList[cc]) {
                    currList[cc] = {}
                }
                $.each(value, function (k, v) {
                    if (exeptions.indexOf(k) == -1) {
                        if (!currList[cc][k]) {
                            currList[cc][k] = 0
                        }
                        currList[cc][k] += parseInt(value[k])
                    } else {
                        currList[cc][k] = value[k]
                    }
                })
            }
        })
        return currList
    }
    __assertNotExists = function (optype, opid, fiscalize_fns) {
        return remote_call('FSC', ['CheckExistance', optype, opid]).then(
            function (response) {
                if (response.status == 'exists') {
                    fiscalize_fns(opid, response.data)
                    var msg = 'Вже проведено на РККС, фіскалізуємо'
                    console.log(msg)
                    __serverLog(msg)
                    return $.Deferred().reject(msg)
                } else {
                    //var msg = 'Невдалося провести операцію на РККС, операцію буде відмінено.\nПеревірте підключення РККС і спробуйте ще раз.'
                    var msg = 'Операція не пройшла по РККС та буде відмінена на сервері!\n' +
                        'Зробіть х-звіт, перевірте залишки та повторіть операцію.\n' +
                        'Якщо х-звіт не сформувався, перепідключіть РККС та \n' +
                        'перезавантажте программу, після чого повторіть операцію. \n' +
                        'У разі повторної помилки зв`яжіться з технічною підтримкою ФК.'
                    console.log('alert');
                    alert(msg)
                    __serverLog(msg)
                    $.Deferred().resolve()
                }
            }
        )
    }
    check_rro_connection = function (CALLBACK) {
        CALLBACK = typeof CALLBACK !== 'undefined' ? CALLBACK : function () {
            console.log('empty callback')
        };

        var check_rpc2ole_connection = function () {
            return remote_call('directRKKS', ['FSCState.ID_DEV']).then(function (data) {//["4.1.20161206"]
                if (data) {
                    console.log('Ole manager працює: ' + data[0])
                    return $.Deferred().resolve()
                } else {
                    console.log('Помилка зв"язку з Ole manager' + data[0])
                    return $.Deferred().reject()
                }
            }, function (data, y, z) {
                if (z.msg == "<class 'Exception'>:method \"directRKKS\" is not supported") {
                    console.log('Клієнтська частина не знайшла підключеного РККС при запуску, чекаємо на підключення РККС')
                    return $.Deferred().reject()
                }
            })
        }

        var fail_to_connect = function () {
            msg = 'Немає з\'єднання з РККС, роботу заблоковано.\n Намагаємося відновити з\'єднання...'
            if (LOADED_MODULES.indexOf('global_block') > -1) {
                imposeBlock('limit_block', msg)
            }
            $('#rro_connection').trigger('redify')
            setTimeout(function () {
                return check_rro_connection(CALLBACK)
            }, 3000)
            return $.Deferred().reject()
        }
        var connected = function () {
            if (LOADED_MODULES.indexOf('global_block') > -1) {
                releaseBlock('rkks')
            }
            $('#rro_connection').trigger('greenify')
            return $.Deferred().resolve()
        }

        $('#rro_connection').trigger('warnify')

        return check_rpc2ole_connection()
            .then(connected, fail_to_connect)
            .then(CALLBACK)
    }
    checkRROConnectionOnClick = function () {
        // Add rro_connection_check to each button
        var binded_fns = $._data(this, 'events').click
        var orig_fnss = []
        for (var i = 0; i < binded_fns.length; i++) {
            orig_fnss.push(binded_fns[i].handler)
        }
        $(this).off('click').on('click', function () {
            check_rro_connection(function () {
                $.each(orig_fnss, function (k, fns) {
                    fns()
                })
            })
        })
    }
    do_settlement = function () {
        return remote_call('directRKKS', ['DoACQXchg'])
    }

    var send_z_data = function (data) {

        z_info = data.Records.filter(function (element, value) {
            return element.RecType == 48
        })[0]
        doc_footer = data.Records.filter(function (element, value) {
            return element.RecType == 127
        })[0]
        doc_header = data.Records.filter(function (element, value) {
            return element.RecType == 255
        })[0]

        z_number = doc_footer ? doc_footer.DocNo : 0
        fn = doc_header ? doc_header.FN : 0
        zn = doc_header ? doc_header.ZN : 0

        fsn = doc_header ? doc_header.FSN : 0
        tn = doc_header ? doc_header.TN : 0

        pid = doc_footer ? doc_footer.PID : 0
        qr = doc_footer ? qr2link(doc_footer.QR) : ''
        fiscal_time = doc_footer ? doc_footer.DateTime : '010170000001'

        op_cnt = z_info ? z_info.OpCnt.toFixed().rjust(10) : 0
        sum_reinf = z_info ? feroksoft.coin_round(z_info.SumReinf).rjust(20) : 0
        sum_collect = z_info ? feroksoft.coin_round(z_info.SumCollect).rjust(20) : 0
        sum_adv = z_info ? feroksoft.coin_round(z_info.SumAdv).rjust(12) : 0

        //console.log(data.Records)
        localStorage.setItem('last_z_report', pid);

        var currency_reports = []
        $.each(__summXZ(data.Records), function (k, v) {
            var rep = {
                numcode: k,
                code: __convCurrNumToCode(k),
                nbu_rate: parseFloat(v.Rate).toFixed(8).rjust(20),
                advance: feroksoft.coin_round(v.SumAdv).rjust(12),
                bought: (v.SumInCurr != 0) ? feroksoft.coin_round(v.SumInCurr).rjust(20) : null,
                bought_equivalent: (v.SumOut != 0) ? feroksoft.coin_round(v.SumOut).rjust(20) : null,
                sold: (v.SumOutCurr != 0) ? feroksoft.coin_round(v.SumOutCurr).rjust(20) : null,
                sold_equivalent: (v.SumIn != 0) ? feroksoft.coin_round(v.SumIn).rjust(20) : null,
                bought_storno: (v.SumOutCurrStorno != 0) ? feroksoft.coin_round(v.SumOutCurrStorno).rjust(20) : null,
                bought_storno_equivalent: (v.SumInStorno != 0) ? feroksoft.coin_round(v.SumInStorno).rjust(20) : null,
                sold_storno: (v.SumInCurrStorno != 0) ? feroksoft.coin_round(v.SumInCurrStorno).rjust(20) : null,
                sold_storno_equivalent: (v.SumOutStorno != 0) ? feroksoft.coin_round(v.SumOutStorno).rjust(20) : null,
            }
            rep.bought_rate = (rep.bought_equivalent / rep.bought)
            rep.bought_rate = rep.bought_rate ? rep.bought_rate.toFixed(8).rjust(20) : null
            rep.sold_rate = (rep.sold_equivalent / rep.sold)
            rep.sold_rate = rep.sold_rate ? rep.sold_rate.toFixed(8).rjust(20) : null

            currency_reports.push(rep)
        })

        //console.log(currency_reports)

        //JSON.stringify(memberArr)

        return $.ajax({
            type: "POST",
            url: 'z_data',
            data: {
                z_number: z_number,
                fn: fn,
                zn: zn,
                fsn: fsn,
                tn: tn,
                pid: pid,
                qr: qr,
                fiscal_time: fiscal_time,
                op_cnt: op_cnt,
                sum_reinf: sum_reinf,
                sum_collect: sum_collect,
                sum_adv: sum_adv,
                currency_reports: JSON.stringify(currency_reports)
            },
        })
    }

    send_zreport = function (exit) {
        return refuseAllCashflows()
            .then(function () {
                return remote_call('directRKKS', ['FSState.LastPID'])
            }) // remote_call('FSC', ['PIDNext'])
            .then(function (last_pid) {
                return remote_call('FSC', ['ZReport', {'id': parseInt(last_pid)}])
            })
            .then(check_rro_responce)
            .then(function (response) {
                //console.log(response)
                if (response.status == 'success') {
                    // return remote_call('FSC', ['DocInfo', response.data.pid]).then(function(zrep){
                    send_z_data(response.data)

                    //if (confirm("Z-звіт був успішно сформован з РККС та надіслан до Податкової! Роздрукувати його?") == true) {

                    var blocks = Mustache.render(TEMPLATES_RKKS['xz_matrix'], report.xz_report_rkks(response.data))
                        .split('\n').groupIn(LINES_PER_PAGE).groupIn(3)

                    var current_settings = __getPrintingSettings()

                    if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                        PRINTING_SYSTEMS['thermoXZ58'](html)
                        return true
                    } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                        PRINTING_SYSTEMS['thermoXZ58'](html)
                        return true
                    } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                        var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                        PRINTING_SYSTEMS['thermoXZ80'](html)
                        return true
                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: blocks})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }
                    //}

                    // })
                } else {
                    //console.log('alert');
                    //alert(response.data)
                    __serverLog(response.data)
                }
            })
            .then(function (ret) {
                if (exit) {
                    return $.ajax({
                        type: "GET",
                        url: 'login/logout',
                        data: {}
                    })
                        .always(function (ret) {
                            window.location = '/'
                        })
                }
            })
    }

    sync_rro_rates = function () {
        // Просто оновлюємо курси РККС до поточних
        var compareWebAndRRORates = function (rro_rates) {
            web_rates = __getWebRates()

            $.each(web_rates, function (wk, wv) {
                web_rates[wk].base_code = 0
                var exists_in_rro = false
                $.each(rro_rates, function (rk, rv) {
                    if (wv.num_code == rv.num_code) {
                        exists_in_rro = true
                    }
                })
                if (!exists_in_rro) {
                    msg = 'На РККС відсутня валюта з кодом ' + ('000' + wv.num_code).substr(-3) + '. Подальша робота неможлива, зверніться до технічної підтримки (098-845-53-34, 098-845-53-44, 066-480-39-63, 050-840-37-01)'
                    console.log(msg)
                    __serverLog(msg)
                    // if(LOADED_MODULES.indexOf('global_block') > -1){imposeBlock('rro_rates_error', msg)}
                    // return false
                }
            })
            return web_rates
        }

        return remote_call('FSC', ['setRates', compareWebAndRRORates(__getWebRates())])
            .fail(function (data, status, xhr) {
                msg = 'Не вдалося змінити курси на РККС. Для повторної відправки курсів до РККС натисніть кнопку "Оновити".'
                console.log(msg)
                __serverLog(msg)
                if (LOADED_MODULES.indexOf('global_block') > -1) {
                    imposeBlock('rro_rates_error', msg)
                }
            })
    }
    send_advances_rro_bulk = function () {
        console.log('Надсилаємо аванси')
        var data = []
        var settings = JSON.parse(localStorage.getItem('general_settings'))
        // $.each(report['accounting_statement']({}, true).currencies, function (k, v) {
        //     if (v.current > 0) { // MUST BE CURRENT IN ORDER TO ALLAW SEVERAL ZReports A DAY
        //         data.push({
        //             currency_code: (v.code != __getNumCode(settings.UAH_ID)) ? parseInt(v.code) : 0,
        //             amount: v.current,
        //         })
        //     }
        // })

        var balance = JSON.parse(localStorage.getItem('balance'))

        $.each(balance, function (bid, balance) {
            if (balance.balance > 0) {// v.initial
                curr_numcode = parseInt(balance.curr_numcode)
                data.push({
                    currency_code: (curr_numcode != 980) ? curr_numcode : 0,
                    amount: balance.balance
                })
            }
        })

        //console.log(data)
        if (data.length == 0) {
            return $.Deferred().resolve()
        } else {
            // return remote_call('FSC', ['LastZpid'])
            //     .then(function (znumber) {
            //         // if (localStorage.getItem('last_z_report') == znumber) {
            //         //     console.log('exists in LS')
            //         //     return $.Deferred().resolve()
            //         // } else {
            last_z_report = localStorage.getItem('last_z_report')
            // console.log(last_z_report)
            return remote_call('FSC', ['Advances', {'id': last_z_report, 'data': data}])
                .then(function (adv_resp) {
                    // (CURRENCYOPERATIONISPRESENT=219)\nАванс неможливий - вже були обмінні операції у цій зміні'
                    // console.log(adv_resp)
                    //localStorage.setItem('last_z_report', znumber);
                    return adv_resp
                })
                .then(inform_server_advances)
            //}
            //})
        }
    }

    sync_exchange_operation = function (exchange_operation_data) {
        // console.log('BLOCK_SYNC_EXCHANGE=')
        // console.log(BLOCK_SYNC_EXCHANGE)
        if (BLOCK_SYNC_EXCHANGE) {
            return $.Deferred().resolve()
        } else {
            BLOCK_SYNC_EXCHANGE = true
        }

        var send_exchange_rro = function (eop) {
            data = {
                id: eop.id,
                currency_code: __getNumCode(eop.currency_id),
                amount: parseInt(eop.currency_amount),
                client: eop.client == '**' ? '' : eop.client,
                rate: String(eop.exchange_rate),
            }
            return remote_call('FSC', ['Exchange', data])
        }

        var fiscalize_exchange = function (eop_id, rro_data) {
            if (rro_data == 'Passed God blessed') {
                __serverLog(rro_data + ' ' + eop_id)

                remote_call('directRKKS', ['FSState.LastPID']) // remote_call('FSC', ['PIDNext']) //
                    .then(function (last_pid) {
                        return (last_pid == 0) ? $.Deferred().reject() : $.Deferred().resolve(last_pid)
                    })
                    .then(function (last_pid) {
                        return remote_call('FSC', ['DocInfo', parseInt(last_pid)])
                    })
                    .then(function (doc) {
                        eop = __getExOpById(eop_id)
                        if (doc.Type == 6 && doc.Records[1].CurrCode == __getCurrency(eop.currency_id).numcode) {
                            releaseBlock('fs_bug')
                            return fiscalize(eop_id, doc)
                        }
                    })
                imposeBlock('fs_bug', "Сервер податкової не выдповідає, почекайте 1-2 хвилини без проведення нових операцій, якщо нічого не зміниться набирайте техпідтримку!")
                return $.Deferred().resolve() // Wait till next sync
            } else {
                return fiscalize(eop_id, rro_data)
            }
        }

        var fiscalize = function (eop_id, rro_data) {
            //console.log(rro_data)
            return $.ajax({
                type: "POST",
                url: 'fiscalize_exchange',
                data: {
                    operation_id: eop_id,
                    rro_id: rro_data.Records[3].PID,
                    rro_qr: qr2link(rro_data.Records[3].QR),
                    num_eop: rro_data.Records[3].DocNo,
                    fn: rro_data.Records[0].FN,
                    fsn: rro_data.Records[0].FSN,
                    tn: rro_data.Records[0].TN,
                    zn: rro_data.Records[0].ZN,
                    curr_code: rro_data.Records[1].CurrCode,
                    op: rro_data.Records[1].Op,
                    op_cnt: rro_data.Records[1] ? rro_data.Records[1].OpCnt.toFixed().rjust(10) : 0,
                    rate: feroksoft.rates_round(rro_data.Records[1].Rate),
                    sum: feroksoft.coin_round(rro_data.Records[1].Sum).rjust(20),
                    sum_base: feroksoft.coin_round(rro_data.Records[1].SumBase).rjust(20),
                    sum_comission: feroksoft.coin_round(rro_data.Records[1].SumComission).rjust(20),
                    fiscal_time: rro_data.Records[3].DateTime
                },
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція exchange була успішно фіскалізована')
                    //console.log(ret.exchange_operations)
                    localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    if (LOADED_MODULES.indexOf('printing') != -1) {
                        // console.log('printReceipt_1');
                        return printReceipt(ret.id, rro_data)
                    }
                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(JSON.stringify(ret.errors))
                }
            })
        }

        var send_exchange_full = function (exchange_operation_data) {
            return send_exchange_rro(exchange_operation_data)
                .then(check_rro_responce)
                .then(function (response) {
                    if (response == 'try_again') {
                        return send_exchange_full(exchange_operation_data)
                    } else {
                        // return __assertNotExists('exchange', exchange_operation_data.virtual_id, fiscalize_exchange)
                        // return fiscalize_exchange(exchange_operation_data.id, response.data)
                        return remote_call('FSC', ['CheckExistance', 'exchange', exchange_operation_data.virtual_id])
                            .then(function (response) {
                                if (response.status == 'exists') {
                                    return $.Deferred().resolve(response)
                                } else {
                                    return $.Deferred().reject()
                                }
                            })
                            .then(function (response) {
                                return fiscalize_exchange(exchange_operation_data.id, response.data)
                            })
                    }
                })
        }

        var rro_max_time_diff = JSON.parse(localStorage.getItem('general_settings')).OPERATION_RRO_MAX_DIFF
        var is_too_old = ActualTime().diff(moment(exchange_operation_data.operation_time), 'seconds') >= rro_max_time_diff
        if (!is_too_old) {
            console.log('Проводимо операцію на РККС')
            x = send_exchange_full(exchange_operation_data)
        } else {
            __serverLog('Не встигли провести операцію №' + exchange_operation_data.virtual_id + ' на РККС, намагаємося скасувати...')
            x = __assertNotExists('exchange', exchange_operation_data.virtual_id, fiscalize_exchange)
                .then(function (data) {
                    return cancelExchange(exchange_operation_data.virtual_id)
                })
        }
        return x.always(function () {
            console.log('Unblock sync')
            BLOCK_SYNC_EXCHANGE = false
        })
    }
    sync_storno_operation = function (exchange_operation_data) {
        if (BLOCK_SYNC_STORNO) {
            return $.Deferred().resolve()
        } else {
            BLOCK_SYNC_STORNO = true
        }

        var send_rro = function (eop) {
            var data = {
                id: eop.id,
                currency_code: __getNumCode(parseInt(eop.currency_id)),
                amount: parseInt(eop.currency_amount),
                client: eop.client,
                rate: String(eop.exchange_rate),
            }
            return remote_call('FSC', ['ExchangeStorno', data])
        }
        var fiscalize = function (eop, rro_data) {
            // console.log(rro_data)
            return $.ajax({
                type: "POST",
                url: 'fiscalize_exchange_storno',
                data: {
                    operation_id: eop.id,
                    rro_storno_id: rro_data.Records[3].PID,
                    rro_storno_qr: rro_data.Records[3].QR,
                    qr_link: qr2link(rro_data.Records[3].QR),
                    num_storno: rro_data.Records[3].DocNo,
                    fn: rro_data.Records[0].FN,
                    fsn: rro_data.Records[0].FSN,
                    tn: rro_data.Records[0].TN,
                    zn: rro_data.Records[0].ZN,
                    curr_code: rro_data.Records[1].CurrCode,
                    op: rro_data.Records[1].Op,
                    op_cnt: rro_data.Records[1] ? rro_data.Records[1].OpCnt.toFixed().rjust(10) : 0,
                    rate: feroksoft.rates_round(rro_data.Records[1].Rate),
                    sum: feroksoft.coin_round(rro_data.Records[1].Sum).rjust(20),
                    sum_base: feroksoft.coin_round(rro_data.Records[1].SumBase).rjust(20),
                    sum_comission: feroksoft.coin_round(rro_data.Records[1].SumComission).rjust(20),
                    fiscal_time: rro_data.Records[3].DateTime
                },
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція сторно була успішно фіскалізована')
                    localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    if (LOADED_MODULES.indexOf('printing') != -1) {
                        return printStorno(ret.id, rro_data)
                    }
                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(JSON.stringify(ret.errors))
                    // fiscalize(eop)
                }
            })
        }
        perform_storno = function () {
            return send_rro(exchange_operation_data)
                .then(check_rro_responce)
                .then(
                    function (response) {
                        return fiscalize(exchange_operation_data, response.data)
                    },
                    function (resp) {
                        return cancelStorno(exchange_operation_data.virtual_id).then(function () {
                            var err = (resp.statusText != "error") ? resp : 'РККС не доступне'
                            var msg = 'Не вдалося сторнувати операцію №' + exchange_operation_data.num_eop + '\n' + err + '\nCпробуйте ще раз'
                            __serverLog(msg)
                            console.log('alert');
                            alert(msg)
                        })
                    }
                )
        }

        x = FiscalCommonsLib.sync_storno_operation(exchange_operation_data, 'РККС')

        return x.always(function () {
            BLOCK_SYNC_STORNO = false
        })
    }

    sync_cashflow_operation = function (cashflow_operation_data) {
        var send_rro = function (cfop) {
            var data = {
                id: cfop.id,
                currency_code: __getNumCode(cfop.currency_id),
                // optype:		cfop.money_amount > 0 ? 2 : 3,
                amount: parseFloat(cfop.money_amount)
            }
            return remote_call('FSC', ['Cashflow', data])
        }

        var fiscalize = function (cfop) {
            return $.ajax({
                type: "POST",
                url: 'fiscalize_cashflow',
                data: {operation_id: cfop.id},
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція cashflow була успішно фіскалізована')
                    localStorage.setItem('cashflow_operations', JSON.stringify(ret.cashflow_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    if (LOADED_MODULES.indexOf('printing') != -1) {
                        getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id': ret.id})
                    }
                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(ret.error)
                }
            })
        }
        return send_rro(cashflow_operation_data).then(check_rro_responce).then(
            function () {
                return fiscalize(cashflow_operation_data)//.then(function(ret){
                // if(LOADED_MODULES.indexOf('printing') != -1){
                // 	return getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id':ret.id})
                // }
                // })
            },
            function (reject_data) {
                var msg = 'Не вдалося передати на РККС ордер №' + cashflow_operation_data.id + '.\n' + reject_data
                __serverLog(msg)
                //console.log('alert');
                //alert(msg)
            }
        )
    }

    sync_payment_operation = function (payment_operation_data) {
        var send_rro = function (cfop) {
            var data = {
                id: cfop.id,
                currency_code: __getNumCode(cfop.currency_id),
                // optype:		cfop.money_amount > 0 ? 2 : 3,
                amount: parseFloat(cfop.payment_amount)
            }
            return remote_call('FSC', ['Cashflow', data])
        }

        var fiscalize = function (cfop, rro_data) {
            console.log(rro_data)
            return $.ajax({
                type: "POST",
                url: 'fiscalize_payment',
                data: {
                    operation_id: cfop.id,
                    rro_id: rro_data.Records[2].PID,
                    num_eop: rro_data.Records[2].DocNo,
                },
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція payment була успішно фіскалізована')
                    localStorage.setItem('payment_operations', JSON.stringify(ret.payment_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()
                    if (LOADED_MODULES.indexOf('printing') != -1) {
                        return printPaymentAccount(cfop.id)
                    }

                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(ret.error)
                }
            })
        }
        return send_rro(payment_operation_data).then(check_rro_responce).then(
            function (response) {
                // console.log(response.data)
                return fiscalize(payment_operation_data, response.data)//.then(function(ret){
                // if(LOADED_MODULES.indexOf('printing') != -1){
                // 	return getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id':ret.id})
                // }
                // })
            },
            function (reject_data) {
                var msg = 'Не вдалося передати на РККС платiж №' + payment_operation_data.real_id + '.\n' + reject_data
                __serverLog(msg)
                //console.log('alert');
                //alert(msg)
            }
        )
    }

    sync_canceled_payment_operation = function (payment_operation_data) {
        var send_rro = function (cfop) {
            var data = {
                id: cfop.id + '9',
                currency_code: __getNumCode(cfop.currency_id),
                // optype:		cfop.money_amount > 0 ? 2 : 3,
                amount: -parseFloat(cfop.payment_amount)
            }
            return remote_call('FSC', ['Cashflow', data])
        }

        var fiscalize = function (cfop, rro_data) {
            console.log(rro_data)
            return $.ajax({
                type: "POST",
                url: 'fiscalize_canceled_payment',
                data: {
                    operation_id: cfop.id,
                    rro_id: rro_data.Records[2].PID,
                    num_eop: rro_data.Records[2].DocNo,
                },
            }).done(function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    console.log('Операція canceled payment була успішно фіскалізована')

                    //alert('Платіжна операція '+ payment_operation_data.real_id +' була скасована')

                    localStorage.setItem('payment_operations', JSON.stringify(ret.payment_operations))
                    localStorage.setItem('balance', JSON.stringify(ret.balance))
                    updateFront()

                } else if (ret.status == 'error') {
                    console.log('alert');
                    alert(ret.error)
                }
            })
        }
        return send_rro(payment_operation_data).then(check_rro_responce).then(
            function (response) {
                // console.log(response.data)
                return fiscalize(payment_operation_data, response.data)//.then(function(ret){
                // if(LOADED_MODULES.indexOf('printing') != -1){
                // 	return getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id':ret.id})
                // }
                // })
            },
            function (reject_data) {
                var msg = 'Не вдалося передати на РККС платiж №' + payment_operation_data.real_id + '.\n' + reject_data
                __serverLog(msg)
                //console.log('alert');
                //alert(msg)
            }
        )
    }

    sync_all_operations = function () {

        var chain = $.Deferred().resolve()

        if (!((BLOCK_SYNC_EXCHANGE) || (BLOCK_SYNC_STORNO))) {
            console.log('Синхронізуємося ...')

            var not_fiscalized_exchanges = JSON
                .parse(localStorage.getItem('exchange_operations'))
                .filter(function (element, value) {
                    return !element.fiscal_time
                })
            $.each(not_fiscalized_exchanges, function (k, v) {
                chain = chain.then(function () {
                    return sync_exchange_operation(v)
                })
            })

            var not_fiscalized_stornos = JSON
                .parse(localStorage.getItem('exchange_operations'))
                .filter(function (element, value) {
                    return !element.fiscal_storno_time && element.storno_time
                })
            $.each(not_fiscalized_stornos, function (k, v) {
                chain = chain.then(function () {
                    return sync_storno_operation(v)
                })
            })

            not_fiscalized_cashflows = JSON
                .parse(localStorage.getItem('cashflow_operations'))
                .filter(function (element, value) {
                    return !element.fiscal_time && element.confirmation_time
                })
            $.each(not_fiscalized_cashflows, function (k, v) {
                chain = chain.then(function () {
                    return sync_cashflow_operation(v)
                })
            })

            not_confirmed_cashflows = JSON
                .parse(localStorage.getItem('cashflow_operations'))
                .filter(function (element, value) {
                    return !element.confirmation_time && !element.refusal_time
                })
            if (not_confirmed_cashflows.length > 0) {
                console.log('Оновлюємо інформацію про інкасації та підкріплення з серверу')
                chain = chain.then(function () {
                    return updateLS(['cashflow_operations', 'balance'], separately = false)
                })
            }

            not_fiscalized_payments = JSON
                .parse(localStorage.getItem('payment_operations'))
                .filter(function (element, value) {
                    return !element.fiscal_time && !element.cancel_time && element.payment_time != null && element.transaction_id != null
                })
            $.each(not_fiscalized_payments, function (k, v) {
                chain = chain.then(function () {
                    return sync_payment_operation(v)
                })
            })

            not_fiscalized_canceled_payments = JSON
                .parse(localStorage.getItem('payment_operations'))
                .filter(function (element, value) {
                    return element.fiscal_time && !element.fiscal_cancel_time && element.cancel_time && element.payment_time != null && element.transaction_id != null
                })

            $.each(not_fiscalized_canceled_payments, function (k, v) {
                chain = chain.then(function () {
                    return sync_canceled_payment_operation(v)
                })
            })

            if (not_fiscalized_canceled_payments.length > 0) {
                console.log('Оновлюємо інформацію про платежи з серверу')
                chain = chain.then(function () {
                    return updateLS(['payment_operations', 'balance'], separately = false)
                })
            }

        }

        chain.then(
            function () {
                setTimeout(sync_all_operations, SYNC_PERIOD * 1000)
            },
            function () {
                setTimeout(sync_all_operations, SYNC_PERIOD * 1000)
            }
        )

    }

    var check_rro_responce = function (rro_response) {
        var resp_has = function (cmd) {
            return rro_response.data.indexOf(cmd) !== -1
        }
        if (rro_response.status == 'success') {
            console.log('Операція успішно пройшла на РККС')
            return $.Deferred().resolve(rro_response)
        } else if (rro_response.data == 'exists') {
            var msg = 'Така операція вже міститься в РККС. Фіскалізуємо ...'
            __serverLog(msg)
            return $.Deferred().resolve(rro_response)
        } else if (resp_has("(CRP_ERR_DENIED=023)")) { // Доступ заборонено DoFiscal
            // var msg = 'Невдалося провести операцію на РККС, Z звіт не відправлявся більше 24 годин. Надрукуйте Z звіт і спробуйте ще раз. \n' + rro_response.data
            // console.log(msg)
            // __serverLog(msg)
            var msg = 'Отриман відповідь від РККС: ' + rro_response['data']
            __serverLog(msg)

            var msg = 'Коректна робота з РККС неможлива, необхідно оновити зміну!\n' +
                'Друкуємо Z-звіт та виходимо з програми, для подальшої роботи необхідно повторно авторизуватися!'
            __serverLog(msg)
            console.log('alert');
            alert(msg)
            //if (confirm("Схоже, що Z-звіт ;не відправлявся більше 24 годин, відправити його зараз?") == true) {
            return send_zreport(true)
            //} else {
            //    return $.Deferred().reject(msg)
            //}
        } else if (resp_has('MISMATCHIDRATE=220') || resp_has('ABSENT_REQUESTED_IDRATE=218')) {
            //(-2147352567, 'Ошибка.', (0, 'DoFiscal', '(MISMATCHIDRATE=220)\nНевідповідність курсів валют'
            //(-2147352567, 'Ошибка.', (0, 'DoFiscal', '(ABSENT_REQUESTED_IDRATE=218)\nВідсутні курси валют'
            var msg = 'Курси не співпадають, намагаємося оновити на РККС ...\n'
            console.log(msg)
            __serverLog(msg)
            return sync_rro_rates().then(function (resp) {
                return $.Deferred().resolve('try_again')
            })
        } else if (resp_has('MONEY_SUM_LIMIT_EXCEEDED=215')) {
            // (MONEY_SUM_LIMIT_EXCEEDED=215)\nПереповнення сум'
            var msg = 'На РККС не вистачає залишку грошових коштів, необхідно зробити Z звіт і продовжити роботу'
            console.log(msg)
            __serverLog(msg)
            // return send_advances_rro_bulk().then(function (resp) {
            //     return $.Deferred().resolve('try_again')
            // })
            send_zreport(false).then(get_closed_day())
        } else {
            var msg = 'Отримано неочікувану відповідь від РККС: ' + rro_response['data'] + '\nМожливо РККС не підключено.'
            __serverLog(msg)
            return $.Deferred().reject(msg)
        }
    }
    var rro_decorate = function (send_server, sync_rro, __getById) {
        return function (data) {
            return send_server(data).then(
                function (ret) {
                    if (typeof ret.errors !== 'undefined') {
                        //modal_win.find('.alert-warning').remove()
                        if (typeof ret.errors.general !== 'undefined') {
                            console.log('alert');
                            alert(ret.errors.general)
                            if (typeof ret.errors.redirect !== 'undefined') {
                                window.location = ret.errors.redirect;
                            }
                        }
                    } else if (ret.errors) {
                        console.log('Операція не пройшла на сервері:\n. Спробуйте ще раз.')
                        console.log(ret.errors)
                        return $.Deferred().reject()
                    } else {
                        return sync_rro(__getById(ret.id)).fail(function () {
                            var msg = 'Операція #' + ret.id + ' не була передана на РККС, оновіть сторінку'
                            console.log(msg)
                            __serverLog(msg)
                            window.location = '/'
                        })
                    }
                }, function () {
                    console.log('alert');
                    alert('Перевірте з"єднання з інтернетом')
                    // return $.Deferred().reject()
                }
            )
        }
    }

    buysellClass.prototype.send = rro_decorate(buysellClass.prototype.send, sync_exchange_operation, __getExOpById)
    ratesClass.prototype.send = rro_decorate(ratesClass.prototype.send, sync_rro_rates, function () {
    })
    sendStorno = rro_decorate(sendStorno, sync_storno_operation, __getExOpById)

    function print_z_if_forgot() {

        //console.log('need check_last_operator');
        if (!check_last_operator()) {
            var msg = 'Виявлено операції з минулої зміни, яка не була закрита!\n' +
                'Друкуємо Z-звіт та відкриваємо Вашу зміну, після натиснення кнопки "ОК" можете працювати у звичному режимі.'
            __serverLog(msg)
            console.log('alert');
            alert(msg)
            return send_zreport(false)
        }

        if (check_z()) {
            console.log('Необходимо сделать Z')
            checkLimits()
            var check_limits = JSON.parse(localStorage.getItem('check_limits'))
            if (check_limits.status == 'success') {
                limit_block = false
                if (LOADED_MODULES.indexOf('global_block') > -1) {
                    releaseBlock('limit_block')
                }
                var msg = 'З момента відкриття Вашої зміни минуло більше 24 годин!\n' +
                    'Друкуємо Z-звіт та виходимо з програми, для подальшої роботи необхідно повторно авторизуватися.'
                __serverLog(msg)
                console.log('alert');
                alert(msg)
                return send_zreport(true)
                    .then(function () {
                        return $.Deferred().resolve('skip new day')
                    })

            } else if (check_limits.status == 'excess') {
                msg = ''
                $.each(check_limits.data, function (k, v) {
                    msg = msg + v.currency + ": " + v.excess + ", "
                })
                message = 'З момента відкриття Вашої зміни минуло більше 24 годин! Неможливо відкрити нову операційну дату, на відділені виявлено переліміт по наступним валютам: ' +
                    msg + 'зверніться до відділу технічної підтримки ФК!'
                __serverLog(message)
                limit_block = true
                if (LOADED_MODULES.indexOf('global_block') > -1) {
                    imposeBlock('limit_block', message)
                }
            } else {
                //console.log('alert'); alert("Не вдалося перевірити ліміту каси, спробуйте ще раз!")
            }

        } else {
            console.log('Фіскальний день було відкрито сьогодні, продовжуємо роботу ... ')
            return $.Deferred().resolve('skip new day')
        }
    }

    get_closed_day = function () {

        //console.log('get_closed_day')
        return remote_call('directRKKS', ['FSState.LastPID'])
            .then(function (last_pid) {
                return (last_pid == 0) ? $.Deferred().reject() : $.Deferred().resolve(last_pid)
            })
            .then(function (last_pid) {
                return remote_call('FSC', ['DocInfo', parseInt(last_pid)])
            })
            .then(function (data) {
                // console.log(data)
                if (data.Type == 255) {
                    var msg = 'Робочий день закрито'
                    console.log(msg)
                    __serverLog(msg)

                    doc_footer = data.Records.filter(function (element, value) {
                        return element.RecType == 127
                    })[0]

                    pid = doc_footer ? doc_footer.PID : 0
                    //console.log(pid)

                    localStorage.setItem('last_z_report', pid);//gre222
                    return $.Deferred().resolve()
                } else {
                    console.log("Робочий день на РККС вже відкрито, можна продовжувати роботу")
                    return print_z_if_forgot()
                }
            })
            .then(function (data) {
                if (data == 'skip new day') {
                    console.log(data)
                    return $.Deferred().resolve()
                }
                var msg = 'Операційний день на РККС закрито, отправляемо аванси'
                console.log(msg)
                __serverLog(msg)
                return $.Deferred().resolve()
                    .then(send_advances_rro_bulk)
                    .then(sync_rro_rates)
            })
    }

    if (LOADED_MODULES.indexOf('reports') != -1) {
        var zbtn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-danger').prop('id', 'zreport')
            .html('Z звіт')
            .click(function () {
                $.ajax({
                    type: "GET",
                    url: 'api/department/check_limit',
                    success: function (ret) {
                        if (typeof ret.errors !== 'undefined') {
                            if (typeof ret.errors.general !== 'undefined') {
                                console.log('alert');
                                alert(ret.errors.general)
                                if (typeof ret.errors.redirect !== 'undefined') {
                                    window.location = ret.errors.redirect;
                                }
                            }
                        } else if (ret.status == 'success') {
                            if (confirm("Ви впевнені, що хочете відправити Z-звіт?") == true) {
                                return send_zreport(true)
                            }
                        } else if (ret.status == 'excess') {
                            // msg = ''
                            // $.each(ret.data, function (k, v) {
                            //     msg = msg + v.currency + ": " + v.excess + "\n"
                            // })
                            // console.log('alert');
                            // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                            //     msg
                            //
                            msg = ''
                            $.each(ret.data, function (k, v) {
                                // msg = msg + v.currency + ": " + v.excess + "\n"
                                msg = v.message
                            })
                            console.log('alert');
                            // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                            //     msg)
                            alert(msg)

                        } else {
                            console.log('alert');
                            alert("Не вдалося перевірити ліміту каси, спробуйте ще раз!")
                        }
                    }
                })
                $('#reportsModal').modal('hide')
            })
        var xbtn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-info').prop('id', 'xreport')
            .html('X звіт')
            .click(function () {
                print_xreport().always(function () {
                    return $('#reportsModal').modal('hide');
                })
            })
        var z_number_input = $('<input>')
            .addClass('form-control')
            .prop('id', 'z_number_input')
            .prop('type', 'number')
            .prop('step', '1')
            .prop('placeholder', '0')
            .prop('min', '1')
            .val(1)

        remote_call('FSC', ['DocByDate', {zrep: 999, mask: 1, before: 1, date: ActualTime().format('YYYYMMDDHHmmss')}])
            .then(function (data) {
                doc_footer = data.Records.filter(function (element, value) {
                    return element.RecType == 127
                })[0]
                z_number_input.val(doc_footer.DocNo)
            })

        var zcopy_btn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-success').prop('id', 'zcopy_btn')
            .html('копія Z')
            .click(function () {
                check_rro_connection(function () {
                    var znum = parseInt($('#z_number_input').val())
                    return print_zreport(znum)
                }).always(function () {
                    $('#reportsModal').modal('hide')
                })
            })

        $('#reportsModal').find('.modal-body').append(
            $('<div>').addClass('row')
                .append($('<h3>').addClass('col-sm-2').append(xbtn))
                .append($('<h3>').addClass('col-sm-2').append(zbtn))
                .append($('<h3>').addClass('col-sm-2').append(z_number_input))
                .append($('<h3>').addClass('col-sm-2').append(zcopy_btn))
        )
    }
    $('ul.nav.navbar-nav .btn-default').each(checkRROConnectionOnClick)
    //deployRROConnectionIndicator()
    sync_all_operations()
    //get_closed_day()
    check_rro_connection().then(get_closed_day())
    //check_rro_connection().then(opened_day_init)}
}

PRROModule = function () {
    // On advances: temp1 = "{"status": "error", "data": "(-2147352567, '\u041e\u0448\u0438\u0431\u043a\u0430.', (0, 'DoFiscal', '(CRP_ERR_DENIED=023)\\n\u0414\u043e\u0441\u0442\u0443\u043f \u0437\u0430\u0431\u043e\u0440\u043e\u043d\u0435\u043d\u043e', None, 0, -1610341865), None)"}"
    LOADED_MODULES.push('prro')
    console.log('Welcome to pRRO module!')
    LINES_PER_PAGE = 100

    qr2link = function (qr_string) {
        var x = $.base64.decode(qr_string)
        var tail = $.base64.encode(x.substr(16)).replace_all('+', '-').replace_all('/', '_').replace_all('=', '')
        link = "http://" + x.substr(0, 16) + "/qr/" + tail
        return link
    }

    postZ = function () {
        var prom = $.Deferred()
        $.ajax({
            type: "POST",
            url: 'z_report',
            data: {},
            success: function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    prom.resolve(ret)
                } else {
                    prom.reject()
                    $.each(ret.errors, function (key, value) {
                        console.log('alert');
                        alert(key + ': ' + value)
                    })
                }
            }
        })
        return prom
    }

    send_zreport = function (exit) {
        return postZ()
        .then(function (ret) {
             if (typeof ret.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
            } else if (ret.status == 'success') {
                var blocks = Mustache.render(TEMPLATES_RKKS['xz_matrix'], report.xz_report_prro(ret.z_report_data))
                    .split('\n').groupIn(LINES_PER_PAGE).groupIn(3)

                var current_settings = __getPrintingSettings()

                 if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                     if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                         var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                         return PRINTING_SYSTEMS['thermoXZ58'](html)
                     } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                         var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                         return PRINTING_SYSTEMS['thermoXZ58'](html)
                     } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                         var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                         return PRINTING_SYSTEMS['thermoXZ80'](html)
                     } else {
                         var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: blocks})
                         return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                     }
                 } else {
                     var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: blocks})
                     return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                 }
            }

        })
        .then(function (ret) {
            if (exit) {
                return $.ajax({
                    type: "GET",
                    url: 'login/logout',
                    data: {}
                })
                    .always(function (ret) {
                        window.location = '/'
                    })
            }
        })
    }

    printZreport = function (doc_data) {// Override

        var print_doc = function (response) {
            return $.Deferred().resolve()
                .then(function () {

                    var blocks = Mustache.render(TEMPLATES_RKKS['xz_matrix'], report.xz_report_prro(doc_data))
                        .split('\n').groupIn(LINES_PER_PAGE).groupIn(3)

                    var current_settings = __getPrintingSettings()

                     if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                         if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                             var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                             PRINTING_SYSTEMS['thermoXZ58'](html)
                             return true
                         } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                             var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                             PRINTING_SYSTEMS['thermoXZ58'](html)
                             return true
                         } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                             var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: blocks})//gre
                             PRINTING_SYSTEMS['thermoXZ80'](html)
                             return true
                         } else {
                             var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: blocks})
                             return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                         }
                     } else {
                         var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: blocks})
                         return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                     }

                }).then(function () {
                        $.ajax({
                            type: "POST",
                            url: 'zreport_printed',
                            data: {
                                id: doc_data.id
                            },
                            success: function (ret) {

                            }
                        })
                    }
                )
        }

        if (typeof doc_data !== 'undefined') {
            return print_doc(doc_data)
        }
    }

    printStorno = function (opid, doc_data) {// Override

        var print_doc = function (response) {
            // console.log(response)
            var data = report['exchange_prro'](response)
            var current_settings = __getPrintingSettings()

            // console.log(data);

            return $.Deferred().resolve()
                .then(function () {

                    if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                        exchange = 'exchange_prro_2020'
                        exchange_2_pages = 'exchange_prro_2020_2_pages'

                        if (current_settings['receipt_printer_type'].includes('thermo58_1')) {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            return $.Deferred().resolve()

                        } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {

                            var html = Mustache.render(TEMPLATES_THERMO[exchange_2_pages], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            return $.Deferred().resolve()

                        } else if (current_settings['receipt_printer_type'].includes('thermo80')) {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            return $.Deferred().resolve()

                        } else {
                            var html = Mustache.render(TEMPLATES_RKKS[exchange], data)//, {base:TEMPLATES.base})
                            // console.log(html);
                            return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                        }
                    } else {
                        exchange = 'exchange_prro_2020'
                        var html = Mustache.render(TEMPLATES_RKKS[exchange], data)//, {base:TEMPLATES.base})
                        // console.log(html);
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }

                }).then(function () {
                        $.ajax({
                            type: "POST",
                            url: 'exchange_printed',
                            data: {
                                id: response.id
                            },
                            success: function (ret) {
                                return $.Deferred().resolve()
                            }
                        })
                    }
                )
        }
        // console.log('print prro')
        // console.log(doc_data)
        if (typeof doc_data !== 'undefined') {
            return print_doc(doc_data)
        } else {
            $.ajax({
                type: "POST",
                url: 'get_exchange_by_number',
                data: {'operation_id': opid, storno:true},
                success: function (ret) {
                    if (typeof ret.errors !== 'undefined') {
                        //modal_win.find('.alert-warning').remove()
                        if (typeof ret.errors.general !== 'undefined') {
                            console.log('alert');
                            alert(ret.errors.general)
                            if (typeof ret.errors.redirect !== 'undefined') {
                                window.location = ret.errors.redirect;
                            }
                        }
                    } else if (ret.status == 'success') {
                        return print_doc(ret.exchange_data)
                    }
                }
            })
        }
    }

    printReceipt = function (opid, doc_data) {// Override

        var print_doc = function (response) {
            // console.log(response)
            var data = report['exchange_prro'](response)
            var current_settings = __getPrintingSettings()

            return $.Deferred().resolve()
                .then(function () {

                    if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                        exchange = 'exchange_prro_2020'
                        exchange_2_pages = 'exchange_prro_2020_2_pages'
                        if (current_settings['receipt_printer_type'].includes('thermo58_1')) {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            return $.Deferred().resolve()

                        } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {

                            var html = Mustache.render(TEMPLATES_THERMO[exchange_2_pages], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman

                            return $.Deferred().resolve()

                        } else if (current_settings['receipt_printer_type'].includes('thermo80')) {

                            data.copy = 1;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            data.copy = 2;

                            var html = Mustache.render(TEMPLATES_THERMO[exchange], data, {base: TEMPLATES_THERMO.base})

                            PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman

                            return $.Deferred().resolve()

                        } else {
                            var html = Mustache.render(TEMPLATES_RKKS[exchange], data)//, {base:TEMPLATES.base})
                            //                             data.copy = 1;

                            // var html = Mustache.render(TEMPLATES_THERMO[exchange_2_pages], data, {base: TEMPLATES_THERMO.base})
                            // console.log(html);
                            return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                        }
                    } else {
                        exchange = 'exchange_prro_2020'
                        var html = Mustache.render(TEMPLATES_RKKS[exchange], data)//, {base:TEMPLATES.base})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }

                }).then(function () {
                        $.ajax({
                            type: "POST",
                            url: 'exchange_printed',
                            data: {
                                id: response.id
                            },
                            success: function (ret) {

                            }
                        })
                    }
                )
        }
        // console.log('print prro')
        // console.log(doc_data)
        if (typeof doc_data !== 'undefined') {
            return print_doc(doc_data)
        } else {
            $.ajax({
                type: "POST",
                url: 'get_exchange_by_number',
                data: {'operation_id': opid, storno:false},
                success: function (ret) {
                    if (typeof ret.errors !== 'undefined') {
                        //modal_win.find('.alert-warning').remove()
                        if (typeof ret.errors.general !== 'undefined') {
                            console.log('alert');
                            alert(ret.errors.general)
                            if (typeof ret.errors.redirect !== 'undefined') {
                                window.location = ret.errors.redirect;
                            }
                        }
                    } else if (ret.status == 'success') {
                        return print_doc(ret.exchange_data)
                    }
                }
            })
        }
    }


    printPaymentAccount = function (opid) {// Override
        //console.log(doc_data)
        var payment = $.grep(JSON.parse(localStorage.getItem('payment_operations')), function (n, i) {
            return n.id == opid
        })[0];

        console.log(payment)
        var docparams = {
            operation_id: opid,
            payment_operation: payment,
        }

        // console.log(response)
        var data = report['payment_account'](docparams)
        var current_settings = __getPrintingSettings()

        //console.log(current_settings);

        data.double_page = false

        var html = '';

        return $.Deferred().resolve(html)
            .then(function (html) {

                payment_account = 'payment_account'

                var current_settings = __getPrintingSettings()

                //                 var html = Mustache.render(TEMPLATES_THERMO[exchange2019], data, {base: TEMPLATES_THERMO.base})
                //
                // PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman
                //
                if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                    if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                        data.copy = 1;
                        var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                        PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                        data.copy = 2;
                        var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                        PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                    } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                        var html = Mustache.render(TEMPLATES_THERMO['payment_account_2_pages'], data, {base: TEMPLATES_THERMO.base_payment})
                        PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                    } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                        data.copy = 1;
                        var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                        PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                        data.copy = 2;
                        var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                        PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                        PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }
                } else {
                    var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                    PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                }
            })
    }

    printPaymentAccount2 = function (opid, doc_data) {// Override
        //console.log(doc_data)
        if (typeof doc_data !== 'undefined') {
            var payment = $.grep(doc_data, function (n, i) {
                return n.id == opid;
            })[0];
        } else {
            var payment = $.grep(JSON.parse(localStorage.getItem('payment_operations')), function (n, i) {
                return n.id == opid
            })[0];
        }

        var docparams = {
            operation_id: opid,
            payment_operation: payment,
        }
        var print_doc = function (response) {
            var data = report['payment_account'](docparams)

            data.double_page = false

            payment_account = 'payment_account'

            // var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
            // return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
            var current_settings = __getPrintingSettings()

            // if (current_settings['receipt_printer_type'] == 'thermo58') {
            //         var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})//, {base:TEMPLATES.base})
            //         return PRINTING_SYSTEMS['thermo58']('exchange', {operation_id: opid}, html)////Roman
            //     } else if (current_settings['receipt_printer_type'] == 'thermo80') {
            //         var html = Mustache.render(TEMPLATES_THERMO['storno2018'], data, {base: TEMPLATES_THERMO.base})
            //         return PRINTING_SYSTEMS['thermo80']('exchange', {operation_id: opid}, html)////Roman
            //     } else {
            //         var html = Mustache.render(TEMPLATES_RKKS['storno2018'], data)//, {base:TEMPLATES.base})
            //         return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)//
            //     }
            if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                    data.copy = 1;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                    data.copy = 2;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                    var html = Mustache.render(TEMPLATES_THERMO['payment_account_2_pages'], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo58']('payment_account', {operation_id: opid}, html)
                } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                    data.copy = 1;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                    data.copy = 2;
                    var html = Mustache.render(TEMPLATES_THERMO[payment_account], data, {base: TEMPLATES_THERMO.base_payment})
                    PRINTING_SYSTEMS['thermo80']('payment_account', {operation_id: opid}, html)
                } else {
                    var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                    PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                }
            } else {
                var html = Mustache.render(TEMPLATES_RKKS[payment_account], data)
                PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
            }
        }
        return print_doc()
    }

    print_zreport = function (znum) {
        return remote_call('FSC', ['DocByZ', {zrep: znum, offset: znum, mask: 1}])
            .then(
                function (zrep) {

                    var current_settings = __getPrintingSettings()

                    var pages = Mustache.render(TEMPLATES_RKKS['xz_matrix'], report.xz_report_rkks(zrep))
                        .split('\n').groupIn(LINES_PER_PAGE).groupIn(3)

                    for (var i = 0; i < pages.length; i++) {
                        pages[i].idx = (function (in_i) {
                            return in_i + 1;
                        })(i);
                    }

                    if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                        if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                            var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                            PRINTING_SYSTEMS['thermoXZ58'](html)

                            return $.Deferred().resolve()

                        } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                            var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                            PRINTING_SYSTEMS['thermoXZ58'](html)

                            return $.Deferred().resolve()
                        } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                            var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                            PRINTING_SYSTEMS['thermoXZ80'](html)

                            return $.Deferred().resolve()

                        } else {
                            var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: pages})
                            return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                        }
                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: pages})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }

                },
                function (data, status, xhr) {
                    console.log('alert');
                    msg = xhr.msg
                    alert(msg)
                    __serverLog(msg)
                }
            )
    }
    print_xreport = function () {
        var prom = $.Deferred()
        $.ajax({
            type: "POST",
            url: 'x_report',
            data: {},
            success: function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    var blocks = Mustache.render(TEMPLATES_RKKS['xz_matrix'], report.xz_report_prro(ret.x_report_data))
                    // TESTING:
                    // blocks += blocks+blocks+blocks+blocks+blocks+blocks+blocks+blocks+blocks+blocks

                    var pages = blocks.split('\n').groupIn(LINES_PER_PAGE).groupIn(3)

                    // Adding indexes for mustache
                    for (var i = 0; i < pages.length; i++) {
                        pages[i].idx = (function (in_i) {
                            return in_i + 1;
                        })(i);
                    }

                    var current_settings = __getPrintingSettings()

                    if (typeof current_settings['receipt_printer_type'] !== 'undefined') {
                        if (current_settings['receipt_printer_type'].includes('thermo58_1')) {
                            var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                            return PRINTING_SYSTEMS['thermoXZ58'](html)
                        } else if (current_settings['receipt_printer_type'].includes('thermo58_2')) {
                            var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                            return PRINTING_SYSTEMS['thermoXZ58'](html)
                        } else if (current_settings['receipt_printer_type'].includes('thermo80')) {
                            var html = Mustache.render(TEMPLATES_THERMO['base_xz'], {pages: pages})
                            return PRINTING_SYSTEMS['thermoXZ80'](html)
                        } else {
                            var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: pages})
                            return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                        }
                    } else {
                        var html = Mustache.render(TEMPLATES_RKKS['base_html'], {pages: pages})
                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                    }
                }
            }
        })
        return prom
    }

    __summXZ = function (records) {//used in reports
        var exeptions = ['CurrCode', 'Rate', 'RateBuy', 'RateSell', 'RecType', 'RecTypeReadable']
        var currList = {}
        $.each(records, function (i, value) {
            var cc = value.CurrCode
            if (value.RecType == 46) {
                if (!currList[cc]) {
                    currList[cc] = {}
                }
                $.each(value, function (k, v) {
                    if (exeptions.indexOf(k) == -1) {
                        if (!currList[cc][k]) {
                            currList[cc][k] = 0
                        }
                        currList[cc][k] += parseInt(value[k])
                    } else {
                        currList[cc][k] = value[k]
                    }
                })
            }
        })
        return currList
    }

    if (LOADED_MODULES.indexOf('reports') != -1) {
        var zbtn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-danger').prop('id', 'zreport')
            .html('Z звіт')
            .click(function () {
                $.ajax({
                    type: "GET",
                    url: 'api/department/check_limit',
                    success: function (ret) {
                        if (typeof ret.errors !== 'undefined') {
                            if (typeof ret.errors.general !== 'undefined') {
                                console.log('alert');
                                alert(ret.errors.general)
                                if (typeof ret.errors.redirect !== 'undefined') {
                                    window.location = ret.errors.redirect;
                                }
                            }
                        } else if (ret.status == 'success') {
                            if (confirm("Ви впевнені, що хочете відправити Z-звіт?") == true) {
                                return send_zreport(true)
                            }
                        } else if (ret.status == 'excess') {
                            // msg = ''
                            // $.each(ret.data, function (k, v) {
                            //     msg = msg + v.currency + ": " + v.excess + "\n"
                            // })
                            // console.log('alert');
                            // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                            //     msg
                            //
                            msg = ''
                            $.each(ret.data, function (k, v) {
                                // msg = msg + v.currency + ": " + v.excess + "\n"
                                msg = v.message
                            })
                            console.log('alert');
                            // alert("На відділені виявлено переліміт по наступним валютам: \n" +
                            //     msg)
                            alert(msg)

                        } else {
                            console.log('alert');
                            alert("Не вдалося перевірити ліміту каси, спробуйте ще раз!")
                        }
                    }
                })
                $('#reportsModal').modal('hide')
            })
        var xbtn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-info').prop('id', 'xreport')
            .html('X звіт')
            .click(function () {
                print_xreport().always(function () {
                    return $('#reportsModal').modal('hide');
                })
            })
        var z_number_input = $('<input>')
            .addClass('form-control')
            .prop('id', 'z_number_input')
            .prop('type', 'number')
            .prop('step', '1')
            .prop('placeholder', '0')
            .prop('min', '1')
            .val(1)

        // remote_call('FSC', ['DocByDate', {zrep: 999, mask: 1, before: 1, date: ActualTime().format('YYYYMMDDHHmmss')}])
        //     .then(function (data) {
        //         doc_footer = data.Records.filter(function (element, value) {
        //             return element.RecType == 127
        //         })[0]
        //         z_number_input.val(doc_footer.DocNo)
        //     })
        var last_z_report = JSON.parse(localStorage.getItem('last_z'))
        // console.log(last_z_report.data.z_number)
        if (typeof last_z_report.data !== 'undefined') {
            z_number_input.val(last_z_report.data.z_number)
        } else {
            z_number_input.val(0)
        }

        var zcopy_btn = $('<button>')
            .prop('type', 'button').addClass('btn btn-lg btn-success').prop('id', 'zcopy_btn')
            .html('копія Z')
            .click(function () {
                var prom = $.Deferred()
                var znum = parseInt($('#z_number_input').val())
                $.ajax({
                    type: "POST",
                    url: 'get_z_report_by_number',
                    data: {'z_number': znum},
                    success: function (ret) {
                        if (typeof ret.errors !== 'undefined') {
                            //modal_win.find('.alert-warning').remove()
                            if (typeof ret.errors.general !== 'undefined') {
                                console.log('alert');
                                alert(ret.errors.general)
                                if (typeof ret.errors.redirect !== 'undefined') {
                                    window.location = ret.errors.redirect;
                                }
                            }
                        } else if (ret.status == 'success') {
                            return printZreport(ret.z_report_data)
                        }
                    }
                })
                return prom
            })

        $('#reportsModal').find('.modal-body').append(
            $('<div>').addClass('row')
                .append($('<h3>').addClass('col-sm-2').append(xbtn))
                .append($('<h3>').addClass('col-sm-2').append(zbtn))
                .append($('<h3>').addClass('col-sm-2').append(z_number_input))
                .append($('<h3>').addClass('col-sm-2').append(zcopy_btn))
        )
    }
    // sync_all_operations()
    //get_closed_day()
    // check_rro_connection().then(get_closed_day()) #переделать, сделать открытие смены
    //check_rro_connection().then(opened_day_init)}
    // get_closed_day()
}

ReportModule = function () {
    if (LOADED_MODULES.indexOf('printing') == -1) {
        return false
    }
    LOADED_MODULES.push('reports')
    var reporting_html =
        '<div class = "row">' +
        '<div class="col-sm-12">' +
        '<label class="control-label">Звiти</label><br>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-lg btn-warning" id="Register">Реєстр купівлі/продажу</button></div>'
    // '<button type="button" class="btn btn-lg btn-warning" id="buyRegister">Реєстр купівлі</button>' +
    // '<button type="button" class="btn btn-lg btn-warning" id="sellRegister">Реєстр продажу</button>' +

    var department_details = JSON.parse(localStorage.getItem('department_details'))
    if (typeof department_details.payments !== 'undefined') {
        if (department_details.payments) {
            reporting_html = reporting_html + '<div class="btn-group"><button type="button" class="btn btn-lg btn-warning" id="PaymentRegister">Реєстр прийнятих платежiв</button></div>'
        }
    }


    reporting_html = reporting_html +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-lg btn-warning" id="accSummary">Звітна довідка</button>' +
        '</div>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-lg btn-primary" id="cashBook">Касова книга &nbsp;</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class = "row">' +
        '<div class="col-sm-12">' +
        '<label class="control-label">Накази</label><br>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-lg btn-info" id="limits">Встановлення ліміту</button>' +
        '</div>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn-lg btn-info" id="titlePage">Титульний аркуш</button>' +
        '</div>' +
        // '<div class="btn-group">' +
        // '<button type="button" class="btn btn-lg btn-info" id="anketa">Тестові питання</button>' +
        // '</div>' +

        '</div>' +
        '</div>' +
        '<div class = "row">' +
        '<h3 class="col-sm-12">' +
        '<label class="control-label">Друкувати №</label>' +
        '<select type="button" class="btn btn-default btn-lg" id="ratesUpdateId">' +
        // '<option value="0">-- рекомендовані --</option>' +
        '</select>' +
        '<button type="button" class="btn btn-success btn-lg" id="ratesLocalOrder">Курси</button>' +
        '<button type="button" class="btn btn-success btn-lg" id="ratesDodatok1">Додаток №1</button>' +
        '</h3>' +
        '</div>'

    modal = $.createModal(
        'reportsModal',
        'performOperation', // btn_id
        false,	//has_footer
        'Відобразити', // bnt_caption
        title = 'Звіти')
        .on('shown.bs.modal', function () {
            $(this).find('select').eq(0).focus()
        });
    modal.find('.modal-body').html(reporting_html)

    populateLocalOrders = function (today_rates) {
        today_rates = today_rates ? today_rates : JSON.parse(localStorage.getItem('today_rates'))
        r_updates = $('#reportsModal #ratesUpdateId').eq(0).html('')

        var key = new Date($('#doc_date').data('daterangepicker').startDate)
        if (dates.compare(key, new Date("2020-02-01T00:00")) < 0) {
            r_updates.append($('<option>').attr('value', 0).html('-- рекомендовані --'))
            $('#ratesDodatok1').removeClass('hide')
        } else {
            $('#ratesDodatok1').addClass('hide')
        }
        for (var i = 0; i <= today_rates.length - 1; i++) {
            time = $.isoDateToTime(today_rates[i].rates_time)
            if (time) {
                r_updates.append($('<option>').attr('value', i + 1).html('(' + (i + 1) + ')  ' + time))
            }
        }
    }

    populateReportsBtns = function () {
        modal.find("#ratesLocalOrder").off('click')
        modal.find("#ratesDodatok1").off('click')
        modal.find("#Register").off('click')
        modal.find("#PaymentRegister").off('click')
        // modal.find("#buyRegister").off('click')
        // modal.find("#sellRegister").off('click')
        modal.find("#accSummary").off('click')
        modal.find("#cashBook").off('click')
        modal.find("#limits").off('click')
        modal.find("#titlePage").off('click')
        // modal.find("#anketa").off('click')
        modal.find("#zreport").off('click')
        modal.find("#xreport").off('click')

        modal.find("#zreport").click(function () {
            if (confirm("Ви впевнені, що хочете відправити дані і надрукувати Z-звіт?") == true) {
                console.log('Z report printed')
            }
        })

        modal.find("#xreport").click(function () {
            console.log('X report printed')
        })

        modal.find("#ratesLocalOrder").click(function () {
            // var DAT = getArchiveData()
            //console.log(DAT)

            // if (DAT.company_rates.data.length == 0) {
            //     date = $.isoDateToUADate(new Date(DAT.report_date))
            //     alert('Не встановлені рекомендовані курси на обрану дату \n ' + date)
            // } else {
            //     var ruid = $('#reportsModal #ratesUpdateId option:selected').eq(0).val()
            //     if (ruid == 0) {
            //         getPrintFnsByDoctype('order')('order', {}).then(function () {
            //             getPrintFnsByDoctype('quotation')('quotation', {update_id: ruid})
            //         })
            //     } else {
            //         getPrintFnsByDoctype('local_order')('local_order', {update_id: ruid}).then(function () {
            //             getPrintFnsByDoctype('local_quotation')('local_quotation', {update_id: ruid})
            //         })
            //     }


            //         date_20200201 = new Date("2020-02-01T09:00")
            // // console.log(rates_time)
            //
            //         if (rates_time < date_20200201) {
            var key = new Date($('#doc_date').data('daterangepicker').startDate)
            var ruid = $('#reportsModal #ratesUpdateId option:selected').eq(0).val()

            if (dates.compare(key, new Date("2020-02-01T00:00")) < 0) {
                if (ruid == 0) {
                    getPrintFnsByDoctype('order')('order', {}).then(function () {
                        getPrintFnsByDoctype('quotation')('quotation', {update_id: ruid})
                    })
                } else {
                    getPrintFnsByDoctype('local_order')('local_order', {update_id: ruid}).then(function () {
                        getPrintFnsByDoctype('local_quotation')('local_quotation', {update_id: ruid})
                    })
                }
            } else {
                getPrintFnsByDoctype('local_quotation_2020')('local_quotation_2020', {update_id: ruid})
            }


            // }
        });

        modal.find("#ratesDodatok1").click(function () {
            var DAT = getArchiveData()
            //console.log(DAT)

            // if (DAT.company_rates.data.length == 0) {
            //     date = $.isoDateToUADate(new Date(DAT.report_date))
            //     alert('Не встановлені рекомендовані курси на обрану дату \n ' + date)
            // } else {
            var ruid = $('#reportsModal #ratesUpdateId option:selected').eq(0).val()
            if (ruid == 0) {
                getPrintFnsByDoctype('dodatok1')('dodatok1', {})
            } else {
                getPrintFnsByDoctype('local_dodatok1')('local_dodatok1', {update_id: ruid})
            }
            // }
        });


        modal.find("#Register").click(function () {
            try {
                var key = new Date($('#doc_date').data('daterangepicker').startDate)

                if (dates.compare(key, new Date("2019-02-07T00:00")) >= 0) {
                    getPrintFnsByDoctype('register2019')('register2019', {buy_register: true})
                } else {
                    getPrintFnsByDoctype('register')('register', {buy_register: true}).then(function () {
                        getPrintFnsByDoctype('register')('register', {buy_register: false})
                    })
                }
            } catch (err) {
                console.log(err)
            }
        });

        modal.find("#PaymentRegister").click(function () {
            try {
                getPrintFnsByDoctype('payment_register')('payment_register', {buy_register: true})
            } catch (err) {
                console.log(err)
            }
        });

        modal.find("#accSummary").click(function () {
            try {

                var key = new Date($('#doc_date').data('daterangepicker').startDate)

                if (dates.compare(key, new Date("2019-02-07T00:00")) >= 0) {
                    getPrintFnsByDoctype('accounting_statement_2019')('accounting_statement_2019', {})
                } else {
                    getPrintFnsByDoctype('accounting_statement')('accounting_statement', {})
                }

            } catch (err) {
                console.log(err)
            }
        });
        modal.find("#cashBook").append($('<img id="CashBookSpinnerImg" class="hide" src="/static/images/spinner.gif" alt="Spinner icon" width=20 height="auto"/>'));
        modal.find("#cashBook").click(function () {
            try {
                $("#CashBookSpinnerImg").removeClass('hide')
                $("#cashBook").prop('disabled', true)
                getPrintFnsByDoctype('cash_book')('cash_book', {})
            } catch (err) {
                modal.find("#CashBookSpinnerImg").addClass('hide')
                modal.find("#cashBook").prop('disabled', false)
            }
        });

        document.getElementById("limits").disabled = true;
        department_limits = JSON.parse(localStorage.getItem('department_limits'))

        if (department_limits.status == "success") {
            data = department_limits.data
            uah_limit = $.grep(data, function (n, i) {
                return n.currency_id == 186
            })

            if ((uah_limit.length > 0) && (uah_limit[0].limit_type > 0)) {
                document.getElementById("limits").disabled = false;

                modal.find("#limits").click(function () {
                    try {
                        // getPrintFnsByDoctype('limits')('limits', {}).then(function () {
                        // 	getPrintFnsByDoctype('limits_currency')('limits_currency', {})
                        // })
                        getPrintFnsByDoctype('limits')('limits', {})
                    } catch (err) {

                    }
                })
            } else {
                document.getElementById("limits").disabled = false;

                modal.find("#limits").click(function () {
                    console.log('alert');
                    alert('Ліміти встановлено в ознайомлювальних цілях!!!\nОфіційний НАКАЗ(и) можна буде роздрукувати після повноцінного введення обмежень щодо лімітів та обнулення каси відділення!!!')
                })
            }
        }

        // modal.find("#anketa").click(function () {
        //     try {
        //         getPrintFnsByDoctype('anketa')('anketa', {})
        //     } catch (err) {
        //
        //     }
        // });

        modal.find("#titlePage").click(function () {

            var selectPeriodModal = $.createModal(
                'selectPeriodModal',
                btn_id = 'performOperation',
                footer = false,
                bnt_caption = 'Відобразити',
                title = 'Титульний аркуш: вибір періоду')
                .on('shown.bs.modal', function () {
                    $(this).find('.close').eq(0).focus()
                });
            selectPeriodModal.find('.modal-body')
                .html(
                    '<div class="col-sm-12">' +
                    '<div class="form-group">' +
                    '<label class="col-sm-2 control-label" for="doc_date_title" style="text-align:right;">Перiод</label>' +
                    '<div class="col-sm-5">' +
                    '<input class="form-control" data-date-format="YYYY-MM-DD HH:mm:ss" data-role="datetimepicker" id="doc_date_title" name="doc_date_title" type="text" value="">' +
                    '</div>' +
                    '<button type="button" class="btn btn-primary" id="titlePageOkButton">Сформувати</button>' +
                    '</div>' +
                    '</div><br><br>')

            var settings = JSON.parse(localStorage.getItem('general_settings'))
            var today = ActualTime().subtract({hours: settings.OPER_DATE_HOUR, minutes: settings.OPER_DATE_MINUTE})

            $('#doc_date_title').daterangepicker({
                locale: {format: 'YYYY-MM-DD'},
                startDate: today.format('YYYY-MM-DD HH:mm:ss'),
                endDate: today.format('YYYY-MM-DD HH:mm:ss'),
                // maxDate: today.format('YYYY-MM-DD'),
                //minDate: today.subtract({days:settings.ARCHIVE_MAX_DAYS}).format('YYYY-MM-DD'),
                singleDatePicker: false,
                timePicker: false,
                autoApply: true,
                ranges: false
            })

            selectPeriodModal.find("#titlePageOkButton").off('click').click(function () {
                var date_from = $('#doc_date_title').data('daterangepicker').startDate
                var date_end = $('#doc_date_title').data('daterangepicker').endDate
                getPrintFnsByDoctype('titlePage')('titlePage', {'date_from': date_from, 'date_end': date_end})
                $('#selectPeriodModal').modal('hide')
            })

            $('#reportsModal').modal('hide')
            displayModal($("#selectPeriodModal"))

        })

        modal.on('shown.bs.modal', function () {
            var settings = JSON.parse(localStorage.getItem('general_settings'))
            var today = ActualTime().subtract({hours: settings.OPER_DATE_HOUR, minutes: settings.OPER_DATE_MINUTE})

            $(this).find('input[name=doc_date]').val(today.format('YYYY-MM-DD'))//gre05092019
        });

    }

    var settings = JSON.parse(localStorage.getItem('general_settings'))

    if (settings.DESIGN == 1) {
        btn = $.addNavButton('reportsMenu', 'Друк звітів [F8]', 119) //F8
        .click(function () {
            displayModal($("#reportsModal"))
            populateLocalOrders()
        })
        .removeClass('btn-default').addClass('btn-warning')
    } else {
        btn = $.addNavButton('reportsMenu', 'Звіти та курси [F8]', 119) //F8
            .click(function () {
                displayModal($("#reportsModal"))
                populateLocalOrders()
            })
            .removeClass('btn-default').addClass('btn-warning')
    }
    populateReportsBtns()
}

ArchiveModule = function () {
    if (LOADED_MODULES.indexOf('reports') == -1) {
        return false
    }
    LOADED_MODULES.push('archive')
    var settings = JSON.parse(localStorage.getItem('general_settings'))
    var today = ActualTime().subtract({hours: settings.OPER_DATE_HOUR, minutes: settings.OPER_DATE_MINUTE})
    moment.locale('uk')
    var api_url = 'api/archive'
    populateReportsBtns()

    $('#reportsModal .modal-body').prepend(
        '<div class="row">' +
        '<div class="col-sm-6">' +
        '<label class="control-label" for="now">Дата документів</label>' +
        '<input class="form-control" data-date-format="YYYY-MM-DD HH:mm:ss" data-role="datetimepicker" id="doc_date" name="doc_date" type="text" value="">' +
        '</div>' +
        '</div>' +
        '<br>'
    )

    var load_archive = function () {
        var doc_date = $('#doc_date').data('daterangepicker').startDate
        var data = {
            startDate: doc_date.format('YYYY-MM-DD HH:mm:ss')//._d.toUTCString(), //Sat, 09 Jun 2018 00:00:00 GMT
            // endDate : $('#doc_date').data('daterangepicker').endDate._d,
        }

        var key = doc_date.format('YYYY-MM-DD')
        var arch = localStorage.getItem('archive')
        if (!arch) {
            arch = {}
        } else {
            arch = JSON.parse(arch)
        }

        populateLocalOrders(arch[key] ? arch[key].today_rates : null)

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
                //modal_win.find('.alert-warning').remove()
                if (typeof data.errors.general !== 'undefined') {
                    console.log('alert');
                    alert(data.errors.general)
                    if (typeof data.errors.redirect !== 'undefined') {
                        window.location = data.errors.redirect;
                    }
                }
            } else {
                arch[key] = data
                localStorage.setItem('archive', JSON.stringify(arch))
                populateLocalOrders(arch[key] ? arch[key].today_rates : null)
            }
        }

        //if ((key != today.format('YYYY-MM-DD')) & !(key in arch)){
        $.ajax({
            type: "GET",
            url: api_url,
            data: data,
            contentType: 'application/json',
            async: false,
            success: onSuccess
        });
        //}
    }

    $('#doc_date').daterangepicker({
        locale: {format: 'YYYY-MM-DD'},
        startDate: today.format('YYYY-MM-DD HH:mm:ss'),
        // maxDate: today.format('YYYY-MM-DD'),
        //minDate: today.subtract({days:settings.ARCHIVE_MAX_DAYS}).format('YYYY-MM-DD'),
        singleDatePicker: true,
        timePicker: false,
        autoApply: true,
        ranges: false
    }, load_archive)
}

PrintingModule = function () {
    LOADED_MODULES.push('printing')
    var printChrome = function (doctype, params, preview, html, after_hook) {
        doctype = typeof doctype !== 'undefined' ? doctype : 'accounting_statement';
        params = typeof params !== 'undefined' ? params : {};
        preview = typeof preview !== 'undefined' ? preview : false;
        after_hook = typeof after_hook !== 'undefined' ? after_hook : function () {
        };
        // get reports data + check archive
        // RETURN deferred
        // print document
        var html = typeof html !== 'undefined' ? html : Mustache.render(TEMPLATES[doctype], report[doctype](params), {base: TEMPLATES.base})

        // TESTING:
        // console.log(html)
        if (doctype === 'cash_book') {
            var data = new FormData();
            data.append('html', html);

            var req = new XMLHttpRequest();
            req.open("POST", '/html_to_pdf', true);
            req.responseType = "blob";
            req.setRequestHeader("X-CSRFToken", csrftoken);
            req.onload = function (event) {
                var blob = req.response;
                // var fileName = req.getResponseHeader("filename") //if you have the fileName header available
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = "print.pdf";
                link.click();
                $("#CashBookSpinnerImg").addClass('hide')
                $("#cashBook").prop('disabled', false)
            };

            req.send(data);

            return $.Deferred().resolve()
        }




        var donePrinting = $.Deferred()

        modal = $.createModal(
            'previewModal',
            btn_id = 'printBtn',
            footer = true,
            bnt_caption = 'Друк',
            title = 'Попередній перегляд')
            .modal({
                backdrop: true,
                show: true,
                keyboard: true
            });
        frame = $('<iframe>')
            .attr('style', 'position:relative; top:0; left:0; width:100%;')
            .attr('frameborder', 0)
            .attr('scrolling', 'no')
            .attr('id', 'previewFrame')
        modal.find('.modal-body').append(frame)
        frame = document.getElementById('previewFrame')
        frame.contentWindow.document.body.innerHTML = html
        frame.height = frame.contentWindow.document.body.scrollHeight

        function doPrintFrame() {
            frame.contentWindow.focus()
            frame.contentWindow.print()
            modal.modal('hide')
            modal.off('shown.bs.modal')
            modal.remove()
            $('.modal-backdrop').remove()
            donePrinting.resolve()
        }

        modal.on('shown.bs.modal', function () {
            $('#printBtn').focus()
            if (!preview) {
                after_hook()
                doPrintFrame()
            } else {
                $('#printBtn').off('click')
                $('#printBtn').on('click', function () {
                    after_hook()
                    doPrintFrame()
                })
            }
        });

        return donePrinting
    }
    PRINTING_SYSTEMS = {'chrome': printChrome}

    printAfterPopulate = function (elements, print_fns, id_colnum) {
        printBtn = $('<button>')
            .addClass("btn btn-sm btn-default btn-secondary glyphicon glyphicon-print")
            .click(function () {
                row = $(this).parent().parent()
                opid = row.children().eq(id_colnum - 1).html()
                num_eop = row.children().eq(id_colnum).html()
                if (confirm("Надрукувати копію документа № " + num_eop + "?")) {
                    print_fns(opid)
                }
            })
        elements.append(printBtn);
    }

    printAfterPopulateStorno = function (elements, print_fns, id_colnum) {
        printBtn = $('<button>')
            .addClass("btn btn-sm btn-default btn-secondary glyphicon glyphicon-print")
            .click(function () {
                row = $(this).parent().parent()
                opid = row.children().eq(id_colnum - 1).html()
                num_eop = row.children().eq(id_colnum).html()
                if (confirm("Надрукувати копію сторно документа?")) {
                    print_fns(opid)
                }
            })
        elements.append(printBtn);
    }

    _getPrintFnsByDoctype = function (doctype) {
        var current_settings = __getPrintingSettings()
        //console.log(doctype)

        if (['exchange', 'storno', 'payment_account'].indexOf(doctype) > -1) {
            x = PRINTING_SYSTEMS[current_settings['receipt_printer_type']]
        } else if (['payment_service', 'order', 'dodatok1', 'local_dodatok1', 'local_order', 'quotation', 'local_quotation', 'local_quotation_2020', 'cash_book', 'limits', 'limits_currency', 'anketa', 'register', 'register2019', 'titlePage', 'cashflow', 'accounting_statement', 'accounting_statement_2019'].indexOf(doctype) > -1) {
            x = PRINTING_SYSTEMS['chrome']
        } else {
            x = PRINTING_SYSTEMS[current_settings['doc_printer_type']]
        }
        return (typeof x != 'undefined') ? x : PRINTING_SYSTEMS[DEFAULT_SETTINGS[doc_printer]]
    }

    getPrintFnsByDoctype = function (doctype) {
        return _getPrintFnsByDoctype(doctype)
    }

    printReceipt = function (opid) {//РРО

        var docparams = {
            operation_id: opid,
        }

        getPrintFnsByDoctype('exchange')('exchange', docparams)
            .always(function () {
                var needs_certificate = (exchange.certificate_code != null) & (exchange.certificate_code != '') & (exchange.currency_amount > 0)
                if (needs_certificate) {
                    getPrintFnsByDoctype('certificate')('certificate', {operation_id: opid})
                }
            })
    }
}

PrintingThermoModule = function () {

    var printThermo58 = function (doctype, params, html) {
        doctype = typeof doctype !== 'undefined' ? doctype : 'exchange';
        params = typeof params !== 'undefined' ? params : {};

        //var data = report[doctype](params)
        var data = []

        data.double_page = false

        console.log(data)

        //var html = Mustache.render(TEMPLATES[doctype], data, {base:TEMPLATES.base})

        //var html = Mustache.render(TEMPLATES_THERMO[doctype], data, {base:TEMPLATES_THERMO.base})

        var settings = __getPrintingSettings()

        if (doctype == 'exchange') {
            //console.log('PrintingThermoModule.printThermo.exchange')
            //var printer =  settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS-58 11.2.0.0'
            var printer = settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
            data = {
                // zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 2,
                // width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 384,
                // high_density_vertical: true,
                // high_density_horizontal: true,
                // low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,
                //
                zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 4,
                width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 1024,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,

                //zoom: 	 					settings.doc_printer_zoom ? parseFloat(settings.doc_printer_zoom) : 1.3,
                //width: 						settings.doc_printer_width ? parseInt(settings.doc_printer_width) : 384,
                //high_density_vertical:  	settings.doc_printer_hi_vquality == 'y' ? true : false,
                //high_density_horizontal:  	settings.doc_printer_hi_hquality == 'y' ? true : false,
                //low_density_y_dots:  		settings.doc_printer_y_dots ? parseInt(settings.doc_printer_y_dots) : 8,
            }
        } else if (doctype == 'storno') {
            //console.log('PrintingThermoModule.printThermo80.storno')
            //var printer =  settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS-58 11.2.0.0'
            var printer = settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
            data = {
                zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 2,
                width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 384,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,
            }
        } else if (doctype == 'payment_account') {
            //console.log('PrintingThermoModule.printThermo80.storno')
            //var printer =  settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS-58 11.2.0.0'
            var printer = settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
            data = {
                zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 2,
                width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 384,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,
            }
        } else {
            //var printer = settings.doc_printer ? decodeURIComponent(settings.doc_printer) : 'POS-58 11.2.0.0'
            var printer = settings.doc_printer ? decodeURIComponent(settings.doc_printer) : 'POS58 10.0.0.6'
            data = {
                zoom: settings.doc_printer_zoom ? parseFloat(settings.doc_printer_zoom) : 2,
                width: settings.doc_printer_width ? parseInt(settings.doc_printer_width) : 384,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.doc_printer_y_dots ? parseInt(settings.doc_printer_y_dots) : 8,
            }
        }
        // console.log('PrintingThermoModule.printThermo58')
        // console.log([html, printer, data])
        return remote_call('printThermo', [html, printer, data])
            .then(
                function (data) {
                    console.log(data)
                    //if (data[0]. == 'exists'){
                    //     console.log('CheckExistance')
                    // 	fiscalize_fns(opid).then(function(ret){
                    // 		if(LOADED_MODULES.indexOf('printing') != -1){return printReceipt(ret.id)}
                    // 	})
                    // 	var msg = 'Вже проведено на РРО, фіскалізуємо'
                    // 	console.log(msg)
                    // 	__serverLog(msg)
                    // 	return $.Deferred().reject(msg)
                    // }else{
                    // 	var msg = 'Операцію в базі РРО не знайдено, відміняємо на сервері'
                    // 	console.log(msg)
                    // 	__serverLog(msg)
                    // 	return $.Deferred().resolve()
                    // }
                })
    }

    var printThermo80 = function (doctype, params, html) {
        doctype = typeof doctype !== 'undefined' ? doctype : 'exchange';
        params = typeof params !== 'undefined' ? params : {};

        //var data = report[doctype](params)
        var data = []

        data.double_page = false

        //console.log(data)

        //var html = Mustache.render(TEMPLATES[doctype], data, {base:TEMPLATES.base})

        //var html = Mustache.render(TEMPLATES_THERMO[doctype], data, {base:TEMPLATES_THERMO.base})

        var settings = __getPrintingSettings()

        if (doctype == 'exchange') {
            //console.log('PrintingThermoModule.printThermo.exchange')
            //var printer =  settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS-58 11.2.0.0'
            var printer = settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
            data = {
                zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 4,
                width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 1024,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,

                //zoom: 	 					settings.doc_printer_zoom ? parseFloat(settings.doc_printer_zoom) : 1.3,
                //width: 						settings.doc_printer_width ? parseInt(settings.doc_printer_width) : 384,
                //high_density_vertical:  	settings.doc_printer_hi_vquality == 'y' ? true : false,
                //high_density_horizontal:  	settings.doc_printer_hi_hquality == 'y' ? true : false,
                //low_density_y_dots:  		settings.doc_printer_y_dots ? parseInt(settings.doc_printer_y_dots) : 8,
            }
        } else if (doctype == 'storno') {
            //console.log('PrintingThermoModule.printThermo80.storno')
            //var printer =  settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS-58 11.2.0.0'
            var printer = settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
            data = {
                zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 4,
                width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 1024,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,
            }
        } else if (doctype == 'payment_account') {
            //console.log('PrintingThermoModule.printThermo80.storno')
            //var printer =  settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS-58 11.2.0.0'
            var printer = settings.receipt_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
            data = {
                zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 4,
                width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 1024,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,
            }
        } else {
            //var printer = settings.doc_printer ? decodeURIComponent(settings.doc_printer) : 'POS-58 11.2.0.0'
            var printer = settings.doc_printer ? decodeURIComponent(settings.doc_printer) : 'POS58 10.0.0.6'
            data = {
                zoom: settings.receipt_printer_zoom ? parseFloat(settings.receipt_printer_zoom) : 4,
                width: settings.receipt_printer_width ? parseInt(settings.receipt_printer_width) : 1024,
                high_density_vertical: true,
                high_density_horizontal: true,
                low_density_y_dots: settings.receipt_printer_y_dots ? parseInt(settings.receipt_printer_y_dots) : 8,
            }
        }
        // console.log('PrintingThermoModule.printThermo80')
        // console.log([html, printer, data])
        return remote_call('printThermo', [html, printer, data])
            .then(
                function (data) {
                    console.log(data)
                    //if (data[0]. == 'exists'){
                    //     console.log('CheckExistance')
                    // 	fiscalize_fns(opid).then(function(ret){
                    // 		if(LOADED_MODULES.indexOf('printing') != -1){return printReceipt(ret.id)}
                    // 	})
                    // 	var msg = 'Вже проведено на РРО, фіскалізуємо'
                    // 	console.log(msg)
                    // 	__serverLog(msg)
                    // 	return $.Deferred().reject(msg)
                    // }else{
                    // 	var msg = 'Операцію в базі РРО не знайдено, відміняємо на сервері'
                    // 	console.log(msg)
                    // 	__serverLog(msg)
                    // 	return $.Deferred().resolve()
                    // }
                })
    }

    var printThermoXZ58 = function (html) {
        //doctype = typeof doctype !== 'undefined' ? doctype : 'exchange';
        //params = typeof params !== 'undefined' ? params : {};

        //var data = report[doctype](params)

        //data.double_page = false

        //console.log(data)

        //var html = Mustache.render(TEMPLATES[doctype], data, {base:TEMPLATES.base})

        //var html = Mustache.render(TEMPLATES_THERMO[doctype], data, {base:TEMPLATES_THERMO.base})

        var settings = __getPrintingSettings()

        //var printer = settings.doc_printer ? decodeURIComponent(settings.doc_printer) : 'POS-58 11.2.0.0'
        var printer = settings.doc_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
        var data = {
            zoom: settings.doc_printer_zoom ? parseFloat(settings.doc_printer_zoom) : 2,
            width: settings.doc_printer_width ? parseInt(settings.doc_printer_width) : 384,
            high_density_vertical: true,
            high_density_horizontal: true,
            low_density_y_dots: settings.doc_printer_y_dots ? parseInt(settings.doc_printer_y_dots) : 8,
        }

        console.log('PrintingThermoModule.printThermoXZ')
        console.log([html, printer])
        return remote_call('printThermo', [html, printer, data])
    }

    var printThermoXZ80 = function (html) {
        //doctype = typeof doctype !== 'undefined' ? doctype : 'exchange';
        //params = typeof params !== 'undefined' ? params : {};

        //var data = report[doctype](params)

        //data.double_page = false

        //console.log(data)

        //var html = Mustache.render(TEMPLATES[doctype], data, {base:TEMPLATES.base})

        //var html = Mustache.render(TEMPLATES_THERMO[doctype], data, {base:TEMPLATES_THERMO.base})

        var settings = __getPrintingSettings()

        //var printer = settings.doc_printer ? decodeURIComponent(settings.doc_printer) : 'POS-58 11.2.0.0'
        var printer = settings.doc_printer ? decodeURIComponent(settings.receipt_printer) : 'POS58 10.0.0.6'
        var data = {
            zoom: settings.doc_printer_zoom ? parseFloat(settings.doc_printer_zoom) : 3,
            width: settings.doc_printer_width ? parseInt(settings.doc_printer_width) : 550,
            high_density_vertical: true,
            high_density_horizontal: true,
            low_density_y_dots: settings.doc_printer_y_dots ? parseInt(settings.doc_printer_y_dots) : 8,
        }

        console.log('PrintingThermoModule.printThermoXZ')
        console.log([html, printer])
        return remote_call('printThermo', [html, printer, data])
    }

    PRINTING_SYSTEMS['thermoXZ58'] = printThermoXZ58
    PRINTING_SYSTEMS['thermoXZ80'] = printThermoXZ80
    PRINTING_SYSTEMS['thermo58'] = printThermo58
    PRINTING_SYSTEMS['thermo80'] = printThermo80
}

PrintingMatrixModule = function () {
    var printMatrix = function (doctype, params, is_short) {
        is_short = typeof is_short !== 'undefined' ? is_short : false;
        doctype = typeof doctype !== 'undefined' ? doctype : 'exchange';
        params = typeof params !== 'undefined' ? params : {};
        // 128 symbols
        var prepareData = {
            exchange: function (data) {
                company = data.company.wrapText(46, ' ')
                data.company1 = company[0]
                data.company2 = company.slice(1).map(function (x) {
                    return x.ljust(62)
                })
                data.full_name = data.full_name.wrapText(62, ' ')
                data.address = data.address.wrapText(62, ' ')
                if (typeof (data.rro_id) === 'string') {
                    data.rro_id = data.rro_id.ljust(33)
                } else if (typeof (data.rro_id) === 'number') {
                    data.rro_id = String(data.rro_id).ljust(33)
                }
                data.datetime = ('Дата та час здiйснення операцiї ' + data.date + ' ' + data.time).ljust(62)
                data.type = data.type.ljust(44)
                data.max_buy = (data.max_buy + ' гривень.').ljust(62)
                data.client = data.client.replaceAll(' ', '_').cjust(61, '_')
                data.received = data.received.cjust(20)
                data.rate = data.rate.cjust(12)
                data.give = data.give.cjust(20)
                return data
            },
            accounting_statement: function (data) {
                data.company = data.company.wrapText(46, ' ')
                data.full_name = data.full_name.wrapText(62, ' ')
                data.address = data.address.wrapText(62, ' ')
                $.each(data.currencies, function (k, v) {
                    v.ind = String(v.ind).cjust(4)
                    v.code = String(v.code).cjust(4)
                    v.initial = String(v.initial.toFixed(2)).cjust(9)
                    v.advance = String(v.advance.toFixed(2)).cjust(11)
                    v.income = String(v.income.toFixed(2)).cjust(9)
                    v.bought = String(v.bought.toFixed(2)).cjust(9)
                    v.sold = String(v.sold.toFixed(2)).cjust(9)
                    v.endday = String(v.endday.toFixed(2)).cjust(9)
                    v.intraday = String(v.intraday.toFixed(2)).cjust(9)
                    v.current = String(v.current.toFixed(2)).cjust(11)
                })
                return data
            },
            certificate: function (data) {
                data.company = data.company.wrapText(100, ' ')
                data.full_name = data.full_name.wrapText(100, ' ')
                data.address = data.address.wrapText(100, ' ')
                data.amount = data.amount.replaceAll(' ', '_').cjust(79, '_')
                data.equivalent = data.equivalent.replaceAll(' ', '_').cjust(79, '_')
                data.client = data.client.replaceAll(' ', '_').cjust(41, '_')
                data.country = data.country.replaceAll(' ', '_').cjust(41, '_')
                return data
            },
            cashflow: function (data) {
                data.address = data.address.wrapText(62, ' ')
                data.currency = data.currency.cjust(16)
                data.up_opname = data.up_opname.cjust(12)
                data.low_opname = data.low_opname.cjust(12)
                data.up_acc = String(data.up_acc).cjust(24)
                data.low_acc = String(data.low_acc).cjust(24)
                data.amount = String(data.amount).cjust(24)
                data.collector = data.collector.replaceAll(' ', '_').cjust(80, '_')
                data.total_words = data.total_words.replaceAll(' ', '_').cjust(80, '_')
                data.zmist = data.zmist.replaceAll(' ', '_').cjust(80, '_')
                data.collector_doc = data.collector_doc.replaceAll(' ', '_').cjust(80, '_')
                data.income_class = data.income_class.replace('underlined', '<<<:27-45-01:>>>')
                data.income_class_end = data.income_class.replace('<<<:27-45-01:>>>', '<<<:27-45-00:>>>')
                data.outcome_class = data.outcome_class.replace('underlined', '<<<:27-45-01:>>>')
                data.outcome_class_end = data.outcome_class.replace('<<<:27-45-01:>>>', '<<<:27-45-00:>>>')
                return data
            },
            register: function (data) {
                data.address = data.address.wrapText(62, ' ')
                data.full_name = data.full_name.wrapText(100, ' ')

                $.each(data.operations, function (k, v) {
                    v.num = String(v.num).cjust(4, ' ')
                    v.amount = String(v.amount.toFixed(2)).cjust(9, ' ')
                    v.rate = String(v.rate.toFixed(6)).cjust(10, ' ')
                    v.equivalent = String(v.equivalent.toFixed(2)).cjust(11, ' ')
                    v.certificate_code = v.certificate_code ? v.certificate_code.cjust(17, ' ') : '				  '
                    if (typeof (v.rro_id) === 'string') {
                        v.rro_id = v.rro_id.cjust(15, ' ')
                    } else if (typeof (v.rro_id) === 'number') {
                        v.rro_id = String(v.rro_id).cjust(15, ' ')
                    }
                    v.storno = v.storno ? v.storno.rjust(8) : '        '
                })
                $.each(data.totals, function (k, v) {
                    v.currency = String(v.currency).cjust(9, ' ')
                    v.amount = String(v.amount.toFixed(2)).cjust(16, ' ')
                    v.equivalent = (String(v.equivalent.toFixed(2)) + ' грн.').cjust(28, ' ')
                })
                data.big_total = (String(data.big_total.toFixed(2)) + ' грн.').cjust(28, ' ')

                // data.equivalent = data.equivalent.replaceAll(' ', '_').cjust(79, '_')
                // data.client = data.client.replaceAll(' ', '_').cjust(41, '_')
                // data.country = data.country.replaceAll(' ', '_').cjust(41, '_')
                return data
            },
        }

        var data = report[doctype](params)

        var html = Mustache.render(MATRIX_TEMPLATES[doctype], prepareData[doctype](data))

        var settings = __getPrintingSettings()
        var printer = (doctype == 'exchange') ? settings.receipt_printer : settings.doc_printer
        printer = printer ? decodeURIComponent(printer) : 'POS-58'

        if (is_short) {
            html = '<<<:27-112-0-15:>>>' + html
        } else {
            html = '   ' + html.replaceAll('\n', '\n   ')
        }
        // TESTING:
        // console.log(html)
        // return $.Deferred().resolve()

        return remote_call('printMatrixCP866u', [html, printer])
    }

    PRINTING_SYSTEMS['matrix'] = function (doctype, params) {
        return printMatrix(doctype, params, false)
    }
    PRINTING_SYSTEMS['matrix_short'] = function (doctype, params) {
        return printMatrix(doctype, params, true)
    }
}

LocksModule = function () {
    LOADED_MODULES.push('locks')
    TIMELAG = 3
    LOCKS = {}

    exchange = JSON.parse(localStorage.getItem('exchange_operations'))
    if (exchange.length > 0) {
        LOCKS.exchange = moment(exchange.slice(-1)[0].operation_time)
    }

    inouts = JSON.parse(localStorage.getItem('cashflow_operations'))
    if (inouts.length > 0) {
        LOCKS.inout = moment(inouts.slice(-1)[0].operation_time)
    }

    rates = JSON.parse(localStorage.getItem('today_rates'))
    if (rates.length > 0) {
        LOCKS.rates = moment(rates.slice(-1)[0].rates_time)
    }

    var implement_lag = function (fns, lock) {
        return function (data) {
            if (!lock || ActualTime().diff(lock, 'seconds') > TIMELAG) {
                lock = ActualTime()
                return fns(data)
            } else {
                console.log('alert');
                alert('Не можна проводити операції частіше ніж раз на ' + TIMELAG + ' секунди')
            }
        }
    }

    buysellClass.prototype.send = implement_lag(buysellClass.prototype.send, LOCKS.exchange)
    inoutClass.prototype.send = implement_lag(inoutClass.prototype.send, LOCKS.inout)
    ratesClass.prototype.send = implement_lag(ratesClass.prototype.send, LOCKS.rates)
}

SettingsModule = function () {
    LOADED_MODULES.push('settings')

    var settings_html =
        '<div class="component">' +
        '<div class="form-group row">'

    var department_details = JSON.parse(localStorage.getItem('department_details'))
    var rro_type = department_details.rro_type
    if (rro_type != 'rro')  {
        settings_html = settings_html +
            '<div class="col-md-6">' +
            '<label class="col-md-12" control-label centered" for="checkboxes">' +
            '<h4>Принтер чеків, X та Z звітів</h4>' +
            '</label>' +
            // '<label class="control-label" for="receipt_printer">Принтер</label>' +
            '<select id="receipt_printer" name="receipt_printer" class="form-control">' +
            '<option value="chrome">-- браузер --</option>' +
            '</select>' +
            '<label class="control-label">Тип</label>' +
            '<select class="form-control" id="receipt_printer_type" name="receipt_printer_type" >' +
            '<option value="chrome">звичайний</option>' +
            '<option value="thermo58_1">термо 58 mm роздільні сторінки</option>' +
            '<option value="thermo58_2">термо 58 mm одна сторінка</option>' +
            '<option value="thermo80">термо 80 mm</option>'
        if (rro_type == 'rkks') {
            settings_html = settings_html +
            '<option value="2_thermo58_1">термо 58 mm роздільні сторінки варіант 2</option>' +
            '<option value="2_thermo58_2">термо 58 mm одна сторінка варіант 2</option>' +
            '<option value="2_thermo80">термо 80 mm вариант 2</option>'
        }
        settings_html = settings_html +
            // '<option value="matrix">матричний</option>' +
            // '<option value="matrix_short">матричний вузький</option>' +
            '</select>' +
            '</div>'
    }

    settings_html = settings_html +
        '<div class="col-md-6">' +
        '<label class="col-md-12" control-label centered" for="checkboxes">' +
        '<h4>Принтер документів</h4>' +
        '</label>' +
        // '<label class="control-label" for="doc_printer">Принтер</label>' +
        '<select id="doc_printer" name="doc_printer" class="form-control">' +
        '<option value="chrome">-- браузер --</option>' +
        '</select>' +
        '<label class="control-label">Тип</label>' +
        '<select class="form-control" id="doc_printer_type" name="doc_printer_type" >' +
        '<option value="chrome">звичайний</option>' +
        // '<option value="thermo58">термо 58 mm</option>' +
        // '<option value="thermo80">термо 80 mm</option>' +
        // '<option value="matrix_short">матричний вузький</option>' +
        // '<option value="matrix">матричний</option>' +
        '</select>' +
        '</div>				' +
        '<div class="col-md-6">' +
        '<h4>Інші налаштування</h4>' +
        '<div class="checkbox">' +
        '<label for="receipt_printer_double">' +
        '<input type="checkbox" name="receipt_printer_double" id="receipt_printer_double" value="y">' +
        'Автоматична підстановка валюти' +
        '</label>' +
        '</div>' +
        '<div class="checkbox">' +
        '<label for="doc_printer_double">' +
        '<input type="checkbox" name="doc_printer_double" id="doc_printer_double" value="y">' +
        'Відображати всі операції' +
        '</label>' +
        '</div>' +
        '</div>				' +
        '</div>' +
        '</div>'

    modal = $.createModal(
        'settingsModal',
        btn_id = 'saveSettings',
        footer = true,
        bnt_caption = 'Зберегти',
        title = 'Налаштування'
    ).on('shown.bs.modal', function () {
        $(this).find('select').eq(0).focus()
    });

    modal.find('.modal-body').html(settings_html)

    var update_settings = function () {
        var settings = feroksoft.deSerialize($("#settingsModal").find("select, textarea, input").serialize())

        $('#settingsModal')
            .find('input[type=checkbox]:not(:checked)')
            .map(function () {
                settings[this.name] = 'n'
            })

        return $.ajax({
            type: "POST",
            url: 'settings',
            data: JSON.stringify({printer_settings: JSON.stringify(settings)}),//{'printer_settings':settings}),
            dataType: 'json',
            contentType: 'application/json',
            success: function (ret) {
                if (typeof ret.errors !== 'undefined') {
                    //modal_win.find('.alert-warning').remove()
                    if (typeof ret.errors.general !== 'undefined') {
                        console.log('alert');
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                } else if (ret.status == 'success') {
                    localStorage.clear();
                    window.location = '/'
                }
            }
        })
    }

    var populate = function (form) {
        current_settings = __getPrintingSettings()
        $.each(DEFAULT_SETTINGS, function (k, v) {
            var current_value = typeof current_settings[k] == 'undefined' ? v : decodeURIComponent(current_settings[k])
            var element = form.find('[name=' + k + ']')
            // $("#settingsModal").find('[name=receipt_printer]')
            if (element.attr("type") === 'checkbox') {
                if (current_value != 'n') {
                    element.val(current_value)
                    element.prop("checked", true)
                }
            } else {
                element.val(current_value)
            }
        })
    }

    var populatePrinters = function (ret) {
        var form = $("#settingsModal")
        var dp = form.find('#doc_printer').html('').append($("<option>").val('chrome').html('-- браузер --'))
        var rp = form.find('#receipt_printer').html('').append($("<option>").val('chrome').html('-- браузер --'))
        $.each(ret[0], function (k, v) {
            dp.append($("<option>").val(k).html(k))
            rp.append($("<option>").val(k).html(k))
        })
    }

    $('#settingsModal #saveSettings').click(update_settings)

    var settings = JSON.parse(localStorage.getItem('general_settings'))

    if (settings.DESIGN == 1) {
        $.addNavButton('showSettings', 'Налаштування &nbsp&nbsp')
        $('#showSettings')
            .click(function () {
                var modal = $("#settingsModal")

                remote_call('printerList', [])
                    .then(populatePrinters)
                    .always(function () {
                        populate(modal)
                        displayModal(modal)
                    })
            }).removeClass('btn-default').addClass('btn-info').append($('<i>').addClass("glyphicon glyphicon-cog"))
    } else {
        $('#showSettings')
            .click(function () {
                var modal = $("#settingsModal")

                remote_call('printerList', [])
                    .then(populatePrinters)
                    .always(function () {
                        populate(modal)
                        displayModal(modal)
                    })
            }).removeClass('btn-default').addClass('btn-link').append($('<i>').addClass("glyphicon glyphicon-cog"))
    }
}

GlobalBlock = function () {
    GLOBAL_BLOCK = {}
    LOADED_MODULES.push('global_block')

    imposeBlock = function (blktype, msg) {
        if (GLOBAL_BLOCK[blktype] == msg && $(".blockOverlay").length !== 0) {
            return
        }
        GLOBAL_BLOCK[blktype] = msg
        $('ul.nav.navbar-nav .btn-default').hide()
        $.blockUI({
            message: $('<p>').html(msg),
            css: {
                border: 'none',
                padding: '15px',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: .5,
                color: '#fff'
            }
        });

        // console.log('alert'); alert('Программу заблоковано')
    }

    releaseBlock = function (blktype) {

        if (limit_block == false) {
            GLOBAL_BLOCK[blktype] = false
            $('ul.nav.navbar-nav .btn-default').show()
            $.unblockUI()
            $.each(GLOBAL_BLOCK, function (k, v) {
                if (v != false) {
                    GLOBAL_BLOCK[v] = false
                    imposeBlock(k, v)
                    console.log(k)
                    return false
                }
            })
        }
        // console.log('alert'); alert('Программу розблоковано')
    }
};

ActualTimeModule = function () {
    var API_NAME = 'actual_time'

    ActualTime = function () {
        var x = JSON.parse(localStorage.getItem(API_NAME))
        try {
            var time_diff = moment(x.client_time).diff(moment(x.server_time))
            return moment(moment() - moment.duration(time_diff))
        } catch (error) {
            return null
        }
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    checkTime = function () {
        var config = JSON.parse(localStorage.getItem('general_settings'))
        var operations = JSON.parse(localStorage.getItem('exchange_operations'))

        actual_time = ActualTime()

        if (actual_time == null) {
            return false
        }
        var today_oper_date = actual_time.hour(config.OPER_DATE_HOUR).minute(config.OPER_DATE_MINUTE).second(0)

        var start_oper_date = actual_time.hour(config.OPER_DATE_HOUR).minute(config.OPER_DATE_MINUTE).second(0)

        if (ActualTime().diff(moment(start_oper_date), 'seconds') < 0) {
            start_oper_date = addDays(start_oper_date, -1)
        }

        // var today_oper_date_block = ActualTime().hour(config.OPER_DATE_HOUR).minute(config.OPER_DATE_MINUTE).second(0)
        // today_oper_date_block.subtract(config.STORNO_MAX_DELAY, 's')
        // if(ActualTime() < today_oper_date && ActualTime() > today_oper_date_block){
        // 	var msg = 'Робота заблокована, іде перезмінка'
        // 	console.log(msg)
        // 	if(LOADED_MODULES.indexOf('global_block') > -1){
        // 		imposeBlock('preopen', msg)
        // 	}
        // }
        //console.log(today_oper_date)
        $('#op_date').html($.isoDateToUADate(start_oper_date))
        $('#web_time').html($.isoDateToTime(ActualTime()))

        // перевірка, щоб оновити сторінку о 9:00, без оновлення
        $.each(operations, function (k, v) {
            if (moment(v.operation_time) < today_oper_date && ActualTime() > today_oper_date) {

                //updateLS(api_to_load, separately=false).done(function(){
                updateLS(['actual_time', 'balance', 'nbu_rates', 'company_rates', 'today_rates'], separately = false).done(function () {
                    localStorage.setItem('exchange_operations', []);
                    localStorage.setItem('cashflow_operations', []);
                    // if(LOADED_MODULES.indexOf('global_block') > -1){releaseBlock('preopen')}
                    //console.log('updateFront')
                    updateFront()

                    if (LOADED_MODULES.indexOf('archive') != -1) {
                        $('#doc_date').data('daterangepicker').setStartDate(today_oper_date)
                        $('#doc_date').data('daterangepicker').setEndDate(today_oper_date)
                    }

                    //console.log('alert'); alert('Відкрито новий операційний день')
                    if (LOADED_MODULES.indexOf('rro') != -1) {
                        get_closed_day()
                    }
                    if (LOADED_MODULES.indexOf('rkks') != -1) {
                        get_closed_day()
                    }
                })
                return false;
            }
        })
    }
    return $.getJSON('api/department/' + API_NAME, function (response) {
        if (typeof response.errors !== 'undefined') {
            if (typeof response.errors.general !== 'undefined') {
                console.log('alert');
                alert(response.errors.general)
                if (typeof response.errors.redirect !== 'undefined') {
                    window.location = response.errors.redirect;
                }
            }
        } else {
            response.client_time = moment().toISOString()
            localStorage.setItem(API_NAME, JSON.stringify(response));
        }
    }).then(function () {
        setInterval(checkTime, 1000)
    })
}

