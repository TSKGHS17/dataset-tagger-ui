import React from 'react';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Layout, Button, Form, Input, Space, Modal, message, Spin} from 'antd';
import axios from 'axios';
import Constants from "../utils/Constants";
import Styles from "../utils/Styles";
import {WithRouter} from "../router/WithRouter";

const {Header, Footer, Content} = Layout;

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            isLogging: false,
            showErrorMsg: false,
            errorMsg: "",
        }
    }

    onFinish = (values) => {
        this.setState({isLogging: true});
        if (values.username === undefined || values.password === undefined || values.username === "" || values.password === "") {
            this.setState({isLogging: false});
            return;
        }

        let frontEndLoginUrl = '/b/api/user/login';
        axios.post(Constants.frontEndBaseUrl + frontEndLoginUrl, values, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                this.setState({isLogging: false});
                message.success('登录成功');
                this.props.navigate(`/`);
            } else {
                this.setState({isLogging: false, showErrorMsg: true, errorMsg: data['error_msg']});
            }
        }).catch((err) => {
            this.setState({isLogging: false, showErrorMsg: true, errorMsg: err.message});
        })
    };

    handleRegister = () => {
        this.props.navigate('/register');
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
                <Header style={Styles.headerStyle}>数据标注平台</Header>
                <Content style={Styles.contentStyle}>
                    <Spin spinning={this.state.isLogging}>
                    <Form
                        ref={this.formRef}
                        initialValues={{
                            role: "publisher",
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
                            <Input
                                prefix={<UserOutlined/>}
                                placeholder="用户名"
                            />
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

                        <Form.Item>
                            <Space size={10}>
                                <Button type="primary" htmlType="submit">
                                    登录
                                </Button>
                                <Button onClick={this.handleRegister}>
                                    注册
                                </Button>
                                <Button onClick={this.resetForm}>
                                    重置
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                    </Spin>
                    <Modal
                        open={this.state.showErrorMsg}
                        title={"登录失败"}
                        onCancel={this.closeErrorMsg}
                        footer={<Button type="primary" onClick={this.closeErrorMsg}>好的</Button>}
                    >
                        {this.state.errorMsg}
                    </Modal>
                </Content>
                <Footer style={Styles.footerStyle}/>
            </Layout>
        )
    }
}

export default WithRouter(LoginPage);