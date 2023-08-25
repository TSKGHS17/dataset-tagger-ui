import React from "react";
import {Layer, Stage, Image, Rect, Text} from "react-konva";
import useImage from 'use-image';
import axios from "axios";
import Constants from "../utils/Constants";
import {Button, Card, Divider, Form, Input, message, Modal, Select, Space, Switch} from "antd";
import Rectangle from "./Rectangle";
import {PlusOutlined} from "@ant-design/icons";

const BackgroundImage = (values) => {
    const [image] = useImage(values.imageUrl);
    if (image) {
        values.getImageSize(image.width, image.height);
    }

    return <Image image={image}/>;
};

export default class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageWidth: 0,
            imageHeight: 0,
            rectangles: [],
            isCreatingRects: true,

            // current chosen tag
            selectedRectangleId: null,
            tag: undefined,
            tagTime: undefined,
            taggerName: undefined,
            taggerId: undefined,

            // drawing new rect
            isDrawing: false,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            isNamingRect: false,

            newLabelOption: undefined,
        }
    }

    componentDidMount() {
        this.getSampleTags();
    }

    getSampleTags = () => {
        axios.get(Constants.frontEndBaseUrl + Constants.proxy + Constants.sample_join_tags + `/${this.props.sid}`,
            Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                this.setState({
                    rectangles: data.data['tags'],
                });
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    // get the size of the backgroundImage
    getImageSize = (width, height) => {
        if (this.state.imageWidth === 0 && this.state.imageHeight === 0) {
            this.setState({
                imageWidth: width,
                imageHeight: height,
            });
        }
    }

    switchMode = (isCreatingRects) => {
        this.setState({isCreatingRects: isCreatingRects});
    }

    // drawing
    drawingHandleMouseDown = (e) => {
        const {layerX, layerY} = e.evt;
        this.setState({
            isDrawing: true,
            startX: layerX,
            startY: layerY,
            endX: layerX,
            endY: layerY,
        });
    }

    drawingHandleMouseMove = (e) => {
        if (!this.state.isDrawing) {
            return;
        }
        const {layerX, layerY} = e.evt;
        this.setState({
            endX: layerX,
            endY: layerY,
        });
    }

    drawingHandleMouseUp = () => {
        if (this.state.isDrawing) {
            this.setState({
                isDrawing: false,
                isNamingRect: true,
            });
        }
    }

    confirmNamingRect = (values) => {
        // values['label'] is an array, change it into string "label1;label2;label3"
        let label = values['label'][0];
        for (let i = 1; i < values['label'].length; ++i) {
            label += ";" + values['label'][i];
        }

        const value = {
            "sample_id": this.props.sid,
            "begin_pos": {
                "location": `${this.state.startX},${this.state.startY}`,
            },
            "end_pos": {
                "location": `${this.state.endX},${this.state.endY}`,
            },
            "tag": {
                "category": label,
            },
        };

        axios.post(Constants.frontEndBaseUrl + Constants.proxy + Constants.tag,
            JSON.stringify(value), Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('标记成功');
                // renew tags
                this.getSampleTags();
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });

        this.setState({
            isNamingRect: false,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
        });
    }

    cancelNamingRect = () => {
        this.setState({
            isNamingRect: false,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
        });
    }

    updateTagName = (newTags) => {
        if (newTags.length === 0) {
            message.warning("标签不能为空，修改失败");
            return;
        }

        // find the info of the target tag
        let beginPos, endPos;
        for (let i = 0; i < this.state.rectangles.length; ++i) {
            if (this.state.rectangles[i]['_id'] === this.state.selectedRectangleId) {
                beginPos = this.state.rectangles[i]['begin_pos']['location'];
                endPos = this.state.rectangles[i]['end_pos']['location'];
            }
        }

        // transform [tag1, tag2] into "tag1;tag2"
        let newTagsString = newTags[0];
        for (let i = 1; i < newTags.length; ++i) {
            newTagsString += ";" + newTags[i];
        }

        const value = {
            "sample_id": this.props.sid,
            "begin_pos": {
                "location": beginPos,
            },
            "end_pos": {
                "location": endPos,
            },
            "tag": {
                "category": newTagsString,
            },
        };

        axios.post(Constants.frontEndBaseUrl + Constants.proxy + Constants.tag + `/${this.state.selectedRectangleId}`,
            JSON.stringify(value), Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('修改成功');
                // renew tags
                this.getSampleTags();
                this.setState({
                    tag: newTagsString,
                });
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    checkDeselect = (e) => {
        // click on <Image>
        if (e.target.index === 0) {
            this.setState({
                selectedRectangleId: null,
                tag: undefined,
                tagTime: undefined,
                taggerName: undefined,
                taggerId: undefined,
            });
        }
    }

    deleteRect = () => {
        axios.delete(Constants.frontEndBaseUrl + Constants.proxy + Constants.tag + `/${this.state.selectedRectangleId}`,
            Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                const newRects = this.state.rectangles.filter(item => item['_id'] !== this.state.selectedRectangleId);
                this.setState({
                    rectangles: newRects,
                    tag: undefined,
                    tagTime: undefined,
                    taggerName: undefined,
                    taggerId: undefined,
                }, () => {
                    message.success("删除成功！");
                });
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    renderStage = () => {
        if (this.state.isCreatingRects) {
            return (
                <Stage
                    width={this.state.imageWidth}
                    height={this.state.imageHeight}
                    onMouseDown={this.drawingHandleMouseDown}
                    onMouseMove={this.drawingHandleMouseMove}
                    onMouseUp={this.drawingHandleMouseUp}
                >
                    <Layer>
                        <BackgroundImage imageUrl={this.props.backgroundImage} getImageSize={this.getImageSize}/>
                        {this.state.rectangles.map((rectangle, index) => {
                            const beginPositions = rectangle['begin_pos']['location'].split(',');
                            const endPositions = rectangle['end_pos']['location'].split(',');
                            return (
                                <React.Fragment>
                                    <Rect
                                        key={index}
                                        x={parseFloat(beginPositions[0])}
                                        y={parseFloat(beginPositions[1])}
                                        width={parseFloat(endPositions[0]) - parseFloat(beginPositions[0])}
                                        height={parseFloat(endPositions[1]) - parseFloat(beginPositions[1])}
                                        stroke='red'
                                    />
                                    <Text
                                        text={rectangle['tag']['category']}
                                        x={parseFloat(beginPositions[0])}
                                        y={parseFloat(beginPositions[1]) - 25}
                                        fill='red'
                                        fontSize={25}
                                    />
                                </React.Fragment>
                            );
                        })}
                        {(this.state.isDrawing || this.state.isNamingRect) && (
                            <Rect
                                x={this.state.startX}
                                y={this.state.startY}
                                width={this.state.endX - this.state.startX}
                                height={this.state.endY - this.state.startY}
                                stroke='blue'
                            />
                        )}
                    </Layer>
                </Stage>
            );
        }
        else
            {
                return (
                    <Stage
                        width={this.state.imageWidth}
                        height={this.state.imageHeight}
                        onMouseDown={this.checkDeselect}
                        onTouchStart={this.checkDeselect}
                    >
                        <Layer>
                            <BackgroundImage imageUrl={this.props.backgroundImage} getImageSize={this.getImageSize}/>
                            {this.state.rectangles.map((rectangle, index) => {
                                const beginPositions = rectangle['begin_pos']['location'].split(',');
                                const endPositions = rectangle['end_pos']['location'].split(',');
                                return (
                                    <Rectangle
                                        key={index}
                                        tag={rectangle['tag']['category']}
                                        x={parseFloat(beginPositions[0])}
                                        y={parseFloat(beginPositions[1])}
                                        width={parseFloat(endPositions[0]) - parseFloat(beginPositions[0])}
                                        height={parseFloat(endPositions[1]) - parseFloat(beginPositions[1])}
                                        isSelected={rectangle['_id'] === this.state.selectedRectangleId}
                                        onSelect={() => {
                                            this.setState({
                                                selectedRectangleId: rectangle['_id'],
                                                tag: rectangle['tag']['category'],
                                                tagTime: rectangle['tag_time'],
                                                taggerName: rectangle['tagger_name'],
                                                taggerId: rectangle['tagger_id']
                                            });
                                        }}
                                        onDrag={(newAttrs) => {
                                            // drag the rectangle
                                            const rects = this.state.rectangles.slice();
                                            const width = parseFloat(endPositions[0]) - parseFloat(beginPositions[0]);
                                            const height = parseFloat(endPositions[1]) - parseFloat(beginPositions[1]);

                                            // new begin pos and end pos
                                            rects[index]['begin_pos']['location'] = `${newAttrs.x},${newAttrs.y}`;
                                            rects[index]['end_pos']['location'] = `${newAttrs.x + width},${newAttrs.y + height}`;

                                            // setState to make it move
                                            this.setState({rectangles: rects});
                                        }}
                                        onScale={(newAttrs) => {
                                            const rects = this.state.rectangles.slice();
                                            const width = newAttrs.width;
                                            const height = newAttrs.height;

                                            // new size
                                            rects[index]['begin_pos']['location'] = `${newAttrs.x},${newAttrs.y}`;
                                            rects[index]['end_pos']['location'] = `${newAttrs.x + width},${newAttrs.y + height}`;

                                            // setState to make it move
                                            this.setState({rectangles: rects});
                                        }}
                                        confirmChange={() => {
                                            const value = {
                                                "sample_id": this.props.sid,
                                                "begin_pos": {
                                                    "location": this.state.rectangles[index]['begin_pos']['location'],
                                                },
                                                "end_pos": {
                                                    "location": this.state.rectangles[index]['end_pos']['location'],
                                                },
                                                "tag": {
                                                    "category": this.state.rectangles[index]['tag']['category'],
                                                },
                                            };

                                            axios.post(Constants.frontEndBaseUrl + Constants.proxy + Constants.tag + `/${this.state.selectedRectangleId}`,
                                                JSON.stringify(value), Constants.formHeader).then((res) => {
                                                const {data} = res;
                                                if (data.code === 200) {
                                                    message.success('修改成功');
                                                    // renew tags
                                                    this.getSampleTags();
                                                } else {
                                                    message.error(data['error_msg']);
                                                }
                                            }).catch((err) => {
                                                message.error(err.message);
                                            });
                                        }}
                                        cancelChange={() => {
                                            this.getSampleTags();
                                        }}
                                    />
                                );
                            })}
                        </Layer>
                    </Stage>
                );
            }
        }

        render() {
            return (
                <Space direction={"vertical"} size={"middle"}>
                    <Space direction={"horizontal"}>
                        <Switch
                            checkedChildren="新建"
                            unCheckedChildren="编辑"
                            defaultChecked
                            onChange={this.switchMode}
                        />
                    </Space>
                    <Space direction={"horizontal"}>
                        {this.renderStage()}
                        <Card
                            title="标记信息"
                            extra={this.state.selectedRectangleId === null ? <div/> :
                                <Button danger
                                        disabled={(this.props.relation === 'tagger') && (this.props.uid !== this.state.taggerId)}
                                        onClick={this.deleteRect}>删除</Button>}
                            style={{
                                width: 300,
                            }}
                        >
                            {this.state.tag === undefined ? <p>标签：{this.state.tag}</p> :
                                <Select
                                    onChange={this.updateTagName}
                                    mode="tags"
                                    style={{
                                        width: '100%',
                                    }}
                                    placeholder="选择标签"
                                    value={this.state.tag.split(';')}
                                    options={this.props.labelOptions.map((item) => ({
                                        label: item,
                                        value: item,
                                    }))}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider
                                                style={{
                                                    margin: '8px 0',
                                                }}
                                            />
                                            <Space
                                                style={{
                                                    padding: '0 8px 4px',
                                                }}
                                            >
                                                <Input
                                                    placeholder="输入标签"
                                                    onChange={(e) => {
                                                        this.setState({newLabelOption: e.target.value});
                                                    }}
                                                />
                                                <Button
                                                    type="text"
                                                    icon={<PlusOutlined/>}
                                                    onClick={() => {
                                                        this.props.setLabelOptions(this.state.newLabelOption);
                                                    }}
                                                >增加</Button>
                                            </Space>
                                        </>
                                    )}
                                />}
                            <p>标记时间：{this.state.tagTime === undefined ? undefined : this.state.tagTime.slice(0, this.state.tagTime.length - 2)}</p>
                            <p>标记者：{this.state.taggerName}</p>
                        </Card>
                    </Space>
                    <Modal
                        open={this.state.isNamingRect}
                        title={"命名标签"}
                        onCancel={this.cancelNamingRect}
                        footer={null}
                        destroyOnClose={true}
                    >
                        <Form
                            layout={"vertical"}
                            onFinish={this.confirmNamingRect}
                        >
                            <Form.Item
                                label={"标签："}
                                name="label"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入标签！',
                                    },
                                ]}
                            >
                                <Select
                                    mode="tags"
                                    style={{
                                        width: '100%',
                                    }}
                                    placeholder="选择标签"
                                    options={this.props.labelOptions.map((item) => ({
                                        label: item,
                                        value: item,
                                    }))}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider
                                                style={{
                                                    margin: '8px 0',
                                                }}
                                            />
                                            <Space
                                                style={{
                                                    padding: '0 8px 4px',
                                                }}
                                            >
                                                <Input
                                                    placeholder="输入标签"
                                                    onChange={(e) => {
                                                        this.setState({newLabelOption: e.target.value});
                                                    }}
                                                />
                                                <Button
                                                    type="text"
                                                    icon={<PlusOutlined/>}
                                                    onClick={() => {
                                                        this.props.setLabelOptions(this.state.newLabelOption);
                                                    }}
                                                >增加</Button>
                                            </Space>
                                        </>
                                    )}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">确定</Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Space>
            );
        }
        }