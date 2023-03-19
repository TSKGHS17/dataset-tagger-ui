import Functions from "./Functions";

const Styles = {
    layoutStyle: {
        minHeight: '100vh',
    },
    headerStyle: {
        padding: 0,
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#7dbcea',
    },
    contentStyle: {
        position: 'relative',
        left: (Functions.getCenter()[0] - 230) + 'px',
        top: (Functions.getCenter()[1] - 228) + 'px',
        width: "30%",
    },
    footerStyle: {
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#7dbcea',
    },
    siderStyle: {
        color: '#fff',
        backgroundColor: '#ffffff',
    },
}

export default Styles;