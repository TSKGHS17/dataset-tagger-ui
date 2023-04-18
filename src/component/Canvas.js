import React from "react";
import {Input, Modal, message} from "antd";

export default class Canvas extends React.Component {
    //TODO: constructor只被call了一次，写一个destructor
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.inputRef = React.createRef();
        this.state = {
            image: new Image(),
            context: null,
            isNamingLabel: false,
        };
        this.image = new Image();
        this.image.alt = "Current dealing";
        this.image.src = this.props.src;

        this.beginX = 0;
        this.beginY = 0;
        this.endX = 0;
        this.endY = 0;
        this.labelList = [];
    }

    componentDidMount() {
        this.setState({
            context: this.canvasRef.current.getContext('2d'),
        });
        this.canvasRef.current.addEventListener('mousedown', this.handleMousedown);
        this.canvasRef.current.addEventListener('mouseup', this.handleMouseup);
        this.image.onload = () => {
            this.state.context.drawImage(this.image, 0, 0, this.canvasRef.current.width, this.canvasRef.current.height);
            let tmpContext = this.state.context;
            tmpContext.strokeStyle = "#ae2029";
            tmpContext.lineWidth = 3;
            this.setState({
                context: tmpContext,
            });
        }
    }

    componentWillUnmount() {
        this.canvasRef.current.removeEventListener('mousedown', this.handleMousedown);
        this.canvasRef.current.removeEventListener('mouseup', this.handleMouseup);
    }

    handleMousedown = (event) => {
        this.beginX = 2 * (event.clientX - this.canvasRef.current.getBoundingClientRect().left);
        this.beginY = 2 * (event.clientY - this.canvasRef.current.getBoundingClientRect().top);
        this.state.context.beginPath();
    }

    handleMouseup = (event) => {
        this.endX = 2 * (event.clientX - this.canvasRef.current.getBoundingClientRect().left);
        this.endY = 2 * (event.clientY - this.canvasRef.current.getBoundingClientRect().top);

        this.labelList.push([this.beginX, this.beginY, this.endX - this.beginX, this.endY - this.beginY]);
        this.drawRectangle();
        this.setState({
            isNamingLabel: true,
        });
    }

    drawRectangle() {
        let curLabel = this.labelList[this.labelList.length - 1];
        this.state.context.strokeRect(curLabel[0], curLabel[1], curLabel[2], curLabel[3]);
    }

    clearRectangle() {
        // this.labelList.pop();
        // this.state.context.clearRect(0, 0, this.canvasRef.current.width, this.canvasRef.current.height);
        // this.state.context.drawImage(this.image, 0, 0, this.canvasRef.current.width, this.canvasRef.current.height);
        // for (let i = 0; i < this.labelList.length; ++i) {
        //     this.state.strokeRect(this.labelList[i][0], this.labelList[i][1], this.labelList[i][2], this.labelList[i][3]);
        // }
    }

    namingLabelHandleOk = () => {
        const value = this.inputRef.current.input.value;
        if (value === "") {
            message.info("Label name can't be empty.");
        }
        else {
            this.labelList[this.labelList.length - 1].push(value);
            this.setState({
                isNamingLabel: false,
            });
        }
    }

    namingLabelingHandleCancel = () => {
        this.clearRectangle();
        this.setState({
            isNamingLabel: false,
        });
    }

// <List
// header={<div>Labels</div>}
// footer={null}
// bordered
// dataSource={labelList}
// renderItem={(item) => <List.Item>{item}</List.Item>}
// />

    render() {
        return (
            <>
                <canvas
                    id={"canvas"}
                    ref={this.canvasRef}
                    width={720}
                    height={1280}
                    style={{
                        "cursor": "pointer",
                        "width": 360,
                        "height": 640,
                    }}
                />
                <Modal
                    open={this.state.isNamingLabel}
                    title={"Name the label"}
                    destroyOnClose={true}
                    onOk={this.namingLabelHandleOk}
                    onCancel={this.namingLabelingHandleCancel}
                >
                    <Input
                        allowClear
                        ref={this.inputRef}
                        placeholder="Name the label"
                    />
                </Modal>
            </>

        );
    }
}
