import React from "react";
import {Layout, Menu, Row} from "antd";
import {DatabaseTwoTone, HomeTwoTone, TabletTwoTone} from "@ant-design/icons";
import PhotoWall from "../component/PhotoWall";
import Styles from "../utils/Styles";
import Functions from "../utils/Functions";

const {Header, Footer, Sider, Content} = Layout;

const items = [
    Functions.getItem('Home', 'home', <HomeTwoTone/>, [Functions.getItem('Information', 'info')]),
    Functions.getItem('Data sets', 'data sets', <DatabaseTwoTone/>, [
        Functions.getItem('Data set 1', 'ds'),
    ]),
    Functions.getItem('Playground', 'playground', <TabletTwoTone/>),
];

class HomePage extends React.Component {
    render() {
        return (
            <div>
                <Layout style={Styles.layoutStyle}>
                    <Sider width={256} style={Styles.siderStyle}>
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
                        <Header style={Styles.headerStyle}> Header Position </Header>
                        <Content
                            style={{
                                margin: '0 16px',
                            }}
                        >
                            <Row>
                                <PhotoWall />
                            </Row>
                        </Content>
                        <Footer style={Styles.footerStyle}> Footer Position </Footer>
                    </Layout>
                </Layout>
            </div>
        );
    }
}

export default HomePage;