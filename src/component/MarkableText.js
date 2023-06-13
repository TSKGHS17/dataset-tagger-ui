import React from 'react';
import {Button, Drawer, Input, message, Space, Typography} from 'antd';
import Styles from "../utils/Styles";
import axios from "axios";
import Constants from "../utils/Constants";

const {Paragraph, Title, Text} = Typography;

class MarkableText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.item['content'],
            selectedText: '',
            selectedIndices: [],
            markedText: '',
            markedIndices: [],
            isNamingLabel: false,
            label: '',
        }
    }

    handleSelection = () => {
        const selection = window.getSelection();
        const selected = selection.toString();
        const range = selection.getRangeAt(0);
        const startIndex = this.getAbsoluteIndex(range.startContainer, range.startOffset);
        const endIndex = this.getAbsoluteIndex(range.endContainer, range.endOffset);
        this.setState({selectedText: selected, selectedIndices: [startIndex, endIndex]});
    };

    getAbsoluteIndex = (node, offset) => {
        let index = offset;
        let currentNode = node.parentNode;

        while (currentNode && currentNode.previousSibling) {
            currentNode = currentNode.previousSibling;
            index += currentNode.textContent.length;
        }

        return index;
    };

    handleMark = () => {
        let startIndex, endIndex;
        const marked = this.state.text.split('').map((char, index) => {
            if (index === this.state.selectedIndices[0]) {
                startIndex = index;
                return `<mark>${char}`;
            } else if (index + 1 === this.state.selectedIndices[1]) {
                endIndex = index + 1;
                return `${char}<mark>`;
            }

            return char;
        }).join('');

        if (!this.checkValid(startIndex, endIndex)) {
            message.error("标签间不能重叠！");
            return;
        }

        this.setState({
            markedText: marked,
            selectedText: '',
            selectedIndices: [],
            markedIndices: [startIndex, endIndex],
            isNamingLabel: true
        });
    };

    checkValid = (startIndex, endIndex) => {
        let labels = [];
        for (let i = 0; i < this.props.allLabels.length; ++i) {
            if (this.props.item['_id'] === this.props.allLabels[i]['sample_id']) {
                labels.push([parseInt(this.props.allLabels[i]['begin_pos']['bchar']), parseInt(this.props.allLabels[i]['end_pos']['bchar'])]);
            }
        }

        for (let i = 0; i < labels.length; i++) {
            const [labelStart, labelEnd] = labels[i];
            if (startIndex < labelEnd && endIndex > labelStart) {
                return false;
            }
        }

        return true;
    }

    renderSampleText = () => {
        const paragraphs = this.state.text.split('\n\n');
        const renderedParagraphs = paragraphs.map((paragraph, index) => (
            <Paragraph key={index} style={Styles.textParagraph}> {paragraph} </Paragraph>
        ));

        return (
            <Typography>
                {renderedParagraphs}
            </Typography>
        );
    }

    renderMarkedText = () => {
        const paragraphs = this.state.markedText.split('\n\n');
        let formerParagraphs = [], laterParagraphs = [], markedParagraphs = [];
        let flag = false;
        for (let i = 0; i < paragraphs.length; ++i) {
            let splitParagraphs = paragraphs[i].split('<mark>');
            if (splitParagraphs.length === 3) {
                flag = true;
                markedParagraphs = splitParagraphs;
            } else {
                if (flag) {
                    laterParagraphs.push(paragraphs[i]);
                } else {
                    formerParagraphs.push(paragraphs[i]);
                }
            }
        }

        const renderedFormerParagraphs = formerParagraphs.map((paragraph, index) => (
            <Paragraph key={index} style={Styles.textParagraph}> {paragraph} </Paragraph>
        ));

        const renderedLaterParagraphs = laterParagraphs.map((paragraph, index) => (
            <Paragraph key={index} style={Styles.textParagraph}> {paragraph} </Paragraph>
        ));

        const renderedMarkedParagraphs = (
            <Paragraph style={Styles.textParagraph}>
                {markedParagraphs[0]}
                <Text style={Styles.markedTextParagraph} mark>{markedParagraphs[1]}</Text>
                {markedParagraphs[2]}
            </Paragraph>
        );

        return (
            <Typography>
                {renderedFormerParagraphs}
                {renderedMarkedParagraphs}
                {renderedLaterParagraphs}
            </Typography>
        );
    }

    cancelNamingLabel = () => {
        this.setState({isNamingLabel: false, markedIndices: []});
    }

    confirmNamingLabel = () => {
        const value = {
            "sample_id": this.props.item['_id'],
            "begin_pos": {
                "bchar": this.state.markedIndices[0],
            },
            "end_pos": {
                "bchar": this.state.markedIndices[1],
            },
            "tag": {
                "category": this.state.label,
            },
        };
        axios.post(Constants.base + '/api/tag', JSON.stringify(value), Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                message.success('标记成功');
            } else {
                message.error(data['error_msg']);
            }
        }).catch((err) => {
            message.error(err.message);
        });
        this.setState({isNamingLabel: false, label:'', markedIndices: []});
    }

    render() {
        return (
            <>
                <Space direction="vertical" size="middle">
                    <div
                        onMouseUp={this.handleSelection}
                        style={{userSelect: 'text'}}
                    >
                        {this.renderSampleText()}
                    </div>
                    <Title level={4}>当前选中文本为：</Title>
                    <Paragraph>
                        <blockquote>{this.state.selectedText}</blockquote>
                    </Paragraph>
                    <Button onClick={this.handleMark} disabled={!this.state.selectedText}>标记当前选中文本</Button>
                </Space>
                <Drawer
                    placement="right"
                    open={this.state.isNamingLabel}
                    title={"命名标记"}
                    onClose={this.cancelNamingLabel}
                    extra={<Space direction="horizontal" size="middle">
                        <Button type="primary" onClick={this.confirmNamingLabel} disabled={!this.state.label}>确认</Button>
                        <Button onClick={this.cancelNamingLabel}>取消</Button>
                    </Space>}
                    destroyOnClose={true}
                >
                    <Space direction="vertical" size="middle">
                        {this.renderMarkedText()}
                        <Title level={4}>输入标签：</Title>
                        <Input allowClear onChange={(e) => {this.setState({label: e.target.value});}}/>
                    </Space>
                </Drawer>
            </>
        );
    }
};

export default MarkableText;
