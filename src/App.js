import './App.css';
import React from "react"
import {Layout, Menu, Row} from "antd";
import {DatabaseTwoTone, HomeTwoTone, TabletTwoTone} from "@ant-design/icons";
import PhotoWall from "./component/PhotoWall";

const {Header, Footer, Sider, Content} = Layout;

function getItem(label, key, icon, children, type) {
    return {
        key, icon, children, label, type,
    };
}

const items = [
    getItem('Home', 'home', <HomeTwoTone/>, [getItem('Information', 'info')]),
    getItem('Data sets', 'data sets', <DatabaseTwoTone/>, [
        getItem('Data set 1', 'ds'),
    ]),
    getItem('Playground', 'playground', <TabletTwoTone/>),
];

const HeaderStyle = {
    padding: 0,
    textAlign: 'center',
    backgroundColor: '#ffffff',
}

const SiderStyle = {
    color: '#fff',
    backgroundColor: '#ffffff',
}

const FooterStyle = {
    textAlign: 'center',
    backgroundColor: '#ffffff',
}

class App extends React.Component {
    render() {
        return (
            <div>
                <Layout
                    style={{
                        minHeight: '100vh',
                    }}
                >
                    <Sider width={256} style={SiderStyle}>
                        <div
                            style={{
                                height: 32,
                                margin: 16,
                            }}
                        />
                        <Menu
                            style={{
                                width: 256,
                            }}
                            defaultSelectedKeys={['1']}
                            defaultOpenKeys={['sub1']}
                            mode="inline"
                            items={items}
                        />
                    </Sider>
                    <Layout className="site-layout">
                        <Header style={HeaderStyle}> Header Position </Header>
                        <Content
                            style={{
                                margin: '0 16px',
                            }}
                        >
                            <Row>
                                <PhotoWall />
                            </Row>
                        </Content>
                        <Footer style={FooterStyle}> Footer Position </Footer>
                    </Layout>
                </Layout>
            </div>
        );
    }
}

export default App;