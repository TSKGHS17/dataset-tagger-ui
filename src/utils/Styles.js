import Functions from "./Functions";

const functions = new Functions();

const Styles = {
    layoutStyle: {
        minHeight: '100vh',
    },
    headerStyle: {
        padding: 0,
        textAlign: 'center',
        color: '#fff',
        background: 'linear-gradient(#28B4FA, #2946FF)',
    },
    headerStyleWithSider: {
        padding: 0,
        background: 'linear-gradient(#28B4FA, #2946FF)',
        position: 'relative',
    },
    contentStyle: {
        position: 'relative',
        left: (functions.getCenter()[0] - 230) + 'px',
        top: (functions.getCenter()[1] - 228) + 'px',
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
        background: 'linear-gradient(#28B4FA, #2946FF)',
    },
    siderStyle: {
        backgroundColor: '#fff',
    },
    appHeader: {
        padding: 0,
        background: 'linear-gradient(#28B4FA, #2946FF)',
        position: 'relative',
    },
    appAvatar: {
        cursor: 'pointer',
        position: 'absolute',
        right: '15px',
        top: '15px',
    },
    listItem: {
        position: 'relative',
    },
    listItemAvatar: {
        position: 'absolute',
        top: '1px',
        left: '5px',
        backgroundColor: '#fff',
    },
    listItemTitle: {
        position: 'absolute',
        top: '0px',
        left: '60px',
    },
    listItemTitleWithPointer: {
        position: 'absolute',
        cursor: 'pointer',
        top: '0px',
        left: '60px',
    },
    listItemDesc: {
        position: 'absolute',
        top: '20px',
        left: '60px',
    },
    firstButton: {
        position: 'absolute',
        right: '20px',
    },
    secondButton: {
        position: 'absolute',
        right: '90px',
    },
    textParagraph: {
        fontSize: '120%',
    },
    markedTextParagraph: {
        fontSize: '109.5%',
    }
}

export default Styles;