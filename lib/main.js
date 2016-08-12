/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

require( 'sdk/preferences/service' ).set( 'extensions.sdk.console.logLevel', 'all' );
var gridContentScript = require( 'sdk/self' ).data.url( '../laxar-developer-tools-widget/content/includes/lib/laxar-developer-tools/grid.js' );
var widgetOutlineContentScript = require( 'sdk/self' ).data.url( '../laxar-developer-tools-widget/content/includes/lib/laxar-developer-tools/widget-outline.js' );

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
const channel = new MessageChannel();
const addonSide = channel.port1;
const panelSide = channel.port2;
var getLaxarDeveloperToolsApiInterval;
var REFRESH_DELAY_MS = 100;

pageMod.PageMod( {
   include: '*',
   contentScriptFile: [
      gridContentScript,
      widgetOutlineContentScript,
      './content_script_utilities.js'
   ],
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

const laxarPanel = Class( {
   extends: Panel,
   label: 'LaxarJS',
   tooltip: 'Firefox add-on to help to develop LaxarJS apps',
   icon: '../laxar-developer-tools-widget/content/includes/widgets/developer-toolbar-widget/default.theme/images/title-icon.png',
   url: '../laxar-developer-tools-widget/content/debug.html',
   setup: function(options) {
      'use strict';
      this.debuggee = options.debuggee;
   },
   onLoad: function() {
      'use strict';
      var panelThis = this;
      addonSide.onmessage = function( event ) {
         var message = JSON.parse( event.data );
         if( message.text === 'messagePortStarted' ) {
            if( establishChannelInterval ) {
               clearInterval( establishChannelInterval );
            }
         }
      };
      var establishChannelInterval = setInterval( function() {
         panelThis.postMessage( JSON.stringify( { text: 'noLaxarDeveloperToolsApi' } ), [panelSide] );
      }, REFRESH_DELAY_MS );

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
   dispose: function() {
      'use strict';
      if( getLaxarDeveloperToolsApiInterval ) {
         clearInterval( getLaxarDeveloperToolsApiInterval );
      }
   }
} );

const replTool = new Tool( {
   panels: {
     repl: laxarPanel
   }
} );
