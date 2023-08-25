import React from 'react';
import {Avatar, Button, List, message, Skeleton, Tooltip} from "antd";
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
            currentPage: 1,
            currentPagesize: 10,
        }

        let frontEndDatasetUrl = Constants.proxy + Constants.datasets +
            `?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}`;
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
        let frontEndDatasetUrl = Constants.proxy + Constants.datasets +
            `?page_num=${page}&page_size=${pageSize}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    currentShowing: data.data['datasets'],
                    currentPage: page,
                    currentPagesize: pageSize,
                });
            }
            else {
                message.error(data['error_msg']);
                this.props.navigate('/login');
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
        const data = undefined;
        axios.post(Constants.frontEndBaseUrl + Constants.proxy + Constants.auth + `/${item['_id']}`, JSON.stringify(data), Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                for (let i = 0; i < this.state.currentShowing.length; ++i) {
                    if (this.state.currentShowing[i]['_id'] === item['_id']) {
                        let newCurrentShowing = this.state.currentShowing;
                        newCurrentShowing[i]['relation'] = 'owner';
                        this.setState({currentShowing: newCurrentShowing});
                    }
                }
                message.success('加入成功！');
            } else {
                message.error(data['error_msg']);
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
                            <Button type={"primary"} style={Styles.firstButton}
                                    onClick={() => this.handleJoinButton(item)} disabled={item['relation'] != null}>参与标注</Button>
                        </List.Item>
                    )}
                />
                </Skeleton>
            </>
        );
    }
}

export default WithRouter(Playground);