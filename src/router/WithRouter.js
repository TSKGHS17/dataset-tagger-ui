import {useNavigate, useSearchParams} from "react-router-dom";

export const WithRouter = (Component) => {
    const Wrapper = (props) => {
        const navigate = useNavigate();
        const [searchParams] = useSearchParams();

        return (
            <Component
                navigate={navigate}
                searchParams={searchParams}
                {...props}
            />
        );
    };

    return Wrapper;
};