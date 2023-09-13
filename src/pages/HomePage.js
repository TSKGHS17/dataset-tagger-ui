import React from 'react';
import axios from "axios";
import Constants from "../utils/Constants";
import {Col, message, Row, Skeleton, Typography} from "antd";
import Styles from "../utils/Styles";
import {WithRouter} from "../router/WithRouter";

const {Title} = Typography;

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            isLoading: true,
        }
    }

    componentDidMount() {
        axios.get(Constants.frontEndBaseUrl + Constants.proxy + Constants.info, Constants.formHeader).then((res) => {
            if (res.data.code === 200) {
                this.setState({username: res.data.data['username'], isLoading: false});
            } else {
                message.error(res.data['error_msg']);
                this.props.navigate('/login');
            }
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
        });
    }

    render() {
        return (
            <div className="parent-container-center">
                <Skeleton active loading={this.state.isLoading}>
                    <Title>{`欢迎，${this.state.username}`}</Title>
                </Skeleton>
            </div>
        );
    }
}

export default WithRouter(HomePage);