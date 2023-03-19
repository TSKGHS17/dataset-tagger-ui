import React from "react";
import {Button, Form, Input, Layout, Select, Space} from "antd";
import Styles from "../utils/Styles";

const {Header, Footer, Content} = Layout;
const {Option} = Select;

const prefixSelector = (
    <Form.Item name="prefix" noStyle>
        <Select
            style={{
                width: 70,
            }}
        >
            <Option value="86">+86</Option>
            <Option value="87">+87</Option>
        </Select>
    </Form.Item>
);

export default class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
    }

    resetForm = () => {
        this.formRef.current.resetFields();
    }

    render() {
        return (
            <Layout style={Styles.layoutStyle}>
                <Header style={Styles.headerStyle}>Header</Header>
                <Content style={Styles.contentStyle}>
                    <Form ref={this.formRef}>
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
                            ]}
                        >
                            <Input
                                addonBefore={prefixSelector}
                                style={{
                                    width: '100%',
                                }}
                            />
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