import React from 'react';
import {Avatar, Button, List, message, Progress, Skeleton, Tooltip} from "antd";
import axios from "axios";
import Constants from "../utils/Constants";
import {
    FileImageTwoTone,
    FileTextTwoTone,
    QuestionCircleTwoTone,
    SoundTwoTone
} from "@ant-design/icons";
import {WithRouter} from "../router/WithRouter";
import Styles from "../utils/Styles";

class Playground extends React.Component {
    constructor(props) {
        super(props);
        this.pagination = React.createRef();
        this.state = {
            isLoading: true,
            total: 0,
            currentShowing: [],
        }

        let frontEndDatasetUrl = `/b/api/datasets?page_num=1&page_size=10`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    isLoading: false,
                    total: data.data['total'],
                    currentShowing: data.data['datasets'],
                });
            }
            else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
        });
    }

    onPaginationChange = (page, pageSize) => {
        let frontEndDatasetUrl = `/b/api/datasets?page_num=${page}&page_size=${pageSize}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    currentShowing: data.data['datasets'],
                });
            }
            else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
        });
    }

    getIcon = (item) => {
        switch (item['sample_type']) {
            case "text":
                return <FileTextTwoTone/>;
            case "audio":
                return <SoundTwoTone/>;
            case "picture":
                return <FileImageTwoTone/>;
            default:
                return <QuestionCircleTwoTone/>;
        }
    }

    handleJoinButton = (item) => {
        // TODO 发送参与的信息
    }

    //TODO: 进度条正确显示

    render() {
        return (
            <>
                <Skeleton active loading={this.state.isLoading}>
                <List
                    pagination={{
                        total: this.state.total,
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        onChange: this.onPaginationChange
                    }}
                    dataSource={this.state.currentShowing}
                    renderItem={(item) => (
                        <List.Item style={Styles.listItem}>
                            <List.Item.Meta
                                avatar={<Avatar icon={this.getIcon(item)} size="large" style={Styles.listItemAvatar}/>}
                                title={<span style={Styles.listItemTitleWithPointer}>
                                    {<Tooltip title={'创建者: ' + item['publisher_name']}>
                                        <span>{item['name']}</span>
                                    </Tooltip>}
                                </span>}
                                description={<span style={Styles.listItemDesc}>{item['desc']}</span>}
                            />
                            <Progress percent={30} size={[500, 5]} style={Styles.progress}/>
                            <Button type={"primary"} style={Styles.firstButton}
                                    onClick={this.handleJoinButton(item)}>参与标注</Button>
                        </List.Item>
                    )}
                />
                </Skeleton>
            </>
        );
    }
}

export default WithRouter(Playground);