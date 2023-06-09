import React from "react";
import {WithRouter} from "../router/WithRouter";
import {Button, Space} from "antd";

class AudioList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            uid: this.props.searchParams.get('uid'),
            did: this.props.searchParams.get('did'),
        }
    }
    backtoDataset = () => {
        this.props.navigate(`/dataset?uid=${this.state.uid}`);
    }
    render() {
        return (
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Button type="primary" onClick={this.backtoDataset}>返回</Button>
                <h1>audio</h1>
            </Space>
        );
    }
}

export default WithRouter(AudioList);