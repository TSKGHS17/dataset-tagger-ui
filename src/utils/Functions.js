const Functions = {
    getCenter() {
        let winWidth, winHeight;
        if (window.innerWidth) {
            winWidth = window.innerWidth;
        } else if ((document.body) && (document.body.clientWidth)) {
            winWidth = document.body.clientWidth;
        }

        if (window.innerHeight) {
            winHeight = window.innerHeight;
        } else if ((document.body) && (document.body.clientHeight)) {
            winHeight = document.body.clientHeight;
        }

        return [winWidth / 2, winHeight / 2];
    },
    getItem(label, key, icon, children, type) {
        return {
            key, icon, children, label, type,
        };
    }
}

export default Functions;