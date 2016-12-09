
var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();
var hours = {Sunday: "CLOSED", Monday: "CLOSED", Tuesday: "CLOSED", Wednesday: "9:00am - 6:00pm", Thursday: "9:00am - 6:00pm", Friday: "9:00am - 6:00pm", Saturday: '9:00am - 4:00pm'};
var fallbackhours = {Sunday: "CLOSED", Monday: "CLOSED", Tuesday: "CLOSED", Wednesday: "9:00am - 6:00pm", Thursday: "9:00am - 6:00pm", Friday: "9:00am - 6:00pm", Saturday: '9:00am - 4:00pm'};
var map;
var showLogging = true;
var gltlocation={lat: 40.740042, lng: -96.677580};

document.addEventListener("deviceReady", deviceReady, false);

function deviceReady() {
    deviceReadyDeferred.resolve();
    checkEmailAvailability();
    updateHours();
    document.addEventListener("online", runOnline, false);
    document.addEventListener("offline", runOffline, false);


}

$(document).on("mobileinit", function () {
    jqmReadyDeferred.resolve();
});

$.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

function doWhenBothFrameworksLoaded() {



    //db = window.openDatabase("gltdb", "1.0", 'gltdb', 100000);
    //db.transaction(setup, errorHandler, dbReady);
    //drawMap();
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
            console.log(x);
            localStorage.setItem('glthours', x);
            populateHours();
        },
        error: function () {

            localStorage.setItem('glthours', fallbackhours);
            console.log('Unable to get hours');
        }
    });
}

function populateHours() {
    var tempHours = localStorage.getItem('glthours');

    if (tempHours != null) {
        try {
            hours = JSON.parse(tempHours);
        } catch (err) {
            console.log('unable to parse hours');
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

function checkEmailAvailability() {
    cordova.plugins.email.isAvailable(
            function (isAvailable) {
                if (isAvailable) {
                    jQuery('#sendEmailButton').fadeIn();
                } else {
                    jQuery('#sendEmailButton').fadeOut();
                }
            }
    );
}

function submitContact() {

    if (!navigator.onLine) {
        alert('We are unable to send at this time. Please check your network connection.')
        return false;
    }

    var data = jQuery('#sendContactForm').serialize() + '&idn=3kf73asdf823faf';
    jQuery.ajax({
        url: 'https://thegreenleafteacompany.com/app/mail.php?' + data,
        method: 'GET',
        datatype: 'json',
        success: function () {
            jQuery('#sendContactForm').slideUp(200, function () {
                jQuery('#sendContactThankYou').slideDown();
                jQuery('#sendContactForm')[0].reset();

                setTimeout(function () {
                    jQuery('#sendContactThankYou').slideUp(200, function () {
                        jQuery('#sendContactForm').slideDown();
                    });
                }, 5000);
            });
        },
        error: function () {
            alert('THERE WAS AN ERROR SENDING YOUR MESSAGE, PLEASE TRY AGAIN LATER');
        }
    });

    return false;
}



/*





 var gltkey = "ck_4b163616463e82881436006679ce5320ec0e07a5";
 var gltsecret = "cs_765f31f076f60d73b019c9774bdbb34159037424";
 var glturl = "https://thegreenleafteacompany.com"; //162.210.96.43
 var db;


 var defaultCategories = [
 {slug: 'black', name: 'Black', 'qty': '1 Teaspoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': 'Be carefull not to oversteep or it can become bitter!  Use <b>more</b> tea if you like it strong, not a longer steep time!'},
 {slug: 'white', name: 'White', 'qty': '1 Tablespoon', 'temp': '180', min: 4, 'max': 5, 'notes': ''},
 {slug: 'green', name: 'Green', 'qty': '1 teaspoon', 'temp': '180', 'min': 1, 'max': 2, 'notes': ''},
 {slug: 'pu-erh', name: 'Pu-Erh', 'qty': '1 teaspoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': ''},
 {slug: 'oolong', name: 'Oolong', 'qty': '1 teaspoon', 'temp': '180', 'min': 2, 'max': 3, 'notes': ''},
 {slug: 'herbal-tisane', name: 'Herbal Blend', 'qty': '1 Tablespoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': ''},
 {slug: 'fruit-tisane', name: 'Fruit Tisane', 'qty': '1 Tablespoon', 'temp': '208', 'min': 5, 'max': 8, 'notes': ''}
 ]









 //Attempt to update CATEGORIES library from site
 function retrieveCategories() {
 showLoading();
 if (typeof db == 'undefined')
 webDbInit();
 var endpoint = glturl + '/wp-json/wc/v1/products/categories';
 jQuery.ajax({
 url: endpoint + '?per_page=100&parent=31&consumer_key=' + gltkey + '&consumer_secret=' + gltsecret,
 beforeSend: function (xhr) {
 showLoading();
 xhr.setRequestHeader("Authorization", "Basic " + btoa(gltkey + ":" + gltsecret));
 },
 method: 'GET',
 datatype: 'json',
 success: function (cats) {
 console.table(cats);
 clearCategoriesTable(function(){




 });

 jQuery.each(cats, function (i, cat) {
 console.log(cat);
 if (cat.slug!='seasonal' && cat.slug!='organic') {
 var insertArray = [
 cat.slug,
 cat.name,
 cat.prep.amount,
 cat.prep.temp,
 cat.prep.min,
 cat.prep.max,
 cat.prep.note
 ];
 db.transaction(function (tx) {
 tx.executeSql("insert into teacategories(slug,category,qty,temp,minlow,minhigh,notes) values(?,?,?,?,?,?,?)", insertArray);
 });
 }

 //                 for (var i=0;i<tea.categories.length;i++) {
 //                 var catTarget = jQuery('#teacat_' + tea.categories[i].slug);
 //                 if (catTarget.length) {
 //                 jQuery('ul',catTarget).append('<li>'+tea.name+'</li>')
 //                 }
 //                 //console.log(tea.categories[i]);
 //                 }
 //if one of the categories matches, insert it into the table as a sub item
 //tea.id
 //tea.name
 //tea.images[0].src
 //tea.categories (array) .id,.name,.slug

 //hideLoading();
 });
 },
 complete: function () {
 hideLoading()
 }
 });
 }


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

 function setup(tx) {
 tx.executeSql('create table if not exists teas(id INTEGER PRIMARY KEY, log TEXT, created DATE);');
 tx.executeSql('create table if not exists teacategories(slug TEXT PRIMARY KEY, category TEXT, qty type TEXT, temp TEXT, minlow INTEGER, minhigh INTEGER, notes TEXT);');
 db.transaction(function (tx) {
 tx.executeSql("select * from teacategories", [], categoriesInitialize, errorHandler);
 }, errorHandler, function () {});

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


 function categoriesShow() {
 db.transaction(function (tx) {
 tx.executeSql("select * from teacategories", [], function (tx, results) {
 if (results.rows.length != 0) {
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
 }, errorHandler);
 }, errorHandler, function () {});


 }

 function clearCategoriesTable() {
 db.transaction(function (tx) {
 tx.executeSql("delete from teacategories");
 }, errorHandler, function () {
 jQuery('#teacategories').html("<li>Categories Cleared</li>").listview("refresh");
 jQuery('#teatypetimer .ui-header h1').html('Select your type of tea');
 });
 }

 function dbReady() {
 console.log('db.ready');
 }

 function webDbInit() {
 db = window.openDatabase("gltdb", "1.0", 'gltdb', 100000);
 db.transaction(setup, errorHandler, dbReady);
 }

 //navigator.onLine

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


 function showLoading() {
 setTimeout(function () {
 console.log('LOADING SPINNER');
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

 function hideLoading() {
 setTimeout(function () {
 console.log('NO LOADING SPINNER');
 $.mobile.loading("hide");
 }, 1);
 }
 */






function sendEmail() {
    cordova.plugins.email.isAvailable(
            function (isAvailable) {
                if (isAvailable) {
                    cordova.plugins.email.open({
                        to: "info@thegreenleafteacompany.com"
                    }, function () {});
                } else {
                    console.log('Email is not available on this platform');
                }
            }
    );


}

function drawMap() {
    try {
        var div = document.getElementById("map_canvas");
        // Initialize the map view
        map = plugin.google.maps.Map.getMap(div);
        // Wait until the map is ready status.
        map.addEventListener(plugin.google.maps.event.MAP_READY, function () {

            jQuery('#map_canvas_static').hide();
            jQuery('#map_canvas').show();


            map.animateCamera({
                target: gltlocation,
                zoom: 17,
                tilt: 60,
                bearing: 140,
                duration: 5000
            }, function () {

                // Add a maker
                map.addMarker({
                    position: gltlocation,
                    title: "Welecome to \n" +
                            "the Greenleaf Tea Company.",
                    snippet: "The tea is awesome!",
                    animation: plugin.google.maps.Animation.BOUNCE
                }, function (marker) {

                    // Show the info window
                    marker.showInfoWindow();

                    // Catch the click event
                    marker.on(plugin.google.maps.event.INFO_CLICK, function () {

                        // To do something...
                        alert("Hello world!");

                    });
                });
            });

        });
    } catch (err) {
        console.log(err.message);
    }
}

function errorHandler(e) {
    console.log(e);
}