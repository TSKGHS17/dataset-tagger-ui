import {Button, Modal, Space, Upload, message} from 'antd';
import {LeftOutlined, RightOutlined, PlusOutlined} from "@ant-design/icons";
import React from "react";
import Canvas from "./Canvas";
import {WithRouter} from "../router/WithRouter";
import { saveAs } from 'file-saver';

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

class PictureList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previewOpen: false,
            previewImage: undefined,
            previewTitle: false,
            fileList: [],
            currentFileUid: undefined,
            currentLabelList: [],
            uid: this.props.searchParams.get('uid'),
            did: this.props.searchParams.get('did'),
        };
    }

    handleCancel = () => {
        this.setState({previewOpen: false});
    }

    handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        this.setState({
            previewOpen: true,
            previewImage: file.url || file.preview,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
            currentFileUid: file.uid,
        });
    };

    handleChange = (info) => {
        this.setState({
            fileList: info.fileList,
        });
    };

    handleDownload = () => {
        const jsonData = JSON.stringify(this.state.currentLabelList);

        const blob = new Blob([jsonData], { type: 'application/json' });

        let dotIndex = this.state.previewTitle.indexOf('.');
        saveAs(blob, `${this.state.previewTitle.substring(0, dotIndex)}.json`);

        const byteCharacters = atob(this.state.previewImage.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pic = new Blob([byteArray], { type: 'image/jpeg' });

        saveAs(pic, `${this.state.previewTitle.substring(0, dotIndex)}.jpg`);
    };

    prePic = () => {
        for (let index = 0; index < this.state.fileList.length; ++index) {
            if (this.state.fileList[index].uid === this.state.currentFileUid) {
                if (index > 0) {
                    this.handlePreview(this.state.fileList[index - 1]);
                } else {
                    message.info("This is the first picture.");
                }
            }
        }
    };

    nextPic = () => {
        for (let index = 0; index < this.state.fileList.length; ++index) {
            if (this.state.fileList[index].uid === this.state.currentFileUid) {
                if (index < this.state.fileList.length - 1) {
                    this.handlePreview(this.state.fileList[index + 1]);
                } else {
                    message.info("This is the last picture.");
                }
            }
        }
    };

    backtoDataset = () => {
        this.props.navigate(`/dataset?uid=${this.state.uid}`);
    }

    updatePreviewImage = (newImage) => {
        this.setState({previewImage: newImage});
    }

    render() {
        return (
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Button type="primary" onClick={this.backtoDataset}>返回</Button>
                <Upload
                    action="http://localhost:3000/home"
                    listType="picture-card"
                    fileList={this.state.fileList}
                    onPreview={this.handlePreview}
                    onChange={(info) => this.handleChange(info)}
                    method={"get"}
                >
                    <div>
                        <PlusOutlined/>
                        <div
                            style={{
                                marginTop: 8,
                            }}
                        >
                            Upload
                        </div>
                    </div>
                </Upload>
                <Modal
                    open={this.state.previewOpen}
                    title={this.state.previewTitle}
                    onCancel={this.handleCancel}
                    width={650}
                    footer={
                        <Space wrap>
                            <Button type="primary" onClick={this.handleDownload}>Save</Button>
                            <Button icon={<LeftOutlined/>} onClick={this.prePic}></Button>
                            <Button icon={<RightOutlined/>} onClick={this.nextPic}></Button>
                        </Space>}
                >
                    <Canvas src={this.state.previewImage} labelList={this.state.currentLabelList} updatePreviewImage={this.updatePreviewImage}/>
                </Modal>
            </Space>
        );
    }
};

export default WithRouter(PictureList);