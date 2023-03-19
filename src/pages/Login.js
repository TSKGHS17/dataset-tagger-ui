import React from 'react';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Layout, Button, Checkbox, Form, Input, Space} from 'antd';
import axios from 'axios';

const {Header, Footer, Content} = Layout;

const layoutStyle = {
    minHeight: '100vh',
};

const headerStyle = {
    padding: 0,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#7dbcea',
};
const contentStyle = {
    position: 'relative',
    left: (getCenter()[0] - 230) + 'px',
    top: (getCenter()[1] - 228) + 'px',
    width: "30%",
};
const footerStyle = {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#7dbcea',
};

function getCenter() {
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
}

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
    }
    onFinish = (values) => {
        // console.log('Received values of form: ', values);
    };

    handleLogin = () => {
        let values = this.formRef.current.getFieldsValue();
        axios.post('http://192.168.31.217:8082/api/publisher/login', values).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        })
    }

    resetForm = () => {
        this.formRef.current.resetFields();
    }

    render() {
        return (
            <Layout style={layoutStyle}>
                <Header style={headerStyle}>Header</Header>
                <Content style={contentStyle}>
                    <Form
                        name="normal_login"
                        ref={this.formRef}
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={this.onFinish}
                    >
                        <Form.Item
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your username!',
                                },
                            ]}
                        >
                            <Input prefix={<UserOutlined/>} placeholder="Username"/>
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                            ]}
                        >
                            <Input
                                prefix={<LockOutlined/>}
                                type="password"
                                placeholder="Password"
                            />
                        </Form.Item>

                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Form.Item >
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button type="primary" htmlType="submit" onClick={this.handleLogin}>
                                    Log in
                                </Button>
                                <Button htmlType="submit">
                                    Register
                                </Button>
                                <Button onClick={this.resetForm}>
                                    Reset
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Content>
                <Footer style={footerStyle}>Footer</Footer>
            </Layout>
        )
    }
}

