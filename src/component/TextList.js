import React from "react";
import {WithRouter} from "../router/WithRouter";
import {Button, List, message, Modal, Skeleton, Space, Typography, Input, Popconfirm, Drawer, Popover} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import axios from "axios";
import Constants from "../utils/Constants";
import Styles from "../utils/Styles";
import MarkableText from "./MarkableText";
import "./TextList.css";

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

    renderParagraph = (item) => {
        const sid = item['_id'], texts = item['content'];
        let labels = [];
        for (let i = 0; i < this.state.currentShowingLabels.length; ++i) {
            if (sid === this.state.currentShowingLabels[i]['sample_id']) {
                labels.push(this.state.currentShowingLabels[i]);
            }
        }

        return (
            <Typography>
                <Space direction="vertical" size="middle">
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
                        >
                            <Button danger>删除</Button>
                        </Popconfirm>
                    </Space>
                    <div>
                        {this.renderMarkedParagraph(texts, labels)}
                    </div>
                </Space>
            </Typography>
        );
    }

    renderMarkedParagraph = (texts, labels) => {
        let startIndex = 0;
        const paragraphs = [];
        labels.sort((a, b) => a['begin_pos']['bchar'] - b['begin_pos']['bchar']);
        for (let i = 0; i < labels.length; ++i) {
            let markStartIndex = parseInt(labels[i]['begin_pos']['bchar']), markEndIndex = parseInt(labels[i]['end_pos']['bchar']);
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
                <Button danger onClick={() => this.confirmDeleteLabel(label)}>删除</Button>
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
               message.success("删除成功！");
               this.renewLabels();
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
                message.success('删除成功');
                for (let i = 0; i < this.state.currentShowing.length; ++i) {
                    if (this.state.currentShowing[i]['_id'] === sid) {
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
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Space direction="horizontal" size="middle">
                    <Button type="primary" shape="round" icon={<PlusOutlined/>} onClick={this.startCreateSample}/>
                    <Button onClick={this.backtoDataset}>返回</Button>
                </Space>
                <List
                    loading={this.state.isLoading}
                    bordered
                    pagination={{
                        total: this.state.total,
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        onChange: this.onPaginationChange
                    }}
                    dataSource={this.state.currentShowing}
                    renderItem={(item) => (
                        <List.Item>
                            {this.renderParagraph(item)}
                        </List.Item>
                    )}
                />
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