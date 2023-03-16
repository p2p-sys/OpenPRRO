var buysellClass = function (modal_win, populateHTML) {
    populateHTML = typeof populateHTML !== 'undefined' ? populateHTML : true;

    modal_win.on('shown.bs.modal', function () {

        if (__getPrintingSettings().receipt_printer_double == 'n') {
            $(this).find('select#currency').val(0);
        }
        $(this).find('select#currency').eq(0).focus()
        // receipt_printer_double
        updateEquivalent()
    });
    modal_win.on('hide.bs.modal', function () {
        $('input#doPrintCertificate').remove()
    });

    //// Додати розрахунок здачі
    if (populateHTML) {
        var prev = modal_win.find('input[name=money_amount]').parent()
        received_amount = addInput(prev, label_name = 'Отримано', ident = 'received_amount')
        var prev = modal_win.find('input[name=equivalent]').parent()
        spare_change = addInput(prev, label_name = 'Решта', ident = 'spare_change')
    }
    spare_change.attr('readonly', true).attr('type', 'label')

    function update_spare() {
        equivalent = modal_win.find('input[name=equivalent]').val()
        received_amount = modal_win.find('input[name=received_amount]').val()
        spare_change = ((received_amount - equivalent) >= 0) ? (received_amount - equivalent).toFixed(2) : 'Отримано недостатньо коштів'
        sc_elem = modal_win.find('input[name=spare_change]')
        sc_elem.val(spare_change)
    }

    received_amount.on('keyup', function () {
        update_spare()
        sc_elem = modal_win.find('input[name=spare_change]')
        if (!sc_elem.visibility == true) {
            sc_elem.parent().show()
            $("label[for=" + sc_elem[0].id + "]").eq(0).show()
        }
    })
    modal_win.find('input[name=money_amount]').on('change', update_spare)
    modal_win.on('show.bs.modal', function () {
        modal_win.find('input[name=spare_change]').parent().hide()
        modal_win.find('input[name=spare_change]').parent().prev().hide()
    });
    //// Додати розрахунок здачі

    var updateEquivalent = function () {
        money_amount = modal_win.find('input[name=money_amount]').val()
        curr = modal_win.find('select[name=currency] option:selected').val()

        rates = $.actualRates()

        if (rates[curr]) {
            if (modal_win.find("#operation_type").val() == 'buy') {
                rate = rates[curr].buy_rate
            } else if (modal_win.find("#operation_type").val() == 'sell') {
                rate = rates[curr].sell_rate
            }
        } else {
            rate = 1
        }
        modal_win.find('input[name=exRate]').val(rate)
        new_equivalent = feroksoft.money_round(money_amount * rate)
        modal_win.find('input#equivalent').val(new_equivalent)

        //// imperative auth if amount is > 150 000
        if (new_equivalent >= 150000) {
            if (!modal_win.find("#notAnonymous").prop('checked')) {
                modal_win.find("#notAnonymous").trigger('click')
            }
            if (!modal_win.find("#checkPassport").prop('checked')) {
                modal_win.find("#checkPassport").trigger('click')
            }
            modal_win.find("#notAnonymous").prop('readonly', true)
            modal_win.find("#notAnonymous").prop('disabled', true)
            modal_win.find("#checkPassport").prop('readonly', true)
            modal_win.find("#checkPassport").prop('disabled', true)
        } else {
            modal_win.find("#notAnonymous").prop('readonly', false)
            modal_win.find("#notAnonymous").prop('disabled', false)
            modal_win.find("#checkPassport").prop('readonly', false)
            modal_win.find("#checkPassport").prop('disabled', false)

            if ((modal_win.find("#surname").val() == '') && (modal_win.find("#name").val() == '') && (modal_win.find("#father_name").val() == '')) {
                if (modal_win.find("#notAnonymous").prop('checked')) {
                    modal_win.find("#notAnonymous").trigger('click')
                }
            }
            if ((modal_win.find("#passport").val() == '') && (modal_win.find("#issue_auth").val() == '') && (modal_win.find("#tin").val() == '')) {
                if (modal_win.find("#checkPassport").prop('checked')) {
                    modal_win.find("#checkPassport").trigger('click')
                }
            }
        }
        //// imperative auth if amount is > 150 000
    }

    modal_win.find('input[name=money_amount]').on('keyup', updateEquivalent)
    modal_win.find('input[name=money_amount]').on("focus", function () {
        $(this).on("keydown", function (event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        });
    });

    var currencies = modal_win.find('select[name=currency]')
    currencies.change(updateEquivalent)
    currencies.append(currencies.find('option').pySort(function (a) {
        return [].concat(CURRENCY_ORDER).reverse().indexOf(a.innerText)
    }))
    currencies.find('option').eq(0).attr('selected', 'selected')

    var ActivateNames = function (activate) {
        modal_action = activate ? 'show' : 'hide'
        //alert(activate)
        modal_win.find(".is-name")[modal_action]()
        modal_win.find(".is-name input#surname").prop('required', activate)
        modal_win.find(".is-name input#name").prop('required', activate)
        modal_win.find(".is-name input").each(function () {
            markNormal($(this))
        })
    }
    var ActivatePassport = function (activate) {
        modal_action = activate ? 'show' : 'hide'
        //alert(activate)
        modal_win.find(".is-passport")[modal_action]()
        modal_win.find(".is-passport input#passport").prop('required', activate)
        modal_win.find(".is-passport input#issue_date").prop('required', activate)
        modal_win.find(".is-passport input#issue_auth").prop('required', activate)
        modal_win.find(".is-passport input#tin").prop('required', activate)
        modal_win.find(".is-passport input").each(function () {
            markNormal($(this))
        })
    }
    var resetModal = function () {
        const secondsSinceEpoch = Math.round(Date.now() / 1000)
        // console.log(secondsSinceEpoch)
        modal_win.find("#client_time").val(secondsSinceEpoch)

        modal_win.find('.modal-header,.modal-footer').removeClass('sell-colored buy-colored')
        modal_win.find("input").removeClass('alert-danger')
        modal_win.find('.alert-warning').remove()

        modal_win.find("input[type=text], textarea, input[type=number]").val("");
        modal_win.find("#notResident").prop('checked', false)
        modal_win.find("#notAnonymous").prop('checked', false)
        modal_win.find("#notAnonymous").parent().show()
        modal_win.find(".is-resident").hide()

        modal_win.find("#checkPassport").prop('checked', false)
        modal_win.find("#checkPassport").prop('readonly', false)
        modal_win.find("#checkPassport").prop('disabled', false)
        modal_win.find("#checkPassport").parent().hide()
        modal_win.find("#buysellPerformOperationImg").addClass('hide')
        modal_win.find("#cancelOperation").removeClass('hide')

        var today = ActualTime()
        $('#issue_date').daterangepicker({
            locale: {format: 'DD-MM-YYYY'},
            startDate: today.format('DD-MM-YYYY'),
            // endDate: today.format('YYYY-MM-DD HH:mm:ss'),
            // maxDate: today.format('YYYY-MM-DD'),
            //minDate: today.subtract({days:settings.ARCHIVE_MAX_DAYS}).format('YYYY-MM-DD'),
            singleDatePicker: true,
            timePicker: false,
            autoApply: true,
            ranges: false
        })

        ActivateNames(false)
        ActivatePassport(false)
        modal_win.find('input[name=summ]').val(0)
        updateEquivalent()
    };

    this.buy = function () {
        resetModal()
        modal_win.find('#received_amount').parent().hide();
        modal_win.find('label[for="received_amount"]').hide();
        modal_win.find('.modal-header,.modal-footer').addClass('buy-colored')
        modal_win.find("#operation_type").val('buy')
        modal_win.find(".modal-title").html('Купівля валюти')
        modal_win.find("#performOperation").html('Купити &nbsp;')
        addCertificateBtn()
        modal_win.find("#performOperation").append($('<img id="buysellPerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));
        displayModal(modal_win)
    }
    this.sell = function () {
        resetModal()
        modal_win.find('#received_amount').parent().show();
        modal_win.find('label[for="received_amount"]').show();
        modal_win.find('.modal-header,.modal-footer').addClass('sell-colored')
        modal_win.find("#operation_type").val('sell')
        modal_win.find(".modal-title").html('Продаж валюти')
        modal_win.find("#performOperation").html('Продати &nbsp;')
        modal_win.find('input[name=certificate]').val('').attr('readonly', false).show()
        modal_win.find("#performOperation").append($('<img id="buysellPerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));
        displayModal(modal_win)
    }
    var addCertificateBtn = function () {
        target = modal_win.find('#certificate')
        target.hide()
        i = $('<input>').attr('type', 'button').attr('id', 'doPrintCertificate').addClass('form-control').val('Згенерувати')
        target.after(i)
        i.click(function () {
            certificate_number = randomString(2, 'QWERTYUIOPASDFGHJKLZXCVBNM') + randomString(5, '1234567890')
            target.val(certificate_number)
            target.attr('readonly', true)
            target.show()
            $(this).remove()
        })
    }

    // this.ResidencyChange = function () {
    //     if ($(this).is(":checked")) {
    //         modal_win.find("#notAnonymous").prop('readonly', true)
    //         modal_win.find("#notAnonymous").prop('disabled', true)
    //         modal_win.find(".is-resident").show()
    //         ActivateNames(true)
    //         modal_win.find("#notAnonymous").parent().hide()
    //     } else {
    //         modal_win.find(".is-resident").hide()
    //         ActivateNames(false)
    //         modal_win.find("#notAnonymous").parent().show()
    //         modal_win.find("#notAnonymous").prop('checked', false)
    //         modal_win.find("#notAnonymous").prop('readonly', false)
    //         modal_win.find("#notAnonymous").prop('disabled', false)
    //     }
    //     updateEquivalent()
    // }
    // modal_win.find("#notResident").change(this.ResidencyChange)

    this.CheckPassportChange = function () {
        if ($(this).is(":checked")) {
            // modal_win.find("#notAnonymous").prop('readonly', true)
            // modal_win.find("#notAnonymous").prop('disabled', true)
            // modal_win.find("#notAnonymous").prop('checked', true)
            // modal_win.find(".is-passport").show()
            // ActivateNames(true)
            ActivatePassport(true)
            // modal_win.find("#notAnonymous").parent().hide()
        } else {
            // modal_win.find(".is-passport").hide()
            // ActivateNames(true)
            ActivatePassport(false)
            // modal_win.find("#notAnonymous").parent().show()
            // modal_win.find("#notAnonymous").prop('checked', true)
            // modal_win.find("#notAnonymous").prop('readonly', false)
            // modal_win.find("#notAnonymous").prop('disabled', false)
        }
        // updateEquivalent()
    }
    modal_win.find("#checkPassport").change(this.CheckPassportChange)

    this.AnonymityChange = function () {
        //alert('AnonymityChange')
        if ($(this).is(":checked")) {
            ActivateNames(true)
            // modal_win.find("#checkPassport").prop('checked', false)
            // ActivatePassport(false)
            modal_win.find("#checkPassport").prop('checked', false)
            modal_win.find("#checkPassport").prop('readonly', false)
            modal_win.find("#checkPassport").prop('disabled', false)
            modal_win.find("#checkPassport").parent().show()

        } else {
            if (!modal_win.find("#notResident").prop('checked')) {
                ActivateNames(false)
                // ActivatePassport(false)
            }
            // if (!modal_win.find("#checkPassport").prop('checked')) {
            ActivateNames(false)
            ActivatePassport(false)
            modal_win.find("#checkPassport").prop('checked', false)
            modal_win.find("#checkPassport").prop('readonly', false)
            modal_win.find("#checkPassport").prop('disabled', false)
            modal_win.find("#checkPassport").parent().hide()
            // }
        }
    }
    modal_win.find("#notAnonymous").change(this.AnonymityChange)

    buysellClass.prototype.send = function (data) {
        modal_win.find("#cancelOperation").addClass('hide')
        modal_win.find("#performOperation").prop('disabled', true)
        modal_win.find("#buysellPerformOperationImg").removeClass('hide')
        updateEquivalent()
        return $.get('exchange', data, function (ret) {
            if (ret.status == 'success') {
                modal_win.modal('hide')
                modal_win.find("#buysellPerformOperationImg").addClass('hide')
                resetModal()
                localStorage.setItem('exchange_operations', JSON.stringify(ret.exchange_operations))
                localStorage.setItem('balance', JSON.stringify(ret.balance))
                updateStatusTable()
                updateOperationsTable()
                updateFront()
                if (typeof ret.exchange_data !== 'undefined') {
                    printReceipt(null, ret.exchange_data)
                }
            } else {
                modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
                $.each(ret.errors, function (key, value) {
                    markError(modal_win.find('input[name=' + key + ']'), msg = value)
                })
                modal_win.find("#performOperation").prop('disabled', false)
                modal_win.find("#cancelOperation").removeClass('hide')
                modal_win.find("#buysellPerformOperationImg").addClass('hide')
            }
        })
    }
    var Perform = function () {

        // Перевірка форми на валідність
        var check = true
        if (__getPrintingSettings().receipt_printer_double == 'n') {
            curr = modal_win.find('select[name=currency] option:selected').val()
            if (curr == 0) {
                check = false
            }
        }
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
            //this.value = changeQuotes(this.value);
            //console.log(this.value)
        });
        // Перевірка на валідність
        if (check) {
            //Відправка операції на бек-енд
            modal_data = modal_win.find("select, textarea, input").serialize()
            modal_data = feroksoft.deSerialize(modal_data)
            buysellClass.prototype.send(modal_data)
        }
    }

    var performOperation = modal_win.find("#performOperation")
    performOperation.click(Perform)

    modal_win.on('keypress', function (e) {
        // console.log(e.keyCode)
        if (/^[А-Яа-яЄєІіЇїҐґa-zA-Z0-9\'.,\- \b]+$/.test(String.fromCharCode(e.keyCode))) {
            return;
        } else {
            e.preventDefault();
        }
    });
    modal_win.keydown(function (event) {
        if (event.keyCode == 13) {
            Perform();
            return false;
        }
    });

    if (__getPrintingSettings().receipt_printer_double == 'n') {
        var x = document.getElementById("currency");
        var option = document.createElement("option");
        option.text = "Необхідно вибрати валюту";
        option.value = "0";
        x.add(option, x[0]);
        $(this).find('select#currency').val(0);
        $(this).find('select#currency').eq(0).focus()
    }

}
var inoutClass = function (modal_win) {
    modal_win.on('shown.bs.modal', function () {
        $(this).find('input[name=money_amount]').eq(0).focus()
    });
    var resetModal = function () {
        modal_win.find('.modal-header,.modal-footer').removeClass('sell-colored buy-colored')
        modal_win.find('input[name=money_amount]').val('')
        modal_win.find("input").removeClass('alert-danger')
        modal_win.find('.alert-warning').remove()
        modal_win.find("#outcomePerformOperationImg").addClass('hide')
        updateEquivalent()
    };
    this.income = function () {
        resetModal()
        modal_win.find('.modal-header,.modal-footer').addClass('sell-colored')
        modal_win.find("#operation_type").val('income')
        modal_win.find(".modal-title").html('Підкріплення')

        modal_win.find("#performOperation").html('Провести &nbsp;')
        modal_win.find("#performOperation").append($('<img id="outcomePerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));

       modal_win.find('#bank_outcome').addClass('hide')

        displayModal(modal_win)
    }

    var bank_outcome = function () {

         if (confirm("Ви впевнені, що хочете сформувати БАНКІВСЬКУ iнкасацiю?") == true) {

            var department_details = JSON.parse(localStorage.getItem('department_details'))
            var settings = JSON.parse(localStorage.getItem('general_settings'))

            var cost = department.cost;
            var minimal_cost = settings.MINIMUM_COST;

            if (cost > minimal_cost) {

                $.ajax({
                    type: "GET",
                    url: 'cashflow',
                    data: {
                        operation_type: 'outcome',
                        money_amount: cost,
                        collector: department_details.collector_id,
                        currency: settings.UAH_ID,
                        ex_rate: 1,
                        equivalent: cost,
                        bank: 1
                    },
                    success: function (ret) {
                        modal_win.modal('hide')
                        modal_win.find("#outcomePerformOperationImg").addClass('hide')
                        localStorage.setItem('cashflow_operations', JSON.stringify(ret.cashflow_operations))
                        localStorage.setItem('balance', JSON.stringify(ret.balance))
                        updateStatusTable()
                        updateOperationsTable()
                        if (LOADED_MODULES.indexOf('prro') > -1) {
                            if (LOADED_MODULES.indexOf('printing') != -1) {
                                getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id': ret.id})
                            }
                        }
                    }
                })

            } else {

                alert("Некоректна сума видаткової частини, зв'яжіться з керівництвом відділення!");
            }
        }

    }

    this.outcome = function () {
        resetModal()
        modal_win.find('.modal-header,.modal-footer').addClass('buy-colored')
        modal_win.find("#operation_type").val('outcome')
        modal_win.find(".modal-title").html('Інкасація')

        modal_win.find("#performOperation").html('Провести &nbsp;')
        modal_win.find("#performOperation").append($('<img id="outcomePerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));

        modal_win.find('#bank_outcome').removeClass('hide')
        displayModal(modal_win)
    }
    var updateEquivalent = function () {
        money_amount = modal_win.find('input[name=money_amount]').val()
        curr = modal_win.find('select[name=currency] option:selected').val()
        rate = JSON.parse(localStorage.getItem('nbu_rates'))[curr]
        if (!rate) {
            rate = 1
        } else {
            rate = rate.rate
        }
        modal_win.find('input[name=ex_rate]').val(rate)
        modal_win.find('input#equivalent').val(money_amount * rate)
    };
    modal_win.find('input[name=money_amount]').on('keyup', updateEquivalent)
    modal_win.find('select[name=currency]').change(updateEquivalent)
    modal_win.find('input[name=money_amount]').on("focus", function () {
        $(this).on("keydown", function (event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        });
    });

    inoutClass.prototype.send = function (data) {
        modal_win.find("#performOperation").prop('disabled', true)
        modal_win.find("#outcomePerformOperationImg").removeClass('hide')
        return $.get('cashflow', data, function (ret) {
            if (ret.status == 'success') {
                modal_win.modal('hide')
                modal_win.find("#outcomePerformOperationImg").addClass('hide')
                localStorage.setItem('cashflow_operations', JSON.stringify(ret.cashflow_operations))
                localStorage.setItem('balance', JSON.stringify(ret.balance))//gregre
                updateStatusTable()
                updateOperationsTable()
                if (LOADED_MODULES.indexOf('prro') > -1) {
                    if (LOADED_MODULES.indexOf('printing') != -1) {
                        getPrintFnsByDoctype('cashflow')('cashflow', {'operation_id': ret.id})
                    }
                }

            } else {
                modal_win.find('.alert-warning').remove()
                modal_win.find("#outcomePerformOperationImg").addClass('hide')
                if (typeof ret.errors.general !== 'undefined') {
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
                $.each(ret.errors, function (key, value) {
                    markError(modal_win.find('input[name=' + key + ']'), msg = value)
                })
            }
        })
    }

    var Perform = function () {
        // Перевірка форми на валідність
        var check = true
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
        });

        if (check) {
            modal_data = modal_win.find("select, textarea, input").serialize()
            modal_data = feroksoft.deSerialize(modal_data)
            inoutClass.prototype.send(modal_data)
        }
    };

    var btn = $('<button class="btn btn-info">Банкiвська iнкасацiя</button>')
        .attr('id', 'bank_outcome')
    var before_element = modal_win.find("#performOperation")
    btn.insertBefore(before_element)

    modal_win.find("#bank_outcome").click(bank_outcome)

    // before_element.html('Провести &nbsp;')
    // before_element.append($('<img id="paymentPerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));

    modal_win.find("#performOperation").click(Perform)

    modal_win.keydown(function (event) {
        if (event.keyCode == 13) {
            Perform()
            return false;
        }
    });

}

var paymentCashflowClass = function (modal_win) {
    modal_win.on('shown.bs.modal', function () {
        $(this).find('input[name=money_amount]').eq(0).focus()
    });
    var resetModal = function () {
        modal_win.find('.modal-header,.modal-footer').removeClass('sell-colored buy-colored')
        modal_win.find('input[name=money_amount]').val('')
        modal_win.find("input").removeClass('alert-danger')
        modal_win.find('.alert-warning').remove()
    };
    this.outcome = function () {
        $('#paymentsModal').modal('hide')
        resetModal()
        modal_win.find('.modal-header,.modal-footer').addClass('sell-colored')
        modal_win.find(".modal-title").html('Платіжна інкасація')

        var settings = JSON.parse(localStorage.getItem('general_settings'))
        var payment_balance = $.grep(JSON.parse(localStorage.getItem('balance')), function (n, i) {
            return n.currency_id == settings.UAH_ID
        })[0].payment_balance;
        // console.log(payment_balance)
        modal_win.find('input[name=money_amount]').val(payment_balance)

        displayModal(modal_win)
    }

    paymentCashflowClass.prototype.send = function (data) {
        modal_win.find("#performOperation").prop('disabled', true)
        return $.get('paymentcashflow', data, function (ret) {
            if (ret.status == 'success') {
                modal_win.modal('hide')
                localStorage.setItem('cashflow_operations', JSON.stringify(ret.cashflow_operations))
                localStorage.setItem('balance', JSON.stringify(ret.balance))
                updateStatusTable()
                updateOperationsTable()
            } else {
                modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
                $.each(ret.errors, function (key, value) {
                    markError(modal_win.find('input[name=' + key + ']'), msg = value)
                })
            }
        })
    }

    var Perform = function () {
        // Перевірка форми на валідність
        var check = true
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
        });

        if (check) {
            modal_data = modal_win.find("select, textarea, input").serialize()
            modal_data = feroksoft.deSerialize(modal_data)
            paymentCashflowClass.prototype.send(modal_data)
        }
    };

    modal_win.find("#performOperation").click(Perform)
    modal_win.keydown(function (event) {
        if (event.keyCode == 13) {
            Perform()
            return false;
        }
    });

}

var payment_commission_by_service = function (service_id) {

    var data = {
        service_id: service_id,
    }

    var onSuccess = function (data, status, xhr) {
        if (typeof data.errors !== 'undefined') {
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
                    localStorage.setItem('payment_commissions', JSON.stringify(data.data))
                }

            } else {
                localStorage.setItem('payment_commissions', [])
            }
        }
    };

    return $.ajax({
        type: "POST",
        url: "api/payment_commission_by_service",
        data: JSON.stringify(data),
        contentType: 'application/json',
        async: false,
        success: onSuccess
    });

};


var paymentServiceClass = function (modal_win) {

    var openServicesForm = function (payment_services, category_id, pageName) {

        var payment_category = $.grep(JSON.parse(localStorage.getItem('payment_categories')), function (n, i) {
            return n.id == category_id
        })[0];

        // console.log(payment_services)
        var payment_services_html =
            '<div style="text-align:center"><h3>' + payment_category.name + '</h3>'

        if (payment_category.name !== payment_category.description) {
            payment_services_html = payment_services_html + '<h4>' + payment_category.description + '</h4>'
        }
        payment_services_html = payment_services_html + '</div><div class="row">'

        $.each(payment_services, function (i, op) {
            payment_services_html = payment_services_html +
                '<div id="paymentServiceButton' + op.id + '" class="column"><div class="service_container">' +
                '<img class="image" src="/static/images/payment_services/' + op.id + '_thumbnail.png" alt="' + op.name + '" />' +
                '<p class="bottom-left">' + op.name + '</p> ' +
                '</div></div>'
        })

        payment_services_html = payment_services_html +
            '</div>'

        document.getElementById(pageName).innerHTML = payment_services_html

        var openPaymentPage = function () {
            // console.log('test')
            openPaymentServicePage('paymentTabCategory', this, '#ffffcc')
        }

        $.each(payment_services, function (i, op) {
            modal_win.find("#paymentServiceButton" + op.id).click(openPaymentPage)
        })

    }
    var payment_services_by_category = function (pageName, category_id) {

        var data = {
            id: category_id,
        }

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
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

                        var payment_services_web = data.data

                        var payment_services_storage = JSON.parse(localStorage.getItem('payment_services'))
                        if (payment_services_storage) {

                            // var payment_services_storage = JSON.parse(localStorage.getItem('payment_services'))
                            // var payment_services = payment_services_storage.concat(payment_services_web)

                            var new_record = false
                            $.each(payment_services_web, function (i, op) {
                                var ps = $.grep(payment_services_storage, function (n, i) {
                                    return n.id == op.id
                                });
                                if (ps.length == 0) {
                                    payment_services_storage = payment_services_storage.concat(payment_services_web)
                                    new_record = true
                                }
                            })
                            console.log(new_record)
                            if (new_record) {
                                localStorage.setItem('payment_services', JSON.stringify(payment_services_storage))
                            }
                            var payment_services = payment_services_storage

                        } else {
                            var payment_services = payment_services_web
                            localStorage.setItem('payment_services', JSON.stringify(payment_services_web))
                        }
                        var payment_services = $.grep(payment_services, function (n, i) {
                            return n.category_id == category_id
                        });

                        openServicesForm(payment_services, category_id, pageName)

                    }

                }
            }
        };

        $.ajax({
            type: "POST",
            url: "api/payment_services_by_category",
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: onSuccess
        });

    };

    var payment_services_by_phrase = function (payment_search_text) {

        var data = {
            text: payment_search_text,
        }

        var onSuccess = function (data, status, xhr) {
            if (typeof data.errors !== 'undefined') {
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

                        var payment_services_web = data.data

                        var pageName = 'paymentTabCategory1'

                        // localStorage.setItem('payment_services', JSON.stringify(payment_services))

                        // console.log(payment_services)

                        var payment_services_html =
                            '<div style="text-align:center"><h3>Результат пошуку по фразі «' + payment_search_text + '»</h3>'
                        payment_services_html = payment_services_html + '</div><div class="row">'

                        $.each(payment_services_web, function (i, op) {
                            payment_services_html = payment_services_html +
                                '<div id="paymentServiceButton' + op.id + '" class="column"><div class="service_container">' +
                                '<img class="image" src="/static/images/payment_services/' + op.id + '_thumbnail.png" alt="' + op.name + '" />' +
                                '<p class="bottom-left">' + op.name + '</p> ' +
                                '</div></div>'
                        })

                        payment_services_html = payment_services_html +
                            '</div>'

                        document.getElementById(pageName).innerHTML = payment_services_html

                        var openPaymentPage = function () {
                            // console.log('test')
                            openPaymentServicePage('paymentTabCategory', this, '#ffffcc')
                        }

                        var payment_services_storage = JSON.parse(localStorage.getItem('payment_services'))

                        var new_record = false
                        $.each(payment_services_web, function (i, op) {
                            modal_win.find("#paymentServiceButton" + op.id).click(openPaymentPage)
                            var ps = $.grep(payment_services_storage, function (n, i) {
                                return n.id == op.id
                            });
                            if (ps.length == 0) {
                                payment_services_storage = payment_services_storage.concat(payment_services_web)
                                new_record = true
                            }
                        })
                        if (new_record) {
                            localStorage.setItem('payment_services', JSON.stringify(payment_services_storage))
                        }

                    }

                }
            }
        };

        $.ajax({
            type: "POST",
            url: "api/payment_services_by_phrase",
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: onSuccess
        });

    };

    var payment_validate = function () {

        var check = true
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
        });

        if (check) {

            var service_id = modal_win.find('input[name=payment_service]').val()

            var payment_account = modal_win.find('input[name=payment_account]').val()

            var data = {
                service_id: service_id,
                payment_account: payment_account
            }

            var onSuccess = function (data, status, xhr) {
                if (typeof data.errors !== 'undefined') {
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
                            // localStorage.setItem('payment_commissions', JSON.stringify(data.data))
                            markNormal(modal_win.find('input[name=payment_account]'))
                            // alert('Валидация пройдена!')

                            var payment_currency_amount = modal_win.find('input[name=payment_currency_amount]').val()
                            var payment_commission_amount = modal_win.find('input[name=payment_commission_amount]').val()
                            var payment_amount = modal_win.find('input[name=payment_amount]').val()

                            var docparams = {
                                client: 'Ідентифікатор - ' + payment_account,
                                currency_amount: payment_currency_amount,
                                commission_amount: payment_commission_amount,
                                payment_amount: payment_amount,
                            }

                            var data = report['payment_validate'](docparams)

                            data.double_page = false

                            var html = '';

                            return $.Deferred().resolve(html)
                                .then(function (html) {
                                    payment_validate_form = 'payment_validate'

                                    // var html = Mustache.render(TEMPLATES_RKKS[payment_validate_form], data)
                                    // return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                                    var current_settings = __getPrintingSettings()

                                    if (current_settings['receipt_printer_type'] == 'thermo58') {
                                        var html = Mustache.render(TEMPLATES_THERMO[payment_validate_form], data, {base: TEMPLATES_THERMO.base_payment})
                                        return PRINTING_SYSTEMS['thermo58']('payment_account', {}, html)
                                    } else if (current_settings['receipt_printer_type'] == 'thermo58_2') {
                                        var html = Mustache.render(TEMPLATES_THERMO[payment_validate_form], data, {base: TEMPLATES_THERMO.base_payment})
                                        return PRINTING_SYSTEMS['thermo58']('payment_account', {}, html)
                                    } else if (current_settings['receipt_printer_type'] == 'thermo80') {
                                        var html = Mustache.render(TEMPLATES_THERMO[payment_validate_form], data, {base: TEMPLATES_THERMO.base_payment})
                                        return PRINTING_SYSTEMS['thermo80']('payment_account', {}, html)
                                    } else {
                                        var html = Mustache.render(TEMPLATES_RKKS[payment_validate_form], data)
                                        return PRINTING_SYSTEMS['chrome'](0, 0, 0, html)
                                    }

                                })

                        } else if (data.status == 'errors') {
                            msg = data.message
                            markError(modal_win.find('input[name=payment_account]'), msg)
                        }
                    }
                }
            };

            return $.ajax({
                type: "POST",
                url: "api/payment_service_validate",
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: onSuccess
            });
        }

    };

    function openPage(pageName, elmnt, color, category_id) {

        modal_win.find("#performOperation").addClass('hide')
        modal_win.find('#paymentTabCategoryTemplate').addClass('hide')
        modal_win.find("#payment_validate").addClass('hide')

        // console.log('open '+category_id)
        // Hide all elements with class="tabcontent" by default */
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Remove the background color of all tablinks/buttons
        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].style.backgroundColor = "";
            tablinks[i].style.color = "white";
        }

        // Show the specific tab content
        document.getElementById(pageName).style.display = "block";
        document.getElementById(pageName).style.backgroundColor = "white";
        document.getElementById(pageName).style.color = "#000000";

        if (category_id > 0) {

            modal_win.find('#paymentServicesSearch').val('');

            if (localStorage.getItem('payment_services')) {
                var payment_services = $.grep(JSON.parse(localStorage.getItem('payment_services')), function (n, i) {
                    return n.category_id == category_id
                });
            } else {
                localStorage.setItem('payment_services', JSON.stringify([]))
                payment_services = []
            }

            var payment_category = $.grep(JSON.parse(localStorage.getItem('payment_categories')), function (n, i) {
                return n.id == category_id
            })[0];

            // console.log(payment_services.length)
            // console.log(payment_category.count)
            if (!payment_services) {
                payment_services_by_category(pageName, category_id);
            } else if (payment_services.length < payment_category.count) {
                payment_services_by_category(pageName, category_id);
            } else if (payment_services.length > payment_category.count) {
                localStorage.setItem('payment_services', JSON.stringify([]))
                payment_services_by_category(pageName, category_id);
            } else {
                openServicesForm(payment_services, category_id, pageName)
            }

        } else {

            payment_search_text = modal_win.find('#paymentServicesSearch').val()

            if (payment_search_text.length > 2) {

                payment_services_by_phrase(payment_search_text)

            } else if (payment_search_text.length = 0) {
                modal_win.find("#paymentButtonCategory1").click();
            }
        }

        elmnt.style.backgroundColor = color;
        elmnt.style.color = '#0f0f0a';

    }

    var updateComission = function () {

        var payment_currency_amount = parseFloat(modal_win.find('input[name=payment_currency_amount]').val())

        var service_id = modal_win.find('input[name=payment_service]').val()

        // console.log(service_id)

        var payment_commissions = $.grep(JSON.parse(localStorage.getItem('payment_commissions')), function (n, i) {
            var max = n.max ? n.max : 1000000000;
            var min = n.min ? n.min : 0;
            return (n.payment_service_id = service_id) && (payment_currency_amount <= max) && (payment_currency_amount >= min)

        })[0];
        // console.log(payment_commissions)
        if (payment_commissions.type == 1) {
            payment_commission_amount = payment_commissions.comission
        } else {
            payment_commission_amount = feroksoft.money_round1(payment_currency_amount * (payment_commissions.comission / 100), 2)
        }

        payment_amount = feroksoft.money_round1(payment_currency_amount + payment_commission_amount)
        payment_commission_amount = feroksoft.money_round1(payment_amount - payment_currency_amount)

        modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        modal_win.find('input[name=payment_amount]').val(payment_amount)
        modal_win.find('input[name=payment_commission]').val(payment_commissions.payment_commission_id)

    };

    var updateComissionByPaymentAmount = function () {

        var payment_amount = parseFloat(modal_win.find('input[name=payment_amount]').val())

        var service_id = modal_win.find('input[name=payment_service]').val()

        // console.log(service_id)

        var payment_commissions = $.grep(JSON.parse(localStorage.getItem('payment_commissions')), function (n, i) {
            var max = n.max ? n.max : 1000000000;
            var min = n.min ? n.min : 0;
            return (n.payment_service_id = service_id) && (payment_amount <= max) && (payment_amount >= min)

        })[0];

        if (payment_commissions.type == 1) {
            payment_commission_amount = payment_commissions.comission
        } else {
            payment_commission_amount = feroksoft.money_round1(payment_amount * (payment_commissions.comission / 100), 2)
        }

        payment_currency_amount = feroksoft.money_round1(payment_amount - payment_commission_amount)

        //Пересчитаем комиссию для точности
        if (payment_commissions.type == 1) {
            payment_commission_amount = payment_commissions.comission
        } else {
            payment_commission_amount = feroksoft.money_round1(payment_currency_amount * (payment_commissions.comission / 100), 2)
        }

        payment_currency_amount = feroksoft.money_round1(payment_amount - payment_commission_amount, 2)

        if (payment_currency_amount < 0) {
            payment_currency_amount = 0
        }

        if (payment_commission_amount < 0) {
            payment_commission_amount = 0
        }

        modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
        modal_win.find('input[name=payment_commission]').val(payment_commissions.payment_commission_id)

    };

    function openPaymentServicePage(pageName, elmnt, color) {

        var service_id = elmnt.getAttribute('id').substr(20);
        // console.log(elmnt.getAttribute('id'))
        // console.log(service_id)

        // Hide all elements with class="tabcontent" by default */
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Remove the background color of all tablinks/buttons
        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].style.backgroundColor = "";
            tablinks[i].style.color = "white";
        }

        // Show the specific tab content
        document.getElementById(pageName).style.display = "block";
        document.getElementById(pageName).style.backgroundColor = "white";
        document.getElementById(pageName).style.color = "#000000";

        var payment_service = $.grep(JSON.parse(localStorage.getItem('payment_services')), function (n, i) {
            return n.id == service_id
        })[0];

        // console.log(payment_service)
        modal_win.find('#paymentServiceName').html('Платіж по сервісу ' + payment_service.name)

        modal_win.find('#payment_account').prop('placeholder', payment_service.welcome + ', наприклад ' + payment_service.example)
        modal_win.find('input[name=payment_service]').val(service_id)
        modal_win.find('input[name=payment_service]').addClass('hide')
        modal_win.find('input[name=payment_commission]').addClass('hide')

        modal_win.find('input[name=payment_account]').val('')
        modal_win.find('input[name=payment_currency_amount]').val('')
        modal_win.find('input[name=payment_commission_amount]').val('')
        modal_win.find('input[name=payment_amount]').val('')

        markNormal(modal_win.find('input[name=payment_account]'))
        markNormal(modal_win.find('input[name=payment_currency_amount]'))
        markNormal(modal_win.find('input[name=payment_commission_amount]'))
        markNormal(modal_win.find('input[name=payment_amount]'))

        // Add the specific color to the button used to open the tab content
        elmnt.style.backgroundColor = color;
        elmnt.style.color = '#0f0f0a';

        payment_commission_by_service(service_id);

        modal_win.find('input[name=payment_currency_amount]').on('keyup', updateComission)
        modal_win.find('input[name=payment_currency_amount]').on("focus", function () {
            $(this).on("keydown", function (event) {
                if (event.keyCode === 38 || event.keyCode === 40) {
                    event.preventDefault();
                }
            });
        });

        modal_win.find('input[name=payment_amount]').on('keyup', updateComissionByPaymentAmount)

        // modal_win.find("#performOperation").prop('disabled', false)
        var performOperation = modal_win.find("#performOperation")
        performOperation.html('Провести &nbsp;')
        performOperation.append($('<img id="paymentPerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));
        performOperation.removeClass('hide')
        modal_win.find("#payment_validate").removeClass('hide')

        modal_win.find('#paymentTabCategoryTemplate').removeClass('hide')

    }

    modal_win.on('shown.bs.modal', function () {

        var openPage1 = function () {
            openPage('paymentTabCategory1', this, '#ffffcc', 1)
        }

        var openPage2 = function () {
            openPage('paymentTabCategory2', this, '#ffffcc', 2)
        }
        var openPage3 = function () {
            openPage('paymentTabCategory3', this, '#ffffcc', 3)
        }
        var openPage4 = function () {
            openPage('paymentTabCategory4', this, '#ffffcc', 4)
        }
        var openPage5 = function () {
            openPage('paymentTabCategory5', this, '#ffffcc', 5)
        }
        var openPage6 = function () {
            openPage('paymentTabCategory6', this, '#ffffcc', 6)
        }
        var openPage7 = function () {
            openPage('paymentTabCategory7', this, '#ffffcc', 7)
        }
        var openPage8 = function () {
            openPage('paymentTabCategory8', this, '#ffffcc', 8)
        }
        var openPage9 = function () {
            openPage('paymentTabCategory9', this, '#ffffcc', 9)
        }
        var openPage10 = function () {
            openPage('paymentTabCategory10', this, '#ffffcc', 10)
        }
        var openPage11 = function () {
            openPage('paymentTabCategory11', this, '#ffffcc', 11)
        }
        var openPage12 = function () {
            openPage('paymentTabCategory12', this, '#ffffcc', 12)
        }

        var paymentSearch = function () {

            if (modal_win.find('#paymentServicesSearch').val().length > 0) {
                openPage('paymentTabCategory1', this, '#ffffcc', 0)
            } else {
                modal_win.find("#paymentButtonCategory1").click();
            }

        };

        var paymentIconBarHtml = '';

        var payment_categories = JSON.parse(localStorage.getItem('payment_categories'));
        $.each(payment_categories, function (i, pc) {
            paymentIconBarHtml = paymentIconBarHtml + '<a href="#" id="paymentButtonCategory' + pc.id + '" class="tablink"><i class="fa ' + pc.image + '"></i></a>'
        })
        paymentIconBarHtml = paymentIconBarHtml + '<input type="text" placeholder="Пошук.." id="paymentServicesSearch">'

        document.getElementById('paymentIconBar').innerHTML = paymentIconBarHtml

        // modal_win.find("#performOperation").click(Perform)
        modal_win.find("#paymentButtonCategory1").click(openPage1)
        modal_win.find("#paymentButtonCategory2").click(openPage2)
        modal_win.find("#paymentButtonCategory3").click(openPage3)
        modal_win.find("#paymentButtonCategory4").click(openPage4)
        modal_win.find("#paymentButtonCategory5").click(openPage5)
        modal_win.find("#paymentButtonCategory6").click(openPage6)
        modal_win.find("#paymentButtonCategory7").click(openPage7)
        modal_win.find("#paymentButtonCategory8").click(openPage8)
        modal_win.find("#paymentButtonCategory9").click(openPage9)
        modal_win.find("#paymentButtonCategory10").click(openPage10)
        modal_win.find("#paymentButtonCategory11").click(openPage11)
        modal_win.find("#paymentButtonCategory12").click(openPage12)

        modal_win.find("#paymentButtonCategory1").click();

        modal_win.find('#paymentServicesSearch').on('keyup', paymentSearch)

        // modal_win.find("#performOperation").prop('disabled', true)

        $(this).find('input[name=payment_account]').eq(0).focus()
    });
    var resetModal = function () {
        modal_win.find('.modal-header,.modal-footer').removeClass('sell-colored buy-colored')
        modal_win.find('input[name=payment_account]').val('')
        modal_win.find('input[name=payment_currency_amount]').val('')
        modal_win.find('input[name=payment_commission_amount]').val('')
        modal_win.find('input[name=payment_amount]').val('')
    };

    this.services_income = function () {
        $('#paymentsModal').modal('hide')
        resetModal()
        modal_win.find('.modal-header,.modal-footer').addClass('buy-colored')
        modal_win.find("#operation_type").val('income')
        modal_win.find(".modal-title").html('Платеж')
        displayModal(modal_win)
    };

    paymentServiceClass.prototype.send = function (data) {

        // console.log('perfom send')

        var performOperation = modal_win.find("#performOperation")
        var paymentPerformOperationImg = modal_win.find("#paymentPerformOperationImg")
        paymentPerformOperationImg.removeClass('hide')

        performOperation.prop('disabled', true)

        return $.get('payment_service', data, function (ret) {
            if (ret.status == 'success') {
                modal_win.modal('hide')
                localStorage.setItem('payment_operations', JSON.stringify(ret.payment_operations))
                localStorage.setItem('balance', JSON.stringify(ret.balance))
                updateStatusTable()
                updateOperationsTable()
            } else {
                modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
                $.each(ret.errors, function (key, value) {
                    markError(modal_win.find('input[name=' + key + ']'), msg = value)
                })
                performOperation.prop('disabled', false)
                paymentPerformOperationImg.addClass('hide')
                modal_win.find("#payment_validate").addClass('hide')

            }
        })
    }

    var Perform = function () {
        // console.log('perfom')
        // Перевірка форми на валідність
        var check = true
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
        });

        if (check) {
            // console.log('perfom check')
            modal_data = modal_win.find("select, textarea, input").serialize()
            modal_data = feroksoft.deSerialize(modal_data)
            paymentServiceClass.prototype.send(modal_data)
        }
    };

    modal_win.on('keypress', function (e) {
        //console.log(e.keyCode)
        if (/^[А-Яа-яЄєІіЇїҐґa-zA-Z0-9_\-+\/'.,;#№^&%$`!<>|\\@* \b]+$/.test(String.fromCharCode(e.keyCode))) {
            return;
        } else {
            e.preventDefault();
        }
    });

    var performOperation = modal_win.find("#performOperation")

    var btn = $('<button class="btn btn-info hide"><i class=" glyphicon glyphicon-print"></i>&nbsp;&nbsp; На уточнення клієнту</button>')
        .attr('id', 'payment_validate')
    btn.insertBefore(performOperation)

    modal_win.find("#payment_validate").click(payment_validate)

    performOperation.click(Perform)

}


var paymentAccountClass = function (modal_win) {
    modal_win.on('shown.bs.modal', function () {
        $(this).find('input[name=phone]').eq(0).focus()
    });
    var resetModal = function () {
        modal_win.find('.modal-header,.modal-footer').removeClass('sell-colored buy-colored')
        modal_win.find('input[name=payment_currency_amount]').val('')
        modal_win.find('input[name=payment_commission_amount]').val('')
        modal_win.find('input[name=payment_discount_amount]').val(0)
        modal_win.find('input[name=payment_amount]').val('')

        setting = JSON.parse(localStorage.getItem('general_settings'))
        service_id = setting.PAYMENT_SERVICE_CODE

        modal_win.find('input[name=payment_service]').val(service_id)
        modal_win.find('input[name=payment_service]').addClass('hide')
        modal_win.find('input[name=payment_commission]').addClass('hide')

        payment_commission_by_service(service_id);

        var department_details = JSON.parse(localStorage.getItem('department_details'))
        if (typeof department_details.payment_discount !== 'undefined') {
            if (!department_details.payment_discount) {
                modal_win.find('input[name=payment_discount_amount]').parent().addClass('hide')
                modal_win.find('label[for=payment_discount_amount]').addClass('hide')
            }
        }
        // updateComission()
    };

    this.accounts_income = function () {

        $('#paymentsModal').modal('hide')
        resetModal()

        modal_win.find('.modal-header,.modal-footer').addClass('buy-colored')
        modal_win.find("#operation_type").val('income')
        modal_win.find(".modal-title").html('Платіж за реквізитами')

        displayModal(modal_win)

    };

    this.accounts_template_income = function (opid, payment_templates) {

        // console.log(opid)

        data = $.grep(payment_templates, function (n, i) {
            return (n.id == opid)
            //return (n.fiscal_time != null)
        })[0]
        // console.log(data)

        $('#paymentTemplatesModal').modal('hide')
        resetModal()

        modal_win.find('.modal-header,.modal-footer').addClass('buy-colored')
        modal_win.find("#operation_type").val('income')
        modal_win.find(".modal-title").html('Платіж за реквізитами')

        modal_win.find('input[name=phone]').val(data.person_phone)
        modal_win.find('input[name=name]').val(data.person_name)
        modal_win.find('input[name=surname]').val(data.person_surname)
        modal_win.find('input[name=father_name]').val(data.person_father_name)
        modal_win.find('input[name=address]').val(data.person_address)

        modal_win.find('input[name=payment_recipient_account]').val(data.recipient_account)

        modal_win.find('select[name=payment_recipient_bank]').val(data.bank_id)

        modal_win.find('input[name=payment_recipient_ipn]').val(data.recipient_ipn)
        modal_win.find('input[name=payment_recipient_name]').val(data.recipient_name)
        modal_win.find('input[name=payment_purpose]').val(data.purpose)

        modal_win.find('input[name=payment_currency_amount]').val(data.currency_amount)

        modal_win.find('input[name=payment_amount]').val(data.total_amount)

        setting = JSON.parse(localStorage.getItem('general_settings'))
        service_id = setting.PAYMENT_SERVICE_CODE

        modal_win.find('input[name=payment_service]').val(service_id)
        modal_win.find('input[name=payment_service]').addClass('hide')
        modal_win.find('input[name=payment_commission]').addClass('hide')

        payment_commission_by_service(service_id);

        if (data.currency_amount > 0) {
            updateComission()
        } else {
            updateComissionByPaymentAmount()
        }

        displayModal(modal_win)

        modal_win.find('input[name=payment_purpose]').focus();

    };

    var updateComission = function () {

        var payment_currency_amount = parseFloat(modal_win.find('input[name=payment_currency_amount]').val())

        var payment_discount_amount = parseFloat(modal_win.find('input[name=payment_discount_amount]').val())

        var service_id = modal_win.find('input[name=payment_service]').val()

        // console.log(service_id)

        var payment_commissions = $.grep(JSON.parse(localStorage.getItem('payment_commissions')), function (n, i) {
            var max = n.max ? n.max : 1000000000;
            var min = n.min ? n.min : 0;
            return (n.payment_service_id == service_id) && (payment_currency_amount <= max) && (payment_currency_amount >= min)

        })[0];
        // console.log(JSON.parse(localStorage.getItem('payment_commissions')))
        // console.log(payment_commissions)
        // console.log(service_id)
        if (payment_commissions.type == 1) {
            payment_commission_amount = payment_commissions.comission
        } else {
            payment_commission_amount = feroksoft.money_round1(payment_currency_amount * (payment_commissions.comission / 100), 2)
        }

        if (payment_discount_amount > payment_commission_amount) {
            payment_discount_amount = payment_commission_amount
            modal_win.find('input[name=payment_discount_amount]').val(payment_commission_amount)
        }

        payment_amount = feroksoft.money_round1(payment_currency_amount + payment_commission_amount - payment_discount_amount)
        payment_commission_amount = feroksoft.money_round1(payment_amount - payment_currency_amount)

        modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        modal_win.find('input[name=payment_amount]').val(payment_amount)
        modal_win.find('input[name=payment_commission]').val(payment_commissions.payment_commission_id)

    };

    var updateComissionByPaymentAmount = function () {

        var payment_amount = parseFloat(modal_win.find('input[name=payment_amount]').val())

        var payment_discount_amount = parseFloat(modal_win.find('input[name=payment_discount_amount]').val())

        var service_id = modal_win.find('input[name=payment_service]').val()

        // console.log(service_id)

        var payment_commissions = $.grep(JSON.parse(localStorage.getItem('payment_commissions')), function (n, i) {
            var max = n.max ? n.max : 1000000000;
            var min = n.min ? n.min : 0;
            return (n.payment_service_id == service_id) && (payment_amount <= max) && (payment_amount >= min)

        })[0];

        if (payment_commissions.type == 1) {
            payment_commission_amount = payment_commissions.comission
        } else {
            payment_commission_amount = feroksoft.money_round(payment_amount * (payment_commissions.comission / 100), 2)
        }

        if (payment_discount_amount > payment_commission_amount) {
            payment_discount_amount = payment_commission_amount
            modal_win.find('input[name=payment_discount_amount]').val(payment_commission_amount)
        }
        payment_currency_amount = feroksoft.money_round1(payment_amount - payment_commission_amount + payment_discount_amount)

        //Пересчитаем комиссию для точности
        if (payment_commissions.type == 1) {
            payment_commission_amount = payment_commissions.comission
        } else {
            payment_commission_amount = feroksoft.money_round1(payment_currency_amount * (payment_commissions.comission / 100), 2)
        }

        if (payment_discount_amount > payment_commission_amount) {
            payment_discount_amount = payment_commission_amount
            modal_win.find('input[name=payment_discount_amount]').val(payment_commission_amount)
        }

        payment_currency_amount = feroksoft.money_round1(payment_amount - payment_commission_amount + payment_discount_amount)

        if (payment_currency_amount < 0) {
            payment_currency_amount = 0
        }

        if (payment_commission_amount < 0) {
            payment_commission_amount = 0
        }

        modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
        modal_win.find('input[name=payment_commission]').val(payment_commissions.payment_commission_id)

    };

    var payment_search = function () {

        var payment_id = prompt("Заповнення даних по номеру квитанції:", "Введіть номер квитанції");
        if (payment_id == null || payment_id == "") {
            // txt = "User cancelled the prompt.";
        } else {
            // document.getElementById("demo").innerHTML = txt;

            // modal_win.find('input[name=phone]').val(txt)

            // phone = modal_win.find('input[name=phone]').val()
            var data = {
                id: payment_id,
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
                            data = data.data
                            modal_win.find('input[name=phone]').val(data.phone)
                            modal_win.find('input[name=name]').val(data.name)
                            modal_win.find('input[name=surname]').val(data.surname)
                            modal_win.find('input[name=father_name]').val(data.father_name)
                            modal_win.find('input[name=address]').val(data.address)

                            modal_win.find('input[name=payment_recipient_account]').val(data.account)

                            modal_win.find('select[name=payment_recipient_bank]').val(data.bank_id)

                            modal_win.find('input[name=payment_recipient_ipn]').val(data.ipn)
                            modal_win.find('input[name=payment_recipient_name]').val(data.recipient_name)
                            modal_win.find('input[name=payment_purpose]').val(data.purpose)

                            modal_win.find('input[name=payment_currency_amount]').val(data.currency_amount)

                            updateComission()

                            modal_win.find('input[name=payment_purpose]').focus();
                        } else {
                            alert('На жаль, за вказаним номером даних немає');
                        }

                    }
                    // console.log(data)

                }
            }

            $.ajax({
                type: "GET",
                url: "api/payment_operation_by_id",
                data: data,
                contentType: 'application/json',
                success: onSuccess
            });
        }
        // modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        // modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
    };

    var payment_person_by_phone = function () {

        phone = modal_win.find('input[name=phone]').val()
        var data = {
            phone: phone,
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
                        data = data.data
                        modal_win.find('input[name=name]').val(data.name)
                        modal_win.find('input[name=surname]').val(data.surname)
                        modal_win.find('input[name=father_name]').val(data.father_name)
                        modal_win.find('input[name=address]').val(data.address)

                        modal_win.find('input[name=payment_recipient_account]').attr('list', 'payment_recipient_account_list')//gre0609

                        var str=''; // variable to store the options
                        var payment_recipient_account_data = data.payment_recipient_account_list;
                        for (var i=0; i < payment_recipient_account_data.length;++i){
                            str += '<option value="'+payment_recipient_account_data[i]+'" />';
                        }
                        // console.log(str)
                        // modal_win.find('datalist[name=payment_recipient_account_list]').innerHTML = str;
                        document.getElementById("payment_recipient_account_list").innerHTML = str;

                        modal_win.find('input[name=payment_recipient_account]').focus();

                    } else {
                        modal_win.find('input[name=name]').val('')
                        modal_win.find('input[name=surname]').val('')
                        modal_win.find('input[name=father_name]').val('')
                        modal_win.find('input[name=address]').val('')
                    }
                }
                // console.log(data)

            }
        }

        $.ajax({
            type: "GET",
            url: "api/payment_person_by_phone",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

        // modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        // modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
    };

    var payment_recipient_by_account = function () {

        var payment_recipient_account = modal_win.find('input[name=payment_recipient_account]').val()
        var data = {
            account: payment_recipient_account,
        }

        // if (payment_recipient_account.length == 29){
            modal_win.find('select[name=payment_recipient_bank]').parent().addClass('hide')
            modal_win.find('label[for=payment_recipient_bank]').addClass('hide')
            modal_win.find('select[name=payment_recipient_bank]').val(300001)
        // } else {
        //     modal_win.find('select[name=payment_recipient_bank]').parent().removeClass('hide')
        //     modal_win.find('label[for=payment_recipient_bank]').removeClass('hide')
        // }

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
                        data = data.data

                        // if (payment_recipient_account.length == 29){
                            modal_win.find('select[name=payment_recipient_bank]').val(300001)
                        // } else {
                        //     modal_win.find('select[name=payment_recipient_bank]').val(data.bank_id)
                        // }
                        modal_win.find('input[name=payment_recipient_ipn]').val(data.ipn)
                        modal_win.find('input[name=payment_recipient_name]').val(data.name)
                        modal_win.find('input[name=payment_purpose]').val(data.purpose)
                        modal_win.find('input[name=payment_purpose]').focus();
                    } else {
                        modal_win.find('input[name=payment_recipient_ipn]').val('')
                        modal_win.find('input[name=payment_recipient_name]').val('')
                        modal_win.find('input[name=payment_purpose]').val('')
                    }
                }
                // console.log(data)

            }
        }

        $.ajax({
            type: "GET",
            url: "api/payment_recipient_by_account",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

        // modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        // modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
    };

    modal_win.find('input[name=payment_currency_amount]').on('keyup', updateComission)
    // modal_win.find('select[name=currency]').change(updateEquivalent)
    modal_win.find('input[name=payment_currency_amount]').on("focus", function () {
        $(this).on("keydown", function (event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        });
    });

    modal_win.find('input[name=payment_discount_amount]').on('keyup', updateComission)
    modal_win.find('input[name=payment_amount]').on('keyup', updateComissionByPaymentAmount)

    modal_win.find('input[name=phone]').on('keyup', payment_person_by_phone)
    modal_win.find('input[name=payment_recipient_account]').on('keyup', payment_recipient_by_account)

    modal_win.find('select[name=payment_recipient_bank]').parent().addClass('hide')
    modal_win.find('label[for=payment_recipient_bank]').addClass('hide')
    modal_win.find('select[name=payment_recipient_bank]').val(300001)

    paymentAccountClass.prototype.send = function (data) {
        var performOperation = modal_win.find("#performOperation")
        var paymentPerformOperationImg = modal_win.find("#paymentPerformOperationImg")
        paymentPerformOperationImg.removeClass('hide')

        performOperation.prop('disabled', true)

        return $.get('payment_account', data, function (ret) {
            if (ret.status == 'success') {
                modal_win.modal('hide')
                localStorage.setItem('payment_operations', JSON.stringify(ret.payment_operations))
                localStorage.setItem('balance', JSON.stringify(ret.balance))
                updateStatusTable()
                updateOperationsTable()
            } else {
                modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
                $.each(ret.errors, function (key, value) {
                    markError(modal_win.find('input[name=' + key + ']'), msg = value)
                })
                performOperation.prop('disabled', false)
                paymentPerformOperationImg.addClass('hide')

            }
        })
    }

    var Perform = function () {
        // Перевірка форми на валідність
        var check = true
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
        });

        if (check) {
            // modal_data = modal_win.find("select, textarea, input").serialize()
            // modal_data = feroksoft.deSerialize(modal_data)
            modal_data = modal_win.find("select, textarea, input")
            paymentAccountClass.prototype.send(modal_data)
        }
    };

    modal_win.find("#performOperation").click(Perform)
    modal_win.on('keypress', function (e) {
        //console.log(e.keyCode)
        if (/^[А-Яа-яЄєІіЇїҐґa-zA-Z0-9_\-+\/'.,;:()?#№^&%$`!<>|\\@* \b]+$/.test(String.fromCharCode(e.keyCode))) {
            return;
        } else {
            e.preventDefault();
        }
    });

    var btn = $('<button class="btn btn-info"><i class=" glyphicon glyphicon-search"></i>&nbsp;&nbsp; Пошук</button>')
        .attr('id', 'payment_by_number')
    var before_element = modal_win.find("#performOperation")
    btn.insertBefore(before_element)

    modal_win.find("#payment_by_number").click(payment_search)
    before_element.html('Провести &nbsp;')
    before_element.append($('<img id="paymentPerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));

    // modal_win.keydown(function (event) {
    //     if (event.keyCode == 13) {
    //         Perform()
    //         return false;
    //     }
    // });
}

var paymentTemplateClass = function (modal_win) {
    modal_win.on('shown.bs.modal', function () {
        $(this).find('input[name=template_name]').eq(0).focus()
    });
    var resetModal = function () {
        modal_win.find('.modal-header,.modal-footer').removeClass('sell-colored buy-colored')
    };

    this.template_add = function () {
        $('#paymentTemplatesModal').modal('hide')
        resetModal()
        modal_win.find('.modal-header,.modal-footer').addClass('buy-colored')
        // modal_win.find("#operation_type").val('income')
        modal_win.find(".modal-title").html('Шаблон')

        displayModal(modal_win)

    };

    var payment_search = function () {

        var payment_id = prompt("Заповнення даних по номеру квитанції:", "Введіть номер квитанції");
        if (payment_id == null || payment_id == "") {
            // txt = "User cancelled the prompt.";
        } else {
            // document.getElementById("demo").innerHTML = txt;

            // modal_win.find('input[name=phone]').val(txt)

            // phone = modal_win.find('input[name=phone]').val()
            var data = {
                id: payment_id,
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
                            data = data.data

                            modal_win.find('input[name=template_person_phone]').val(data.phone)

                            modal_win.find('input[name=template_person_name]').val(data.name)
                            modal_win.find('input[name=template_person_surname]').val(data.surname)
                            modal_win.find('input[name=template_person_father_name]').val(data.father_name)
                            modal_win.find('input[name=template_person_address]').val(data.address)

                            modal_win.find('input[name=template_recipient_account]').val(data.account)

                            modal_win.find('select[name=template_recipient_bank]').val(data.bank_id)

                            modal_win.find('input[name=template_recipient_ipn]').val(data.ipn)
                            modal_win.find('input[name=template_recipient_name]').val(data.recipient_name)
                            modal_win.find('input[name=template_purpose]').val(data.purpose)

                            modal_win.find('input[name=template_currency_amount]').val(0)

                            modal_win.find('input[name=template_total_amount]').val(0)

                            modal_win.find('input[name=template_purpose]').focus();
                        } else {
                            alert('На жаль, за вказаним номером даних немає');
                        }

                    }
                    // console.log(data)

                }
            }

            $.ajax({
                type: "GET",
                url: "api/payment_operation_by_id",
                data: data,
                contentType: 'application/json',
                success: onSuccess
            });
        }
        // modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        // modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
    };

    var template_person_by_phone = function () {

        phone = modal_win.find('input[name=template_person_phone]').val()
        var data = {
            phone: phone,
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
                        data = data.data
                        modal_win.find('input[name=template_person_name]').val(data.name)
                        modal_win.find('input[name=template_person_surname]').val(data.surname)
                        modal_win.find('input[name=template_person_father_name]').val(data.father_name)
                        modal_win.find('input[name=template_person_address]').val(data.address)
                        modal_win.find('input[name=template_recipient_account]').focus();
                    } else {
                        // modal_win.find('input[name=template_person_name]').val('')
                        // modal_win.find('input[name=template_person_surname]').val('')
                        // modal_win.find('input[name=template_person_father_name]').val('')
                        // modal_win.find('input[name=template_person_address]').val('')
                    }
                }
                // console.log(data)

            }
        }

        $.ajax({
            type: "GET",
            url: "api/payment_person_by_phone",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

        // modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        // modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
    };

    var template_recipient_by_account = function () {

        template_recipient_account = modal_win.find('input[name=template_recipient_account]').val()
        var data = {
            account: template_recipient_account,
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
                        data = data.data

                        modal_win.find('select[name=template_recipient_bank]').val(data.bank_id)

                        modal_win.find('input[name=template_recipient_ipn]').val(data.ipn)
                        modal_win.find('input[name=template_recipient_name]').val(data.name)
                        modal_win.find('input[name=template_purpose]').val(data.purpose)
                        modal_win.find('input[name=template_purpose]').focus();
                    } else {
                        // modal_win.find('input[name=template_recipient_ipn]').val('')
                        // modal_win.find('input[name=template_recipient_name]').val('')
                        // modal_win.find('input[name=template_purpose]').val('')
                    }
                }
                // console.log(data)

            }
        }

        $.ajax({
            type: "GET",
            url: "api/payment_recipient_by_account",
            data: data,
            contentType: 'application/json',
            success: onSuccess
        });

        // modal_win.find('input[name=payment_commission_amount]').val(payment_commission_amount)
        // modal_win.find('input[name=payment_currency_amount]').val(payment_currency_amount)
    };

    var updateTotalAmount = function () {
        modal_win.find('input[name=template_total_amount]').val(0)
    };

    var updateCurrencyAmount = function () {
        modal_win.find('input[name=template_currency_amount]').val(0)
    };

    // modal_win.find('select[name=currency]').change(updateEquivalent)
    modal_win.find('input[name=template_currency_amount]').on("focus", function () {
        $(this).on("keydown", function (event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        });
    });

    modal_win.find('input[name=template_person_phone]').on('keyup', template_person_by_phone)

    modal_win.find('input[name=template_recipient_account]').on('keyup', template_recipient_by_account)

    modal_win.find('input[name=template_currency_amount]').on('keyup', updateTotalAmount)

    modal_win.find('input[name=template_total_amount]').on('keyup', updateCurrencyAmount)

    paymentTemplateClass.prototype.send = function (data) {
        var performOperation = modal_win.find("#performOperation")
        var paymentPerformOperationImg = modal_win.find("#paymentPerformOperationImg")
        paymentPerformOperationImg.removeClass('hide')

        performOperation.prop('disabled', true)

        return $.get('payment_template', data, function (ret) {
            if (ret.status == 'success') {
                modal_win.modal('hide')
                // localStorage.setItem('payment_templates', JSON.stringify(ret.payment_templates))
                // localStorage.setItem('balance', JSON.stringify(ret.balance))
                // updateStatusTable()
                // updateOperationsTable()
                displayModal($("#paymentTemplatesModal"))
            } else {
                modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }
                $.each(ret.errors, function (key, value) {
                    markError(modal_win.find('input[name=' + key + ']'), msg = value)
                })
                performOperation.prop('disabled', false)
                paymentPerformOperationImg.addClass('hide')

            }
        })
    }

    var Perform = function () {
        // Перевірка форми на валідність
        var check = true
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
        });

        if (check) {
            modal_data = modal_win.find("select, textarea, input").serialize()
            modal_data = feroksoft.deSerialize(modal_data)
            paymentTemplateClass.prototype.send(modal_data)
        }
    };

    modal_win.find("#performOperation").click(Perform)
    modal_win.on('keypress', function (e) {
        //console.log(e.keyCode)
        if (/^[А-Яа-яЄєІіЇїҐґa-zA-Z0-9_\-+\/'.,;:()?#№^&%$`!<>|\\@* \b]+$/.test(String.fromCharCode(e.keyCode))) {
            return;
        } else {
            e.preventDefault();
        }
    });

    modal_win.find('select[name=template_recipient_bank]').parent().addClass('hide')
    modal_win.find('label[for=template_recipient_bank]').addClass('hide')
    modal_win.find('select[name=template_recipient_bank]').val(300001)

    var btn = $('<button class="btn btn-info"><i class=" glyphicon glyphicon-search"></i>&nbsp;&nbsp; Пошук</button>')
        .attr('id', 'payment_by_number')
    var before_element = modal_win.find("#performOperation")
    btn.insertBefore(before_element)

    modal_win.find("#payment_by_number").click(payment_search)
    before_element.html('Зберегти &nbsp;')
    before_element.append($('<img id="paymentPerformOperationImg" class="hide" src="/static/images/spinner.gif" alt="Save icon" width=20 height="auto"/>'));

    // modal_win.keydown(function (event) {
    //     if (event.keyCode == 13) {
    //         Perform()
    //         return false;
    //     }
    // });
}

var ratesClass = function (modal_win) {
    var orig_data = []
    modal_win.find('input:not([readonly])').change(function () {
        $(this).addClass('buy-colored')
    })
    modal_win.on('shown.bs.modal', function () {
        $(this).find('input:not([readonly])').eq(0).focus()
    })

    var getBuyRate = function (cid) {
        return modal_win.find('input[readonly][value=' + cid + ']:first-child').parent().next().children().eq(0)
    }
    var getSellRate = function (cid) {
        return modal_win.find('input[readonly][value=' + cid + ']:first-child').parent().next().next().children().eq(0)
    }
    var getMinRate = function (cid) {
        return modal_win.find('input[readonly][value=' + cid + ']:first-child').parent().next().next().next().children().eq(0)
    }
    var getMaxRate = function (cid) {
        return modal_win.find('input[readonly][value=' + cid + ']:first-child').parent().next().next().next().next().children().eq(0)
    }
    var getNBURate = function (cid) {
        return modal_win.find('input[readonly][value=' + cid + ']:first-child').parent().next().next().next().next().next().children().eq(0)
    }
    var resetModal = function () {
        modal_win.find("input").removeClass('alert-danger')
        modal_win.find('.alert-warning').remove()
    }

    this.activate = function () {
        modal_win.find('input:not([readonly])').removeClass('buy-colored')
        modal_win.find(".modal-title").html('Зміна курсів')

        resetModal()
        repopulateForm()
        orig_data = modal_win.find("select, textarea, input").serialize()
        displayModal(modal_win)
    }
    var repopulateForm = function () {
        var nbu_rates = JSON.parse(localStorage.getItem('nbu_rates'))
        setting = JSON.parse(localStorage.getItem('general_settings'))
        $.each($.actualRates(), function (k, v) {
            if (k != 'rates_time') {
                var nbu_rate = nbu_rates[k] ? nbu_rates[k].rate : 1
                var currency = __getCurrency(k)
                var degree = __getCurrDegree(k)
                // 2 - default decimal places dictated by NBUы
                var x = currency.decimal_places ? currency.decimal_places : 2
                var step = Math.pow(10, x)
                step = step * currency.degree
                step = 1 / step

                nbu = feroksoft.rates_round(nbu_rates[k].rate / nbu_rates[k].degree)
                var nbutop = (1 + setting.NBU_DEVIATION_TOP / 100) * nbu
                var nbubottom = (1 - setting.NBU_DEVIATION_BOTTOM / 100) * nbu

                getSellRate(k).val(v.sell_rate).attr('step', step).attr('min', 0)
                getBuyRate(k).val(v.buy_rate).attr('step', step).attr('min', 0)
                getMinRate(k).val(nbubottom.toFixed(x))
                getMaxRate(k).val(nbutop.toFixed(x))
                getNBURate(k).val(nbu_rate)
            }
        })
    }

    var checkNBU30percent = function (check) {
        resetModal()
        setting = JSON.parse(localStorage.getItem('general_settings'))
        nbu_rates = JSON.parse(localStorage.getItem('nbu_rates'))

        $.each(nbu_rates, function (k, v) {
            nbu = feroksoft.rates_round(v.rate / v.degree)

            var nbutop = (1 + setting.NBU_DEVIATION_TOP / 100) * nbu
            var nbubottom = (1 - setting.NBU_DEVIATION_BOTTOM / 100) * nbu

            var x = getSellRate(k)
            var y = getBuyRate(k)

            if ((typeof x.val() == 'undefined') || (typeof y.val() == 'undefined')) {
                // if no input for that currency present
                return true
            }

            var xVal = parseFloat(x.val().replace(",", "."));
            var yVal = parseFloat(y.val().replace(",", "."));

            if (xVal > nbutop) {
                markError(x, msg = 'Курс не може бути більше ' + nbutop.toFixed(4) + ' (' + setting.NBU_DEVIATION_TOP + '% від курсу НБУ)')
                check = false
            }
            if (yVal < nbubottom) {
                markError(y, msg = 'Курс не може бути менше ' + nbubottom.toFixed(4) + ' (' + setting.NBU_DEVIATION_BOTTOM + '% від курсу НБУ)')
                check = false
            }
            if (xVal < yVal) {
                markError(x, msg = 'Курс продажу не може бути менше курсу купівлі')
                check = false
            }
            if (xVal == yVal) {
                markError(x, msg = 'Курс купівлі та продажу не можуть співпадати')
                markError(y, msg = 'Курс купівлі та продажу не можуть співпадати')
                check = false
            }

        })
        return check
    }

    ratesClass.prototype.send = function (data) {
        modal_win.find("#performOperation").prop('disabled', true)
        return $.get('change_rates', data, function (ret) {
            if (ret.status == 'success') {
                modal_win.modal('hide')
                localStorage.setItem('today_rates', JSON.stringify(ret.today_rates))
                updateStatusTable()

                if (LOADED_MODULES.indexOf('printing') != -1) {
                    last_rate = JSON.parse(localStorage.getItem('today_rates')).length
                    // getPrintFnsByDoctype('local_order')('local_order', {update_id:last_rate})

                    date_20200201 = new Date("2020-02-01T00:00")
        // console.log(rates_time)

                    // if (rates_time < date_20200201) {
                    //     getPrintFnsByDoctype('local_order')('local_order', {update_id: last_rate}).then(function () {
                    //         getPrintFnsByDoctype('local_quotation')('local_quotation', {update_id: last_rate})
                    //     })
                    // } else {
                        getPrintFnsByDoctype('local_quotation_2020')('local_quotation_2020', {update_id: last_rate})
                    // }

                }

            } else {
                modal_win.find('.alert-warning').remove()
                if (typeof ret.errors.general !== 'undefined') {
                    alert(ret.errors.general)
                    if (typeof ret.errors.redirect !== 'undefined') {
                        window.location = ret.errors.redirect;
                    }
                }

                $.each(ret.errors.currencies, function (key, value) {
                    if (value.buy_rate) {
                        msg = value.buy_rate.slice(-1)[0].split(':')
                        cid = msg[0]
                        info = msg[1]
                        err_element = getBuyRate(cid)
                        markError(err_element, msg = info)
                    }
                    if (value.sell_rate) {
                        msg = value.sell_rate.slice(-1)[0].split(':')
                        cid = msg[0]
                        info = msg[1]
                        err_element = getSellRate(cid)
                        markError(err_element, msg = info)
                    }
                })
                modal_win.find("#performOperation").prop('disabled', false)
            }
        })
    }

    var Perform = function () {
        // Перевірка форми на валідність
        var check = true
        modal_win.find('input').each(function () {
            if (!this.checkValidity()) {
                markError($(this))
                check = false
            }
        });
        data = modal_win.find("select, textarea, input").serialize()
        check = checkNBU30percent(check)

        if (data == orig_data) {
            check = false
            alert('Спочатку змініть хоча б одне значення курсів')
        }
        if (check && confirm("Ви змінили усі курси?")) {
            ratesClass.prototype.send(data)
        }
    }
    modal_win.find("#performOperation").click(Perform)

    modal_win.find('input').each(function () {
        $(this).on("keydown", function (event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        });
    });


}
