import React from "react";
import {Input, Space, message} from "antd";
import axios from "axios";
import Constants from "../utils/Constants";

export default class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.canvasRef = React.createRef();
        this.state = {
            image: null,
            context: null,
            isNamingLabel: false,
            beginX: 0,
            beginY: 0,
            endX: 0,
            endY: 0,
            inputValue: '',
            labelList: [],
        };
    }

    componentDidMount() {
        this.setState({
            context: this.canvasRef.current.getContext('2d'),
        });

        if (!this.props.readonly) {
            this.canvasRef.current.addEventListener('mousedown', this.handleMousedown);
            this.canvasRef.current.addEventListener('mouseup', this.handleMouseup);
        }

        let image = new Image();
        image.alt = "Current dealing";
        image.src = this.props.src;
        this.setState({image: image}, () => {
            this.state.image.onload = () => {
                this.canvasRef.current.width = this.state.image.width;
                this.canvasRef.current.height = this.state.image.height;
                this.state.context.drawImage(this.state.image, 0, 0, this.state.image.width, this.state.image.height);
                axios.get(Constants.frontEndBaseUrl + `/b/api/sample/tag/${this.props.sid}`, Constants.formHeader).then((res) => {
                    const {data} = res;
                    if (data.code === 200) {
                        let tmpContext = this.state.context;
                        tmpContext.strokeStyle = "#79deec";
                        tmpContext.lineWidth = 3;
                        tmpContext.font = '26px Arial';
                        tmpContext.fillStyle = "#79deec";
                        this.setState({
                            labelList: data.data['tags'],
                            context: tmpContext,
                        }, () => {
                            // drawTags
                            for (let i = 0; i < this.state.labelList.length; ++i) {
                                const beginPos = this.state.labelList[i]['begin_pos']['location'].split(',');
                                const endPos = this.state.labelList[i]['end_pos']['location'].split(',');
                                this.state.context.strokeRect(parseInt(beginPos[0]), parseInt(beginPos[1]),
                                    parseInt(endPos[0]) - parseInt(beginPos[0]), parseInt(endPos[1]) - parseInt(beginPos[1]));
                                this.state.context.fillText(this.state.labelList[i]['tag']['category'],
                                    parseInt(beginPos[0]), parseInt(beginPos[1]));
                            }

                            if (!this.props.readonly) {
                                let tmpContext = this.state.context;
                                tmpContext.strokeStyle = "#ae2029";
                                this.setState({
                                    context: tmpContext,
                                });
                            }
                        });
                    } else {
                        message.error(data['error_msg']);
                    }
                }).catch((err) => {
                    message.error(err.message);
                });
            }
        });
    }

    componentWillUnmount() {
        this.canvasRef.current.removeEventListener('mousedown', this.handleMousedown);
        this.canvasRef.current.removeEventListener('mouseup', this.handleMouseup);
    }

    handleMousedown = (event) => {
        this.setState({
            beginX: event.clientX - this.canvasRef.current.getBoundingClientRect().left,
            beginY: event.clientY - this.canvasRef.current.getBoundingClientRect().top,
        });
    }

    handleMouseup = (event) => {
        this.setState({
            endX: event.clientX - this.canvasRef.current.getBoundingClientRect().left,
            endY: event.clientY - this.canvasRef.current.getBoundingClientRect().top,
        }, () => {
            this.drawRectangle();
            this.setState({
                isNamingLabel: true,
            });
        });
    }

    drawRectangle() {
        this.state.context.strokeRect(this.state.beginX, this.state.beginY,
            this.state.endX - this.state.beginX, this.state.endY - this.state.beginY);
        this.canvasRef.current.removeEventListener('mousedown', this.handleMousedown);
        this.canvasRef.current.removeEventListener('mouseup', this.handleMouseup);
    }

    handleInputValueChange = (e) => {
        const value = e.target.value;
        if (value !== '') {
            this.props.finish(false);
            this.props.label(this.state.beginX, this.state.beginY, this.state.endX, this.state.endY, value);
        }
        else {
            this.props.finish(true);
        }
    }

    render() {
        return (
            <Space direction="vertical">
                <canvas
                    id={"canvas"}
                    ref={this.canvasRef}
                    style={this.state.isNamingLabel || this.props.readonly ? {
                        "pointerEvents": "none",
                    } : {
                        "cursor": "pointer",
                    }}
                />
                {
                    this.props.readonly ? <div></div> : <Input placeholder="请输入标签" onChange={this.handleInputValueChange}></Input>
                }
            </Space>

        );
    }
}
