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
    Typography,
    Upload,
    Image,
    Popconfirm, Drawer
} from "antd";
import axios from "axios";
import Constants from "../utils/Constants";
import {InboxOutlined} from "@ant-design/icons";
import {saveAs} from 'file-saver';
import Canvas from "./Canvas";

const {Text, Paragraph} = Typography;
const {Dragger} = Upload;

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
            currentCheckingLabels: undefined,
            currentSampleLabels: [],
            percent: 0,
            relation: this.props.searchParams.get('relation'),
            drawerFinishButton: true,
            drawerLabelPos: [],
        }

        this.draggerProps = {
            name: 'file',
            multiple: true,
            method: 'post',
            action: Constants.base + `/api/sample/upload/${this.state.did}`,
            beforeUpload: (file) => {
                const isJPG = file.type === "image/jpeg";
                const isPNG = file.type === "image/png";
                if (!isJPG && !isPNG) {
                    message.error(`${file.name}不是jpg/png文件`);
                }
                return isJPG || isPNG || Upload.LIST_IGNORE;
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

    startCreateSample = () => {
        this.setState({isCreating: true});
    }

    cancelCreateSample = () => {
        this.setState({isCreating: false});
    }

    componentDidMount() {
        let frontEndDatasetUrl =
            `/api/samples?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
        axios.get(Constants.base + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    total: data.data['total'],
                    tmpCurrentShowing: data.data['samples'],
                }, () => {
                    let frontEndTagsUrl =
                        `/api/tags?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.base + frontEndTagsUrl, Constants.formHeader).then((res) => {
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
        axios.get(Constants.base + `/api/dataset/process/${this.state.did}`, Constants.formHeader).then((res) => {
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

    onPaginationChange = (page, pageSize) => {
        let frontEndDatasetUrl = `/api/samples?page_num=${page}&page_size=${pageSize}&dataset_id=${this.state.did}`;
        axios.get(Constants.base + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    total: data.data['total'],
                    tmpCurrentShowing: data.data['samples'],
                }, () => {
                    let frontEndTagsUrl = `/api/tags?page_num=${page}&page_size=${pageSize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.base + frontEndTagsUrl, Constants.formHeader).then((res) => {
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
        axios.delete(Constants.base + `/api/sample/${sid}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                if (this.state.currentShowing.length === 1 && this.state.currentPage !== 1) {
                    let frontEndDatasetUrl =
                        `/api/samples?page_num=${this.state.currentPage - 1}
                        &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.base + frontEndDatasetUrl, Constants.formHeader).then((res) => {
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
                                axios.get(Constants.base + frontEndTagsUrl, Constants.formHeader).then((res) => {
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
                    axios.get(Constants.base + frontEndDatasetUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                total: data.data['total'],
                                tmpCurrentShowing: data.data['samples'],
                            }, () => {
                                let frontEndTagsUrl =
                                    `/api/tags?page_num=${this.state.currentPage}
                                    &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                                axios.get(Constants.base + frontEndTagsUrl, Constants.formHeader).then((res) => {
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

    handleDownload = (item, index) => {
        axios.get(Constants.base + `/api/sample/tag/${item['_id']}`, Constants.formHeader).then((res) => {
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

    startLabelSample = (item) => {
        this.setState({isLabeling: true, currentLabeling: item});
    }

    cancelLabelSample = () => {
        this.setState({isLabeling: false, currentLabeling: undefined, drawerFinishButton: true});
    }

    confirmLabelSample = () => {
        const formattedValues = {
            "sample_id": this.state.currentLabeling['_id'],
            "begin_pos": {
                "location": `${this.state.drawerLabelPos[0]},${this.state.drawerLabelPos[1]}`,
            },
            "end_pos": {
                "location": `${this.state.drawerLabelPos[2]},${this.state.drawerLabelPos[3]}`,
            },
            "tag": {
                "category": this.state.drawerLabelPos[4],
            },
        }
        axios.post(Constants.base + '/api/tag', JSON.stringify(formattedValues), Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('标记成功');
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
        this.setState({isLabeling: false, currentLabeling: undefined, drawerFinishButton: true});
    }

    getCanvasSrc = () => {
        if (this.state.currentLabeling !== undefined) {
            return Constants.frontEndAddr + this.state.currentLabeling['nginx_url'];
        }
        else {
            return undefined;
        }
    }

    getCanvasSid = () => {
        if (this.state.currentLabeling !== undefined) {
            return this.state.currentLabeling['_id'];
        }
        else {
            return undefined;
        }
    }

    getReadOnlyCanvasSrc = () => {
        if (this.state.currentCheckingLabels !== undefined) {
            return Constants.frontEndAddr + this.state.currentCheckingLabels['nginx_url'];
        }
        else {
            return undefined;
        }
    }

    getReadOnlyCanvasSid = () => {
        if (this.state.currentCheckingLabels !== undefined) {
            return this.state.currentCheckingLabels['_id'];
        }
        else {
            return undefined;
        }
    }

    changeDrawerFinishButton = (value) => {
        this.setState({drawerFinishButton: value});
    }

    changeDrawerLabelPos = (beginX, beginY, endX, endY, value) => {
        this.setState({drawerLabelPos: [beginX, beginY, endX, endY, value]});
    }

    startShowingLabels = (item) => {
        axios.get(Constants.base + `/api/sample/tag/${item['_id']}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                this.setState({
                    isShowingLabels: true,
                    currentSampleLabels: data.data['tags'],
                    currentCheckingLabels: item});
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    cancelShowingLabels = () => {
        this.setState({isShowingLabels: false, currentSampleLabels: [], currentCheckingLabels: undefined});
    }

    confirmDeleteLabel = (item) => {
        axios.delete(Constants.base + `/api/tag/${item['_id']}`, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                this.cancelShowingLabels();
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
                        <Progress percent={(100 * this.state.percent).toFixed(2)} size={[500, 5]} status="active"
                                  strokeColor={{
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
                            defaultPageSize: 10,
                            showSizeChanger: true,
                            onChange: this.onPaginationChange
                        }}
                        dataSource={this.state.currentShowing}
                        renderItem={(item, index) => (
                            <List.Item>
                               <Space direction="horizontal" size="middle">
                                   <Space direction="vertical">
                                       <h2># {(this.state.currentPage - 1) * this.state.currentPagesize + index + 1}
                                           {' ' + item['nginx_url'].split('/').pop()}</h2>
                                       <Space direction={"horizontal"} size={"middle"}>
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
                                   <Image width={240}
                                          height={160}
                                          src={Constants.frontEndAddr + item['nginx_url']}/>
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
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                        <p className="ant-upload-hint">
                            支持单一或批量上传
                        </p>
                    </Dragger>
                </Modal>
                <Drawer
                    width={1200}
                    placement="right"
                    open={this.state.isLabeling}
                    title={"标记样本"}
                    onClose={this.cancelLabelSample}
                    extra={<Space direction="horizontal" size="middle">
                        <Button type="primary" onClick={this.confirmLabelSample} disabled={this.state.drawerFinishButton}>完成</Button>
                        <Button onClick={this.cancelLabelSample}>取消</Button>
                    </Space>}
                    destroyOnClose={true}
                >
                    <Canvas
                        src={this.getCanvasSrc()}
                        finish={this.changeDrawerFinishButton}
                        label={this.changeDrawerLabelPos}
                        sid={this.getCanvasSid()}
                        readonly={false}/>
                </Drawer>
                <Drawer
                    width={1200}
                    placement="right"
                    open={this.state.isShowingLabels}
                    title={"当前样本标记列表"}
                    onClose={this.cancelShowingLabels}
                    extra={<Button type="primary" onClick={this.cancelShowingLabels}>好的</Button>}
                    destroyOnClose={true}>
                    <Space direction={"horizontal"}>
                        <Canvas
                            src={this.getReadOnlyCanvasSrc()}
                            sid={this.getReadOnlyCanvasSid()}
                            readonly={true}/>
                        <List
                            bordered
                            dataSource={this.state.currentSampleLabels}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <Typography>
                                        <h4># {index + 1}</h4>
                                        <Paragraph>{"标记：" + item['tag']['category']}</Paragraph>
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
                    </Space>
                </Drawer>
            </Space>
        );
    }
}

export default WithRouter(PictureList);
