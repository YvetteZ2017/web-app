import axios from 'axios';

const baseUrl = 'https://ytmkle1u45.execute-api.us-east-1.amazonaws.com/prod/inputs';

const initialState = {
    inputs: []
}
//----------------------------------------------------
  
const GET_INPUTS = 'GET_INPUTS';
const GET_INPUT = 'GET_INPUT';
const REMOVE_INPUT = 'REMOVE_INPUT';
  
  
//----------------------------------------------------
export function getInputs (inputs) {
    const action = { type: GET_INPUTS, inputs };
    return action;
}

export function getInput (input) {
    const action = { type: GET_INPUT, input };
    return action;
}

export function removeInput (inputId) {
    const action = { type: REMOVE_INPUT, inputId};
    return action;
}

//----------------------------------------------------
export function fetchInputs (userId) {
    return function thunk (dispatch) {
        axios.get(baseUrl, {type: 'list_inputs', user_id: userId})
            .then(inputs => {
                    dispatch(getInputs(inputs))
                }
            );
    }
}

export function fetchInput (userId, inputId) {
    return function thunk (dispatch) {
        axios.get(baseUrl, {type: 'get_input', user_id: userId, id: inputId})
            .then(input => {
                    dispatch(getInput(input))
                }
            );
    }
}

export function postInput (userId, url) {
    return function thunk (dispatch) {
        axios.post(baseUrl, {type: 'add_input', user_id: userId, url: url })
            .then(newInput => {
            dispatch(getInput(newInput));
        });
    }
}

export function deleteInput (userId, inputId) {
    return function thunk (dispatch) {
    dispatch(removeInput(userId, inputId))
    axios.delete(baseUrl, {type: 'delete_input', user_id: userId, id: inputId})
        .then(() => dispatch(fetchInputs()))
        .catch(err => console.error(`Removing input: ${inputId} for user ${userId} unsuccesful`, err));
    }
}

//----------------------------------------------------
export default function reducer (state = initialState, action) {
    switch (action.type) {

        case GET_INPUTS:
            return Object.assign({}, state, {inputs: action.inputs});

        case GET_INPUT:
            return Object.assign({}, state, {inputs: [...state.inputs, action.input]});

        case REMOVE_INPUT:
            const newInputs = state.inputs.filter(input => input.id !== action.inputId)
            return Object.assign({}, state, {inputs: newInputs});

        default:
            return state;
    }
}