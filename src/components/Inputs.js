import React from 'react';
import { connect } from 'react-redux';
import InputItem from './InputItem';


const Inputs = (props) => {
    const inputs = props.inputs;
    return(
        <div>
            <div className="row">
            {
                inputs.map(input => (<InputItem key={input.id} input={input}/>))
            }
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
    return {inputs: state.inputs}
}

export default connect(mapStateToProps)(Inputs);