import React from "react";
import {WithRouter} from "../router/WithRouter";
import {
    Button,
    Col,
    Collapse,
    Drawer,
    Image,
    List,
    message,
    Modal,
    Popconfirm,
    Progress,
    Row,
    Skeleton,
    Space,
    Typography,
    Upload
} from "antd";
import axios from "axios";
import Constants from "../utils/Constants";
import {InboxOutlined} from "@ant-design/icons";
import Canvas from "./Canvas";

const {Text} = Typography;
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
            isCreating: false,
            isLabeling: false,
            currentLabeling: undefined,
            currentCheckingLabels: undefined,
            currentSampleLabels: [],
            percent: 0,
            relation: this.props.searchParams.get('relation'),
            drawerLabelPos: [],
            labelOptions: [], // label options for this dataset
        }

        this.draggerProps = {
            name: 'file',
            multiple: true,
            method: 'post',
            action: Constants.frontEndBaseUrl + `/b/api/sample/upload/${this.state.did}`,
            beforeUpload: (file) => {
                const isJPG = file.type === "image/jpeg";
                const isPNG = file.type === "image/png";
                if (!isJPG && !isPNG) {
                    message.error(`${file.name}不是jpg/png文件`);
                }
                return isJPG || isPNG || Upload.LIST_IGNORE;
            },
            onChange: (info) => {
                const {status, response} = info.file;
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
                    } else {
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
            `/b/api/samples?page_num=${this.state.currentPage}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    isLoading: false,
                    total: data.data['total'],
                    currentShowing: data.data['samples'],
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

    onPaginationChange = (page, pageSize) => {
        let frontEndDatasetUrl = `/b/api/samples?page_num=${page}&page_size=${pageSize}&dataset_id=${this.state.did}`;
        axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
            let {data} = res;
            if (data.code === 200) {
                this.setState({
                    isLoading: false,
                    total: data.data['total'],
                    currentShowing: data.data['samples'],
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
                                isLoading: false,
                                total: data.data['total'],
                                currentShowing: data.data['samples'],
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
                } else {
                    let frontEndDatasetUrl =
                        `/b/api/samples?page_num=${this.state.currentPage}
                        &page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`;
                    axios.get(Constants.frontEndBaseUrl + frontEndDatasetUrl, Constants.formHeader).then((res) => {
                        let {data} = res;
                        if (data.code === 200) {
                            this.setState({
                                isLoading: false,
                                total: data.data['total'],
                                currentShowing: data.data['samples'],
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

    completeLabelSample = () => {
        this.setState({isLabeling: false, currentLabeling: undefined});
    }

    getCanvasSrc = () => {
        if (this.state.currentLabeling !== undefined) {
            return Constants.frontEndAddr + this.state.currentLabeling['nginx_url'];
        } else {
            return undefined;
        }
    }

    getCanvasSid = () => {
        if (this.state.currentLabeling !== undefined) {
            return this.state.currentLabeling['_id'];
        } else {
            return undefined;
        }
    }

    setLabelOptions = (newLabelOption) => {
        if (newLabelOption === undefined) {
            message.error("标签不能为空！");
        } else {
            this.setState({labelOptions: [...this.state.labelOptions, newLabelOption]});
        }
    }

    handleDownloadDataset = async () => {
        //TODO 数据集下载

        // const zip = new JSZip();
        // const samplesRequests = [];
        // const pageNum = Math.floor(this.state.total / this.state.currentPagesize) + 1;
        //
        // for (let i = 1; i <= pageNum; ++i) {
        //     const request = axios.get(Constants.frontEndBaseUrl + Constants.proxy + Constants.samples +
        //         `?page_num=${i}&page_size=${this.state.currentPagesize}&dataset_id=${this.state.did}`,
        //         Constants.formHeader);
        //     samplesRequests.push(request);
        // }
        //
        // try {
        //     const samplesResponses = await Promise.allSettled(samplesRequests);
        //     const tagsRequests = [];
        //
        //     samplesResponses.forEach((response) => {
        //         if (response.status === 'fulfilled') {
        //             const data = response.value.data;
        //             if (data.code === 200) {
        //                 const samples = data.data['samples'];
        //                 for (let j = 0; j < samples.length; ++j) {
        //                     const textsBlob = new Blob([samples[j]['content']], {type: 'text/plain;charset=utf-8'});
        //                     const sampleIndex = (data.data['curPage'] - 1) * this.state.currentPagesize + j + 1;
        //                     zip.file(`${sampleIndex}.text.txt`, textsBlob, {binary: true});
        //
        //                     const request = axios.get(Constants.frontEndBaseUrl + Constants.proxy + Constants.sample_join_tags +
        //                         `/${samples[j]['_id']}`, Constants.formHeader);
        //                     tagsRequests.push(request);
        //                 }
        //             } else {
        //                 message.error(data['error_msg']);
        //             }
        //         } else {
        //             message.error(response.reason.message);
        //         }
        //     });
        //
        //     try {
        //         const tagsResponses = await Promise.allSettled(tagsRequests);
        //
        //         tagsResponses.forEach((response, index) => {
        //             const tags = response.value.data.data['tags'];
        //             const jsonData = JSON.stringify(tags);
        //             const blob = new Blob([jsonData], {type: 'application/json'});
        //             zip.file(`${index + 1}.labels.json`, blob, {binary: true});
        //         })
        //
        //         const content = await zip.generateAsync({type: 'blob'});
        //         saveAs(content, `${this.state.did}.zip`);
        //     } catch (err) {
        //         message.error(err);
        //     }
        // } catch (err) {
        //     message.error(err);
        // }
    }

    render() {
        return (
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Row align={'middle'}>
                    <Col span={8}>
                        <Space direction='horizontal' size='middle'>
                            <Button type="primary" onClick={this.startCreateSample}
                                    disabled={this.state.relation === 'tagger'}>创建样本</Button>
                            {/*<Button onClick={this.handleDownloadDataset}>数据集下载</Button>*/}
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
                                <Space direction="horizontal" size="middle">
                                    <Space direction="vertical">
                                        <Space direction={"horizontal"} size={"middle"} align={"baseline"}>
                                            <h2># {(this.state.currentPage - 1) * this.state.currentPagesize + index + 1}
                                                {' ' + item['nginx_url'].split('/').pop().split('||')[0]}</h2>
                                            {/*{this.getListItemTag(item)} show the process tag */}
                                        </Space>
                                        <Space direction={"horizontal"} size={"middle"}>
                                            <Button type={"primary"}
                                                    onClick={() => this.startLabelSample(item)}>标记</Button>
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
                                        </Space>
                                        <Collapse
                                            bordered={false}
                                        >
                                            <Collapse.Panel
                                                header={"图片，标记数：" + item['tag_num']}
                                                key={1}
                                            >
                                                <Image
                                                    src={Constants.frontEndAddr + item['nginx_url']}
                                                    preview={false}
                                                />,
                                            </Collapse.Panel>
                                        </Collapse>
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
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                        <p className="ant-upload-hint">
                            支持单一或批量上传
                        </p>
                    </Dragger>
                </Modal>
                <Drawer
                    width={window.innerWidth}
                    placement="right"
                    open={this.state.isLabeling}
                    title={"标记样本"}
                    onClose={this.completeLabelSample}
                    extra={null}
                    destroyOnClose={true}
                >
                    <Canvas
                        backgroundImage={this.getCanvasSrc()}
                        sid={this.getCanvasSid()}
                        uid={this.state.uid}
                        relation={this.state.relation}
                        labelOptions={this.state.labelOptions}
                        setLabelOptions={this.setLabelOptions}
                    />
                </Drawer>
            </Space>
        );
    }
}

export default WithRouter(PictureList);