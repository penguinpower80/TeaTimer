/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//EdictWheelsEbbedPsalms25

var gltkey = "ck_4b163616463e82881436006679ce5320ec0e07a5";
var gltsecret = "cs_765f31f076f60d73b019c9774bdbb34159037424";
var glturl = "https://thegreenleafteacompany.com"; //162.210.96.43
var db;
var showLogging=true;

var defaultCategories = [
    {slug: 'black', name: 'Black', 'qty': '1 Teaspoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': 'Be carefull not to oversteep or it can become bitter!  Use <b>more</b> tea if you like it strong, not a longer steep time!'},
    {slug: 'white', name: 'White', 'qty': '1 Tablespoon', 'temp': '180', min: 4, 'max': 5, 'notes': ''},
    {slug: 'green', name: 'Green', 'qty': '1 teaspoon', 'temp': '180', 'min': 1, 'max': 2, 'notes': ''},
    {slug: 'pu-erh', name: 'Pu-Erh', 'qty': '1 teaspoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': ''},
    {slug: 'oolong', name: 'Oolong', 'qty': '1 teaspoon', 'temp': '180', 'min': 2, 'max': 3, 'notes': ''},
    {slug: 'herbal-tisane', name: 'Herbal Blend', 'qty': '1 Tablespoon', 'temp': '208', 'min': 4, 'max': 5, 'notes': ''},
    {slug: 'fruit-tisane', name: 'Fruit Tisane', 'qty': '1 Tablespoon', 'temp': '208', 'min': 5, 'max': 8, 'notes': ''}
]

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        tLog('APP READY');

        db = window.openDatabase("gltdb", "1.0", 'gltdb', 100000);
        db.transaction(setup, errorHandler, dbReady);

        console.log('Received Event: ' + id);
    }
};


function errorHandler(e) {
    console.log(e);
}
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
                /*
                 for (var i=0;i<tea.categories.length;i++) {
                 var catTarget = jQuery('#teacat_' + tea.categories[i].slug);
                 if (catTarget.length) {
                 jQuery('ul',catTarget).append('<li>'+tea.name+'</li>')
                 }
                 //console.log(tea.categories[i]);
                 }*/
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

function tLog(x) {
   if (showLogging) {
    jQuery('#tlog').append("<div>"+x+"</div>");
   }
}