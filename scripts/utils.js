// Fonction utilitaire pour récupérer un élément frère d'un autre
export function getFirstSibling(el, selector) {
    return Array.prototype.filter.call(
        el.parentNode.children,
        function (child) {
            return child !== el && child.matches(selector);
        }
    )[0];
}

// Fonction permettant de définir 1 ou plusieurs gestionnaires d'événement en même temps sur un élement,
// en offrant également la possiblité de faire de la délégation
export function addEvents(element, events, selector, handler) {
    events = events.trim().split(" ");

    if (typeof selector === "function") {
        handler = selector;
        selector = null;
    }

    events.forEach((eventName) => {
        element.addEventListener(
            eventName,
            function (e) {
                let originalTarget = e.target;
                if (
                    (selector && originalTarget.matches(selector)) ||
                    originalTarget === element
                ) {
                    handler.call(originalTarget, e);
                }
            },
            false
        );
    });
}

// Fonction permettant de facilement supprimer un élément du DOM
export function removeNode(node) {
    if (node) {
        node.parentNode.removeChild(node);
    }
}

export function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
