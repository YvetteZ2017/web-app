import React, { Component } from "react";

import NavBar from '../components/NavBar';
import NewUpload from '../components/UploadNew';
import Inputs from '../components/Inputs';
import '../css/app.css';
import store, {fetchInputs} from "../store";
import {connect} from "react-redux";
import axios from "axios";
import awsConfig from "../config";


const apiPath = awsConfig.API.endpoints[0].endpoint
async function getInputItems (userId) {
    console.log('userId', userId)
    const inputs =  await axios.get(apiPath, {params: {user_id: userId}})
        .then(res => res.data);
    console.log('res.data', inputs.data)
    return inputs
}

class FaceApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputs: null,
        }
    }

    async componentDidMount () {
        let userId = this.props.userId
        if (!userId) {
            userId = localStorage.getItem('userId')
        }
        console.log('props', this.props)
        console.log('userId', userId)
        const inputsThunk = fetchInputs(userId);
        try {
            await store.dispatch(inputsThunk);
            let inputs = await getInputItems(userId)
            console.log('inputs', inputs)
            this.setState({inputs: inputs})
        } catch (err) {
            alert(err.message);
            console.error('err: ', err);
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <NavBar />
                    <NewUpload />
                    <Inputs />
                    <a href="url">hello</a>
                </header>
            </div>
        );
    }

}

const mapStatesToProps = (state) => (
    {
        userId: state.userId,
        inputs: state.inputs
    }
)

export default connect(mapStatesToProps, null)(FaceApp);