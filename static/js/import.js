var inputType = "string";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;
var admin = false;

$(function()
{
    
    $("input[type=file]").change(function(){
        var inputs = document.getElementsByTagName("input");
        for (i = 0, len = inputs.length; i < len; i++) {
            if (inputs[i].name.indexOf("admin") !=-1) {
                admin = true;                 
            }
            else if (inputs[i].name.indexOf("curator") !=-1) {
                admin = false;            
            }            
        }

        var config = buildConfig();
                
	$("input[type=file]").parse({
            config: config,
            before: function(file, inputElem)
            {
                    console.log("Parsing file...", file);
            },
            error: function(err, file)
            {
                    console.log("ERROR:", err, file);
                    firstError = firstError || err;
                    errorCount++;
            },
            complete: function()
            {
                    printStats("Done with all files");
            }
	});
    });


});

function printStats(msg)
{
	if (msg)
		console.log(msg);
	//console.log("       Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");
	console.log("  Row count:", rowCount);
	if (stepped)
		console.log("    Stepped:", stepped);
	console.log("     Errors:", errorCount);
	if (errorCount)
		console.log("First error:", firstError);
        
}

function buildConfig()
{
	return {
            delimiter: ";",	// auto-detect
            newline: "",	// auto-detect
            quoteChar: '"',
            escapeChar: '"',
            header: false,
            trimHeaders: false,
            dynamicTyping: false,
            preview: 0,
            encoding: "",
            worker: false,
            comments: false,
            step: stepFn,
            complete: completeFn,
            error: errorFn,
            download: false,
            skipEmptyLines: false,
            chunk: undefined,
            fastMode: undefined,
            beforeFirstChunk: undefined,
            withCredentials: undefined,
            transform: undefined
	};
}

function stepFn(results, parser)
{
    stepped++;
    if (results)
    {
        if (results.data)

                for(var i=0; i<results.data.length;i++){
                    var val_code = results.data[i][0];
                    var val_degree = parseInt(results.data[i][2]);
                    var val_kurs1 = results.data[i][3];
                    var val_kurs2 = results.data[i][4];
                    var val_preffix = results.data[i][5];
                    var cf = 10000;

                    try {
                        val_kurs1 = parseFloat(val_kurs1.replace(",", "."));
                        val_kurs2 = parseFloat(val_kurs2.replace(",", "."));
                    } catch(e) {
                        val_kurs1 = 0;//Обнуляем если ошибки
                        val_kurs2 = 0;
                    }

                    if (admin == true) {
                        val_kurs1 = ((val_kurs1 * cf) * (val_degree * cf) / (cf * cf)).toFixed(2);
                        val_kurs2 = ((val_kurs2 * cf) * (val_degree * cf) / (cf * cf)).toFixed(2);
                    } 

                    var inputs = document.getElementsByTagName("input");
                    
                    for (i = 0, len = inputs.length; i < len; i++) {

                        if (inputs[i].name.indexOf("currency_id") !=-1) {
                            if (inputs[i].value == val_code) {
                                value_number = inputs[i].name.split('-')[1];
                                
                                $('#rates-'+value_number+'-buy_rate').val(val_kurs1);
                                $('#rates-'+value_number+'-sell_rate').val(val_kurs2);
                            }
                        }
                    }

                }

                rowCount += results.data.length;
        if (results.errors)
        {
                errorCount += results.errors.length;
                firstError = firstError || results.errors[0];
        }
    }
}

function completeFn(results)
{
	end = now();

	if (results && results.errors)
	{
		if (results.errors)
		{
			errorCount = results.errors.length;
			firstError = results.errors[0];
		}
		if (results.data && results.data.length > 0)
			rowCount = results.data.length;
	}

	printStats("Parse complete");
	console.log("    Results:", results);

	// icky hack
	setTimeout(enableButton, 100);
}

function errorFn(err, file)
{
	end = now();
	console.log("ERROR:", err, file);
	enableButton();
}

function enableButton()
{
	$('#submit').prop('disabled', false);
}

function now()
{
	return typeof window.performance !== 'undefined'
			? window.performance.now()
			: 0;
}
