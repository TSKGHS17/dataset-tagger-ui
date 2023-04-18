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
    headerStyleWithSider: {
        padding: 0,
        backgroundColor: '#7dbcea',
        position: 'relative',
    },
    contentStyle: {
        position: 'relative',
        left: (Functions.getCenter()[0] - 230) + 'px',
        top: (Functions.getCenter()[1] - 228) + 'px',
        width: "30%",
    },
    contentStyleWithSider: {
        margin: '0 16px',
        marginTop: '8px',
        marginBottom: '8px',
    },
    footerStyle: {
        textAlign: 'center',
        color: '#fff',
        backgroundColor: '#7dbcea',
    },
    siderStyle: {
        backgroundColor: '#fff',
    },
}

export default Styles;