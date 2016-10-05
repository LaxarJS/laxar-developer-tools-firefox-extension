# laxar-developer-tools-firefox-extension

The laxar-developer-tools-firefox-extension is a browser Add-on for the Firefox which helps to develop LaxarJS applications.
It adds an additional tab to the developer tools that displays application events, helps visualizing the structure of the current page, and allows to browse log messages of the running LaxarJS application.


## Develop

To use the developer version of the laxar-developer-tools-widget modify the `WIDGET_CONTENT_PATH` in the file `main.js` from `'../laxar-developer-tools-widget/content/index.html'` to `'../laxar-developer-tools-widget/content/debug.html'` and follow the instruction in the
[README](https://github.com/LaxarJS/ax-developer-tools-widget) of the widget.


## Create Extension Package

To build the extension, use jpm to create a `.xpi` package.

```
jpm xpi
```

### Build new version with updated Widget

Update the submodule and copy the widget:
```
rsync -av --exclude=".git" laxar-developer-tools-widget-source/  laxar-developer-tools-widget
cd laxar-developer-tools-widget/content
rm -r bower_components
npm install
grunt dist-without-optimize
cd ../../
```

Build the package with `jpm`.
