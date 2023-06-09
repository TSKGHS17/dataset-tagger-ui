import React from "react";
import {Button, Space, Input, Modal, Form, Radio, message, List, Avatar, Typography, Progress, Popconfirm, Skeleton} from 'antd';
import axios from "axios";
import Constants from "../utils/Constants";
import {WithRouter} from "../router/WithRouter";
import {FileImageTwoTone, FileTextTwoTone, QuestionCircleTwoTone, SoundTwoTone} from "@ant-design/icons";
import Styles from "../utils/Styles";

const {Search} = Input;
const {Paragraph} = Typography;

class Dataset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            total: 0,
            uid: this.props.searchParams.get('uid'),
            currentShowing: [],
            isCreatingDataset: false,
        }

        let frontEndDatasetUrl = `/b/api/datasets?page_num=1&page_size=10&publisher_id=${this.state.uid}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    isLoading: false,
                    total: data.data['total'],
                    currentShowing: data.data['datasets'],
                });
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
        });
    }

    onPaginationChange = (page, pageSize) => {
        let frontEndDatasetUrl = `/b/api/datasets?page_num=${page}&page_size=${pageSize}&publisher_id=${this.state.uid}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    currentShowing: data.data['datasets'],
                });
            } else {
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

    onSearch = (value) => {
        //TODO
    }

    startCreateDataset = () => {
        this.setState({isCreatingDataset: true});
    }

    cancelCreateDataset = () => {
        this.setState({isCreatingDataset: false});
    }

    confirmCreateDataset = (values) => {
        axios.post(Constants.frontEndBaseUrl + '/b/api/dataset', values, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('创建成功');
                let newCurrentShowing = this.state.currentShowing;
                newCurrentShowing.push(data.data);
                this.setState({currentShowing: newCurrentShowing});
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    handleManage = (item) => {
        let datasetId = item['_id'];
        switch (item['sample_type']) {
            case "text":
                this.props.navigate(`/dataset/text-list?uid=${this.state.uid}&did=${datasetId}`);
                break;
            case "audio":
                this.props.navigate(`/dataset/audio-list?uid=${this.state.uid}&did=${datasetId}`);
                break;
            case "picture":
                this.props.navigate(`/dataset/picture-list?uid=${this.state.uid}&did=${datasetId}`);
                break;
            default:
                message.error('错误');
        }
    }

    confirmDeleteDataset = (item) => {
        const targetId = item['_id'];
        axios.delete(Constants.frontEndBaseUrl + `/b/api/dataset/${targetId}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('删除成功');
                for (let i = 0; i < this.state.currentShowing.length; ++i) {
                    if (this.state.currentShowing[i]['_id'] === targetId) {
                        let newCurrentShowing = this.state.currentShowing.slice(0, i).concat(this.state.currentShowing.slice(i + 1));
                        this.setState({currentShowing: newCurrentShowing});
                    }
                }
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
        this.setState({isDeletingDataset: false});
    }

    editListItemTitle = (item, newTitle) => {
        for (let i = 0; i < this.state.currentShowing.length; ++i) {
            if (this.state.currentShowing[i]['_id'] === item['_id']) {
                let newCurrentItem = this.state.currentShowing[i];
                newCurrentItem['name'] = newTitle;
                let newCurrentShowing = this.state.currentShowing;
                newCurrentShowing[i] = newCurrentItem;
                axios.put(Constants.frontEndBaseUrl + `/b/api/dataset/${item['_id']}`, newCurrentItem, Constants.formHeader).then((res) => {
                    const {data} = res;
                    if (data.code === 200) {
                        this.setState({currentShowing: newCurrentShowing});
                        message.success('修改成功');
                    } else {
                        message.error(data['error_msg']);
                    }
                }).catch((err) => {
                    message.error(err.message);
                });
            }
        }
    }

    editListItemDesc = (item, newDesc) => {
        for (let i = 0; i < this.state.currentShowing.length; ++i) {
            if (this.state.currentShowing[i]['_id'] === item['_id']) {
                let newCurrentItem = this.state.currentShowing[i];
                newCurrentItem['desc'] = newDesc;
                let newCurrentShowing = this.state.currentShowing;
                newCurrentShowing[i] = newCurrentItem;
                axios.put(Constants.frontEndBaseUrl + `/b/api/dataset/${item['_id']}`, newCurrentItem, Constants.formHeader).then((res) => {
                    const {data} = res;
                    if (data.code === 200) {
                        this.setState({currentShowing: newCurrentShowing});
                        message.success('修改成功');
                    } else {
                        message.error(data['error_msg']);
                    }
                }).catch((err) => {
                    message.error(err.message);
                });
            }
        }
    }

    render() {
        return (
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Space direction="horizontal" size="middle">
                    <Button type="primary" onClick={this.startCreateDataset}>创建</Button>
                    <Search placeholder="输入数据集名称" onSearch={this.onSearch} enterButton/>
                </Space>
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
                                title={<Paragraph style={Styles.listItemTitle}
                                                  editable={{onChange: (newTitle) => {this.editListItemTitle(item, newTitle)}}}>
                                        {item['name']}
                                    </Paragraph>}
                                description={<Paragraph style={Styles.listItemDesc}
                                                        type={"secondary"}
                                                        editable={{onChange: (newDesc) => {this.editListItemDesc(item, newDesc)}}}>
                                        {item['desc']}
                                    </Paragraph>}
                            />
                            <Progress percent={30} size={[500, 5]} style={Styles.progress}/>
                            <Button type={"primary"} style={Styles.secondButton}
                                    onClick={() => this.handleManage(item)}>管理</Button>
                            <Popconfirm
                                title="删除数据集"
                                description="确认删除该数据集吗？"
                                onConfirm={() => {this.confirmDeleteDataset(item)}}
                                okText="确认"
                                cancelText="取消"
                            >
                                <Button style={Styles.firstButton} danger>删除</Button>
                            </Popconfirm>
                        </List.Item>
                    )}
                />
                </Skeleton>
                <Modal
                    open={this.state.isCreatingDataset}
                    title={'创建新数据集'}
                    onCancel={this.cancelCreateDataset}
                    footer={null}
                    destroyOnClose={true}
                >
                    <Form
                        onFinish={this.confirmCreateDataset}
                    >
                        <Form.Item
                            name="name"
                            label="标题"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入数据集标题!',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            name="desc"
                            label="描述"
                            rules={[
                                {
                                    required: true,
                                    message: '请描述数据集！',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            name="sample_type"
                            label="样本类型"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择样本类型！',
                                },
                            ]}
                        >
                            <Radio.Group itialValues={'text'}>
                                <Radio value={'text'}>文本</Radio>
                                <Radio value={'picture'}>图片</Radio>
                                <Radio value={'audio'}>音频</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="tag_type"
                            label="标记类型"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择标记类型！',
                                },
                            ]}
                        >
                            <Radio.Group itialValues={'num_tag'}>
                                <Radio value={'num_tag'}>数值标签</Radio>
                                <Radio value={'class_tag'}>分类标签</Radio>
                                <Radio value={'text_tag'}>文本标签</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button type="primary" htmlType={"submit"}>确定</Button>
                                <Button onClick={this.cancelCreateDataset}>取消</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </Space>
        );
    }
}

export default WithRouter(Dataset);