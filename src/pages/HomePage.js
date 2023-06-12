import React from 'react';
import axios from "axios";
import Constants from "../utils/Constants";
import {message, Skeleton, Typography} from "antd";
import Styles from "../utils/Styles";

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
        let frontEndInfoUrl = '/b/api/user/info';
        axios.get(Constants.frontEndBaseUrl + frontEndInfoUrl, Constants.formHeader).then((res) => {
            if (res.data.code === 200) {
                this.setState({username: res.data.data['username'], isLoading: false});
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

    render() {
        return (
            <>
                <Skeleton active loading={this.state.isLoading}>
                    <Title style={Styles.contentStyle}>{`欢迎，${this.state.username}`}</Title>
                </Skeleton>
            </>
        );
    }
}

export default HomePage;