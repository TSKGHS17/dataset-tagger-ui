import React from 'react';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Layout, Button, Checkbox, Form, Input, Space, Modal} from 'antd';
import axios from 'axios';
import Constants from "../utils/Constants";
import Styles from "../utils/Styles";

const {Header, Footer, Content} = Layout;

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state={
            showErrorMsg: false,
            errorMsg: "",
        }
    }
    onFinish = (values) => {
        // console.log('Received values of form: ', values);
    };

    handleLogin = () => {
        let values = this.formRef.current.getFieldsValue();
        if (values.username === undefined || values.password === undefined || values.username === "" || values.password === "") {
            return;
        }

        axios.post(Constants.frontEndBaseUrl + '/b/api/publisher/login', values, Constants.formHeader).then((res) => {
            const {data} = res;
            console.log(res);
            if (data.code === 200) {
                //TODO
            }
            else {
                this.setState({showErrorMsg: true, errorMsg: data.error_msg});
            }
        }).catch((err) => {
            this.setState({showErrorMsg: true, errorMsg: err.message});
        })
    }

    resetForm = () => {
        this.formRef.current.resetFields();
    }

    closeErrorMsg = () => {
        this.setState({showErrorMsg: false});
    }

    render() {
        return (
            <Layout style={Styles.layoutStyle}>
                <Header style={Styles.headerStyle}>Header</Header>
                <Content style={Styles.contentStyle}>
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
                                    message: '请输入用户名！',
                                },
                            ]}
                        >
                            <Input prefix={<UserOutlined/>} placeholder="用户名"/>
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入密码！',
                                },
                            ]}
                        >
                            <Input
                                prefix={<LockOutlined/>}
                                type="password"
                                placeholder="密码"
                            />
                        </Form.Item>

                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Form.Item >
                                <Checkbox>记住我</Checkbox>
                            </Form.Item>
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button type="primary" htmlType="submit" onClick={this.handleLogin}>
                                    登录
                                </Button>
                                <Button htmlType="submit">
                                    注册
                                </Button>
                                <Button onClick={this.resetForm}>
                                    重置
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                    <Modal
                        open={this.state.showErrorMsg}
                        title={"登录失败"}
                        onCancel={this.closeErrorMsg}
                        footer={<Button onClick={this.closeErrorMsg}>好的</Button>}
                    >
                        {this.state.errorMsg}
                    </Modal>
                </Content>
                <Footer style={Styles.footerStyle}>Footer</Footer>
            </Layout>
        )
    }
}

