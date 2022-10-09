import React from 'react';
import { useSelector } from "react-redux";

import Main from '../Main';
import * as Constants from '../Util/constants';

const FormsCreator = () => {
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const formsURL = `https://zealous-visvesvaraya-c9d3d7.netlify.app/${propertyID}`

    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Forms Creator</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <iframe src={formsURL} title="Forms Creator" style={{border: 'none'}} width="100%" height="1000">
                        </iframe>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default FormsCreator