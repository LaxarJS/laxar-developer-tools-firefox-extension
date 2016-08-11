/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global self, unsafeWindow */

self.port.on( 'getLaxarDeveloperToolsApi', function() {
   'use strict';
   var axDeveloperToolsApi = unsafeWindow.axDeveloperToolsApi;
   if( axDeveloperToolsApi ) {
      self.port.emit( 'gotLaxarDeveloperToolsApi', JSON.stringify( axDeveloperToolsApi ) );
   }
   else {
      self.port.emit( 'noLaxarDeveloperToolsApi' );
   }
} );
