import React from "react";
import {Button, Space, Input, Modal, Form, Radio, message} from 'antd';
import axios from "axios";
import Constants from "../utils/Constants";

const { Search } = Input;

class Dataset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myDatasets: [],
            isCreatingDataset: false,
        }
    }

    componentDidMount() {
        //TODO: 初始化当前用户的数据集
    }

    onSearch = (value) => {
        //TODO
    }

    startCreateDataset = () => {
        this.setState({isCreatingDataset: true});
    }

    cancelCreateDataset = () => {
        this.setState({isCreatingDataset: false});
    }

    confirmCreateDataset = (values) => {
        axios.post(Constants.frontEndBaseUrl + '/b/api/dataset', values, Constants.formHeader).then((res) => {
            const {data} = res;
            if (data.code === 200) {
                this.setState({myDatasets: [...this.state.myDatasets, data.data], isCreatingDataset: false}, () => {
                    console.log(this.state);
                });
                message.success('创建成功');
            } else {
                //TODO
            }
        }).catch((err) => {
            message.error(err.message);
        });
    }

    //TODO: dataset list展示
    render() {
        return (
            <>
                <Space
                    direction="horizontal"
                    size="middle"
                >
                    <Button type="primary" onClick={this.startCreateDataset}>创建</Button>
                    <Search placeholder="输入数据集ID" onSearch={this.onSearch} enterButton />
                </Space>
                <Modal
                    open={this.state.isCreatingDataset}
                    title={'创建新数据集'}
                    onCancel={this.cancelCreateDataset}
                    footer={null}
                    destroyOnClose={true}
                >
                    <Form
                        onFinish={this.confirmCreateDataset}
                    >
                        <Form.Item
                            name="desc"
                            label="描述"
                            rules={[
                                {
                                    required: true,
                                    message: '请描述数据集！',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            name="sample_type"
                            label="样本类型"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择样本类型！',
                                },
                            ]}
                        >
                            <Radio.Group itialValues={'text'}>
                                <Radio value={'text'}>文本</Radio>
                                <Radio value={'picture'}>图片</Radio>
                                <Radio value={'audio'}>音频</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="tag_type"
                            label="标记类型"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择标记类型！',
                                },
                            ]}
                        >
                            <Radio.Group itialValues={'num_tag'}>
                                <Radio value={'num_tag'}>数值标签</Radio>
                                <Radio value={'class_tag'}>分类标签</Radio>
                                <Radio value={'text_tag'}>文本标签</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button type="primary" htmlType={"submit"}>确定</Button>
                                <Button onClick={this.cancelCreateDataset}>取消</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        );
    }
};

export default Dataset;