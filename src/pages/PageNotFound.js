import React from 'react'
import {Button, Result} from "antd";
import {WithRouter} from "../router/WithRouter";

class PageNotFound extends React.Component {
    backHome = () => {
        this.props.navigate('/login');
    }

    render() {
        return (
            <Result
                status="404"
                title="404"
                subTitle="Page not found"
                extra={<Button type="primary" onClick={this.backHome}>回到首页</Button>}
            />
        );
    }
}

export default WithRouter(PageNotFound);