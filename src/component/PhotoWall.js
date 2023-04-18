import {Button, Modal, Space, Upload, message} from 'antd';
import {LeftOutlined, RightOutlined, PlusOutlined} from "@ant-design/icons";
import React from "react";
import Canvas from "./Canvas";

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export default class PhotoWall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previewOpen: false,
            previewImage: undefined,
            previewTitle: false,
            fileList: [],
            currentFileUid: undefined,
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

    handleDownload = () => {};

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

    render() {
        return (
            <>
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
                    footer={
                        <Space wrap>
                            <Button type="primary" onClick={this.handleDownload}>Save</Button>
                            <Button icon={<LeftOutlined/>} onClick={this.prePic}></Button>
                            <Button icon={<RightOutlined/>} onClick={this.nextPic}></Button>
                        </Space>}
                >
                    <Canvas src={this.state.previewImage}/>
                </Modal>
            </>
        );
    }
};