import awsConfig from '../config';
import axios from 'axios';

const apiPath = awsConfig.API.endpoints[0].endpoint

const initialState = {
    inputs: [],
    userId: '',
    input: null,
}
//----------------------------------------------------
  
const GET_INPUTS = 'GET_INPUTS';
const GET_INPUT = 'GET_INPUT';
const GET_USERID = 'GET_USERID';
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

export function getUserId (userId) {
    const action = { type: GET_USERID, userId };
    return action;
}

export function removeInput (inputId) {
    const action = { type: REMOVE_INPUT, inputId};
    return action;
}

//----------------------------------------------------
export function fetchInputs (userId) {
    return function thunk (dispatch) {
        axios.get(apiPath, {
            params: {user_id: userId}})
            .then(res => (res.data))
            .then(inputs => {
                    dispatch(getInputs(inputs))
                }
            );
    }
}

export function fetchInput (userId, inputId) {
    return function thunk (dispatch) {
        axios.get(`${apiPath}/${inputId}`, {params: {user_id: userId}})
            .then(res => (res.data))
            .then(input => {
                    dispatch(getInput(input))
                })
            .catch(err => console.error(`Fetching input: ${inputId} for user ${userId} failed`, err));
    }
}

export function postInput (userId, url) {
    return function thunk (dispatch) {
        axios.post(apiPath, {user_id: userId, url: url })
            .then(res => (res.data))
            .then((newInput) => {
                dispatch(getInput(newInput));
            })
            .catch(err => console.error(`Post input for user ${userId} failed`, err));
    }
}

export function deleteInput (userId, inputId) {
    return function thunk (dispatch) {
    dispatch(removeInput(userId, inputId))
    console.log('## userId', userId);
    axios.delete(`${apiPath}/${inputId}`, {params: {user_id: userId}})
        .then(res => (res.data))
        .then(() => dispatch(fetchInputs(userId)))
        .catch(err => console.error(`Removing input: ${inputId} for user ${userId} failed`, err));
    }
}

//----------------------------------------------------
export default function reducer (state = initialState, action) {
    switch (action.type) {

        case GET_USERID:
            return Object.assign({}, state, {userId: action.userId});
        case GET_INPUTS:
            return Object.assign({}, state, {inputs: action.inputs});

        case GET_INPUT:
            const otherInputs = state.inputs.filter(input => input.id !== Number(action.input.id))
            return Object.assign({}, state, {inputs: [action.input, ...otherInputs], input: action.input});

        case REMOVE_INPUT:
            const newInputs = state.inputs.filter(input => input.id !== action.inputId)
            return Object.assign({}, state, {inputs: newInputs});

        default:
            return state;
    }
}