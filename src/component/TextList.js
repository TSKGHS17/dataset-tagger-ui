import React from "react";
import {WithRouter} from "../router/WithRouter";
import {
    Button,
    List,
    message,
    Modal,
    Skeleton,
    Space,
    Typography,
    Input,
    Popconfirm,
    Drawer,
    Popover,
    Progress
} from "antd";
import axios from "axios";
import Constants from "../utils/Constants";
import Styles from "../utils/Styles";
import MarkableText from "./MarkableText";
import "./List.css";
import {saveAs} from 'file-saver';

const {Paragraph, Text} = Typography;
const {TextArea} = Input;

class TextList extends React.Component {
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
            currentLabeling: undefined,
            percent: 0,
            relation: this.props.searchParams.get('relation'),
        }

        this.textAreaRef = React.createRef();
    }

    componentDidMount() {
        let frontEndDatasetUrl =
            `/b/api/samples?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    total: data.data['total'],
                    tmpCurrentShowing: data.data['samples'],
                }, () => {
                    let frontEndTagsUrl =
                        `/b/api/tags?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
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
        axios.get(Constants.frontEndBaseUrl + `/b/api/dataset/process/${this.state.did}`, Constants.formHeader).then((res) => {
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

    confirmCreateSample = () => {
        const value = {
            dataset_id: this.state.did,
            content: this.textAreaRef.current.resizableTextArea['textArea']['value'],
        };
        axios.post(Constants.frontEndBaseUrl + '/b/api/sample', JSON.stringify(value), Constants.formHeader).then(res => {
            const {data} = res;
            if (data.code === 200) {
                if (this.state.currentShowing.length < this.state.currentPagesize) {
                    let newCurrentShowing = this.state.currentShowing;
                    newCurrentShowing.push(data.data);
                    this.setState({
                        currentShowing: newCurrentShowing,
                        total: this.state.total + 1,
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
                this.getPercentage();
                message.success('创建成功');
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
        this.setState({isCreating: false});
    }

    onPaginationChange = (page, pageSize) => {
        let frontEndDatasetUrl = `/b/api/samples?page_num=${page}&page_size=${pageSize}&dataset_id=${this.state.did}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    total: data.data['total'],
                    tmpCurrentShowing: data.data['samples'],
                }, () => {
                    let frontEndTagsUrl = `/b/api/tags?page_num=${page}&page_size=${pageSize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndTagsUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                isLoading: false,
                                currentShowingLabels: data.data.tags,
                                currentShowing: this.state.tmpCurrentShowing,
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

    renderParagraph = (item, index) => {
        const sid = item['_id'], texts = item['content'];
        let labels = [];
        for (let i = 0; i < this.state.currentShowingLabels.length; ++i) {
            if (sid === this.state.currentShowingLabels[i]['sample_id']) {
                labels.push(this.state.currentShowingLabels[i]);
            }
        }

        const sampleIndex = (this.state.currentPage - 1) * this.state.currentPagesize + index + 1;
        return (
            <Typography>
                <Space direction="vertical" size="middle">
                    <h3># {sampleIndex}</h3>
                    <div>
                        {this.renderMarkedParagraph(texts, labels)}
                    </div>
                    <Space direction="horizontal" size="middle">
                        <Button type="primary" onClick={() => this.startLabelSample(item)}>标记</Button>
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
                        <Button onClick={() => this.handleDownload(texts, labels, sampleIndex)}>下载</Button>
                    </Space>
                </Space>
            </Typography>
        );
    }

    renderMarkedParagraph = (texts, labels) => {
        let startIndex = 0;
        const paragraphs = [];
        labels.sort((a, b) => a['begin_pos']['bchar'] - b['begin_pos']['bchar']);
        for (let i = 0; i < labels.length; ++i) {
            let markStartIndex = parseInt(labels[i]['begin_pos']['bchar']),
                markEndIndex = parseInt(labels[i]['end_pos']['bchar']);
            if (startIndex < markStartIndex) {
                paragraphs.push(this.renderNormalText(texts, startIndex, markStartIndex));
            }

            if (markStartIndex < markEndIndex) {
                paragraphs.push(this.renderMarkedText(texts, markStartIndex, markEndIndex, labels[i]));
            }

            startIndex = markEndIndex;
        }

        if (startIndex < texts.length) {
            paragraphs.push(this.renderNormalText(texts, startIndex, texts.length));
        }

        return paragraphs;
    }

    renderNormalText = (texts, startIndex, endIndex) => {
        return (
            <Text style={Styles.textParagraph}>{texts.slice(startIndex, endIndex)}</Text>
        );
    }

    renderMarkedText = (texts, startIndex, endIndex, label) => {
        const content = (
            <Typography>
                <Paragraph>{"标记：" + label['tag']['category']}</Paragraph>
                <Paragraph>{"标记者：" + label['tagger_name']}</Paragraph>
                <Paragraph>{"标记时间：" + label['tag_time'].slice(0, label['tag_time'].length - 2)}</Paragraph>
                <Button danger
                        disabled={(this.state.relation === 'tagger') && (this.state.uid !== label['tagger_id'])}
                        onClick={() => this.confirmDeleteLabel(label)}>删除</Button>
            </Typography>
        );

        return (
            <Popover content={content} title="标签">
                <Text mark style={Styles.textParagraph}
                      className={"markedText"}>{texts.slice(startIndex, endIndex)}</Text>
            </Popover>
        );
    }

    confirmDeleteLabel = (label) => {
        const tid = label['_id'];
        axios.delete(Constants.frontEndBaseUrl + `/b/api/tag/${tid}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                this.renewLabels();
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

    confirmDeleteSample = (item) => {
        const sid = item['_id'];
        axios.delete(Constants.frontEndBaseUrl + `/b/api/sample/${sid}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                if (this.state.currentShowing.length === 1 && this.state.currentPage !== 1) {
                    let frontEndDatasetUrl =
                        `/b/api/samples?page_num=${this.state.currentPage - 1}
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
                                    `/b/api/tags?page_num=${this.state.currentPage}
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
                        `/b/api/samples?page_num=${this.state.currentPage}
                        &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                total: data.data['total'],
                                tmpCurrentShowing: data.data['samples'],
                            }, () => {
                                let frontEndTagsUrl =
                                    `/b/api/tags?page_num=${this.state.currentPage}
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

    confirmLabelSample = () => {
        this.renewLabels();
        this.setState({isLabeling: false, currentLabeling: undefined});
    }

    renewLabels = () => {
        let frontEndTagsUrl =
            `/b/api/tags?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
        axios.get(Constants.frontEndBaseUrl + frontEndTagsUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    currentShowingLabels: data.data.tags,
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
    }

    handleDownload = (texts, labels, sampleIndex) => {
        const jsonData = JSON.stringify(labels);

        const blob = new Blob([jsonData], {type: 'application/json'});
        const textsBlob = new Blob([texts], {type: 'text/plain;charset=utf-8'});

        saveAs(blob, `${this.state.did}.${sampleIndex}.labels.json`);
        saveAs(textsBlob, `${this.state.did}.${sampleIndex}.text.txt`);
    }

    render() {
        return (
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Space direction="horizontal" size={550} align="baseline">
                    <Space direction="horizontal" size="middle" align="baseline">
                        <Button type="primary" onClick={this.startCreateSample} disabled={this.state.relation === 'tagger'}>创建样本</Button>
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
                <Skeleton active loading={this.state.isLoading}>
                    <List
                        bordered
                        pagination={{
                            total: this.state.total,
                            defaultCurrent: 1,
                            defaultPageSize: 10,
                            showSizeChanger: true,
                            onChange: this.onPaginationChange
                        }}
                        dataSource={this.state.currentShowing}
                        renderItem={(item, index) => (
                            <List.Item>
                                {this.renderParagraph(item, index)}
                            </List.Item>
                        )}
                    />
                </Skeleton>
                <Modal
                    open={this.state.isCreating}
                    title={"创建新样本"}
                    onCancel={this.cancelCreateSample}
                    footer={<Space direction="horizontal" size="middle">
                        <Button type="primary" onClick={this.confirmCreateSample}>确认</Button>
                        <Button onClick={this.cancelCreateSample}>取消</Button>
                    </Space>}
                    destroyOnClose={true}
                >
                    <TextArea allowClear autoSize ref={this.textAreaRef}/>
                </Modal>
                <Drawer
                    placement="right"
                    open={this.state.isLabeling}
                    title={"标记样本"}
                    onClose={this.cancelLabelSample}
                    extra={<Space direction="horizontal" size="middle">
                        <Button type="primary" onClick={this.confirmLabelSample}>完成</Button>
                        <Button onClick={this.cancelLabelSample}>取消</Button>
                    </Space>}
                    destroyOnClose={true}
                >
                    <MarkableText item={this.state.currentLabeling} allLabels={this.state.currentShowingLabels}/>
                </Drawer>
            </Space>
        );
    }
}

export default WithRouter(TextList);