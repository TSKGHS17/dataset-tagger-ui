import React from "react";
import {Button, Form, Input, Layout, message, Modal, Space} from "antd";
import Styles from "../utils/Styles";
import Constants from "../utils/Constants";
import {WithRouter} from "../router/WithRouter";
import axios from "axios";

const {Header, Footer, Content} = Layout;

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            showErrorMsg: false,
            errorMsg: "",
        }
    }

    onRegister = (values) => {
        if (values.username === undefined || values.password === undefined || values.username === "" || values.password === "") {
            return;
        }

        let frontEndRegisterUrl = '/b/api/user/register';
        axios.post(Constants.frontEndBaseUrl + frontEndRegisterUrl, values, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('注册成功');
                this.props.navigate('/login');
            } else {
                this.setState({showErrorMsg: true, errorMsg: data.error_msg});
                // TODO
            }
        }).catch((err) => {
            this.setState({showErrorMsg: true, errorMsg: err.message});
        });
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
                        ref={this.formRef}
                        onFinish={this.onRegister}
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
                            name="email"
                            label="邮箱"
                            rules={[
                                {
                                    required: false,
                                    type: 'email',
                                    message: '输入的邮箱地址不合法！',
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
                                    required: false,
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
                    <Modal
                        open={this.state.showErrorMsg}
                        title={"注册失败"}
                        onCancel={this.closeErrorMsg}
                        footer={<Button type="primary" onClick={this.closeErrorMsg}>好的</Button>}
                    >
                        {this.state.errorMsg}
                    </Modal>
                </Content>
                <Footer style={Styles.footerStyle}>Footer</Footer>
            </Layout>
        );
    }
}

export default WithRouter(RegisterPage);