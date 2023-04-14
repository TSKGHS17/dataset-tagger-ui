import React from "react";
import {Input, Modal, message} from "antd";

export default class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.inputRef = React.createRef();
        this.state = {
            src: this.props.src,
            context: null,
            isNamingLabel: false,
        };
        this.image = new Image();
        this.image.alt = "Current dealing";
        this.image.src = this.state.src;

        this.beginX = 0;
        this.beginY = 0;
        this.endX = 0;
        this.endY = 0;
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

    handleMousedown= (event) => {
        this.beginX = event.clientX - this.canvasRef.current.getBoundingClientRect().left;
        this.beginY = event.clientY - this.canvasRef.current.getBoundingClientRect().top;
        this.state.context.beginPath();
    }

    handleMouseup = (event) => {
        this.endX = event.clientX - this.canvasRef.current.getBoundingClientRect().left;
        this.endY = event.clientY - this.canvasRef.current.getBoundingClientRect().top;

        this.state.context.strokeRect(this.beginX, this.beginY, this.endX - this.beginX, this.endY - this.beginY);
        this.setState({
            isNamingLabel: true,
        });
    }
    namingLabelHandleOk = () => {
        const value = this.inputRef.current.input.value;
        if (value === "") {
            message.info("Label name can't be empty.");
            return;
        }
        else {
            this.props.getLabelName(value);
            this.setState({
                isNamingLabel: false,
            });
        }
    }

    namingLabelingHandleCancel = () => {
        //TODO: 清除当前路径
        this.setState({
            isNamingLabel: false,
        });
    }

    render() {
        return (
            <>
                <canvas
                    id={"canvas"}
                    ref={this.canvasRef}
                    width={360}
                    height={640}
                    style={{"cursor": "pointer"}}
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
