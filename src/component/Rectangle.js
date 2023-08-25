import React from "react";
import {Rect, Transformer, Text} from "react-konva";

export default class Rectangle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.shapeRef = React.createRef();
        this.transRef = React.createRef();
    }

    // attach transformer to selected rect
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.isSelected === true && this.props.isSelected !== prevProps.isSelected) {
            if (this.props.isSelected) {
                this.transRef.current.nodes([this.shapeRef.current]);
                this.transRef.current.getLayer().batchDraw();
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <Rect
                    x={this.props.x}
                    y={this.props.y}
                    width={this.props.width}
                    height={this.props.height}
                    stroke='red'
                    ref={this.shapeRef}

                    onClick={this.props.onSelect}
                    onTap={this.props.onSelect}
                    draggable
                    onDragEnd={(e) => {
                        this.props.onDrag({
                            x: e.target.x(),
                            y: e.target.y(),
                        });
                    }}
                    onTransformEnd={(e) => {
                        // transformer is changing scale of the node and not its width or height
                        // but in the store we have only width and height
                        // to match the data better we will reset scale on transform end
                        const node = this.shapeRef.current;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        // we will reset it back
                        node.scaleX(1);
                        node.scaleY(1);

                        this.props.onScale({
                            x: node.x(),
                            y: node.y(),
                            // set minimal value
                            width: Math.max(5, node.width() * scaleX),
                            height: Math.max(5, node.height() * scaleY),
                        });
                    }}
                />
                <Text
                    text={this.props.tag}
                    x={this.props.x}
                    y={this.props.y - 25}
                    fill='red'
                    fontSize={25}
                />
                {this.props.isSelected && (
                    <React.Fragment>
                        <Transformer
                            ref={this.transRef}
                            rotateEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => {
                                // limit resize
                                if (newBox.width < 5 || newBox.height < 5) {
                                    return oldBox;
                                }

                                return newBox;
                            }}
                        />
                        <Text
                            text={"确认"}
                            x={this.props.x + this.props.width - 60}
                            y={this.props.y - 15}
                            fill="green"
                            onClick={() => {
                                this.props.confirmChange();
                            }}
                        />
                        <Text
                            text={"取消"}
                            x={this.props.x + this.props.width - 25}
                            y={this.props.y - 15}
                            fill="red"
                            onClick={() => {
                                this.props.cancelChange();
                            }}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}