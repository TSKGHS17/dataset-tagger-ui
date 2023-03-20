import React from "react";
import {Button, Form, Input, Layout, Space} from "antd";
import Styles from "../utils/Styles";
import axios from "axios";
import Constants from "../utils/Constants";

const {Header, Footer, Content} = Layout;

export default class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
    }

    onFinish = (values) => {
        if (values.username === undefined || values.password === undefined || values.username === "" || values.password === "") {
            return;
        }
    }

    resetForm = () => {
        this.formRef.current.resetFields();
    }

    render() {
        return (
            <Layout style={Styles.layoutStyle}>
                <Header style={Styles.headerStyle}>Header</Header>
                <Content style={Styles.contentStyle}>
                    <Form
                        ref={this.formRef}
                        onFinish={this.onFinish}
                    >
                        <Form.Item
                            name="username"
                            label="用户名"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入用户名！',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入密码！',
                                },
                            ]}
                            hasFeedback
                        >
                            <Input.Password/>
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label="确认密码"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: '请确认密码！',
                                },
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次输入的密码必须相同！'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password/>
                        </Form.Item>

                        <Form.Item
                            name="nickname"
                            label="昵称"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入昵称！',
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="邮箱"
                            rules={[
                                {
                                    type: 'email',
                                    message: '输入的邮箱地址不合法！',
                                },
                                {
                                    required: true,
                                    message: '请输入邮箱地址！',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="电话号码"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入电话号码！',
                                },
                                () => ({
                                    validator(_, value) {
                                        if (!value || (value.length === 11 && /^\d+$/.test(value))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('输入的电话号码不合法！'));
                                    },
                                }),
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button type="primary" htmlType="submit">
                                    注册
                                </Button>
                                <Button onClick={this.resetForm}>
                                    重置
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Content>
                <Footer style={Styles.footerStyle}>Footer</Footer>
            </Layout>
        );
    }
}