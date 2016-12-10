
var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();
var hours = {Sunday: "CLOSED", Monday: "CLOSED", Tuesday: "CLOSED", Wednesday: "9:00am - 6:00pm", Thursday: "9:00am - 6:00pm", Friday: "9:00am - 6:00pm", Saturday: '9:00am - 4:00pm'};
var fallbackhours = {Sunday: "CLOSED", Monday: "CLOSED", Tuesday: "CLOSED", Wednesday: "9:00am - 6:00pm", Thursday: "9:00am - 6:00pm", Friday: "9:00am - 6:00pm", Saturday: '9:00am - 4:00pm'};
var defaultCategories = [
    {slug: 'black', name: 'Black', 'qty': '1 Teaspoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': 'Be carefull not to oversteep or it can become bitter!  Use <b>more</b> tea if you like it strong, not a longer steep time!', 'image': '', 'special': ''},
    {slug: 'white', name: 'White', 'qty': '1 Tablespoon', 'temp': '180', min: 4, 'max': 5, 'notes': '', 'image': '', 'special': ''},
    {slug: 'green', name: 'Green', 'qty': '1 teaspoon', 'temp': '180', 'min': 1, 'max': 2, 'notes': '', 'image': '', 'special': ''},
    {slug: 'pu-erh', name: 'Pu-Erh', 'qty': '1 teaspoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': '', 'image': '', 'special': ''},
    {slug: 'oolong', name: 'Oolong', 'qty': '1 teaspoon', 'temp': '180', 'min': 2, 'max': 3, 'notes': '', 'image': '', 'special': ''},
    {slug: 'herbal-tisane', name: 'Herbal Blend', 'qty': '1 Tablespoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': '', 'image': '', 'special': ''},
    {slug: 'fruit-tisane', name: 'Fruit Tisane', 'qty': '1 Tablespoon', 'temp': '208', 'min': 5, 'max': 8, 'notes': '', 'image': '', 'special': ''}
];
var map;
var showLogging = true;
var gltlocation = {lat: 40.740042, lng: -96.677580};
var lastupdate = '';
var gltkey = "ck_4b163616463e82881436006679ce5320ec0e07a5";
var gltsecret = "cs_765f31f076f60d73b019c9774bdbb34159037424";
var glturl = "https://thegreenleafteacompany.com"; //162.210.96.43
var db;

document.addEventListener("deviceReady", deviceReady, false);

function deviceReady() {
    deviceReadyDeferred.resolve();
}

$(document).on("mobileinit", function () {
    jqmReadyDeferred.resolve();
    if (!!!window.cordova)
        deviceReadyDeferred.resolve();

    console.log(!!window.cordova);


});

$.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);



var min = 0;
var max = 0;
var runningTime = 0;
var totalRunSeconds = 0;
var cupFill;
var cupHeight = 0;
var runningInterval = '';
var extraForTime = '';
function setupTimerPage(me) { // When entering pagetwo
    showControls();
    setBodyHeight();
    cupFill = $('#cupFill');
    runningTime = 0;
    min = $(me).data('min');
    max = $(me).data('max');
    var title = $(me).data('title');
    $('#cupFill.full').removeClass('full');
    if (title == '')
        title = 'FREE TIME';

    $('#fullTeaTime .minTime').html(parseMinutes(min));
    $('#fullTeaTime .maxTime').html(parseMinutes(max));
    $('#timerpage h1.teatype').html(title);
    $(":mobile-pagecontainer").pagecontainer("change", "#timerpage");

    var pS = getPercSeconds(min, max, 50);
    totalRunSeconds = pS;
    $('.actualTime').text(getPrettyTime(pS));

    //$( ":mobile-pagecontainer" ).pagecontainer( "change", "#teatypetimer");

    $('#timerrange').on('slidestop', function (e) {
        var p = $(this).val();
        var pS = getPercSeconds(min, max, p);
        totalRunSeconds = pS;
        $('.actualTime').text(getPrettyTime(pS));
    });
}

function fillCup() {
    if (totalRunSeconds == 0)
        return false;
    var x = (runningTime / totalRunSeconds * 100);
    if (x < 95) {
        setCupFill(x)
    }
}

function showControls() {
    jQuery('#playercontrols,#sliderHolder').slideDown();
}

function hideControls() {
    jQuery('#playercontrols,#sliderHolder').slideUp();
}

function toggleControls() {
    if (jQuery('#playercontrols').is(':visible'))
        hideControls();
    else
        showControls();
}

function resetSlide() {
    jQuery('#timerrange').val(50).slider('refresh');
    var pS = getPercSeconds(min, max, 50);
    totalRunSeconds = pS;
    $('.actualTime').text(getPrettyTime(pS));
}

function runTimer() {
    stopTimer();
    $('#cupFill.full').removeClass('full');
    if (totalRunSeconds == 0) {
        setCupFill(35)
    }

    if ($('.actualTime').text() == '0:00') {
        $('.actualTime').fadeOut();
        extraForTime = '';
    } else
        extraForTime = ' / ';

    jQuery('.steam').animate({opacity: 1}, 1000);

    setTimeout(hideControls, 1);
    runningInterval = setInterval(function () {
        runningTime += 1;
        fillCup();
        if (runningTime < 10)
            $('#runningTime').text('0:0' + runningTime + extraForTime);
        else if (runningTime < 60)
            $('#runningTime').text('0:' + runningTime + extraForTime);
        else
            $('#runningTime').text(getPrettyTime(runningTime) + extraForTime);

        if (totalRunSeconds == runningTime) {
            clearInterval(runningInterval);
            $('#cupFill').addClass('full');
            jQuery('.steam').animate({opacity: 0}, 1000);


        }


    }, 1000);
}

function setCupFill(x) {
    if (cupHeight == '')
        cupHeight = $('.cup > img').height();
    if (typeof cupFill == 'undefined')
        cupFill = $('#cupFill');
    cupFill.css('height', (cupHeight * (x / 100)) + 'px')
}


function setBodyHeight(t) {
    var hh = $('.ui-page-active .ui-header').outerHeight();
    var fh = 0;
    $('.ui-page-active .ui-footer .includeInHeight').each(function (i, e) {
        fh += $(e).outerHeight();
    });

    var wh = $(window).height();

    $('.ui-page-active .ui-content').height(wh - (hh + fh) + 'px');
}

function resetTimer() {
    totalRunSeconds = 0;
    $('#cupFill.full').removeClass('full');
    extraForTime = '';
    $('.actualTime:hidden').fadeIn();
    jQuery('.steam').animate({opacity: 0}, 1000);
    if (runningInterval != '') {
        clearInterval(runningInterval);
        $('#runningTime').text('');
        setCupFill(0);
    }
}

function stopTimer() {
    $('#cupFill.full').removeClass('full');
    extraForTime = '';
    $('.actualTime:hidden').fadeIn();
    jQuery('.steam').animate({opacity: 0}, 1000);
    if (runningInterval != '') {
        clearInterval(runningInterval);
        setCupFill(0);
    }
}



//$( document ) .on('pagebeforecreate', function(){
/*
 var min = $(this).data('min');
 var max =$(this).data('max');
 var title=$(this).data('title');
 console.log(title);

 */


//});

function getPrettyTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    if (seconds < 10)
        seconds = '0' + seconds;
    return minutes + ':' + seconds;
}

function getPercSeconds(start, end, perc) {
    if (typeof start == 'number')
        var sSeconds = start * 60;
    else {
        x = start.split(':');
        var sSeconds = x[0] * 60;
        if (x.length == 2)
            sSeconds += (x[1] * 1);
    }
    if (typeof end == 'number')
        var eSeconds = end * 60;
    else {
        x = end.split(':');
        var eSeconds = x[0] * 60;
        if (x.length == 2)
            eSeconds += (x[1] * 1);
    }

    var diff = eSeconds - sSeconds;
    var offset = Math.ceil(diff * (perc / 100), 2);
    return (sSeconds + offset);


}


function parseMinutes(x) {
    if (typeof x == 'number')
        return x + ':00';
    else if (typeof x != 'string')
        return '0:00';
    else {
        x.split(':');
        if (x.length == 1)
            return x[0] + ':00';
        if (x.length == 2) {
            if ((x[1] * 1) < 10)
                return x[0] + ':0' + x[1];
            else
                return x
        }
    }
}

function doWhenBothFrameworksLoaded() {
    updateHours();
    webDbInit();
    document.addEventListener("online", runOnline, false);
    document.addEventListener("offline", runOffline, false);

    var r = retrieveCategories();
    if (r===false) categoriesShow();
    retrieveTeas();

}

function highlightDay() {
    var d = new Date();
    var n = d.getDay();
    jQuery('#hours-table tbody tr:eq(' + n + ')').addClass('today');
}

function updateHours() {
    if (!navigator.onLine) {
        populateHours();
        return false;
    }
    var data = 'idn=3kf73asdf823faf';
    jQuery.ajax({
        url: 'https://thegreenleafteacompany.com/app/hours.php?' + data,
        method: 'GET',
        datatype: 'json',
        success: function (x) {
            localStorage.setItem('glthours', x);
            populateHours();
        },
        error: function () {

            localStorage.setItem('glthours', fallbackhours);
        }
    });
}

function populateHours() {
    var tempHours = localStorage.getItem('glthours');

    if (tempHours != null) {
        try {
            hours = JSON.parse(tempHours);
        } catch (err) {
            hours = fallbackhours;
        }
    }
    jQuery('#hours-table tbody').html('');
    var rows = '';
    for (var day in hours) {
        var h = hours[day];
        rows += '<tr><th>' + day + '</th><td>' + h + '</td></tr>';
    }
    jQuery('#hours-table tbody').append(rows);
    highlightDay();
}

function runOffline() {
    jQuery('#sendContactForm').hide();

}

function runOnline() {
    jQuery('#sendContactForm').show();
}




function webDbInit() {
    db = window.openDatabase("gltdb", "1.0", 'gltdb', 100000);
    db.transaction(setup, errorHandler, function () {});
}

function setup(tx) {
    tx.executeSql('create table if not exists teas(id INTEGER PRIMARY KEY, tea TEXT, category TEXT);');
    tx.executeSql('create table if not exists teacategories(slug TEXT PRIMARY KEY, category TEXT, qty type TEXT, temp TEXT, minlow INTEGER, minhigh INTEGER, notes TEXT, image TEXT, special TEXT);');
    tx.executeSql('create table if not exists teafeed(id INTEGER PRIMARY KEY, excerpt TEXT, link type TEXT, thumbnail TEXT);');
    db.transaction(function (tx) {
        tx.executeSql("select * from teacategories", [], categoriesInitialize, errorHandler);
    }, errorHandler, function () {});
}


function updateFeed() {
    if (!navigator.onLine)
        return false;
    lastupdate = localStorage.getItem('lastfeed');
    //var d = new Date();
    //lastupdate = localStorage.setItem('lastfeed',d.toISOString());


}


var specialCats = {}
function categoriesShow() {
    if (typeof db == 'undefined') return;
    db.transaction(function (tx) {
        tx.executeSql("select * from teacategories", [], function (tx, results) {
            if (results.rows.length != 0) {

                var cats = ''
                for (var i = 0; i < results.rows.length; i++) {
                    var c = results.rows.item(i);
                    specialCats[c.slug]=c.special;
                    if (c.special!=='1') {
                        var li = "<li id='teacat_" + c.slug + "'><a onclick='jQuery(this).parent().find(\"ul\").slideToggle()' href='#'>"

                        if (c.image != '') {
                            li += "<img src='"+c.image+"' />";
                        } else {
                            li += "<img src='img/logo.png' />";
                        }

                        li += "<h2>" + c.category + "</h2><p>";
                        if (c.qty != '')
                            li += c.qty + " per 6-8oz";
                        if (c.temp != '')
                            li += ' | ' + c.temp + "<sup>o</sup>F ";
                        if (c.minLow != '')
                            li += ' | ' + c.minlow + "-" + c.minhigh + ' minutes';
                        li += "</p></a>";

                        li += "<a data-min='" + c.minlow + "' data-max='" + c.minhigh + "' data-title='" + c.category + "' data-icon='fa-clock-o' onclick='setupTimerPage(this);' > TIME </a>";

                        li += "</li>";
                        cats += li;
                    }
                }
                jQuery('#teacategories').html('');
                jQuery('#teacategories').append(cats);//.listview("refresh");
                //$('#teacategories').listview('refresh')
                jQuery('#teacategories').listview();
                jQuery('#teacategories').listview('refresh');

            } else {
                //console.log('No cats to show');
            }

        }, errorHandler);
    }, errorHandler, function () {});
    teasShow();
}

//Attempt to update CATEGORIES library from site
function retrieveCategories() {
    //console.log('Attempting to retrive new');
    if (!navigator.onLine) return false;
    showLoading();
    if (typeof db == 'undefined') webDbInit();
    var endpoint = glturl + '/wp-json/wc/v1/products/categories';
    jQuery.ajax({
        url: endpoint + '?per_page=100&parent=31&consumer_key=' + gltkey + '&consumer_secret=' + gltsecret,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(gltkey + ":" + gltsecret));
        },
        method: 'GET',
        datatype: 'json',
        success: function (cats) {
            //we succesfully got at least some json here
              clearCategoriesTable(function () {});
            jQuery.each(cats, function (i, cat) {

                var image = '';
                if (typeof cat.thumb == 'object' && typeof cat.thumb[0] != 'undefined')  image = cat.thumb[0];

                var special='';
                if (cat.show=='2') var special='1';

                if (cat.show!='0') {
                    var insertArray = [
                        cat.slug,
                        cat.name,
                        cat.prep.amount,
                        cat.prep.temp,
                        cat.prep.min,
                        cat.prep.max,
                        cat.prep.note,
                        image,
                        special
                    ];
                    db.transaction(function (tx) {
                        tx.executeSql("insert into teacategories(slug,category,qty,temp,minlow,minhigh,notes,image,special) values(?,?,?,?,?,?,?,?,?)", insertArray);
                    });
                }

                hideLoading();
                categoriesShow();
            });
        },
        complete: function () {
            hideLoading()
        }
    });
}

function clearTeasTable() {
     db.transaction(function (tx) {
        tx.executeSql("delete from teas");
        }, errorHandler, function () {

    });
 }

 function clearCategoriesTable() {
     db.transaction(function (tx) {
        tx.executeSql("delete from teacategories");
        }, errorHandler, function () {

    });
 }


function categoriesInitialize(tx, results) {
    //should only need to do this once, if nothing is in the db -> will most likely get re-written when online
    if (results.rows.length == 0) { //we found nada, so lets insert the basic from the app
        for (var i = 0; i < defaultCategories.length; i++) {
            var insertArray = [
                defaultCategories[i].slug,
                defaultCategories[i].name,
                defaultCategories[i].qty,
                defaultCategories[i].temp,
                defaultCategories[i].min,
                defaultCategories[i].max,
                defaultCategories[i].notes,
                defaultCategories[i].image,
                defaultCategories[i].special
            ];
            tx.executeSql("insert into teacategories(slug,category,qty,temp,minlow,minhigh,notes,image,special) values(?,?,?,?,?,?,?,?,?)", insertArray);
        }
    }
}

function showLoading() {
    setTimeout(function () {
        var $this = $(this),
                theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme,
                msgText = $this.jqmData("msgtext") || $.mobile.loader.prototype.options.text,
                textVisible = $this.jqmData("textvisible") || $.mobile.loader.prototype.options.textVisible,
                textonly = !!$this.jqmData("textonly");
        html = $this.jqmData("html") || "";
        $.mobile.loading('show', {
            text: msgText,
            textVisible: textVisible,
            theme: theme,
            textonly: textonly,
            html: html
        });
    }, 1);
}

function alertDone() {
    if (!!window.cordova) {
        notification.beep(3);
        notification.vibrate(2000);
    }

}

function hideLoading() {
    setTimeout(function () {
        $.mobile.loading("hide");
    }, 1);
}


function teasShow() {
    db.transaction(function (tx) {
        tx.executeSql("select * from teas", [], function (tx, results) {
            if (results.rows.length != 0) {
                for (var i = 0; i < results.rows.length; i++) {
                    var tea = results.rows[i];
                    var myCategories = JSON.parse(tea.category);

                    for (var c = 0; c < myCategories.length; c++) {
                        if (typeof specialCats[myCategories[c].slug] != 'undefined' && specialCats[myCategories[c].slug]=='1') tea.tea+=" ("+ myCategories[c].name +")"
                    };

                    for (var c = 0; c < myCategories.length; c++) {
                        var catTarget = jQuery('#teacat_' + myCategories[c].slug);

                        if (catTarget.length) {
                            if (jQuery('ul', catTarget).length ==0) {
                                jQuery(catTarget).append('<ul style="display:none" class="tealist"><li>' + tea.tea + '</li></ul>')
                            } else {
                                jQuery('ul', catTarget).append('<li>' + tea.tea + '</li>')
                            }

                            catTarget.data('filtertext', catTarget.data('filtertext') + ' ' +tea.tea);
                        }
                    }
                }
            }
            })

    })
}


//Attempt to update TEA library from site
 function retrieveTeas() {
        if (typeof db == 'undefined') webDbInit();

        var endpoint = glturl + '/wp-json/wc/v1/products';
        jQuery.ajax({
            url: endpoint + '?per_page=100&category=31&consumer_key=' + gltkey + '&consumer_secret=' + gltsecret,
            beforeSend: function (xhr) {
                showLoading();
                xhr.setRequestHeader("Authorization", "Basic " + btoa(gltkey + ":" + gltsecret));
            },
            method: 'GET',
            datatype: 'json',
            success: function (teas) {
                clearTeasTable();
                jQuery.each(teas, function (i, tea) {
                        var insertArray = [
                            tea.id,
                            tea.name,
                            JSON.stringify(tea.categories)
                        ];


                    db.transaction(function (tx) {
                        tx.executeSql("insert into teas(id,tea,category) values(?,?,?)", insertArray);
                    });

/*
                    for (var i = 0; i < tea.categories.length; i++) {
                        var catTarget = jQuery('#teacat_' + tea.categories[i].slug);
                        if (catTarget.length) {
                            jQuery('ul', catTarget).append('<li>' + tea.name + '</li>')
                        } */


                });
            },
            complete: function () {
                hideLoading()
            }
        });
 }


//http://thegreenleafteacompany.com/wp-json/wp/v2/posts
//context = embed|view
//after iso8601 date


/*














 //Attempt to update TEA library from site
 function retrieveTeas() {

 if (typeof db == 'undefined')
 webDbInit();
 var endpoint = glturl + '/wp-json/wc/v1/products';
 jQuery.ajax({
 url: endpoint + '?per_page=100&category=31&consumer_key=' + gltkey + '&consumer_secret=' + gltsecret,
 beforeSend: function (xhr) {
 showLoading();
 xhr.setRequestHeader("Authorization", "Basic " + btoa(gltkey + ":" + gltsecret));
 },
 method: 'GET',
 datatype: 'json',
 success: function (teas) {
 jQuery.each(teas, function (i, tea) {
 for (var i = 0; i < tea.categories.length; i++) {
 var catTarget = jQuery('#teacat_' + tea.categories[i].slug);
 if (catTarget.length) {
 jQuery('ul', catTarget).append('<li>' + tea.name + '</li>')
 }
 //console.log(tea.categories[i]);
 }
 //if one of the categories matches, insert it into the table as a sub item
 //tea.id
 //tea.name
 //tea.images[0].src
 //tea.categories (array) .id,.name,.slug
 console.log(tea);
 //hideLoading();
 });
 },
 complete: function () {
 hideLoading()
 }
 });
 }



 //create basic table to list types, and information for each
 }

 function categoriesInitialize(tx, results) {
 if (results.rows.length == 0 && !navigator.onLine) { //we found nada, so lets insert the basic from the app
 for (var i = 0; i < defaultCategories.length; i++) {
 var insertArray = [
 defaultCategories[i].slug,
 defaultCategories[i].name,
 defaultCategories[i].qty,
 defaultCategories[i].temp,
 defaultCategories[i].min,
 defaultCategories[i].max,
 defaultCategories[i].notes
 ];
 tx.executeSql("insert into teacategories(slug,category,qty,temp,minlow,minhigh,notes) values(?,?,?,?,?,?,?)", insertArray);
 }
 } else {

 if (navigator.onLine) {
 retrieveCategories();


 }


 jQuery('#teatypetimer .ui-header h1').html('Select your type of tea (' + results.rows.length + ' Categories)');
 var cats = ''
 for (var i = 0; i < results.rows.length; i++) {
 var li = "<li id='teacat_" + results.rows.item(i).slug + "'>"
 li += "<a href='#'>" + results.rows.item(i).category + " (" + results.rows.item(i).qty + ", " + results.rows.item(i).temp + "<sup>o</sup>F, " + results.rows.item(i).minlow + "-" + results.rows.item(i).minhigh + ")</a>";
 li += "<ul></ul>";
 li += "</li>";
 cats += li;
 }
 jQuery('#teacategories').html('');
 jQuery('#teacategories').append(cats).listview("refresh");
 }

 }




 function checkConnection() {

 var networkState = navigator.connection.type;
 var states = {};
 states[Connection.UNKNOWN] = 'Unknown connection';
 states[Connection.ETHERNET] = 'Ethernet connection';
 states[Connection.WIFI] = 'WiFi connection';
 states[Connection.CELL_2G] = 'Cell 2G connection';
 states[Connection.CELL_3G] = 'Cell 3G connection';
 states[Connection.CELL_4G] = 'Cell 4G connection';
 states[Connection.CELL] = 'Cell generic connection';
 states[Connection.NONE] = 'No network connection';

 tLog('Connection type: ' + states[networkState]);
 }

 */

function errorHandler(e) {
    console.log(e);
}



function dropTable(x) {
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + x);
    });
}