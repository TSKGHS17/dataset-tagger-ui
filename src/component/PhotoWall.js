import {PlusOutlined} from '@ant-design/icons';
import {Button, List, Modal, Space, Upload, message} from 'antd';
import {useState} from 'react';
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import Canvas from "./Canvas";

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
const PhotoWall = (props) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState([]);
    const [currentFileUid, setCurrentFileUid] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [labelList, setLabelList] = useState([]);

    const handleCancel = () => setPreviewOpen(false);
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        setCurrentFileUid(file.uid);
    };
    const handleChange = (info) => {
        setFileList(info.fileList);
    };
    const handleDownload = (currentFileUid) => {
        return () => {
            let index;
            for (index = 0; index < fileList.length; ++index) {
                if (fileList[index].uid === currentFileUid) {
                    // window.location.href = fileList[index].url;
                }
            }
        }
    };

    const prePic = (fileList, currentFileUid) => {
        return () => {
            let index;
            for (index = 0; index < fileList.length; ++index) {
                if (fileList[index].uid === currentFileUid) {
                    if (index > 0) {
                        handlePreview(fileList[index - 1]);
                    } else {
                        message.info("This is the first picture.");
                    }
                }
            }
        }
    };

    const nextPic = (fileList, currentFileUid) => {
        return () => {
            let index;
            for (index = 0; index < fileList.length; ++index) {
                if (fileList[index].uid === currentFileUid) {
                    if (index < fileList.length - 1) {
                        handlePreview(fileList[index + 1]);
                    } else {
                        message.info("This is the last picture.");
                    }
                }
            }
        }
    };

    const createLabel = (fileList, currentFileUid) => {
        return () => {
            let index;
            for (index = 0; index < fileList.length; ++index) {
                if (fileList[index].uid === currentFileUid) {
                }
            }
            setIsEditing(true);
        }
    }

    const labelingHandleOk = () => {
        setIsEditing(false);
    };

    const labelingHandleCancel = () => {
        setIsEditing(false);
    };

    const getLabelName = (label) => {
        let tmpLabelList = labelList;
        tmpLabelList.push(label);
        setLabelList(tmpLabelList);
    };

    return (
        <>
            <Upload
                action="http://localhost:3000/admin/dataset"
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={(info) => handleChange(info)}
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
                open={previewOpen}
                title={previewTitle}
                footer={
                    <Space wrap>
                        <Button type="primary" onClick={createLabel((fileList, currentFileUid))}>Edit</Button>
                        <Button onClick={handleDownload(currentFileUid)}>Save</Button>
                        <Button icon={<LeftOutlined/>} onClick={prePic(fileList, currentFileUid)}></Button>
                        <Button icon={<RightOutlined/>} onClick={nextPic(fileList, currentFileUid)}></Button>
                    </Space>}
                onCancel={handleCancel}
            >
                <Space size={"middle"}>
                    <img
                        alt="currentShowing"
                        src={previewImage}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    />
                    <List
                        header={<div>Labels</div>}
                        footer={null}
                        bordered
                        dataSource={labelList}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                    />
                </Space>
            </Modal>
            <Modal
                open={isEditing}
                title={"Labeling"}
                footer={
                    <Button type={"primary"} onClick={labelingHandleOk}>Done</Button>
                }
                destroyOnClose={true}
                width={650}
                onCancel={labelingHandleCancel}
            >
                <Canvas src={previewImage} getLabelName={getLabelName}/>
            </Modal>
        </>
    );
};
export default PhotoWall;