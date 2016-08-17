/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

require( 'sdk/preferences/service' ).set( 'extensions.sdk.console.logLevel', 'all' );
var gridContentScript = require( 'sdk/self' ).data.url(
   '../laxar-developer-tools-widget/content/includes/lib/laxar-developer-tools/grid.js' );
var widgetOutlineContentScript = require( 'sdk/self' ).data.url(
   '../laxar-developer-tools-widget/content/includes/lib/laxar-developer-tools/widget-outline.js' );
var widgetOutlineContentStyleScript = require( 'sdk/self' ).data.url(
   '../laxar-developer-tools-widget/default.theme/css/ax-developer-tools-widget.css' );

// require the SDK modules
const { Panel } = require( 'dev/panel' );
const { Tool } = require( 'dev/toolbox' );
const { Class } = require( 'sdk/core/heritage' );
const self = require( 'sdk/self' );
const system = require( 'sdk/system' );
var { setInterval, clearInterval } = require( 'sdk/timers' );
const tabs = require( 'sdk/tabs' );
const pageMod = require( 'sdk/page-mod' );
const { MessageChannel } = require( 'sdk/messaging' );
var ss = require( 'sdk/simple-storage' );
const channel = new MessageChannel();
const addonSide = channel.port1;
const panelSide = channel.port2;
var getLaxarDeveloperToolsApiInterval;
var REFRESH_DELAY_MS = 100;

var ICON_PATH = '../laxar-developer-tools-widget/content/includes/widgets/developer-toolbar-widget/' +
                'default.theme/images/title-icon.png';

var WIDGET_CONTENT_PATH = '../laxar-developer-tools-widget/content/index.html';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

pageMod.PageMod( {
   include: '*',
   contentScriptFile: [
      gridContentScript,
      widgetOutlineContentScript,
      './content_script_utilities.js'
   ],
   contentStyleFile: widgetOutlineContentStyleScript,
   contentScriptWhen: 'end',
   onAttach: function( worker ) {
      'use strict';
      addonSide.onmessage = function( event ) {
         var message = JSON.parse( event.data );
         if( message.text === 'toogleGrid' ||  message.text === 'widgetOutline' ) {
            worker.port.emit(  message.text, JSON.stringify( message.data ) );
         }
      };
   }
} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

pageMod.PageMod( {
   include: '*',
   contentScriptFile: [
      './activate_laxar_connection.js'
   ],
   contentScriptWhen: 'start',
   onAttach: function( worker ) {
      'use strict';
      if( ss.storage.laxarDeveloperToolsExtensionLoaded ) {
         worker.port.emit( 'setLaxarCssClass' );
      }
   }
} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const laxarPanel = Class( {
   extends: Panel,
   label: 'LaxarJS',
   tooltip: 'Firefox add-on to help to develop LaxarJS apps',
   icon: ICON_PATH,
   url: WIDGET_CONTENT_PATH,

   setup: function(options) {
      'use strict';
      this.debuggee = options.debuggee;
      ss.storage.laxarDeveloperToolsExtensionLoaded = true;
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   onReady: function() {
      'use strict';
      addonSide.onmessage = function( event ) {
         var message = JSON.parse( event.data );
         if( message.text === 'messagePortStarted' ) {
            if( establishChannelInterval ) {
               clearInterval( establishChannelInterval );
            }
         }
      };
      var panelThis = this;
      var establishChannelInterval = setInterval( function() {
         panelThis.postMessage( JSON.stringify( { text: 'noLaxarDeveloperToolsApi' } ), [panelSide] );
      }, REFRESH_DELAY_MS );
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   onLoad: function() {
      'use strict';
      var panelThis = this;
      pageMod.PageMod( {
         include: '*',
         contentScriptFile: [
            './developer_tools_api.js'
         ],
         contentScriptWhen: 'end',
         onAttach: function( worker ) {
            worker.port.on( 'gotLaxarDeveloperToolsApi', function( axDeveloperToolsApi ) {
               panelThis.postMessage( axDeveloperToolsApi, [panelSide] );
            } );
            worker.port.on( 'noLaxarDeveloperToolsApi', function() {
               panelThis.postMessage( JSON.stringify( { text: 'noLaxarDeveloperToolsApi' } ), [panelSide] );
            } );
            if( getLaxarDeveloperToolsApiInterval ) {
               clearInterval( getLaxarDeveloperToolsApiInterval );
            }
            getLaxarDeveloperToolsApiInterval = setInterval( function() {
               worker.port.emit( 'getLaxarDeveloperToolsApi' );
            }, REFRESH_DELAY_MS );

            worker.on('detach', function () {
               clearInterval( getLaxarDeveloperToolsApiInterval );
            } );
         }
      } );
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   dispose: function() {
      'use strict';
      this.debuggee = null;
      ss.storage.laxarDeveloperToolsExtensionLoaded = false;
      if( getLaxarDeveloperToolsApiInterval ) {
         clearInterval( getLaxarDeveloperToolsApiInterval );
      }
   }
} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const replTool = new Tool( {
   panels: {
     repl: laxarPanel
   }
} );
