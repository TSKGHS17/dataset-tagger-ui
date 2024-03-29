import React from "react";
import {Button, Space, Input, Modal, Form, Radio, message, List, Avatar, Typography, Popconfirm, Skeleton} from 'antd';
import axios from "axios";
import Constants from "../utils/Constants";
import {WithRouter} from "../router/WithRouter";
import {FileImageTwoTone, FileTextTwoTone, QuestionCircleTwoTone, SoundTwoTone} from "@ant-design/icons";
import Styles from "../utils/Styles";

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
            currentPage: 1,
            currentPagesize: 10,
        }

        let frontEndDatasetUrl = Constants.proxy + Constants.authorized_datasets +
            `?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}`;
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
        let frontEndDatasetUrl = Constants.proxy + Constants.authorized_datasets + `?page_num=${page}&page_size=${pageSize}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    currentShowing: data.data['datasets'],
                    currentPage: page,
                    currentPagesize: pageSize,
                });
            } else {
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

    startCreateDataset = () => {
        this.setState({isCreatingDataset: true});
    }

    cancelCreateDataset = () => {
        this.setState({isCreatingDataset: false});
    }

    confirmCreateDataset = (values) => {
        const sendValues = {
            ...values,
            "tag_type": "num_tag"
        }
        axios.post(Constants.frontEndBaseUrl + Constants.proxy + Constants.dataset, sendValues, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('创建成功');
                if (this.state.currentShowing.length < this.state.currentPagesize) {
                    let newCurrentShowing = this.state.currentShowing;
                    newCurrentShowing.push(data.data);
                    this.setState({
                        currentShowing: newCurrentShowing,
                        total: this.state.total + 1
                    });
                }
                else {
                    let newCurrentShowing = [];
                    newCurrentShowing.push(data.data);
                    this.setState({
                        currentShowing: newCurrentShowing,
                        currentPage: this.state.currentPage + 1,
                        total: this.state.total + 1,
                    });
                }
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
        this.setState({isCreatingDataset: false});
    }

    handleManage = (item) => {
        let datasetId = item['_id'];
        switch (item['sample_type']) {
            case "text":
                this.props.navigate(`/dataset/text-list?uid=${this.state.uid}&did=${datasetId}&relation=${item['relation']}`);
                break;
            case "audio":
                this.props.navigate(`/dataset/audio-list?uid=${this.state.uid}&did=${datasetId}&relation=${item['relation']}`);
                break;
            case "picture":
                this.props.navigate(`/dataset/picture-list?uid=${this.state.uid}&did=${datasetId}&relation=${item['relation']}`);
                break;
            default:
                message.error('错误');
        }
    }

    confirmDeleteDataset = (item) => {
        const targetId = item['_id'];
        axios.delete(Constants.frontEndBaseUrl + Constants.proxy + Constants.dataset + `/${targetId}`,
            Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                if (this.state.currentShowing.length === 1 && this.state.currentPage !== 1) {
                    let frontEndDatasetUrl = Constants.proxy + Constants.authorized_datasets +
                        `?page_num=${this.state.currentPage - 1}&page_size=${this.state.currentPagesize}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                isLoading: false,
                                total: data.data['total'],
                                currentShowing: data.data['datasets'],
                                currentPage: this.state.currentPage - 1,
                            });
                        } else {
                            message.error(data['error_msg']);
                            this.props.navigate('/login');
                        }
                    }).catch((err) => {
                        message.error(err.message);
                        this.props.navigate('/login');
                    });
                }
                else {
                    for (let i = 0; i < this.state.currentShowing.length; ++i) {
                        if (this.state.currentShowing[i]['_id'] === targetId) {
                            let newCurrentShowing = this.state.currentShowing.slice(0, i).concat(this.state.currentShowing.slice(i + 1));
                            this.setState({currentShowing: newCurrentShowing, total: this.state.total - 1});
                        }
                    }
                }
                message.success('删除成功');
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
                axios.put(Constants.frontEndBaseUrl + Constants.proxy + Constants.dataset + `/${item['_id']}`, newCurrentItem, Constants.formHeader).then((res) => {
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
                axios.put(Constants.frontEndBaseUrl + Constants.proxy + Constants.dataset + `/${item['_id']}`,
                    newCurrentItem, Constants.formHeader).then((res) => {
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
                                title={item['relation'] === 'owner' ?
                                    <Paragraph style={Styles.listItemTitle}
                                               editable={{onChange: (newTitle) => {this.editListItemTitle(item, newTitle)}}}>
                                        {item['name']}
                                    </Paragraph>
                                    :
                                    <Paragraph style={Styles.listItemTitle}>
                                        {item['name']}
                                    </Paragraph>}
                                description={item['relation'] === 'owner' ?
                                    <Paragraph style={Styles.listItemDesc}
                                               type={"secondary"}
                                               editable={{onChange: (newDesc) => {this.editListItemDesc(item, newDesc)}}}>
                                        {item['desc']}
                                    </Paragraph>
                                    :
                                    <Paragraph style={Styles.listItemDesc}
                                               type={"secondary"}>
                                        {item['desc']}
                                    </Paragraph>}
                            />
                            <Button type={"primary"} style={Styles.secondButton}
                                    onClick={() => this.handleManage(item)}>管理</Button>
                            <Popconfirm
                                title="删除数据集"
                                description="确认删除该数据集吗？"
                                onConfirm={() => {this.confirmDeleteDataset(item)}}
                                okText="确认"
                                cancelText="取消"
                                disabled={item['relation'] !== 'owner'}
                            >
                                <Button style={Styles.firstButton} danger disabled={item['relation'] !== 'owner'}>删除</Button>
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