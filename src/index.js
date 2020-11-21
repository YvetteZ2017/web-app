import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Amplify from 'aws-amplify';

import awsConfig from './config';
import { Home, FaceApp, SignInPage, SignUpPage } from './pages';
import './css/index.css';

Amplify.configure(awsConfig);

const authenticated = () => Amplify.Auth.User !== null; 

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
    authenticated() === true
      ? <Component {...props} />
      : <Redirect to='/signin' />
  )} />
)

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route path="/signup" component={SignUpPage} />
          <Route path="/signin" component={SignInPage} />
          <PrivateRoute path="/app" component={FaceApp} />
        </Switch>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));