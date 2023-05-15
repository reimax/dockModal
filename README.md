DockModal.js
A vanilla, lightweight (~8kb gzipped), configurable. Fork jquery.dialog.js but without the jQuery dependency.

SETUP

js
```js
dockModal(document.querySelector(".dock_modal"), {
    minimizedWidth: 240,
    class: 'dockmodal_test',
    height: 420,
    title: function() {
        return document.querySelector(".dock_modal").getAttribute("data-title");
    },
    initialState: "minimized"
});
```
html
```html
<div class="dock_modal" data-title="test_title">    
    test content
</div>
```

callback function:
```php
beforeCreate: undefined,
create: undefined,
open: undefined,
beforeClose: undefined,
close: undefined,
beforeMinimize: undefined,
minimize: undefined,
beforeRestore: undefined,
restore: undefined,
beforePopout: undefined,
popout: undefined
```

demo:
https://reimax.github.io/dockModal/public/
