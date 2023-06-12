import React from "react";
import {WithRouter} from "../router/WithRouter";
import {Button, Progress, Space, Typography} from "antd";

const {Text} = Typography;

class PictureList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            total: 0,
            currentPage: 1,
            currentPagesize: 10,
            uid: this.props.searchParams.get('uid'),
            did: this.props.searchParams.get('did'),
            tmpCurrentShowing: [],
            currentShowing: [],
            currentShowingLabels: [],
            isCreating: false,
            isLabeling: false,
            isShowingLabels: false,
            currentLabeling: undefined,
            currentSampleLabels: [],
            percent: 0,
            relation: this.props.searchParams.get('relation'),
        }
    }

    startCreateSample = () => {
        this.setState({isCreating: true});
    }

    backtoDataset = () => {
        this.props.navigate(`/dataset?uid=${this.state.uid}`);
    }

    render() {
        return (
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Space direction="horizontal" size={550} align="baseline">
                    <Space direction="horizontal" size="middle" align="baseline">
                        <Button type="primary" onClick={this.startCreateSample}>创建样本</Button>
                        <Button onClick={this.backtoDataset}>返回</Button>
                    </Space>
                    <Space direction="horizontal" size="middle" align="baseline">
                        <Text>当前标记进度：</Text>
                        <Progress percent={(100 * this.state.percent).toFixed(2)} size={[500, 5]} status="active" strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}/>
                    </Space>
                </Space>
            </Space>
        );
    }
}

export default WithRouter(PictureList);