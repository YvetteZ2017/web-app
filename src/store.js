import { createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import Reducer from './reducers';


export default createStore(Reducer, applyMiddleware(thunkMiddleware, createLogger()));

export * from './reducers';