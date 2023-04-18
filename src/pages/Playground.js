import React from 'react';
import {Avatar, Button, List, message, Pagination, Progress, Tooltip} from "antd";
import axios from "axios";
import Constants from "../utils/Constants";
import {
    FileImageTwoTone,
    FileTextTwoTone,
    QuestionCircleTwoTone,
    SoundTwoTone
} from "@ant-design/icons";
import {WithRouter} from "../router/WithRouter";
import "./Playground.css";

class Playground extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentShowing: [],
        }
    }

    //TODO: 分页
    componentDidMount() {
        let frontEndDatasetUrl = '/b/api/datasets?page_num=1&page_size=10';
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            this.setState({currentShowing: data.data["pageContent"]});
        }).catch((err) => {
            message.error('未登录');
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

    handleEdit = (item) => {
        // TODO switch ()
    }

    //TODO: 进度条正确显示

    render() {
        return (
            <>
                <List
                    pagination={<Pagination/>}
                    dataSource={this.state.currentShowing}
                    renderItem={(item, index) => (
                        <List.Item className={"listItem"}>
                            <List.Item.Meta
                                avatar={<Avatar icon={this.getIcon(item)} size="large" className={'listItemAvatar'}/>}
                                title={<span className={'listItemTitle'}>
                                    {<Tooltip title={'创建者: ' + item['publisher_name']}>
                                        <span>{item['desc']}</span>
                                    </Tooltip>}
                                </span>}
                                description={<span className={'listItemDesc'}>{item['desc']}</span>}
                            />
                            <Progress percent={30} size={[500, 5]} className={"progress"}/>
                            <Button type={"primary"} className={"editButton"}
                                    onClick={this.handleEdit(item)}>编辑</Button>
                        </List.Item>
                    )}
                />
            </>
        );
    }
}

export default WithRouter(Playground);