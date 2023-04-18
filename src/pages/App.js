import React from "react";
import {Avatar, Button, Layout, Menu, message, Popover} from "antd";
import {
    DatabaseTwoTone,
    HomeTwoTone,
    TabletTwoTone,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined
} from "@ant-design/icons";
import Styles from "../utils/Styles";
import Functions from "../utils/Functions";
import {WithRouter} from "../router/WithRouter";
import {Outlet} from "react-router-dom";
import './App.css';
import axios from "axios";
import Constants from "../utils/Constants";

const {Header, Footer, Sider, Content} = Layout;

const items = [
    Functions.getItem('主页', '', <HomeTwoTone/>),
    Functions.getItem('数据集', 'dataset', <DatabaseTwoTone/>),
    Functions.getItem('广场', 'playground', <TabletTwoTone/>),
];

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            username: "username",
        }
    }

    componentDidMount() {
        let frontEndInfoUrl = '/b/api/user/info';
        let username;
        axios.get(Constants.frontEndBaseUrl + frontEndInfoUrl, Constants.formHeader).then((res) => {
            username = res.data.data.username;
            this.setState({username: username});
        }).catch((err) => {
            message.error('未登录');
            this.props.navigate('/login');
        });
    }

    toggleCollapsed = () => {
        this.setState({collapsed: !this.state.collapsed});
    }

    menuHandleClick = (values) => {
        let {key} = values;
        this.props.navigate('/' + key);
    }

    logout = () => {
        let frontEndLogoutUrl = '/b/api/user/logout';
        axios.get(Constants.frontEndBaseUrl + frontEndLogoutUrl, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('注销成功');
                this.props.navigate('/login');
            }
            else {
                message.error('注销失败');
            }
        });
    }

    render() {
        return (
            <div>
                <Layout style={Styles.layoutStyle}>
                    <Sider
                        width={256}
                        style={Styles.siderStyle}
                        collapsible
                        collapsed={this.state.collapsed}
                        trigger={null}
                    >
                        <div
                            style={{
                                height: 32,
                                margin: 16,
                            }}
                        />
                        <Menu
                            mode="vertical"
                            items={items}
                            onClick={this.menuHandleClick}
                        />
                    </Sider>
                    <Layout className="site-layout">
                        <Header className='header'>
                            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: this.toggleCollapsed,
                            })}
                            <Popover
                                title={this.state.username}
                                overlayClassName="popover"
                                content={<Button type="dashed" block onClick={this.logout}>退出登录</Button>}
                            >
                                <Avatar
                                    icon={<UserOutlined/>}
                                    className="avatar"
                                />
                            </Popover>
                        </Header>
                        <Content style={Styles.contentStyleWithSider}>
                            <Outlet/>
                        </Content>
                        <Footer style={Styles.footerStyle}> Footer Position </Footer>
                    </Layout>
                </Layout>
            </div>
        );
    }
}

export default WithRouter(App);