import React from "react";
import {WithRouter} from "../router/WithRouter";
import {
    Button,
    List,
    message,
    Modal,
    Progress,
    Skeleton,
    Space,
    Upload,
    Typography,
    Popconfirm,
    Drawer,
    TimePicker, Form, Input, Tag, Col, Row
} from "antd";
import axios from "axios";
import Constants from "../utils/Constants";
import {CheckCircleOutlined, InboxOutlined, SyncOutlined} from "@ant-design/icons";
import ReactPlayer from 'react-player';
import {saveAs} from 'file-saver';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;
const { RangePicker } = TimePicker;

class AudioList extends React.Component {
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

        this.formRef = React.createRef();

        this.draggerProps = {
            name: 'file',
            multiple: true,
            method: 'post',
            action: Constants.frontEndBaseUrl + `/api/sample/upload/${this.state.did}`,
            beforeUpload: (file) => {
                const isMP3 = file.type === "audio/mpeg";
                if (!isMP3) {
                    message.error(`${file.name}不是mp3文件`);
                }
                return isMP3 || Upload.LIST_IGNORE;
            },
            onChange: (info) => {
                const { status, response } = info.file;
                if (status === 'done') {
                    if (response.code !== 200) {
                        message.error(`${response['error_msg']}`);
                        message.error(`${info.file.name} 上传失败。`);
                        return;
                    }

                    if (this.state.currentShowing.length < this.state.currentPagesize) {
                        let newCurrentShowing = this.state.currentShowing;
                        newCurrentShowing.push(response.data);
                        this.setState({
                            currentShowing: newCurrentShowing,
                            total: this.state.total + 1,
                        });
                    }
                    else {
                        let newCurrentShowing = [];
                        newCurrentShowing.push(response.data);
                        this.setState({
                            currentShowing: newCurrentShowing,
                            currentPage: this.state.currentPage + 1,
                            total: this.state.total + 1,
                        })
                    }
                    this.getPercentage();
                    message.success(`${info.file.name} 成功上传。`);
                } else if (status === 'error') {
                    message.error(`${info.file.name} 上传失败。`);
                }
            },
        };
    }

    componentDidMount() {
        let frontEndDatasetUrl =
            `/api/samples?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    total: data.data['total'],
                    tmpCurrentShowing: data.data['samples'],
                }, () => {
                    let frontEndTagsUrl =
                        `/api/tags?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndTagsUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                isLoading: false,
                                currentShowingLabels: data.data.tags,
                                currentShowing: this.state.tmpCurrentShowing,
                            });
                            this.getPercentage();
                        } else {
                            message.error(data['error_msg']);
                            this.props.navigate('/login');
                        }
                    }).catch((err) => {
                        message.error(err.message);
                        this.props.navigate('/login');
                    });
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

    getPercentage = () => {
        axios.get(Constants.frontEndBaseUrl + `/api/dataset/process/${this.state.did}`, Constants.formHeader).then((res) => {
            let {data} = res;
            this.setState({percent: data['data']});
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
        });
    }

    backtoDataset = () => {
        this.props.navigate(`/dataset?uid=${this.state.uid}`);
    }

    startCreateSample = () => {
        this.setState({isCreating: true});
    }

    cancelCreateSample = () => {
        this.setState({isCreating: false});
    }

    onPaginationChange = (page, pageSize) => {
        let frontEndDatasetUrl = `/api/samples?page_num=${page}&page_size=${pageSize}&dataset_id=${this.state.did}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    total: data.data['total'],
                    tmpCurrentShowing: data.data['samples'],
                }, () => {
                    let frontEndTagsUrl = `/api/tags?page_num=${page}&page_size=${pageSize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndTagsUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                isLoading: false,
                                currentPage: page,
                                currentPagesize: pageSize,
                                currentShowingLabels: data.data.tags,
                                currentShowing: this.state.tmpCurrentShowing,
                            });
                        } else {
                            message.error(data['error_msg']);
                            this.props.navigate('/login');
                        }
                    }).catch((err) => {
                        message.error(err.message);
                        this.props.navigate('/login');
                    });
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

    confirmDeleteSample = (item) => {
        const sid = item['_id'];
        axios.delete(Constants.frontEndBaseUrl + `/api/sample/${sid}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                if (this.state.currentShowing.length === 1 && this.state.currentPage !== 1) {
                    let frontEndDatasetUrl =
                        `/api/samples?page_num=${this.state.currentPage - 1}
                        &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                total: data.data['total'],
                                tmpCurrentShowing: data.data['samples'],
                                currentPage: this.state.currentPage - 1,
                            }, () => {
                                let frontEndTagsUrl =
                                    `/api/tags?page_num=${this.state.currentPage}
                                    &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                                axios.get(Constants.frontEndBaseUrl + frontEndTagsUrl, Constants.formHeader).then((res) => {
                                    let {data} = res;
                                    if (data.code === 200) {
                                        this.setState({
                                            isLoading: false,
                                            currentShowingLabels: data.data.tags,
                                            currentShowing: this.state.tmpCurrentShowing,
                                        });
                                    } else {
                                        message.error(data['error_msg']);
                                        this.props.navigate('/login');
                                    }
                                }).catch((err) => {
                                    message.error(err.message);
                                    this.props.navigate('/login');
                                });
                            });
                        } else {
                            message.error(data['error_msg']);
                            this.props.navigate('/login');
                        }
                    }).catch((err) => {
                        message.error(err.message);
                        this.props.navigate('/login');
                    });
                } else {
                    let frontEndDatasetUrl =
                        `/api/samples?page_num=${this.state.currentPage}
                        &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                total: data.data['total'],
                                tmpCurrentShowing: data.data['samples'],
                            }, () => {
                                let frontEndTagsUrl =
                                    `/api/tags?page_num=${this.state.currentPage}
                                    &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                                axios.get(Constants.frontEndBaseUrl + frontEndTagsUrl, Constants.formHeader).then((res) => {
                                    let {data} = res;
                                    if (data.code === 200) {
                                        this.setState({
                                            isLoading: false,
                                            currentShowingLabels: data.data.tags,
                                            currentShowing: this.state.tmpCurrentShowing,
                                        });
                                    } else {
                                        message.error(data['error_msg']);
                                        this.props.navigate('/login');
                                    }
                                }).catch((err) => {
                                    message.error(err.message);
                                    this.props.navigate('/login');
                                });
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
                this.getPercentage();
                message.success('删除成功');
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    startLabelSample = (item) => {
        this.setState({isLabeling: true, currentLabeling: item});
    }

    cancelLabelSample = () => {
        this.setState({isLabeling: false, currentLabeling: undefined});
    }

    confirmLabelSample = (values) => {
        const formattedValues = {
            "sample_id": this.state.currentLabeling['_id'],
            "begin_pos": {
                "time": values['time'][0].format('mm,ss'),
            },
            "end_pos": {
                "time": values['time'][1].format('mm,ss'),
            },
            "tag": {
                "category": values['label'],
            },
        }
        axios.post(Constants.frontEndBaseUrl + '/api/tag', JSON.stringify(formattedValues), Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                let newCurrentShowingLabels = this.state.currentShowingLabels;
                newCurrentShowingLabels.push(data.data);
                this.setState({
                    currentShowingLabels: newCurrentShowingLabels,
                })
                message.success('标记成功');
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    startShowingLabels = (item) => {
        axios.get(Constants.frontEndBaseUrl + `/api/sample/tag/${item['_id']}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                this.setState({isShowingLabels: true, currentSampleLabels: data.data['tags']});
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    cancelShowingLabels = () => {
        this.setState({isShowingLabels: false, currentSampleLabels: []});
    }

    confirmDeleteLabel = (item) => {
        axios.delete(Constants.frontEndBaseUrl + `/api/tag/${item['_id']}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                axios.get(Constants.frontEndBaseUrl + `/api/sample/tag/${item['sample_id']}`, Constants.formHeader).then((res) => {
                    const {data} = res;
                    if (data.code === 200) {
                        this.setState({currentSampleLabels: data.data['tags']});
                    } else {
                        message.error(data['error_msg']);
                    }
                }).catch((err) => {
                    message.error(err.message);
                });
                this.getPercentage();
                message.success("删除成功！");
            } else {
                message.error(data['error_msg']);
                this.props.navigate('/login');
            }
        }).catch((err) => {
            message.error(err.message);
            this.props.navigate('/login');
        });
    }

    handleDownload = (item, index) => {
        axios.get(Constants.frontEndBaseUrl + `/api/sample/tag/${item['_id']}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                const jsonData = JSON.stringify(data.data['tags']);
                const blob = new Blob([jsonData], {type: 'application/json'});

                saveAs(blob, `${this.state.did}.${index + 1}.labels.json`);
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    getListItemTag = (item) => {
        for (let i = 0; i < this.state.currentShowingLabels.length; ++i) {
            if (item['_id'] === this.state.currentShowingLabels[i]['sample_id']) {
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        success
                    </Tag>
                );
            }
        }

        return (
            <Tag icon={<SyncOutlined spin />} color="processing">
                processing
            </Tag>
        );
    }

    render() {
        return (
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Row align={'middle'}>
                    <Col span={8}>
                        <Space direction='horizontal' size='middle'>
                            <Button type="primary" onClick={this.startCreateSample} disabled={this.state.relation === 'tagger'}>创建样本</Button>
                            <Button onClick={this.backtoDataset}>返回</Button>
                        </Space>
                    </Col>
                    <Col span={8} offset={7}>
                        <Text>当前标记进度：</Text>
                        <Progress percent={(100 * this.state.percent).toFixed(2)} status="active"
                                  strokeColor={{
                                      '0%': '#108ee9',
                                      '100%': '#87d068',
                                  }}/>
                    </Col>
                </Row>
                <Skeleton active loading={this.state.isLoading}>
                    <List
                        bordered
                        pagination={{
                            total: this.state.total,
                            defaultPageSize: 10,
                            showSizeChanger: true,
                            onChange: this.onPaginationChange
                        }}
                        dataSource={this.state.currentShowing}
                        renderItem={(item, index) => (
                            <List.Item>
                                <Space direction={"vertical"}>
                                    <Space direction={"horizontal"} size={"middle"} align={"baseline"}>
                                        <h2># {(this.state.currentPage - 1) * this.state.currentPagesize + index + 1}
                                            {' ' + item['nginx_url'].split('/').pop()}</h2>
                                        {this.getListItemTag(item)}
                                    </Space>
                                    <Space direction={"horizontal"} size={"middle"}>
                                        <ReactPlayer url={Constants.frontEndAddr + item['nginx_url']} controls height={"50px"} width={"800px"}/>
                                        <Button type={"primary"} onClick={() => this.startLabelSample(item)}>标记</Button>
                                        <Popconfirm
                                            title="删除样本"
                                            description="确认删除该样本吗？"
                                            onConfirm={() => {
                                                this.confirmDeleteSample(item)
                                            }}
                                            okText="确认"
                                            cancelText="取消"
                                            disabled={this.state.relation === 'tagger'}
                                        >
                                            <Button danger disabled={this.state.relation === 'tagger'}>删除</Button>
                                        </Popconfirm>
                                        <Button onClick={() => this.startShowingLabels(item)}>查看标签</Button>
                                        <Button onClick={() => this.handleDownload(item, index)}>下载</Button>
                                    </Space>
                                </Space>
                            </List.Item>
                        )}
                    />
                </Skeleton>
                <Modal
                    open={this.state.isCreating}
                    title={"创建新样本"}
                    onCancel={this.cancelCreateSample}
                    footer={null}
                    destroyOnClose={true}
                >
                    <Dragger {...this.draggerProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                        <p className="ant-upload-hint">
                            支持单一或批量上传
                        </p>
                    </Dragger>
                </Modal>
                <Drawer
                    placement="right"
                    open={this.state.isLabeling}
                    title={"标记样本"}
                    onClose={this.cancelLabelSample}
                    extra={<Space direction="horizontal" size="middle">
                        <Button type="primary" onClick={this.cancelLabelSample}>完成</Button>
                        <Button onClick={this.cancelLabelSample}>取消</Button>
                    </Space>}
                    destroyOnClose={true}
                >
                    <Form ref={this.formRef} onFinish={this.confirmLabelSample}>
                        <Form.Item
                            name="time"
                            label="起止时间"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入起止时间！',
                                },
                            ]}>
                            <RangePicker
                                allowClear
                                format='mm:ss'
                            />
                        </Form.Item>
                        <Form.Item
                            name="label"
                            label="标记"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入标记！',
                                },
                            ]}>
                            <Input placeholder="请输入标记"/>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">标记</Button>
                        </Form.Item>
                    </Form>
                </Drawer>
                <Drawer
                    placement="right"
                    open={this.state.isShowingLabels}
                    title={"当前样本标记列表"}
                    onClose={this.cancelShowingLabels}
                    extra={<Button type="primary" onClick={this.cancelShowingLabels}>好的</Button>}
                    destroyOnClose={true}>
                        <List
                            bordered
                            dataSource={this.state.currentSampleLabels}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <Typography>
                                        <h4># {index + 1}</h4>
                                        <Paragraph>{"标记：" + item['tag']['category']}</Paragraph>
                                        <Paragraph>{"起始时间：" + item['begin_pos']['time'].replace(',', ':')}</Paragraph>
                                        <Paragraph>{"终止时间：" + item['end_pos']['time'].replace(',', ':')}</Paragraph>
                                        <Paragraph>{"标记者：" + item['tagger_name']}</Paragraph>
                                        <Paragraph>{"标记时间：" + item['tag_time'].slice(0, item['tag_time'].length - 2)}</Paragraph>
                                        <Button danger
                                                disabled={(this.state.relation === 'tagger') && (this.state.uid !== item['tagger_id'])}
                                                onClick={() => this.confirmDeleteLabel(item)}
                                        >删除</Button>
                                    </Typography>
                                </List.Item>
                            )}
                        />
                </Drawer>
            </Space>
        );
    }
}

export default WithRouter(AudioList);