/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* global self, axDeveloperToolsToggleGrid, axDeveloperToolsToggleWidgetOutline */

self.port.on( 'toogleGrid', function( gridSettings ) {
   'use strict';
   axDeveloperToolsToggleGrid( JSON.parse( gridSettings ) );
} );

self.port.on( 'widgetOutline', function( data ) {
   'use strict';
   axDeveloperToolsToggleWidgetOutline();
} );
