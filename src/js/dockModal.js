var dockModal = function () {
    const defaults = {
        width: 400,
        height: "65%",
        minimizedWidth: 200,
        gutter: 40,
        poppedOutDistance: "6%",
        title: function() {
            return "";
        },
        class: "",
        animationSpeed: 400,
        initialState: 'modal', /* "modal", "docked", "minimized" */
    
        showPopout: true,
        showMinimize: true,
        showClose: false,
    
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
    };
    const main_class = "dockmodal";

    var dockModal = function (element, option) {
        let options = {...defaults, ...option};
        // Check to see if title is a returned function
        if (typeof options.title == "function") {
            options.title = options.title.call(element);
        }
            
        // create modal
        let body = document.querySelector("body");
        let dock_modal_block = document.createElement("div");
        dock_modal_block.className = main_class;
        dock_modal_block.classList.add(options.class);
        Object.assign(dock_modal_block.dataset, {
            width: options.width,
            height: options.height,
            minimizedWidth: options.minimizedWidth,
            gutter: options.gutter,
            animationSpeed: options.animationSpeed,
        });
        
        if (options.initialState == "modal") {
            dock_modal_block.classList.add("popped-out");
        } else if (options.initialState == "minimized") {
            dock_modal_block.classList.add("minimized");
        }
        dock_modal_block.offsetHeight = 0;
        dockModal.setAnimationCSS(dock_modal_block, options);

        // create title
        let dockHeader = document.createElement("div");
        dockHeader.className = main_class + "-header";
        
        if (options.showClose) {
            let a = document.createElement("a");
            a.className = "header-action action-close";
            a.innerHTML = '<i class="icon-close"></i>';
            a.setAttribute("title", "Close");

            dockHeader.appendChild(a);
            dockHeader.querySelector(".action-close").addEventListener("click", function(event) {
                event.stopPropagation();
                dockModal.destroy(dock_modal_block, options);
                return false;
            });
        }
        if (options.showPopout) {
            let a = document.createElement("a");
            a.className = "header-action action-popout";
            a.innerHTML = '<i class="icon-popout"></i>';
            a.setAttribute("title", "Pop out");
            dockHeader.appendChild(a);
            dockHeader.querySelector(".action-popout").addEventListener("click", function(event) {
                event.stopPropagation();

                if (dock_modal_block.classList.contains("popped-out")) {
                    dockModal.restore(dock_modal_block, options);
                } else {
                    dockModal.popout(dock_modal_block, options);
                }
                return false;
            });
        }
        if (options.showMinimize) {
            let a = document.createElement("a");
            a.className = "header-action action-minimize";
            a.innerHTML = '<i class="icon-minimize"></i>';
            a.setAttribute("title", "Minimize");
            dockHeader.appendChild(a);
            dockHeader.querySelector(".action-minimize").addEventListener("click", function(event) {
                event.stopPropagation();

                if (dock_modal_block.classList.contains("minimized")) {
                    if (dock_modal_block.classList.contains("popped-out")) {
                        dockModal.popout(dock_modal_block, options);
                    } else {
                        dockModal.restore(dock_modal_block, options);
                    }
                } else {
                    dockModal.minimize(dock_modal_block, options);
                }
                return false;
            });
        }
        if (options.showMinimize) {
            dockHeader.addEventListener("click", function(event) {
                event.stopPropagation();

                if (dock_modal_block.classList.contains("minimized")) {
                    if (dock_modal_block.classList.contains("popped-out")) {
                        dockModal.popout(dock_modal_block, options);
                    } else {
                        dockModal.restore(dock_modal_block, options);
                    }
                } else {
                    dockModal.minimize(dock_modal_block, options);
                }
                return false;
            });
        }

        let title_text = document.createElement("div");
        title_text.className = "title-text";
        title_text.innerHTML = (options.title || element.getAttribute("title"));
        dockHeader.appendChild(title_text);
        dock_modal_block.appendChild(dockHeader);

        // create body section
        let dockBody = document.createElement("div");
        dockBody.className = main_class + "-body";
        dockBody.appendChild(element)
        dock_modal_block.appendChild(dockBody);

        // create footer
        dock_modal_block.classList.add("no-footer");

        // create overlay
        let overlay = document.querySelector("." + main_class + "-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = main_class + "-overlay";
        }

        // raise create event
        if (typeof options.beforeCreate == "function") {
            options.beforeCreate = options.beforeCreate.call(element);
        }

        body.appendChild(dock_modal_block);
        body.appendChild(overlay);
        dockBody.focus();

        if (typeof options.create == "function") {
            options.create = options.create.call(element);
        }

        // raise open event
        if (typeof options.open == "function") {
            setTimeout(function () {
                options.open = options.open.call(element);
            }, options.animationSpeed);            
        }

        if (dock_modal_block.classList.contains("minimized")) {
            dock_modal_block.querySelector(".dockmodal-body").style.display = "none";
            dockModal.minimize(dock_modal_block, options);
        } else {
            if (dock_modal_block.classList.contains("popped-out")) {
                dockModal.popout(dock_modal_block, options);
            } else {
                dockModal.restore(dock_modal_block, options);
            }
        }

        // attach resize event
        // track width, set to window width
        body.dataset.windowWidth = window.innerWidth;

        window.addEventListener("resize.dockmodal", function() {
            // do nothing if the width is the same
            // update new width value
            if (window.innerWidth == body.dataset.windowWidth) {
                return;
            }

            body.dataset.windowWidth = window.innerWidth;
            dockModal.refreshLayout();
        });

        return dock_modal_block;
    };

    dockModal.destroy = function (element, options) {
        if (!element) return;
    
        let dock_modal_block = element.closest("." + main_class);
    
        // raise beforeClose event
        if (typeof options.beforeClose == "function") {
            setTimeout(function () {
                options.beforeClose = options.beforeClose.call(element);
            }, options.animationSpeed);            
        }
    
        try {
            if (element.classList.contains("popped-out") && !element.classList.contains("minimized")) {
                dock_modal_block.style.left = "50%";
                dock_modal_block.style.right = "50%";
                dock_modal_block.style.top = "50%";
                dock_modal_block.style.bottom = "50%";
            } else {
                dock_modal_block.style.width = "0";
                dock_modal_block.style.height = "0";
            }
            setTimeout(function () {
                //element.replaceWith(element.querySelector(".dockmodal-body").firstChild);
                dock_modal_block.remove();
                document.querySelector("." + main_class + "-overlay").style.display = "none";
                dockModal.refreshLayout();
    
                // raise close event
                if (typeof options.close == "function") {
                    setTimeout(function () {
                        options.close = options.close.call(element);
                    }, options.animationSpeed);            
                }
            }, options.animationSpeed);
    
        }
        catch (err) {
            alert(err.message);
        }
        // other destroy routines
    };
    
    dockModal.close = function (element, options) {
        dockModal.destroy(element, options);
    };
    
    dockModal.minimize = function (element, options) {
        if (!element) return;
    
        // raise beforeMinimize event
        if (typeof options.beforeMinimize == "function") {
            setTimeout(function () {
                options.beforeMinimize = options.beforeMinimize.call(element);
            }, options.animationSpeed);            
        }
    
        let dock_modal_block = element.closest("." + main_class);
        
        let headerHeight = dock_modal_block.querySelector(".dockmodal-header").offsetHeight;
        dock_modal_block.classList.add("minimized");
        dock_modal_block.style.width = options.minimizedWidth + "px";
        dock_modal_block.style.height = headerHeight + "px";
        dock_modal_block.style.left = "auto";
        dock_modal_block.style.right = "auto";
        dock_modal_block.style.top = "auto";
        dock_modal_block.style.bottom = "0";
    
        setTimeout(function () {
            // for safty, hide the body and footer
            dock_modal_block.querySelector(".dockmodal-body").style.display = "none";
    
            // raise minimize event
            if (typeof options.minimize == "function") {
                setTimeout(function () {
                    options.minimize = options.minimize.call(element);
                }, options.animationSpeed);            
            }
        }, options.animationSpeed);
    
        document.querySelector("." + main_class + "-overlay").style.display = "none";
        dock_modal_block.querySelector(".action-minimize").setAttribute("title", "Restore");
    
        dockModal.refreshLayout();
    };
    
    dockModal.restore = function (element, options) {
        if (!element) return;
    
        // raise beforeRestore event
        if (typeof options.beforeRestore == "function") {
            setTimeout(function () {
                options.beforeRestore = options.beforeRestore.call(element);
            }, options.animationSpeed);            
        }
    
        let dock_modal_block = element.closest("." + main_class);
        dock_modal_block.classList.remove("minimized");
        dock_modal_block.classList.remove("popped-out");
        dock_modal_block.querySelector(".dockmodal-body").style.display = "";
        dock_modal_block.style.width = options.width + "px";
        dock_modal_block.style.height = options.height + "px";
        dock_modal_block.style.left = "auto";
        dock_modal_block.style.right = "auto";
        dock_modal_block.style.top = "auto";
        dock_modal_block.style.bottom = "0";
    
        document.querySelector("." + main_class + "-overlay").style.display = "none";
        dock_modal_block.querySelector(".action-minimize").setAttribute("title", "Minimize");
        dock_modal_block.querySelector(".action-popout").setAttribute("title", "Pop-out");
    
        setTimeout(function () {
            // raise restore event
            if (typeof options.restore == "function") {
                setTimeout(function () {
                    options.restore = options.restore.call(element);
                }, options.animationSpeed);            
            }
        }, options.animationSpeed);
    
        dockModal.refreshLayout();
    };
    
    dockModal.popout = function (element, options) {
        if (!element) return;
    
        // raise beforePopout event
        if (typeof options.beforePopout == "function") {
            setTimeout(function () {
                options.beforePopout = options.beforePopout.call(element);
            }, options.animationSpeed);            
        }
    
        let dock_modal_block = element.closest("." + main_class);
        dock_modal_block.querySelector(".dockmodal-body").style.display = "";
    
        // prepare element for animation
        dockModal.removeAnimationCSS(dock_modal_block);
        let offset = { 
            top: dockModal.offsetTop, 
            left: dockModal.offsetLeft, 
        };
        let windowWidth = window.innerWidth;
        dock_modal_block.style.width = "auto";
        dock_modal_block.style.height = "auto";
        dock_modal_block.style.left = offset.left + "px";
        dock_modal_block.style.right = (windowWidth - offset.left - dockModal.clientWidth) + "px";
        dock_modal_block.style.top = offset.top + "px";
        dock_modal_block.style.bottom = 0;
    
        dockModal.setAnimationCSS(dock_modal_block, options);
        setTimeout(function () {
            dock_modal_block.classList.remove("minimized");
            dock_modal_block.classList.add("popped-out");
    
            dock_modal_block.style.width = "auto";
            dock_modal_block.style.height = "auto";
            dock_modal_block.style.left = options.poppedOutDistance;
            dock_modal_block.style.right = options.poppedOutDistance;
            dock_modal_block.style.top = options.poppedOutDistance;
            dock_modal_block.style.bottom = options.poppedOutDistance;
            
            document.querySelector("." + main_class + "-overlay").style.display = "block";
            dock_modal_block.querySelector(".action-popout").setAttribute("title", "Pop-in");
    
            dockModal.refreshLayout();
        }, 10);
    
        setTimeout(function () {
            // raise popout event
            if (typeof options.popout == "function") {
                setTimeout(function () {
                    options.popout = options.popout.call(element);
                }, options.animationSpeed);            
            }
        }, options.animationSpeed);
    };
    
    dockModal.refreshLayout = function () {
        let right = 0;
        let windowWidth = window.innerWidth;
    
        document.querySelectorAll("."+main_class).forEach(function(element) {
            let options = element.dataset;
    
            if (element.classList.contains("popped-out") && !element.classList.contains("minimized")) {
                return;
            }
    
            right += parseFloat(options.gutter);
            element.style.right = right + "px";
            if (element.classList.contains("minimized")) {
                right += parseFloat(options.minimizedWidth);
            } else {
                right += parseFloat(options.width);
            }
            if (right > windowWidth) {
                element.style.display = "none";
            } else {
                setTimeout(function () {
                    element.style.display = "";
                }, parseFloat(options.animationSpeed));
            }
        });
    };

    dockModal.setAnimationCSS = function(element, options) {
        let aniSpeed = options.animationSpeed / 1000;
        element.style.transition = aniSpeed + "s right, " + aniSpeed + "s left, " + aniSpeed + "s top, " + aniSpeed + "s bottom, " + aniSpeed + "s height, " + aniSpeed + "s width";
        return true;
    };
    
    dockModal.removeAnimationCSS = function(element) {
        element.style.transition = "none";
        return true;
    };

    return dockModal;
}();