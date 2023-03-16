if (typeof(Storage) !== "undefined") {// Code for localStorage/sessionStorage.
} else {alert('Sorry! No Web Storage support...')}

api_to_load = ['department_details', 'exchange_operations', 'cashflow_operations', 'payment_operations', 'payment_categories', 'balance', 'currencies', 'general_settings', 'nbu_rates', 'operator', 'company_rates', 'today_rates', 'settings', 'department_limits', 'last_z', 'last_operation']

DEFAULT_SETTINGS={
	receipt_printer:"POS-58 11.2.0.0",
	receipt_printer_double:"y",
	receipt_printer_hi_quality:"y",
	receipt_printer_width:"384",
	receipt_printer_type:"chrome",
	receipt_printer_zoom:"1.3",
	receipt_printer_hi_vquality:'y',
	receipt_printer_hi_hquality:'y',
	receipt_printer_y_dots:'8',
	doc_printer:"chrome",
	doc_printer_double:'n',
	doc_printer_hi_quality:'n',
	doc_printer_width:"1000",
	doc_printer_type:"chrome",
	doc_printer_zoom:"1",
	doc_printer_hi_vquality:'y',
	doc_printer_hi_hquality:'y',
	doc_printer_y_dots:'8'}

function updateLS(api_names, separately){
	separately = typeof separately !== 'undefined' ? separately : true;
	if (separately){
		x = $.Deferred().resolve('done')
		$.each( api_names, function( index, api_name ){
			x = x.then(
				$.getJSON('api/department/'+api_name, function(response){
					localStorage.setItem(api_name, JSON.stringify(response));
				})
			)
		});
		return x
	}else{
		return $.ajax({
			type: "POST",
			url: 'api/bulk',
			data: JSON.stringify(api_names),
			contentType : 'application/json',
            success: function(ret){
				if (typeof ret.errors !== 'undefined') {
                    if (typeof ret.errors.general !== 'undefined') {
                        alert(ret.errors.general)
                        if (typeof ret.errors.redirect !== 'undefined') {
                            window.location = ret.errors.redirect;
                        }
                    }
                }else {
				    $.each(api_names, function( index, api_name ){
                        localStorage.setItem(api_name, JSON.stringify(ret[api_name]))
                    })

                }
			},
            error:function (xhr, ajaxOptions, thrownError){
                switch (xhr.status) {
                    case 400:
                        return $.ajax({
                                type: "GET",
                                url: 'login/logout',
                                data: {},
                                success: function (ret) {
                                    localStorage.clear();
                                    window.location = '/'
                                },
                                error: function (ret) {
                                    localStorage.clear();
                                    window.location = '/'
                                }
                            })
                }
            }
		})}}

var setupEnviropment = function(){
	var settings = JSON.parse(localStorage.getItem('general_settings'))
	CURRENCY_ORDER = settings['CURRENCIES_ORDER']
	EXOPS_ID_COLNUM = 2
	CFOPS_ID_COLNUM = 2
	CF_PRINT_COLNUM = 9
	STORNO_COLNUM = 11
	PRINT_COLNUM = 10
	RRO_STATUS_ORD = 9 // RRO status button where to insert

	ActualTime = moment
	LOADED_MODULES = []

	// Необхідно, щоб CSRF не застарівав, бо сторінка може не оновлюватися цілий день
	CSRF_EXPIRATION_REFRESH = 2400
	setInterval(function(){window.location = '/'}, CSRF_EXPIRATION_REFRESH*1000)
	return $.Deferred().resolve()
}

var checkIfDepartmentDeactivated = function(){
    var deactivated = JSON.parse(localStorage.getItem('department_details')).deactivated
    if (deactivated == null) { return }

    // var dateDiff = ActualTime().diff(moment(deactivated), 'seconds')
    //
    // if (dateDiff > 0) {
        
        var comment = JSON.parse(localStorage.getItem('department_details')).comment.split("--")[0].trim();
        alert('Відділення було деактивовано! \r\n '+comment)
        
        return $.ajax({
            type: "GET",
            url: 'login/logout',
            data: {},
            success: function(ret){window.location = '/'},
            error: function(ret){window.location = '/'}
        })
    // } else {
    //     return false
    // }
}

var checkIfUserDeactivated = function(){
    var deactivated = JSON.parse(localStorage.getItem('operator')).operator_deactivated
    if (deactivated == null) { return }

    var dateDiff = ActualTime().diff(moment(deactivated), 'seconds')

    if (dateDiff > 0) {
        
        alert('Користувач був деактивований!')
        
        return $.ajax({
            type: "GET",
            url: 'login/logout',
            data: {},
            success: function(ret){window.location = '/'},
            error: function(ret){window.location = '/'}
        })
    } else {
        return false
    }
}

var checkIfnotLimit = function(){

    var department_limits = JSON.parse(localStorage.getItem('department_limits'))

    if (department_limits.status == "nolimit") {
        alert('На відділенні не встановлено ліміт каси, зверніться до техпідтримки!')

        return $.ajax({
            type: "GET",
            url: 'login/logout',
            data: {},
            success: function(ret){window.location = '/'},
            error: function(ret){window.location = '/'}
        })
    } else {
        return false
    }
}

var chat = function(){

    converse.initialize({
        allow_logout: false, // No point in logging out when we have auto_login as true.
        allow_muc_invitations: false, // Doesn't make sense to allow because only
                                      // roster contacts can be invited
        allow_contact_requests: false, // Contacts from other servers cannot,
                                       // be added and anonymous users don't
                                       // know one another's JIDs, so disabling.
        authentication: 'anonymous',
        auto_login: true,
        auto_reconnect: true,
        auto_join_rooms: [
            'anonymous@conference.nomnom.im',
        ],
        notify_all_room_messages: [
            'anonymous@conference.nomnom.im',
        ],
        fullname: 'Кассир',
        bosh_service_url: 'https://conversejs.org/http-bind/', // Please use this connection manager only for testing purposes
        jid: 'nomnom.im', // XMPP server which allows anonymous login (doesn't
                          // allow chatting with other XMPP servers).
        keepalive: true,
        hide_muc_server: true, // Federation is disabled, so no use in
                               // showing the MUC server.
        play_sounds: false,
        show_controlbox_by_default: false,
        strict_plugin_dependencies: false,
        locales: [
            'uk'
        ],
        locales_url: 'static/locale/uk/LC_MESSAGES/converse.json',
        animate: true,
        default_state: 'online',
        allow_chat_pending_contacts: false,
        allow_dragresize: false,
        blacklisted_plugins: [
            'converse-dragresize',
            'converse-minimize'
        ],
        // blacklisted_plugins: [
        //     'converse-bookmarks',
        //     'converse-chatboxes',
        //     'converse-chatview',
        //     'converse-controlbox',
        //     'converse-core',
        //     'converse-disco',
        //     'converse-dragresize',
        //     'converse-fullscreen',
        //     'converse-headline',
        //     'converse-mam',
        //     'converse-minimize',
        //     'converse-muc',
        //     'converse-muc-embedded',
        //     'converse-notification',
        //     'converse-otr',
        //     'converse-ping',
        //     'converse-profile',
        //     'converse-register',
        //     'converse-roomslist',
        //     'converse-rosterview',
        //     'converse-singleton',
        //     'converse-spoilers',
        //     'converse-vcard'
        // ],
    });
}

LoadAll = function(){
	updateLS(api_to_load, separately=false)
	.then(setupEnviropment)
	.then(function(){
		var settings = JSON.parse(localStorage.getItem('general_settings'))
		var department_details = JSON.parse(localStorage.getItem('department_details'))

        // console.log('Try connect to HTTPS Oleweb server...')
        // // Check HTTPS
        // $.xmlrpc({
        //     url: settings.LOCAL_RPC_URL.replace("http", "https"),
        //     methodName: 'setServer',
        //     params: [window.location.href],
        //     success: function(response, status, jqXHR) {
        //         console.log('Success! Change to HTTPS Oleweb server')
        //         settings.LOCAL_RPC_URL = settings.LOCAL_RPC_URL.replace("http", "https")
        //         localStorage.setItem('general_settings', JSON.stringify(settings))
        //     },
        //     error: function() {
        //          remote_call('setServer', [window.location.href]) // Виставляємо адресу сайта фінкомпанії за замовчуванням в Олевеб
            // }
        // });

		if (!(checkIfDepartmentDeactivated() || checkIfUserDeactivated() || checkIfnotLimit())) {

            toDataURL(settings.LOGO_IMAGE, function(x){LOGO_IMAGE = x})
            toDataURL(settings.STAMP_IMAGE, function(x){STAMP_IMAGE = x})

            DataUtilsModule()
            PrintingModule()
            PrintingThermoModule()
            PrintingMatrixModule()

            deployRROConnectionIndicator()

            BuysellModule()

            if (typeof department_details.payments !== 'undefined') {
                if (department_details.payments) {
                    PaymentsModule()
                    // PaymentsTemplatesModule()
                }
            }

            InoutModule()
            if(department_details.can_change_rates){
                    RatesModule()
            }

            StornoModule()

            if (settings.DESIGN == 2) {
                InfoModule()
            }

            ReportModule()

            MoneyTableModule()
            ArchiveModule()
            if (settings.DOCUMENTOOBOROT) {
                DocsModule()
            }
            GlobalBlock()
            SettingsModule()
            ActualTimeModule().then(function(){
                    var rro_type = department_details.rro_type
                    if (rro_type == 'rkks'){
                        remote_call('setServer', [window.location.href]) // Виставляємо адресу сайта фінкомпанії за замовчуванням в Олевеб
                        RKKSModule()
                    }
                    else if(rro_type == 'rro'){
                        remote_call('setServer', [window.location.href]) // Виставляємо адресу сайта фінкомпанії за замовчуванням в Олевеб
                        MariaRROModule()
                    }
                    else if(rro_type == 'prro'){
                        remote_call('setServer', [window.location.href]) // Виставляємо адресу сайта фінкомпанії за замовчуванням в Олевеб
                        remote_call('setPrro', [department_details.rro_id])
                        PRROModule()
                    }
                    else if(rro_type == 'nope'){console.log('Працюємо без РРО')}
                    else{
                        remote_call('setServer', [window.location.href]) // Виставляємо адресу сайта фінкомпанії за замовчуванням в Олевеб
                        MariaRROModule()
                    }

                    RefreshBtnModule()
                    LocksModule()
                    InterfacePopulatorsModule()
            }).then(function() {
                ExitBtnModule()
            })
            //chat()
        }
	})
}

$(window).on('load', function() {
    // BrowserDetect.init();
    // console.log(BrowserDetect.browser)
    // console.log(BrowserDetect.version)
    // console.log(BrowserDetect.OS)
    LoadAll()
})
