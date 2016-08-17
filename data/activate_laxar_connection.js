/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global self, unsafeWindow */

self.port.on( 'setLaxarCssClass', function() {
   'use strict';
   unsafeWindow.laxarDeveloperToolsExtensionLoaded = true;
} );
