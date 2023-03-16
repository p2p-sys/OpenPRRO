ActualTime = moment

getArchiveData = function (without_archive) {
    //var without_archive = typeof without_archive !== 'undefined' ? without_archive : false;
    without_archive = false

    var key = $('#doc_date').data('daterangepicker').startDate.format('YYYY-MM-DD')
    var is_today = key == __bank_day_started().format('YYYY-MM-DD')

    if (((is_today) && (LOADED_MODULES.indexOf('archive') != -1)) || without_archive) {
        // return {
        //     'balance': JSON.parse(localStorage.getItem('balance')),
        //     'cashflow_operations': JSON.parse(localStorage.getItem('cashflow_operations')), //__getNotRefusedCashflows(),
        //     'exchange_operations': JSON.parse(localStorage.getItem('exchange_operations')),
        //     'payment_operations': JSON.parse(localStorage.getItem('payment_operations')),
        //     'nbu_rates': JSON.parse(localStorage.getItem('nbu_rates')),
        //     'company_rates': JSON.parse(localStorage.getItem('company_rates')),
        //     'today_rates': JSON.parse(localStorage.getItem('today_rates')),
        //     'report_date': moment(key, 'YYYY-MM-DD').toDate(),
        // }

        // var doc_date = $('#doc_date').data('daterangepicker').startDate
        // var data = {
        //     startDate: doc_date.format('YYYY-MM-DD HH:mm:ss')//._d.toUTCString(), //Sat, 09 Jun 2018 00:00:00 GMT
        //     // endDate : $('#doc_date').data('daterangepicker').endDate._d,
        // }
        //
        // var key = doc_date.format('YYYY-MM-DD')
        // var arch = localStorage.getItem('archive')
        // if (!arch) {
        //     arch = {}
        // } else {
        //     arch = JSON.parse(arch)
        // }

        var data = {
            startDate: $('#doc_date').data('daterangepicker').startDate.format('YYYY-MM-DD HH:mm:ss')//._d.toUTCString(), //Sat, 09 Jun 2018 00:00:00 GMT
            // endDate : $('#doc_date').data('daterangepicker').endDate._d,
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
                // var archive = data
                // console.log(archive)
                // archive['report_date'] = moment(key, 'YYYY-MM-DD').toDate()
                // return archive
                var arch = localStorage.getItem('archive')
                if (!arch) {
                    arch = {}
                } else {
                    arch = JSON.parse(arch)
                }
                arch[key] = data
                localStorage.setItem('archive', JSON.stringify(arch))
            }
        }

        $.ajax({
            type: "GET",
            url: 'api/archive',
            data: data,
            contentType: 'application/json',
            async: false,
            success: onSuccess
        });
       var archive = localStorage.getItem('archive') ? JSON.parse(localStorage.getItem('archive')) : {}
        //console.log(key)
        //console.log(archive)
        archive[key]['report_date'] = moment(key, 'YYYY-MM-DD').toDate()
        return archive[key]

    }
    var archive = localStorage.getItem('archive') ? JSON.parse(localStorage.getItem('archive')) : {}
    //console.log(key)
    //console.log(archive)
    archive[key]['report_date'] = moment(key, 'YYYY-MM-DD').toDate()
    return archive[key]
}

report = new function () {
    this.cash_book = function (data, without_archive) {
        data = typeof data !== 'undefined' ? data : {'double': true};
        // without_archive = typeof without_archive !== 'undefined' ? without_archive : false;
        without_archive = false;
        var DAT = getArchiveData(without_archive)
        // console.log()

        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))
        operator = JSON.parse(localStorage.getItem('operator'))

        data.columns = [{num: 1, clas: ''}]//, {num:2, clas:' column-right'}]
        data.company = config.COMPANY_FULL_NAME
        data.full_name = department.full_name//full_name
        data.address = department.address
        data.date = $.isoDateToUADate(DAT.report_date)
        data.operator = operator.person

        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = DAT.report_date - start;
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);

        data.day_of_year = day;

        data.currencies = [];
        $.each(DAT.balance, function (i, v) {
            entry = {}
            entry.currency_id = v.currency_id
            entry.code = $.pad($.grep(currencies, function (n, i) {
                return n.id == v.currency_id
            })[0].numcode, 3)
            entry.strcode = __getCurrencyCode(v.currency_id)
            entry.endday = 0
            entry.current = feroksoft.money_round(v.balance + v.frozen_balance, 2)

            var sumOps = function (entry, fiscalized) {
                var entry = typeof entry !== 'undefined' ? entry : {};
                var fiscalized = typeof fiscalized !== 'undefined' ? fiscalized : true;
                if (typeof DAT.payment_operations !== 'undefined') {
                    payments = $.getMovement(v.currency_id, DAT.payment_operations, true, 'payment_amount', true, fiscalized, false)
                    cancel_payments = $.getPaymentCancelMovement(v.currency_id, DAT.payment_operations, true, 'payment_amount', true, fiscalized, false)
                } else {
                    payments = 0
                    cancel_payments = 0
                }
                entry.income = $.getMovement(v.currency_id, DAT.cashflow_operations, true, 'money_amount', true, fiscalized, true) + payments
                entry.intraday = $.getMovement(v.currency_id, DAT.cashflow_operations, false, 'money_amount', true, fiscalized, true)
                if (v.currency_id == config.UAH_ID) {
                    entry.bought = $.getMovement(v.currency_id, DAT.exchange_operations, true, 'equivalent', false, fiscalized, false)
                    entry.sold = $.getMovement(v.currency_id, DAT.exchange_operations, false, 'equivalent', false, fiscalized, false)
                } else {
                    entry.bought = $.getMovement(v.currency_id, DAT.exchange_operations, true, 'currency_amount', true, fiscalized, false)
                    entry.sold = $.getMovement(v.currency_id, DAT.exchange_operations, false, 'currency_amount', true, fiscalized, false)
                }
                entry.income = feroksoft.money_round(entry.income, 2)
                entry.bought = feroksoft.money_round(entry.bought, 2)
                entry.sold = feroksoft.money_round(entry.sold, 2)
                entry.intraday = feroksoft.money_round(entry.intraday + cancel_payments, 2)
                return entry
            }

            // Віднімаємо нефіскалізовані операції від поточних залишків для Авансів, звітної та таблиці статусу
            // Щоб можна було передати аванси після проведення операції на сервері, але до фіскалізації
            nonfsc = sumOps({}, false)
            entry.current = feroksoft.money_round(entry.current - nonfsc.income + nonfsc.intraday - nonfsc.bought + nonfsc.sold)

            // currency_id, operations, income, key, check_currency, fiscal_only, confirmed_only

            entry = sumOps(entry, true)

            entry.initial = feroksoft.money_round(0, 2)
            entry.advance = feroksoft.coin_round((entry.current - entry.income + entry.intraday - entry.bought + entry.sold) * 100, 2)

            entry.bought = feroksoft.coin_round((entry.bought + entry.income) * 100, 2)
            entry.sold = feroksoft.coin_round((entry.sold + entry.intraday) * 100, 2)

            entry.current = feroksoft.coin_round((entry.current + entry.endday) * 100, 2)

            operations = [];
            op_count_in = 0;
            op_count_out = 0;
            $.each(__getUserExchanges(DAT.exchange_operations), function (i, v) {
                condition = (v.currency_amount > 0) || (v.currency_amount < 0)
                if (condition && (v.fiscal_time != null) && (v.storno_time == null) && (v.fiscal_storno_time == null) && (v.fiscal_time)) {
                    new2019 = new Date("2019-01-01T09:00")
                    if (new Date(v.fiscal_time) >= new2019) {
                        num_eop = v.num_eop
                    } else {
                        num_eop = v.virtual_id
                    }
                    if (entry.currency_id == config.UAH_ID) {
                        if (v.equivalent > 0) {
                            currency_in = Math.abs(v.equivalent);
                            currency_out = 0;
                            op_count_in += 1;
                        } else {
                            currency_in = 0;
                            currency_out = Math.abs(v.equivalent);
                            op_count_out += 1;
                        }
                        var operation = {
                            time: v.fiscal_time,
                            currency: $.grep(currencies, function (n, i) {
                                return n.id == v.currency_id
                            })[0].code,
                            code: $.pad($.grep(currencies, function (n, i) {
                                return n.id == v.currency_id
                            })[0].numcode, 3),
                            currency_in: feroksoft.coin_round(currency_in * 100, 2),
                            currency_out: feroksoft.coin_round(currency_out * 100, 2),
                            rro_id: v.virtual_id, // v.rro_id ? v.rro_id :
                            num_eop: num_eop, // v.rro_id ? v.rro_id :
                            client: v.client,
                            dt: '333'
                        }
                        operations.push(operation)
                    } else if (entry.currency_id === v.currency_id) {

                        if (v.equivalent < 0) {
                            currency_in = Math.abs(v.currency_amount);
                            currency_out = 0;
                            op_count_in += 1;
                        } else {
                            currency_in = 0;
                            currency_out = Math.abs(v.currency_amount);
                            op_count_out += 1;
                        }

                        var operation = {
                            time: v.fiscal_time,
                            currency: $.grep(currencies, function (n, i) {
                                return n.id == v.currency_id
                            })[0].code,
                            code: $.pad($.grep(currencies, function (n, i) {
                                return n.id == v.currency_id
                            })[0].numcode, 3),
                            currency_in: feroksoft.coin_round(currency_in * 100, 2),
                            currency_out: feroksoft.coin_round(currency_out * 100, 2),
                            rro_id: v.virtual_id, // v.rro_id ? v.rro_id :
                            num_eop: num_eop, // v.rro_id ? v.rro_id :
                            client: v.client,
                            dt: '333'
                        }
                        operations.push(operation)
                        // TESTING
                        // for (i = 0; i < 80; i++) { data.operations.push(operation)}
                    }
                }
            })
            // console.log(DAT.cashflow_operations)
            $.each(__getUserCashflows(DAT.cashflow_operations), function (i, v) {
                // if (entry.currency_id == config.UAH_ID) {
                    condition = (v.money_amount > 0) || (v.money_amount < 0)
                    if (condition && (v.operation_time != null) && (v.confirmation_time != null) && (v.refusal_time == null) && (v.fiscal_time != null) && (v.fiscal_time)) {
                        //if (condition) {
                        if (entry.currency_id === v.currency_id) {
                            if (v.money_amount > 0) {
                                currency_in = Math.abs(v.money_amount);
                                currency_out = 0;
                                op_count_in += 1;
                            } else {
                                currency_in = 0;
                                currency_out = Math.abs(v.money_amount);
                                op_count_out += 1;
                            }
                            if (v.operation_type == 5) {
                                dt = '375'
                            } else {
                                dt = '333'
                            }
                            var operation = {
                                time: v.fiscal_time,
                                currency: $.grep(currencies, function (n, i) {
                                    return n.id == v.currency_id
                                })[0].code,
                                code: $.pad($.grep(currencies, function (n, i) {
                                    return n.id == v.currency_id
                                })[0].numcode, 3),
                                currency_in: feroksoft.coin_round(currency_in * 100, 2),
                                currency_out: feroksoft.coin_round(currency_out * 100, 2),
                                rro_id: v.id, // v.rro_id ? v.rro_id :
                                num_eop: v.id, // v.rro_id ? v.rro_id :
                                client: '',
                                dt: dt
                            }
                            operations.push(operation)
                        }
                        // TESTING
                        // for (i = 0; i < 80; i++) { data.operations.push(operation)}
                    }
                // }
            })
            $.each(__getUserPayments(DAT.payment_operations), function (i, v) {
                if (entry.currency_id == config.UAH_ID) {
                    condition = (v.payment_amount > 0) || (v.payment_amount < 0)
                    if (condition && (v.operation_time != null) && (v.fiscal_time != null) && (v.fiscal_time)) {
                        //if (condition) {
                        if (!v.cancel_time) {
                            currency_in = Math.abs(v.payment_amount);
                            currency_out = 0;
                            op_count_in += 1;
                        } else {
                            currency_in = Math.abs(v.payment_amount);
                            currency_out = Math.abs(v.payment_amount);
                            op_count_out += 1;
                        }
                        dt = '333'
                        var operation = {
                            time: v.fiscal_time,
                            currency: $.grep(currencies, function (n, i) {
                                return n.id == v.currency_id
                            })[0].code,
                            code: $.pad($.grep(currencies, function (n, i) {
                                return n.id == v.currency_id
                            })[0].numcode, 3),
                            currency_in: feroksoft.coin_round(currency_in * 100, 2),
                            currency_out: feroksoft.coin_round(currency_out * 100, 2),
                            rro_id: v.id, // v.rro_id ? v.rro_id :
                            num_eop: v.real_id, // v.rro_id ? v.rro_id :
                            client: '',
                            dt: dt
                        }
                        operations.push(operation)
                        // TESTING
                        // for (i = 0; i < 80; i++) { data.operations.push(operation)}
                    }
                }
            })

            function sortBy(field) {
                return function (a, b) {
                    var aa = Date.parse(a[field]);
                    var bb = Date.parse(b[field]);
                    //console.log(aa)
                    //console.log(bb)
                    if (aa > bb) {
                        //console.log('aa > bb')
                        return 1;
                    } else if (aa < bb) {
                        //console.log('aa < bb')
                        return -1;
                    }
                    return 0;
                };
            }

            // console.log(operations);
            operations.sort(sortBy("time"));
            //console.log(operations);
            entry.operations = operations;

            data.currencies.push(entry)
            entry.opcount_in = feroksoft.intToWords(op_count_in)
            entry.opcount_out = feroksoft.intToWords(op_count_out)

        })


        var order = [].concat(CURRENCY_ORDER).reverse()
        data.currencies.pySort(function (a) {
            return order.indexOf(a.strcode)
        })
        $.each(data.currencies, function (i, v) {
            v.ind = i + 1
        })
        return data
    }

    this.accounting_statement = function (data, without_archive) {
        data = typeof data !== 'undefined' ? data : {'double': true};
        without_archive = typeof without_archive !== 'undefined' ? without_archive : false;
        // console.log('Запрос 352')
        var DAT = getArchiveData(without_archive)
        // console.log(DAT)

        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))
        operator = JSON.parse(localStorage.getItem('operator'))

        data.columns = [{num: 1, clas: ''}]//, {num:2, clas:' column-right'}]
        data.company = config.COMPANY_FULL_NAME
        data.full_name = department.full_name//full_name
        data.address = department.address
        // data.date = $.isoDateToUADate(DAT.report_date)
        data.date = $.isoDateToUADate($('#doc_date').data('daterangepicker').startDate)
        data.operator = operator.person

        data.currencies = []
        $.each(DAT.balance, function (i, v) {
            entry = {}
            entry.currency_id = v.currency_id
            entry.code = $.pad($.grep(currencies, function (n, i) {
                return n.id == v.currency_id
            })[0].numcode, 3)
            entry.strcode = __getCurrencyCode(v.currency_id)
            entry.endday = 0
            entry.current = feroksoft.money_round(v.balance + v.frozen_balance, 2)

            var sumOps = function (entry, fiscalized) {
                var entry = typeof entry !== 'undefined' ? entry : {};
                var fiscalized = typeof fiscalized !== 'undefined' ? fiscalized : true;
                //console.log(DAT.payment_operations)
                if (typeof DAT.payment_operations !== 'undefined') {
                    // payments = $.getPaymentMovement(v.currency_id, DAT.payment_operations, true, 'payment_amount', true, true, false)
                    payments = $.getMovement(v.currency_id, DAT.payment_operations, true, 'payment_amount', true, fiscalized, false)
                    cancel_payments = $.getPaymentCancelMovement(v.currency_id, DAT.payment_operations, true, 'payment_amount', true, fiscalized, false)
                } else {
                    payments = 0
                    cancel_payments = 0
                }
                entry.income = $.getMovement(v.currency_id, DAT.cashflow_operations, true, 'money_amount', true, fiscalized, true) + payments
                entry.intraday = $.getMovement(v.currency_id, DAT.cashflow_operations, false, 'money_amount', true, fiscalized, true)
                if (v.currency_id == config.UAH_ID) {
                    entry.bought = $.getMovement(v.currency_id, DAT.exchange_operations, true, 'equivalent', false, fiscalized, false)
                    entry.sold = $.getMovement(v.currency_id, DAT.exchange_operations, false, 'equivalent', false, fiscalized, false)
                } else {
                    entry.bought = $.getMovement(v.currency_id, DAT.exchange_operations, true, 'currency_amount', true, fiscalized, false)
                    entry.sold = $.getMovement(v.currency_id, DAT.exchange_operations, false, 'currency_amount', true, fiscalized, false)
                }
                entry.income = feroksoft.money_round(entry.income, 2);
                entry.bought = feroksoft.money_round(entry.bought, 2)
                entry.sold = feroksoft.money_round(entry.sold, 2)
                entry.intraday = feroksoft.money_round(entry.intraday + cancel_payments, 2)
                return entry
            }

            // Віднімаємо нефіскалізовані операції від поточних залишків для Авансів, звітної та таблиці статусу
            // Щоб можна було передати аванси після проведення операції на сервері, але до фіскалізації
            nonfsc = sumOps({}, false)

            //entry.current = feroksoft.money_round(entry.current+nonfsc.income-nonfsc.intraday+nonfsc.bought-nonfsc.sold)
            entry.current = feroksoft.money_round(entry.current)

            // currency_id, operations, income, key, check_currency, fiscal_only, confirmed_only

            entry = sumOps(entry, true)

            entry.advance = feroksoft.money_round(entry.current - entry.income + entry.intraday - entry.bought + entry.sold, 2)
            entry.initial = feroksoft.money_round(0, 2)

            data.currencies.push(entry)
        })

        var order = [].concat(CURRENCY_ORDER).reverse()
        data.currencies.pySort(function (a) {
            return order.indexOf(a.strcode)
        })
        $.each(data.currencies, function (i, v) {
            v.ind = i + 1
        })
        type5 = false
        $.each(DAT.cashflow_operations, function (i, v) {
            condition = (v.money_amount > 0) || (v.money_amount < 0)
            if (condition && (v.operation_time != null) && (v.confirmation_time != null) && (v.refusal_time == null) && (v.fiscal_time != null) && (v.fiscal_time)) {
                if (v.operation_type == 5) {
                    type5 = true
                }
            }
        })
        if (type5) {
            data.text_deficit_top = '*'
            data.text_deficit_bottom = '* Нестача валюти'
        } else {
            data.text_deficit_top = ''
            data.text_deficit_bottom = ''
        }

        return data
    }
    this.accounting_statement_2019 = this.accounting_statement

    this.dodatok1 = function (data, without_archive) {
        //console.log(data)
        data = typeof data !== 'undefined' ? data : {'double': false};
        var DAT = getArchiveData()
        //console.log(DAT)

        activeDepartments()
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        data.order_num = DAT.company_rates.meta.order_num
        data.time = $.isoDateToTime(DAT.company_rates.meta.rates_time)
        data.date = $.isoDateToUADate(new Date(DAT.company_rates.meta.rates_time))

        data.company = config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.department = department.address//full_name
        data.full_name = department.full_name

        if (new Date(DAT.company_rates.meta.rates_time) > new Date(config.NEW_CEO_DATE)) {
            data.director = config.COMPANY_CEO2
            data.STAMP_WIDTH = config.STAMP_WIDTH2
            data.STAMP_HEIGHT = config.STAMP_HEIGHT2
            data.STAMP_IMAGE = config.STAMP_IMAGE2 // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE2
        } else {
            data.director = config.COMPANY_CEO
            data.STAMP_WIDTH = config.STAMP_WIDTH
            data.STAMP_HEIGHT = config.STAMP_HEIGHT
            data.STAMP_IMAGE = config.STAMP_IMAGE // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE
        }
        data.LOGO_IMAGE = config.LOGO_IMAGE //config.LOGO_IMAGE
        data.LOGO_WIDTH = config.LOGO_WIDTH
        data.LOGO_HEIGHT = config.LOGO_HEIGHT
        data.legal_number = department.id

        data.currencies = []
        active_departments = JSON.parse(localStorage.getItem('active_departments'))
        //console.log(active_departments)

        active_departments_str = ''
        $.each(active_departments, function (k, v) {
            if (k == 0) {
                active_departments_str = '  ' + v
            } else {
                active_departments_str = active_departments_str + ', ' + v
            }
        })
        data.active_departments = active_departments_str
        data.region_id = department.region_id

        return data
    }

    this.local_dodatok1 = function (data, without_archive) {
        data = typeof data !== 'undefined' ? data : {'double': false};
        var DAT = getArchiveData()
        //console.log(DAT)

        activeDepartments()
        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        data.order_num = DAT.company_rates.meta.order_num
        data.time = $.isoDateToTime(DAT.company_rates.meta.rates_time)
        data.date = $.isoDateToUADate(new Date(DAT.company_rates.meta.rates_time))

        data.company = config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.department = department.address//full_name
        data.full_name = department.full_name
        if (new Date(DAT.company_rates.meta.rates_time) > new Date(config.NEW_CEO_DATE)) {
            data.director = config.COMPANY_CEO2
            data.STAMP_WIDTH = config.STAMP_WIDTH2
            data.STAMP_HEIGHT = config.STAMP_HEIGHT2
            data.STAMP_IMAGE = config.STAMP_IMAGE2 // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE2
        } else {
            data.director = config.COMPANY_CEO
            data.STAMP_WIDTH = config.STAMP_WIDTH
            data.STAMP_HEIGHT = config.STAMP_HEIGHT
            data.STAMP_IMAGE = config.STAMP_IMAGE // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE
        }
        data.LOGO_IMAGE = config.LOGO_IMAGE //config.LOGO_IMAGE
        data.LOGO_WIDTH = config.LOGO_WIDTH
        data.LOGO_HEIGHT = config.LOGO_HEIGHT
        data.legal_number = department.id

        data.currencies = []
        active_departments = JSON.parse(localStorage.getItem('active_departments'))
        //console.log(active_departments)

        data.active_departments = department.full_name
        data.region_id = department.region_id

        var order = [].concat(CURRENCY_ORDER).reverse()
        data.currencies.pySort(function (a) {
            return order.indexOf(a.code)
        })
        return data
    }

    this.register = function (data) {
        var DAT = getArchiveData()
        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        data.operations = []

        op_count = 0

        exchange_operations = DAT.exchange_operations
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
        exchange_operations.sort(compare)

        $.each(__getUserExchanges(exchange_operations), function (i, v) {
            condition = (data.buy_register & (v.currency_amount > 0)) || ((!data.buy_register) & (v.currency_amount < 0))
            if (condition && (v.fiscal_time != null) && (v.fiscal_time)) {
                op_count += 1

                new2019 = new Date("2019-01-01T09:00")
                if (new Date(v.fiscal_time) < new2019) {
                    num_eop = v.virtual_id
                } else {
                    num_eop = v.num_eop
                }

                var operation = {
                    num: op_count,
                    certificate_code: v.certificate_code,
                    time: $.isoDateToTime(v.operation_time),
                    currency: $.grep(currencies, function (n, i) {
                        return n.id == v.currency_id
                    })[0].code,
                    code: $.pad($.grep(currencies, function (n, i) {
                        return n.id == v.currency_id
                    })[0].numcode, 3),
                    amount: Math.abs(v.currency_amount),
                    rate: feroksoft.rates_round(v.equivalent / v.currency_amount),
                    equivalent: Math.abs(v.equivalent),
                    rro_id: v.virtual_id, // v.rro_id ? v.rro_id :
                    num_eop: num_eop, // v.rro_id ? v.rro_id :
                    storno: $.isoDateToTime(v.storno_time)
                }
                data.operations.push(operation)
                // TESTING
                // for (i = 0; i < 80; i++) { data.operations.push(operation)}
            }
        })

        function calcuateTotals(data) {
            // Calculate totals
            data.big_total = 0
            totals = {}
            $.each(data.operations, function (i, v) {
                if (!v.storno) {
                    if (!(v.currency in totals)) {
                        totals[v.currency] = {
                            currency: v.currency,
                            amount: v.amount,
                            equivalent: v.equivalent
                        }
                    } else {
                        totals[v.currency].amount += v.amount
                        totals[v.currency].equivalent += v.equivalent
                    }
                    data.big_total += v.equivalent
                }
            })
            data.totals = [];
            $.each(totals, function (i, v) {
                data.totals.push({
                    currency: v.currency,
                    amount: parseFloat(v.amount.toFixed(2)),
                    equivalent: parseFloat(v.equivalent.toFixed(2)),
                })
            })
            data.big_total = parseFloat(data.big_total.toFixed(2))
            return data
        }

        data = calcuateTotals(data)

        data.max_buy = config.ANONYMOUS_BUY_LIMIT
        data.company = config.COMPANY_FULL_NAME
        data.full_name = department.full_name//
        data.address = department.address//full_name
        data.date = $.isoDateToUSADate(DAT.report_date)

        data.newpage = function (array, render) {
            return (data['operations'].indexOf(this) % 26 == 0) & (data['operations'].indexOf(this) > 0)
        }
        data.index = function (array, render) {
            return data['operations'].indexOf(this)
        }
        data.first_total = function (array, render) {
            return (data.totals.indexOf(this) == 0)
        }
        return data
    }
    this.register2019 = function (data) {
        var DAT = getArchiveData()
        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        data.operations = []

        op_count = 0

        exchange_operations = DAT.exchange_operations
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
        exchange_operations.sort(compare)

        show_prro_text = false

        //console.log(DAT.exchange_operations)
        $.each(__getUserExchanges(exchange_operations), function (i, v) {

            if ((show_prro_text === false) && (v.rro_qr.includes("gov.ua"))) {
                show_prro_text = true
            }
            // console.log(v)
            if (v.fiscal_time != null && v.fiscal_time) {
                op_count += 1

                new2019 = new Date("2019-01-01T09:00")
                if (new Date(v.fiscal_time) < new2019) {
                    num_eop = v.virtual_id
                } else {
                    num_eop = v.num_eop
                }

                //console.log(v)

                //rate: feroksoft.rates_round(v.equivalent/v.currency_amount),

                var operation = {
                    num: op_count,
                    certificate_code: v.certificate_code,
                    time: $.isoDateToTime(v.operation_time),
                    currency: $.grep(currencies, function (n, i) {
                        return n.id == v.currency_id
                    })[0].code,
                    code: $.pad($.grep(currencies, function (n, i) {
                        return n.id == v.currency_id
                    })[0].numcode, 3),
                    amount: Math.abs(v.currency_amount),
                    rate: feroksoft.rates_round(v.exchange_rate),
                    equivalent: Math.abs(v.equivalent),
                    rro_id: v.virtual_id, // v.rro_id ? v.rro_id :
                    num_eop: num_eop, // v.rro_id ? v.rro_id :
                    type_op: v.currency_amount > 0 ? 0 : 1,
                    amount_in: v.currency_amount > 0 ? v.currency_amount : 0,
                    amount_out: v.currency_amount < 0 ? v.currency_amount : 0,
                    equivalent_in: v.currency_amount > 0 ? Math.abs(v.equivalent) : 0,
                    equivalent_out: v.currency_amount < 0 ? Math.abs(v.equivalent) : 0,
                    storno: $.isoDateToTime(v.storno_time)
                }
                data.operations.push(operation)
                // TESTING
                //for (i = 0; i < 80; i++) { operation.num = i+1; data.operations.push(operation)}
            }
        })

        // $.each(__getUserPayments(DAT.pay,payment_operations), function(i,v){
        //     if (v.fiscal_time != null && v.fiscal_time) {
        //         op_count += 1
        //
        //         num_eop = v.real_id
        //
        //         var operation = {
        //             num: op_count,
        //             certificate_code : '',
        //             time: $.isoDateToTime(v.operation_time),
        //             currency: $.grep(currencies, function( n, i ) { return n.id==v.currency_id})[0].code,
        //             code: $.pad($.grep(currencies, function( n, i ) { return n.id==v.currency_id})[0].numcode, 3),
        //             amount: Math.abs(v.payment_amount),
        //             rate: 1,
        //             equivalent: Math.abs(v.payment_amount),
        //             rro_id: v.virtual_id, // v.rro_id ? v.rro_id :
        //             num_eop: num_eop, // v.rro_id ? v.rro_id :
        //             type_op: v.currency_amount > 0 ? 0 : 1,
        //             amount_in: v.currency_amount > 0 ? v.currency_amount : 0,
        //             amount_out: v.currency_amount < 0 ? v.currency_amount : 0,
        //             equivalent_in: v.currency_amount > 0 ?  Math.abs(v.equivalent) : 0,
        //             equivalent_out: v.currency_amount < 0 ? Math.abs(v.equivalent) : 0,
        //             storno:$.isoDateToTime(v.storno_time)
        //         }
        //         data.operations.push(operation)
        //         // TESTING
        //         //for (i = 0; i < 80; i++) { operation.num = i+1; data.operations.push(operation)}
        //     }
        // })

        function calcuateTotals(data) {
            // Calculate totals
            data.big_total_in = 0
            data.big_total_out = 0
            totals = {}
            $.each(data.operations, function (i, v) {
                if (!v.storno) {
                    if (!(v.currency in totals)) {
                        totals[v.currency] = {
                            currency: v.currency,
                            code: v.code,
                            amount_in: v.amount_in,
                            amount_out: -v.amount_out,
                            equivalent_in: v.equivalent_in,
                            equivalent_out: v.equivalent_out
                        }
                    } else {
                        totals[v.currency].amount_in += v.amount_in
                        totals[v.currency].amount_out += -v.amount_out
                        totals[v.currency].equivalent_in += v.equivalent_in
                        totals[v.currency].equivalent_out += v.equivalent_out
                        //totals[v.currency].equivalent += v.equivalent
                    }
                    data.big_total_in += v.equivalent_in
                    data.big_total_out += v.equivalent_out
                }
            })
            //console.log(totals)
            data.totals = [];
            $.each(totals, function (i, v) {
                data.totals.push({
                    currency: v.currency,
                    code: v.code,
                    amount_in: parseFloat(v.amount_in.toFixed(2)),
                    amount_out: parseFloat(v.amount_out.toFixed(2)),
                    equivalent_in: parseFloat(v.equivalent_in.toFixed(2)),
                    equivalent_out: parseFloat(v.equivalent_out.toFixed(2)),
                    //amount : parseFloat(v.amount.toFixed(2)),
                    //equivalent : parseFloat(v.equivalent.toFixed(2)),
                    amount_in_txt: feroksoft.intToWords(parseFloat(v.amount_in.toFixed(2))),
                    amount_out_txt: feroksoft.intToWords(parseFloat(v.amount_out.toFixed(2)))
                })
            })
            data.big_total_in_txt = feroksoft.numberToWords(parseFloat(data.big_total_in.toFixed(2)))
            data.big_total_out_txt = feroksoft.numberToWords(parseFloat(data.big_total_out.toFixed(2)))
            return data
        }

        data = calcuateTotals(data)

        data.max_buy = config.ANONYMOUS_BUY_LIMIT
        data.company = config.COMPANY_FULL_NAME
        data.full_name = department.full_name//
        data.address = department.address//full_name
        data.date = $.isoDateToUSADate(DAT.report_date)

        operator = JSON.parse(localStorage.getItem('operator'))
        data.operator = operator.person
        if (show_prro_text === true) {
            data.show_prro_text = true
            data.prro_public_key = department.prro_public_key
        } else {
            data.show_prro_text = false
        }

        //data.newpage = function(array, render) {return (data['operations'].indexOf(this)%28 == 0) & (data['operations'].indexOf(this) > 0)}
        data.index = function (array, render) {
            return data['operations'].indexOf(this)
        }
        data.first_total = function (array, render) {
            return (data.totals.indexOf(this) == 0)
        }
        data.nofirst_total = function (array, render) {
            return (data.totals.indexOf(this) != 0)
        }
        return data
    }
    this.payment_register = function (data) {
        var DAT = getArchiveData()
        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        data.operations = []

        op_count = 0

        // console.log(DAT.payment_operations)
        show_prro_text = false

        $.each(__getUserPayments(DAT.payment_operations), function (i, v) {
            if (v.payment_time != null && v.fiscal_time != null && v.fiscal_time) {
                //     if (v.payment_time != null && v.fiscal_time != null) {
                op_count += 1

                // console.log(v)
                if ((show_prro_text === false) && (v.rro_qr.includes("gov.ua"))) {
                    show_prro_text = true
                }
                num_eop = v.real_id

                var operation = {
                    num: op_count,
                    certificate_code: '',
                    time: $.isoDateToTime(v.operation_time),
                    currency: $.grep(currencies, function (n, i) {
                        return n.id == v.currency_id
                    })[0].code,
                    code: $.pad($.grep(currencies, function (n, i) {
                        return n.id == v.currency_id
                    })[0].numcode, 3),
                    currency_amount: Math.abs(v.currency_amount),
                    commission_amount: Math.abs(v.commission_amount),
                    payment_amount: Math.abs(v.payment_amount),
                    rate: 1,
                    equivalent: Math.abs(v.payment_amount),
                    rro_id: v.virtual_id, // v.rro_id ? v.rro_id :
                    num_eop: num_eop, // v.rro_id ? v.rro_id :
                    type_op: v.currency_amount > 0 ? 0 : 1,
                    amount_in: v.currency_amount > 0 ? v.currency_amount : 0,
                    amount_out: v.currency_amount < 0 ? v.currency_amount : 0,
                    equivalent_in: v.currency_amount > 0 ? Math.abs(v.equivalent) : 0,
                    equivalent_out: v.currency_amount < 0 ? Math.abs(v.equivalent) : 0,
                    cancel: $.isoDateToTime(v.cancel_time),
                    service_name: v.service_name
                }
                data.operations.push(operation)
                // TESTING
                //for (i = 0; i < 80; i++) { operation.num = i+1; data.operations.push(operation)}
            }
        })

        // Calculate totals
        data.total_currency_amount = 0
        data.total_commission_amount = 0
        data.total_payment_amount = 0
        $.each(DAT.payment_operations, function (i, v) {
            if (v.payment_time != null && v.fiscal_time != null && v.cancel_time == null) {
                data.total_currency_amount += v.currency_amount
                data.total_commission_amount += v.commission_amount
                data.total_payment_amount += v.payment_amount
            }
        })

        data.total_currency_amount = feroksoft.coin_round(data.total_currency_amount * 100, 2)
        data.total_commission_amount = feroksoft.coin_round(data.total_commission_amount * 100, 2)
        data.total_payment_amount = feroksoft.coin_round(data.total_payment_amount * 100, 2)

        data.max_buy = config.ANONYMOUS_BUY_LIMIT
        data.company = config.COMPANY_FULL_NAME
        data.full_name = department.full_name//
        data.address = department.address//full_name
        data.date = $.isoDateToUSADate(DAT.report_date)

        if (show_prro_text === true) {
            data.show_prro_text = true
            data.prro_public_key = department.prro_public_key
        } else {
            data.show_prro_text = false
        }
        operator = JSON.parse(localStorage.getItem('operator'))
        data.operator = operator.person

        //data.newpage = function(array, render) {return (data['operations'].indexOf(this)%28 == 0) & (data['operations'].indexOf(this) > 0)}
        data.index = function (array, render) {
            return data['operations'].indexOf(this)
        }
        // data.first_total = function(array, render) {
        //     return (data.totals.indexOf(this) == 0)}
        // data.nofirst_total = function(array, render) {
        //     return (data.totals.indexOf(this) != 0)}
        return data
    }
    this.cashflow = function (operation_data) {
        // console.log(operation_data)
        if (typeof operation_data.real_id !== 'undefined') {
            cashflow = operation_data
        } else {
            if (typeof operation_data.cashflow_operations !== 'undefined') {
                cashflow = $.grep(operation_data.cashflow_operations, function (n, i) {
                    return n.id === operation_data.operation_id;
                })[0];
            } else {
                var DAT = getArchiveData(true)
                cashflow = $.grep(DAT.cashflow_operations, function (n, i) {
                    return ((n.id === operation_data.operation_id) || (n.real_id === operation_data.operation_id));
                })[0];
            }
        }

        currency = $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == cashflow.currency_id;
        })[0];
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        // console.log(cashflow)
        data = {
            amount: Math.abs(cashflow.money_amount).toFixed(2),
            collector: cashflow.collector,
            collector_doc: 'паспорт ' + cashflow.collector_doc + ' виданий ' + cashflow.issue_auth + ' ' + cashflow.issue_date,
            company: config.COMPANY_FULL_NAME,
            address: department.address,
            full_name: department.full_name,
            currency: currency.code,
            date: $.isoDateToUADate(cashflow.operation_time),
            department: department.address, //full_name,
            'double': department.printer_settings ? department.printer_settings.toString(2)[0] : true,
            equivalent: Math.abs(cashflow.money_amount).toFixed(2),
            // order_num: cashflow.rro_id ? cashflow.rro_id : cashflow.id,
            order_num: cashflow.real_id,
            columns: [{num: 1, clas: ''}, {num: 2, clas: ' column-right'}]
        }

        data['up_opname'] = 'Дебет'
        data['low_opname'] = 'Кредит'

        data['income_class'] = 'underlined'
        data['outcome_class'] = ''

        if (cashflow.operation_type == 5) {
            data.top_text = 'Нестача коштiв. ПIБ: _________________________________ (матерiально вiдповiдальна особа) згiдно Акту №_____ вiд ____.____.____р.'
            if (data['currency'] == 'UAH') {
                data.total_words = feroksoft.numberToWords(Math.abs(cashflow.money_amount)).capitalize()
                data['up_acc'] = '301/' + department.af_id + '-' + data['currency']
                data['low_acc'] = 375
            } else {
                data.total_words = feroksoft.intToWords(Math.abs(cashflow.money_amount)) + ' ' + data['currency']
                data['up_acc'] = '302/' + department.af_id + '-' + data['currency']
                data['low_acc'] = 375
            }
            data.zmist = data.top_text,//
                data['up_acc'] = [data['low_acc'], data['low_acc'] = data['up_acc']][0];
            data['income_class'] = [data['outcome_class'], data['outcome_class'] = data['income_class']][0];
        } else if (cashflow.operation_type == 7) {
            data['up_acc'] = 661
            data['low_acc'] = 301
            data.zmist = ''
            data['income_class'] = [data['outcome_class'], data['outcome_class'] = data['income_class']][0];
            data.total_words = feroksoft.numberToWords(Math.abs(cashflow.money_amount)).capitalize()
        } else if (cashflow.operation_type == 8) {
            data['up_acc'] = 301
            data['low_acc'] = 311
            data.zmist = ''
            data.total_words = feroksoft.numberToWords(Math.abs(cashflow.money_amount)).capitalize()
        } else {
            data.top_text = ''
            if (data['currency'] == 'UAH') {
                data.total_words = feroksoft.numberToWords(Math.abs(cashflow.money_amount)).capitalize()
                data['up_acc'] = 301
                data['low_acc'] = 333
            } else {
                data.total_words = feroksoft.intToWords(Math.abs(cashflow.money_amount)) + ' ' + data['currency']
                data['up_acc'] = 302
                data['low_acc'] = 334
            }
            if (cashflow.money_amount > 0) {
                data.zmist = 'ПIДКРIПЛЕННЯ З КАСИ ГО ДО ВIДДIЛЕННЯ'//БАНКУ
            } else if (cashflow.money_amount < 0) {
                data.zmist = 'ІНКАСАЦІЯ З ВIДДIЛЕННЯ ДО КАСИ ГО',//
                    data['up_acc'] = [data['low_acc'], data['low_acc'] = data['up_acc']][0];
                data['income_class'] = [data['outcome_class'], data['outcome_class'] = data['income_class']][0];
            }
        }
        return data
    }
    this.exchange = function (operation_data) {
        //console.log(operation_data)
        if (typeof operation_data.exchange_operation !== 'undefined') {
            exchange = operation_data.exchange_operation;
        } else {
            var DAT = getArchiveData(true)

            exchange = $.grep(DAT.exchange_operations, function (n, i) {
                return n.id == operation_data.operation_id;
            })[0];
        }
        //console.log(exchange)
        currency = $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == exchange.currency_id;
        })[0];
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        if (typeof operation_data.double_page === 'undefined') {
            var double_page = true //department.printer_settings.toString(2).slice(-1)[0]=='1'
        } else {
            var double_page = operation_data.double_page
        }

        client = exchange.client

        if (client.length < 1) {
            client = '________________________'
            tag_client = false
            tag_no_client = true
        } else {
            tag_client = true
            tag_no_client = false
        }

        new2019 = new Date("2019-01-01T09:00")
        if (new Date(exchange.fiscal_time) >= new2019) {
            num_eop = exchange.num_eop
        } else {
            num_eop = exchange.virtual_id
        }
        if (typeof exchange.num_storno !== 'undefined') {
            num_eop = exchange.num_storno
        }
        // console.log(num_eop)

        data = {
            amount: Math.abs(exchange.currency_amount),
            client: client,
            columns: [{num: 1, clas: '', leftborder: 'none'}, {
                num: 2,
                clas: ' column-right',
                leftborder: 'dashed black 1px'
            }],
            company: config.COMPANY_FULL_NAME,
            edrpou: config.EDRPOU,
            full_name: department.full_name,
            address: department.address,
            currency: currency['code'],
            currency_numcode: currency['numcode'],
            currency_name: currency['name'],
            date: $.isoDateToUADate(exchange.operation_time),
            double_page: double_page,
            equivalent: Math.abs(exchange.equivalent).toFixed(2),
            max_buy: config.ANONYMOUS_BUY_LIMIT,
            num: exchange.virtual_id,
            rate: feroksoft.rates_round(exchange.exchange_rate).toFixed(6),
            rro_id: exchange.virtual_id, // exchange.rro_id ? exchange.rro_id :
            num_eop: num_eop,
            storno: exchange.storno_time,
            time: $.isoDateToTime(exchange.operation_time),
            operation_time: exchange.operation_time,
            tag_client: tag_client,
            tag_no_client: tag_no_client
        }

        //console.log(data)
        if (exchange.currency_amount > 0) {
            data.type = "Купівля іноземної валюти"
            data.type_storno = "купівлi іноземної валюти"
            data.received = data.amount + ' ' + data.currency
            data.give = data.equivalent + ' UAH'
            data.title_received = "ПРИЙНЯТО"
            data.title_give = "СУМА (ДО ВИДАЧІ)"
            data.title_storno_received = "СУМА (ПРИЙНЯТО)"
            data.title_storno_give = "ДО ВИДАЧІ"

            data.received_amount = data.amount
            data.received_currency = data.currency
            //console.log(data.currency)
            data.received_currency_numcode = data.currency_numcode
            data.received_currency_name = data.currency_name
            data.give_amount = data.equivalent
            data.give_currency = 'UAH'
            data.give_currency_numcode = '980'
            data.give_currency_name = 'Українська гривня'
        } else if (exchange.currency_amount < 0) {
            data.type = "Продаж іноземної валюти"
            data.type_storno = "продажу іноземної валюти"
            data.received = data.equivalent + ' UAH'
            data.give = data.amount + ' ' + data.currency
            data.title_received = "СУМА (ПРИЙНЯТО)"
            data.title_give = "ДО ВИДАЧІ"
            data.title_storno_received = "ПРИЙНЯТО"
            data.title_storno_give = "СУМА (ДО ВИДАЧІ)"

            data.received_amount = data.equivalent
            data.received_currency = 'UAH'
            data.received_currency_numcode = '980'
            data.received_currency_name = 'Українська гривня'
            data.give_amount = data.amount
            data.give_currency = data.currency
            data.give_currency_numcode = data.currency_numcode
            data.give_currency_name = data.currency_name
        }

        data.region_id = department.region_id


        // if (typeof exchange.client_tin !== 'undefined') {
        //     // data['passport'] = exchange.client_passport // [INS]{DOC_TYPE}[/INS] [INS]серiя {DOC_SER} № {DOC_NUM} [/INS]
        //     data['passport'] = "Паспорт/IПН " + exchange.client_tin // [INS]{DOC_TYPE}[/INS] [INS]серiя {DOC_SER} № {DOC_NUM} [/INS]
        // } else {
            data['passport'] = '________________________'
        // }
        // console.log(data)

        return data
    }
    this.exchange_prro = function (exchange) {

        // var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

        // var link = qr2link(exchange.qr)
        // data.qrlink = link.replace(re, "");

        client = exchange.client

        if (client.length < 1) {
            client = '________________________'
            tag_client = false
            tag_no_client = true
        } else {
            tag_client = true
            tag_no_client = false
        }

        data = {
            amount: exchange.sum,
            columns: [{num: 1, clas: '', leftborder: 'none'}, {
                num: 2,
                clas: ' column-right',
                leftborder: 'dashed black 1px'
            }],
            company: exchange.company_short_name,
            edrpou: exchange.company_EDRPOU,
            full_name: exchange.department_full_name,
            address: exchange.department_address,
            operator: exchange.operator,
            fn: exchange.fn,
            zn: exchange.zn,
            tax_id: exchange.tax_id,
            pid: exchange.pid,
            currency: exchange.currency_code,
            currency_numcode: exchange.currency_numcode,
            currency_name: exchange.currency_name,
            // date: $.isoDateToUADate(exchange.operation_time),
            // double_page: 0,
            sum_base: exchange.sum_base.toFixed(2),
            rate: feroksoft.rates_round(exchange.rate).toFixed(6),
            sum_base_round: exchange.sum_base_round.toFixed(2),
            sum_base_before_round: exchange.sum_base_before_round.toFixed(2),
            // rro_id: exchange.virtual_id, // exchange.rro_id ? exchange.rro_id :
            num_eop: exchange.op,
            // storno: exchange.storno_time,
            // time: $.isoDateToTime(exchange.fiscal_time),
            // operation_time: exchange.fiscal_time,
            // tag_client: tag_client,
            // tag_no_client: tag_no_client
            qr_base64_img: $('<div>').qrcode(exchange.qr).find('canvas').get(0).toDataURL("image/png"),
            rro_date: moment(exchange.fiscal_time).format('DD.MM.YYYY'),
            rro_time: moment(exchange.fiscal_time).format('HH:mm:ss'),
            tag_client: tag_client,
            tag_no_client: tag_no_client,
            client: client,
            passport: ''
        }
        data.currency_UAH = 'UAH'

        //console.log(data)
        if (exchange.type  === 0) {

            data.type = "Купівля іноземної валюти"
            data.type_storno = "купівлi іноземної валюти"
            data.received = data.amount + ' ' + data.currency
            data.give = data.equivalent + ' UAH'
            data.title_received = "ПРИЙНЯТО"
            data.title_total = "СУМА"
            data.title_give = "ДО ВИДАЧІ"
            data.title_storno_received = "СУМА (ПРИЙНЯТО)"
            data.title_storno_give = "ДО ВИДАЧІ"

            // data.received_amount = data.amount
            // data.received_currency = data.currency
            // //console.log(data.currency)
            // data.received_currency_numcode = data.currency_numcode
            // data.received_currency_name = data.currency_name
            // data.give_amount = data.sum_base
            // data.give_currency = 'UAH'
            // data.give_currency_numcode = '980'
            // data.give_currency_name = 'Українська гривня'
            // data.received_amount = -data.received_amount

        } else if (exchange.type  === 2) {

            data.type = "Продаж іноземної валюти"
            data.type_storno = "продажу іноземної валюти"
            data.received = data.equivalent + ' UAH'
            data.give = data.amount + ' ' + data.currency
            data.title_received = "ДО ВИДАЧІ"
            data.title_total = "СУМА"
            data.title_give = "ПРИЙНЯТО"
            data.title_storno_received = "ПРИЙНЯТО"
            data.title_storno_give = "ДО ВИДАЧІ"

            // data.received_amount = -data.received_amount
            // data.received_amount = data.sum_base
            // // data.sum_base_before_round = data.amount
            // data.received_currency = 'UAH'
            // data.received_currency_numcode = '980'
            // data.received_currency_name = 'Українська гривня'
            // data.give_amount = data.amount
            // data.give_currency = data.currency// 'UAH'
            // data.give_currency_numcode = data.currency_numcode
            // data.give_currency_name = data.currency_name
        } else if (exchange.type  === 1) {
            data.type = "Сторно купівлi іноземної валюти"
            // data.received = data.amount + ' ' + data.currency
            data.received = data.equivalent + ' UAH'
            data.give = data.amount + ' ' + data.currency
            data.title_received = "ДО ВИДАЧІ"
            data.title_total = "СУМА"
            data.title_give = "ПРИЙНЯТО"
            data.title_storno_received = "ПРИЙНЯТО"
            data.title_storno_give = "ДО ВИДАЧІ"
        } else if (exchange.type  === 3) {
            data.type = "Сторно продажу іноземної валюти"
            data.received = data.amount + ' ' + data.currency
            data.give = data.equivalent + ' UAH'
            data.title_received = "ПРИЙНЯТО"
            data.title_total = "СУМА"
            data.title_give = "ДО ВИДАЧІ"
            data.title_storno_received = "СУМА (ПРИЙНЯТО)"
            data.title_storno_give = "ДО ВИДАЧІ"
        }
        data.received_amount = data.amount
        data.received_currency = data.currency
        //console.log(data.currency)
        data.received_currency_numcode = data.currency_numcode
        data.received_currency_name = data.currency_name
        data.give_amount = data.sum_base
        data.give_currency = 'UAH'
        data.give_currency_numcode = '980'
        data.give_currency_name = 'Українська гривня'

        // data.region_id = department.region_id


        // if (typeof exchange.client_tin !== 'undefined') {
        //     // data['passport'] = exchange.client_passport // [INS]{DOC_TYPE}[/INS] [INS]серiя {DOC_SER} № {DOC_NUM} [/INS]
        //     data['passport'] = "Паспорт/IПН " + exchange.client_tin // [INS]{DOC_TYPE}[/INS] [INS]серiя {DOC_SER} № {DOC_NUM} [/INS]
        // } else {
        //     data['passport'] = '________________________'
        // }
        // console.log(data)

        return data
    }
    this.certificate = function (data) {
        if (typeof data.exchange_operation !== 'undefined') {
            exchange = data.exchange_operation;
        } else {
            data = typeof data !== 'undefined' ? data : {operation_id: 1};
            var DAT = getArchiveData(true)

            exchange = $.grep(DAT.exchange_operations, function (n, i) {
                return n.id == data.operation_id;
            })[0];
        }
        currency = $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == exchange.currency_id;
        })[0];
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        tmp_amount = Math.abs(exchange.currency_amount)
        tmp_equivalent = Math.abs(exchange.equivalent)

        data['double'] = false
        data.columns = [{num: 1, clas: ''}, {num: 2, clas: ' column-right'}]
        data.company = config.COMPANY_FULL_NAME
        data.full_name = department.full_name
        data.address = department.address
        //data.date = $.isoDateToUSADate(DAT.report_date)
        report_date = moment(exchange.operation_time, 'YYYY-MM-DD').toDate()
        data.date = $.isoDateToUSADate(report_date)
        data.client = exchange.client
        data.amount = currency.code + ' ' + tmp_amount
        data.equivalent = tmp_equivalent + ' (' + feroksoft.numberToWords(tmp_equivalent) + ')'

        data.certificate_number = exchange.certificate_code
        data.country = exchange.client_country
        data.operation_time = exchange.operation_time

        return data
    }
    this.order = function (data) {
        data = typeof data !== 'undefined' ? data : {'double': false};
        var DAT = getArchiveData()
        //console.log(DAT)

        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        data.order_num = DAT.company_rates.meta.order_num
        data.time = $.isoDateToTime(DAT.company_rates.meta.rates_time)
        data.date = $.isoDateToUADate(new Date(DAT.company_rates.meta.rates_time))

        data.company = config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.department = department.address//full_name
        data.full_name = department.full_name

        if (new Date(DAT.company_rates.meta.rates_time) > new Date(config.NEW_CEO_DATE)) {
            data.director = config.COMPANY_CEO2
            data.STAMP_WIDTH = config.STAMP_WIDTH2
            data.STAMP_HEIGHT = config.STAMP_HEIGHT2
            data.STAMP_IMAGE = config.STAMP_IMAGE2 // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE2
        } else {
            data.director = config.COMPANY_CEO
            data.STAMP_WIDTH = config.STAMP_WIDTH
            data.STAMP_HEIGHT = config.STAMP_HEIGHT
            data.STAMP_IMAGE = config.STAMP_IMAGE // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE
        }
        data.LOGO_IMAGE = config.LOGO_IMAGE //config.LOGO_IMAGE
        data.LOGO_WIDTH = config.LOGO_WIDTH
        data.LOGO_HEIGHT = config.LOGO_HEIGHT

        data.currencies = []

        date_ = new Date(DAT.company_rates.meta.rates_time)
        if (date_.getHours(date_) < 9) {
            data.doc_date = $.isoDateToUADate(date_.setDate(date_.getDate(date_) - 1))
        } else {
            data.doc_date = $.isoDateToUADate(new Date(DAT.company_rates.meta.rates_time))
        }

        $.each(DAT.company_rates.data, function (k, com_rate) {
            curr = $.grep(currencies, function (n, i) {
                return n.id == parseInt(k)
            })[0]
            if (curr.code != 'UAH') {
                nr = DAT.nbu_rates[curr.id]
                if (nr) {
                    nbu_rate = nr.rate
                } else {
                    nbu_rate = '-'
                }

                //var degree = curr.degree ? curr.degree : 1;
                new2020 = new Date("2019-12-28T09:00")
                if (new Date(DAT.company_rates.meta.rates_time) >= new2020) {
                    var degree = curr.degree_2020 ? curr.degree_2020 : 1;
                } else {
                    var degree = curr.degree ? curr.degree : 1;
                }
                var h = curr.decimal_places ? curr.decimal_places : 2;

                entry = {
                    'numcode': $.pad(curr.numcode, 3),
                    'code': curr.code,
                    'degree': degree,
                    'name': curr.name,
                    'buy': (com_rate.buy_rate * degree).toFixed(h),
                    'nbu': feroksoft.rates_round(nbu_rate * degree, 6),
                    'sell': (com_rate.sell_rate * degree).toFixed(h),
                }
                data.currencies.push(entry)
            }
        })
        data.region_id = department.region_id

        var order = [].concat(CURRENCY_ORDER).reverse()
        data.currencies.pySort(function (a) {
            return order.indexOf(a.code)
        })
        return data
    }
    this.local_order = function (data) {
        data = typeof data !== 'undefined' ? data : {update_id: 13};
        var DAT = getArchiveData()
        //console.log(DAT)

        currencies = JSON.parse(localStorage.getItem('currencies'))
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        // console.log(data.update_id)
        // console.log(DAT.today_rates)
        rates_full = DAT.today_rates[parseInt(data.update_id) - 1]

        // console.log()

        var rates = {}
        for (var key in DAT.company_rates.data) {
            var i = 0
            for (var key2 in rates_full) {
                if (key == parseInt(key2)) {
                    rates[key] = rates_full[key2]
                    i = 1
                }
                if (i == 0) {
                    rates[key] = DAT.company_rates.data[key]
                }
            }
        }

        data.order_num = DAT.company_rates.meta.order_num
        data.time = $.isoDateToTime(rates_full.rates_time)
        data.date = $.isoDateToUADate(new Date(rates_full.rates_time))

        date_ = new Date(rates_full.rates_time)
        // console.log(date_.getHours(date_))

        // console.log(date_)

        if (date_.getHours(date_) < 9) {
            data.doc_date = $.isoDateToUADate(date_.setDate(date_.getDate(date_) - 1))
        } else {
            data.doc_date = $.isoDateToUADate(new Date(rates_full.rates_time))
        }

        data.company = config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.full_name = department.full_name
        data.address = department.address

        if (new Date(rates_full.rates_time) > new Date(config.NEW_CEO_DATE)) {
            data.director = config.COMPANY_CEO2
            data.STAMP_WIDTH = config.STAMP_WIDTH2
            data.STAMP_HEIGHT = config.STAMP_HEIGHT2
            data.STAMP_IMAGE = config.STAMP_IMAGE2 // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE2
        } else {
            data.director = config.COMPANY_CEO
            data.STAMP_WIDTH = config.STAMP_WIDTH
            data.STAMP_HEIGHT = config.STAMP_HEIGHT
            data.STAMP_IMAGE = config.STAMP_IMAGE // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE
        }
        data.legal_number = department.id
        data.today = $.isoDateToUADate(DAT.report_date)
        data.LOGO_IMAGE = LOGO_IMAGE //config.LOGO_IMAGE
        data.LOGO_WIDTH = config.LOGO_WIDTH
        data.LOGO_HEIGHT = config.LOGO_HEIGHT

        data.region_id = department.region_id

        data.currencies = []
        $.each(rates, function (cid, rate) {
            if (cid == 'rates_time') {
                return true
            }
            curr = $.grep(currencies, function (n, i) {
                return n.id == parseInt(cid)
            })[0]

            // console.log(curr)

            new2020 = new Date("2019-12-28T09:00")
            if (new Date(rates_full.rates_time) >= new2020) {
                var degree = curr.degree_2020 ? curr.degree_2020 : 1;
            } else {
                var degree = curr.degree ? curr.degree : 1;
            }
            var h = curr.decimal_places ? curr.decimal_places : 2;
            entry = {
                'numcode': $.pad(curr.numcode, 3),
                'code': curr.code,
                'degree': degree,
                'name': curr.name,
                'buy': (rate.buy_rate * degree).toFixed(h),
                'nbu': feroksoft.rates_round((DAT.nbu_rates[curr.id] ? DAT.nbu_rates[curr.id].rate : 1) * degree, 6),
                'sell': (rate.sell_rate * degree).toFixed(h),
            }
            data.currencies.push(entry)
        })

        var order = [].concat(CURRENCY_ORDER).reverse()
        data.currencies.pySort(function (a) {
            return order.indexOf(a.code)
        })
        return data;
    }
    this.quotation = function (data) {
        var DAT = getArchiveData()
        var data = this.order(data)
        var new_currencies = []
        for (var currency_ind in data.currencies) {
            for (var bal in DAT.balance) {
                if (__getCurrencyCode(DAT.balance[bal].currency_id) === data.currencies[currency_ind].code) {
                    new_currencies.push(data.currencies[currency_ind])
                }
            }
        }
        data.currencies = new_currencies
        if (data.currencies.length <= 17) {
            data.tablefont = 'font-size:17px'
        } else if (data.currencies.length <= 19) {
            data.tablefont = 'font-size:16px'
        } else if (data.currencies.length <= 21) {
            data.tablefont = 'font-size:15px'
        } else if (data.currencies.length <= 23) {
            data.tablefont = 'font-size:14px'
        } else if (data.currencies.length <= 25) {
            data.tablefont = 'font-size:13px'
        } else {
            data.tablefont = 'font-size:12px'
        }
        return data
    }
    this.local_quotation = function (data) {
        var DAT = getArchiveData()
        var data = this.local_order(data)
        var new_currencies = []
        for (var currency_ind in data.currencies) {
            for (var bal in DAT.balance) {
                if (__getCurrencyCode(DAT.balance[bal].currency_id) === data.currencies[currency_ind].code) {
                    new_currencies.push(data.currencies[currency_ind])
                }
            }
        }
        data.currencies = new_currencies
        if (data.currencies.length <= 17) {
            data.tablefont = 'font-size:17px'
        } else if (data.currencies.length <= 19) {
            data.tablefont = 'font-size:16px'
        } else if (data.currencies.length <= 21) {
            data.tablefont = 'font-size:15px'
        } else if (data.currencies.length <= 23) {
            data.tablefont = 'font-size:14px'
        } else if (data.currencies.length <= 25) {
            data.tablefont = 'font-size:13px'
        } else {
            data.tablefont = 'font-size:12px'
        }
        return data
    }
    this.local_quotation_2020 = function (data) {
        var DAT = getArchiveData()
        var data = this.local_order(data)
        var new_currencies = []
        for (var currency_ind in data.currencies) {
            for (var bal in DAT.balance) {
                if (__getCurrencyCode(DAT.balance[bal].currency_id) === data.currencies[currency_ind].code) {
                    new_currencies.push(data.currencies[currency_ind])
                }
            }
        }
        data.currencies = new_currencies
        if (data.currencies.length <= 17) {
            data.tablefont = 'font-size:17px'
        } else if (data.currencies.length <= 19) {
            data.tablefont = 'font-size:16px'
        } else if (data.currencies.length <= 21) {
            data.tablefont = 'font-size:15px'
        } else if (data.currencies.length <= 23) {
            data.tablefont = 'font-size:14px'
        } else if (data.currencies.length <= 25) {
            data.tablefont = 'font-size:13px'
        } else {
            data.tablefont = 'font-size:12px'
        }
        return data
    }
    this.xz_report_rkks = function (data) {
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        // console.log(data.Records)
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
                reinforced: feroksoft.coin_round((v.SumReinf != 0) ? v.SumReinf : 0).rjust(20),
                collected: feroksoft.coin_round((v.SumCollect != 0) ? v.SumCollect : 0).rjust(20),
                // collected: (v.SumCollect != 0) ? feroksoft.coin_round(v.SumCollect).rjust(20) : null,

            }
            rep.bought_rate = (rep.bought_equivalent / rep.bought)
            rep.bought_rate = rep.bought_rate ? rep.bought_rate.toFixed(8).rjust(20) : null
            rep.sold_rate = (rep.sold_equivalent / rep.sold)
            rep.sold_rate = rep.sold_rate ? rep.sold_rate.toFixed(8).rjust(20) : null

            // rep.bought_rate = (rep.bought == 0) ? 0 : (rep.bought_equivalent/rep.bought)
            // rep.bought_rate = rep.bought_rate.toFixed(8).rjust(20)
            // rep.sold_rate = (rep.sold == 0) ? 0 : (rep.sold_equivalent/rep.sold)
            // rep.sold_rate = rep.sold_rate.toFixed(8).rjust(20)

            currency_reports.push(rep)
        })

        z_info = data.Records.filter(function (element, value) {
            return element.RecType == 48
        })[0]
        doc_footer = data.Records.filter(function (element, value) {
            return element.RecType == 127
        })[0]
        doc_header = data.Records.filter(function (element, value) {
            return element.RecType == 255
        })[0]
        var templ_data = {
            resp: data,
            currency_reports: currency_reports,
            company: config.COMPANY_FULL_NAME.wrapText(38, ' ', ' ', 'cjust'),//.cjust(39),
            full_name: department.full_name.wrapText(38, ' ', ' ', 'cjust'),//.cjust(39),
            address: department.address.wrapText(38, ' ', ' ', 'cjust'),
            doc_date: moment(doc_footer.DateTime, 'DDMMYYHHmmss').format('DD.MM.YYYY'),
            doc_time: moment(doc_footer.DateTime, 'DDMMYYHHmmss').format('HH:mm'),
            doc_num: z_info ? z_info.OpCnt : 0,
            reinforced: z_info ? z_info.SumReinf : 0,
            collected: z_info ? z_info.SumCollect : 0,
            advance: z_info ? z_info.SumAdv : 0,
            //TN : doc_header.TN.ljust(18),
            TN: 'IД ' + config.EDRPOU,
            FN: ('ФН ' + doc_header.FN).rjust(19),
            ZN: ("ЗН " + doc_header.ZN).ljust(18),
            FSN: doc_header.FSN.rjust(19),
        }
        templ_data.doc_num = templ_data.doc_num.toFixed().rjust(10)
        templ_data.reinforced = feroksoft.coin_round(templ_data.reinforced).rjust(20)
        templ_data.collected = feroksoft.coin_round(templ_data.collected).rjust(20)
        templ_data.advance = feroksoft.coin_round(templ_data.advance).rjust(12)

        templ_data.region_id = department.region_id


        if (doc_footer.DocNo == 0) {
            templ_data.report_name = 'X-ЗВІТ'.cjust(39)
        } else {
            templ_data.report_name = ('Z-ЗВІТ № ' + String(doc_footer.DocNo)).cjust(39)
            templ_data.z_doc_num = String(doc_footer.PID).ljust(8) + 'Фіскальний звітний чек дійсний.'
        }
        // console.log(templ_data)
        return templ_data
    }
    this.xz_report_rkks_offline = function (z_report) {
        // department = JSON.parse(localStorage.getItem('department_details'))
        // config = JSON.parse(localStorage.getItem('general_settings'))

        // // console.log(data.Records)
        // console.log(z_report)
        var currency_reports = []
        $.each(z_report.currency_data, function (n, v) {
            var rep = {
                numcode: v.currency_numcode,
                code: v.currency_code,
                nbu_rate: parseFloat(v.nbu_rate).toFixed(8).rjust(20),
                advance: feroksoft.coin_round(v.advance).rjust(12),
                bought: (v.bought != 0) ? feroksoft.coin_round(v.bought).rjust(20) : null,
                bought_equivalent: (v.bought_equivalent != 0) ? feroksoft.coin_round(v.bought_equivalent).rjust(20) : null,
                sold: (v.sold != 0) ? feroksoft.coin_round(v.sold).rjust(20) : null,
                sold_equivalent: (v.sold_equivalent != 0) ? feroksoft.coin_round(v.sold_equivalent).rjust(20) : null,
                bought_storno: (v.bought_storno != 0) ? feroksoft.coin_round(v.bought_storno).rjust(20) : null,
                bought_storno_equivalent: (v.bought_storno_equivalent != 0) ? feroksoft.coin_round(v.bought_storno_equivalent).rjust(20) : null,
                sold_storno: (v.sold_storno != 0) ? feroksoft.coin_round(v.sold_storno).rjust(20) : null,
                sold_storno_equivalent: (v.sold_storno_equivalent != 0) ? feroksoft.coin_round(v.sold_storno_equivalent).rjust(20) : null,
                reinforced: feroksoft.coin_round(v.reinforced).rjust(20),
                collected: feroksoft.coin_round(v.collected).rjust(20),

            }
            rep.bought_rate = (rep.bought_equivalent / rep.bought)
            rep.bought_rate = rep.bought_rate ? rep.bought_rate.toFixed(8).rjust(20) : null
            rep.sold_rate = (rep.sold_equivalent / rep.sold)
            rep.sold_rate = rep.sold_rate ? rep.sold_rate.toFixed(8).rjust(20) : null

            currency_reports.push(rep)
        })

        var templ_data = {
            // resp: data,
            currency_reports: currency_reports,
            company: String(z_report.company_full_name).wrapText(38, ' ', ' ', 'cjust'),//.cjust(39),
            full_name: String(z_report.department_full_name).wrapText(38, ' ', ' ', 'cjust'),//.cjust(39),
            address: String(z_report.department_address).wrapText(38, ' ', ' ', 'cjust'),
            doc_date: moment(z_report.fiscal_time).format('DD.MM.YYYY'),
            doc_time: moment(z_report.fiscal_time).format('HH:mm'),
            doc_num: z_report.op_cnt,
            reinforced: z_report.sum_reinf,
            collected: z_report.sum_collect,
            advance: z_report.sum_adv,
            //TN : doc_header.TN.ljust(18),
            TN: 'IД ' + z_report.company_EDRPOU,
            FN: ('ФН ' + z_report.fn),
            ZN: ("ЗН " + String(z_report.zn)).ljust(18),
            FSN: String(z_report.fsn).rjust(19),
        }
        templ_data.doc_num = templ_data.doc_num.toFixed().rjust(10)
        templ_data.reinforced = feroksoft.coin_round(templ_data.reinforced).rjust(20)
        templ_data.collected = feroksoft.coin_round(templ_data.collected).rjust(20)
        templ_data.advance = feroksoft.coin_round(templ_data.advance).rjust(12)

        templ_data.region_id = z_report.department_region_id

        if (z_report.z_number == 0) {
            templ_data.report_name = 'X-ЗВІТ'.cjust(39)
        } else {
            templ_data.report_name = ('Z-ЗВІТ № ' + String(z_report.z_number)).cjust(39)
            templ_data.z_doc_num = String(z_report.pid).ljust(8) + 'Фіскальний звітний чек дійсний.'
        }
        return templ_data
    }

    this.xz_report_prro = function (z_report) {
        // department = JSON.parse(localStorage.getItem('department_details'))
        // config = JSON.parse(localStorage.getItem('general_settings'))

        // // console.log(data.Records)
        // console.log(z_report)
        var currency_reports = []
        $.each(z_report.currency_data, function (n, v) {
            var rep = {
                numcode: v.currency_numcode,
                code: v.currency_code,
                nbu_rate: parseFloat(v.nbu_rate).toFixed(8).rjust(20),
                advance: feroksoft.coin_round(v.advance).rjust(12),
                bought: (v.bought != 0) ? feroksoft.coin_round(v.bought).rjust(20) : null,
                bought_equivalent: (v.bought_equivalent != 0) ? feroksoft.coin_round(v.bought_equivalent).rjust(20) : null,
                sold: (v.sold != 0) ? feroksoft.coin_round(v.sold).rjust(20) : null,
                sold_equivalent: (v.sold_equivalent != 0) ? feroksoft.coin_round(v.sold_equivalent).rjust(20) : null,
                bought_storno: (v.bought_storno != 0) ? feroksoft.coin_round(v.bought_storno).rjust(20) : null,
                bought_storno_equivalent: (v.bought_storno_equivalent != 0) ? feroksoft.coin_round(v.bought_storno_equivalent).rjust(20) : null,
                sold_storno: (v.sold_storno != 0) ? feroksoft.coin_round(v.sold_storno).rjust(20) : null,
                sold_storno_equivalent: (v.sold_storno_equivalent != 0) ? feroksoft.coin_round(v.sold_storno_equivalent).rjust(20) : null,
                reinforced: feroksoft.coin_round(v.reinforced).rjust(20),
                collected: feroksoft.coin_round(v.collected).rjust(20),

            }
            rep.bought_rate = (rep.bought_equivalent / rep.bought)
            rep.bought_rate = rep.bought_rate ? rep.bought_rate.toFixed(8).rjust(20) : null
            rep.sold_rate = (rep.sold_equivalent / rep.sold)
            rep.sold_rate = rep.sold_rate ? rep.sold_rate.toFixed(8).rjust(20) : null

            currency_reports.push(rep)
        })

        var templ_data = {
            // resp: data,
            currency_reports: currency_reports,
            company: String(z_report.company_short_name).wrapText(38, ' ', ' ', 'cjust'),//.cjust(39),
            full_name: String(z_report.department_full_name).wrapText(38, ' ', ' ', 'cjust'),//.cjust(39),
            address: String(z_report.department_address).wrapText(38, ' ', ' ', 'cjust'),
            doc_date: moment(z_report.fiscal_time).format('DD.MM.YYYY'),
            doc_time: moment(z_report.fiscal_time).format('HH:mm:ss'),
            doc_num: z_report.op_cnt,
            reinforced: z_report.sum_reinf,
            collected: z_report.sum_collect,
            advance: z_report.sum_adv,
            //TN : doc_header.TN.ljust(18),
            TN: 'IД ' + z_report.company_EDRPOU,
            FN: ('ФН ' + z_report.fn),
            ZN: String(z_report.zn).ljust(18),
            FSN: String(z_report.fsn).rjust(19),
        }
        templ_data.doc_num = templ_data.doc_num.toFixed().rjust(10)
        templ_data.reinforced = feroksoft.coin_round(templ_data.reinforced).rjust(20)
        templ_data.collected = feroksoft.coin_round(templ_data.collected).rjust(20)
        templ_data.advance = feroksoft.coin_round(templ_data.advance).rjust(12)

        templ_data.region_id = z_report.department_region_id

        if (z_report.z_number == 0) {
            templ_data.report_name = 'X-ЗВІТ'.cjust(39)
        } else {
            templ_data.report_name = ('Z-ЗВІТ № ' + String(z_report.z_number)).cjust(39)
            templ_data.z_doc_num = String(z_report.tax_id).ljust(8) + 'Фіскальний звітний чек дійсний.'
        }
        return templ_data
    }

    this.limits = function (data) {
        data = typeof data !== 'undefined' ? data : {update_id: 13};

        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))
        limits = JSON.parse(localStorage.getItem('department_limits')).data

        data.company = config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.full_name = department.full_name
        data.address = department.address

        data.legal_number = department.id
        //data.today =  $.isoDateToUADate(DAT.report_date)

        curr_limit = $.grep(limits, function (n, i) {
            return n.currency_id == config.UAH_ID
        })[0]
        data.date = $.isoDateToUADate(curr_limit.begin_date)
        data.limit = curr_limit.limit
        data.num_rasp = curr_limit.num_rasp

        if (new Date(curr_limit.begin_date) > new Date(config.NEW_CEO_DATE)) {
            data.director = config.COMPANY_CEO2
            data.STAMP_WIDTH = config.STAMP_WIDTH2
            data.STAMP_HEIGHT = config.STAMP_HEIGHT2
            data.STAMP_IMAGE = config.STAMP_IMAGE2 // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE2
        } else {
            data.director = config.COMPANY_CEO
            data.STAMP_WIDTH = config.STAMP_WIDTH
            data.STAMP_HEIGHT = config.STAMP_HEIGHT
            data.STAMP_IMAGE = config.STAMP_IMAGE // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE
        }
        return data;
    }
    this.limits_currency = function (data) {
        data = typeof data !== 'undefined' ? data : {update_id: 13};

        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))
        department_limits = JSON.parse(localStorage.getItem('department_limits')).data

        data.company = config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.full_name = department.full_name
        data.address = department.address

        data.legal_number = department.legal_number

        curr_limit = $.grep(limits, function (n, i) {
            return n.currency_id != config.UAH_ID
        })[0]
        data.date = $.isoDateToUADate(curr_limit.begin_date)

        if (new Date(curr_limit.begin_date) > new Date(config.NEW_CEO_DATE)) {
            data.director = config.COMPANY_CEO2
            data.STAMP_WIDTH = config.STAMP_WIDTH2
            data.STAMP_HEIGHT = config.STAMP_HEIGHT2
            data.STAMP_IMAGE = config.STAMP_IMAGE2 // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE2
        } else {
            data.director = config.COMPANY_CEO
            data.STAMP_WIDTH = config.STAMP_WIDTH
            data.STAMP_HEIGHT = config.STAMP_HEIGHT
            data.STAMP_IMAGE = config.STAMP_IMAGE // config.STAMP_IMAGE
            data.director_title = config.COMPANY_CEO_TITLE
        }
        data.currencies = []
        num = 0
        $.each(department_limits, function (cid, department_limit) {

            if (department_limit.currency_id != config.UAH_ID) {
                num += 1

                curr = $.grep(currencies, function (n, i) {
                    return n.id == parseInt(department_limit.currency_id)
                })[0]

                entry = {
                    'code': curr.code,
                    'curr_name': curr.name,
                    'limit': department_limit.limit,
                    'num_rasp': department_limit.num_rasp
                }
                data.currencies.push(entry)
            }
        })
        var order = [].concat(CURRENCY_ORDER).reverse()
        data.currencies.pySort(function (a) {
            return order.indexOf(a.code)
        })
        $.each(data.currencies, function (i, v) {
            v.num = i + 1
        })

        data.num_rasp = data.currencies[0].num_rasp

        //console.log(data.currencies)

        return data;
    }

    this.anketa = function (data) {
        data = typeof data !== 'undefined' ? data : {update_id: 13};

        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))
        operator = JSON.parse(localStorage.getItem('operator'))

        data.company = config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.full_name = department.full_name
        data.address = department.address
        data.director = config.COMPANY_CEO
        data.director_title = config.COMPANY_CEO_TITLE
        data.legal_number = department.id
        //data.today =  $.isoDateToUADate(DAT.report_date)

        data.STAMP_IMAGE = STAMP_IMAGE // config.STAMP_IMAGE
        data.STAMP_WIDTH = config.STAMP_WIDTH
        data.STAMP_HEIGHT = config.STAMP_HEIGHT
        if (config.EDRPOU === '41919171') {//Afin
            data.number = '1/301020ФМ'
        } else if (config.EDRPOU === '39307260') {//Mg
            data.number = '1/30-1020-ФМ'
        } else if (config.EDRPOU === '39628794') {//Oct
            data.number = ' 1/30/1020-ФМ'
        }
        data.operator = operator.person
        data.operator_short = operator.person_short

        // data.created = $.isoDateToUADate(operator.created)
        var now = new Date();
        data.created = $.isoDateToUADate(now)

        data.summ_otvetov = 4

        rnd = Math.floor(Math.random() * 4) + 1;

        data.answer_3_a = ''
        data.answer_3_b = ''
        data.answer_3_c = ''
        data.answer_3_d = ''

        if (rnd == 1) {
            data.answer_3_a = '+'
        } else if (rnd == 2) {
            data.summ_otvetov = 5
            data.answer_3_b = '+'
        } else if (rnd == 3) {
            data.answer_3_c = '+'
        } else {
            data.answer_3_d = '+'
        }

        return data;
    }

    this.titlePage = function (data) {
        data = typeof data !== 'undefined' ? data : {update_id: 13};

        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        //data.company =  config.COMPANY_FULL_NAME
        data.company_short = config.COMPANY_SHORT_NAME
        data.full_name = department.full_name

        data.date_from = $.isoDateToUADate(data.date_from)
        data.date_end = $.isoDateToUADate(data.date_end)

        return data;
    }

    this.payment_account = function (operation_data) {
        // console.log(operation_data)
        if (typeof operation_data.payment_operation !== 'undefined') {
            payment = operation_data.payment_operation;
        } else {
            var DAT = getArchiveData(true)

            payment = $.grep(DAT.payment_operations, function (n, i) {
                return n.id == operation_data.operation_id;
            })[0];
        }
        // console.log(payment)
        currency = $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == payment.currency_id;
        })[0];
        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        if (typeof operation_data.double_page === 'undefined') {
            var double_page = true //department.printer_settings.toString(2).slice(-1)[0]=='1'
        } else {
            var double_page = operation_data.double_page
        }

        client = payment.client

        num_eop = payment.real_id

        data = {
            currency_amount: payment.currency_amount,
            commission_amount: payment.commission_amount,
            payment_amount: payment.payment_amount,
            client: client,
            columns: [{num: 1, clas: '', leftborder: 'none'}, {
                num: 2,
                clas: ' column-right',
                leftborder: 'dashed black 1px'
            }],
            company: config.COMPANY_FULL_NAME,
            edrpou: config.EDRPOU,
            full_name: department.full_name,
            address: department.address,
            currency: currency['code'],
            currency_numcode: currency['numcode'],
            currency_name: currency['name'],
            date: $.isoDateToUADate(payment.payment_time),
            double_page: double_page,
            max_buy: config.ANONYMOUS_BUY_LIMIT,
            num: payment.virtual_id,
            rate: feroksoft.rates_round(payment.exchange_rate).toFixed(6),
            rro_id: payment.virtual_id, // exchange.rro_id ? exchange.rro_id :
            num_eop: num_eop,
            transaction_id: payment.transaction_id,
            time: $.isoDateToTime(payment.payment_time),
            operation_time: payment.operation_time,
            client_phone: payment.phone,
            client_address: payment.address,
            purpose: payment.purpose,
            recipient_name: payment.recipient_name,
            recipient_bank_code: payment.recipient_bank_code,
            recipient_bank_name: payment.recipient_bank_name,
            recipient_account_title: payment.recipient_account.length == 29 ? 'IBAN отримувача' : 'Рахунок отримувача',
            recipient_account: payment.recipient_account,
            recipient_ipn: payment.recipient_ipn,
            has_recipient_bank_code: payment.recipient_account.length < 29,
            has_payment_address: payment.address !== '',
        }

        return data
    }

    this.payment_validate = function (payment) {

        department = JSON.parse(localStorage.getItem('department_details'))
        config = JSON.parse(localStorage.getItem('general_settings'))

        currency = $.grep(JSON.parse(localStorage.getItem('currencies')), function (n, i) {
            return n.id == config.UAH_ID;
        })[0];

        data = {
            currency_amount: payment.currency_amount,
            commission_amount: payment.commission_amount,
            payment_amount: payment.payment_amount,
            client: payment.client,
            company: config.COMPANY_FULL_NAME,
            edrpou: config.EDRPOU,
            full_name: department.full_name,
            address: department.address,
            currency: currency['code'],
            currency_numcode: currency['numcode'],
            currency_name: currency['name'],
            columns: [{num: 1, clas: '', leftborder: 'none'}],

        }

        return data
    }

}