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
import axios from "axios";
import Constants from "../utils/Constants";
import './App.css';

const {Header, Footer, Sider, Content} = Layout;
const functions = new Functions();

const items = [
    functions.getItem('主页', '', <HomeTwoTone/>),
    functions.getItem('数据集', 'dataset', <DatabaseTwoTone/>),
    functions.getItem('广场', 'playground', <TabletTwoTone/>),
];

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            username: "username",
            uid: "uid",
        }
    }

    componentDidMount() {
        let frontEndInfoUrl = '/b/api/user/info';
        axios.get(Constants.frontEndBaseUrl + frontEndInfoUrl, Constants.formHeader).then((res) => {
            if (res.data.code === 200) {
                this.setState({username: res.data.data['username'], uid: res.data.data['uid']});
            }
            else {
                message.error(res.data['error_msg']);
                this.props.navigate('/login');
            }
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
        });
    }

    toggleCollapsed = () => {
        this.setState({collapsed: !this.state.collapsed});
    }

    menuHandleClick = (values) => {
        let {key} = values;
        this.props.navigate('/' + key + `?uid=${this.state.uid}`);
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
                message.error(data['error_msg']);
                this.props.navigate('/login');
            }
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
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
                        <Header style={Styles.appHeader}>
                            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: this.toggleCollapsed,
                            })}
                            <Popover
                                title={this.state.username}
                                overlayClassName={'popover'}
                                content={<Button type="dashed" block onClick={this.logout}>退出登录</Button>}
                            >
                                <Avatar
                                    icon={<UserOutlined/>}
                                    style={Styles.appAvatar}
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