import React from 'react';
import { withRouter } from 'react-router-dom';
import { Auth } from 'aws-amplify';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import '../css/app.css'

const styles = theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: 0,
      email: '',
      password: '',
      code: '',
      userObject: null
    };
  }

  async onSubmitForm(e) {
    e.preventDefault();
    try {
        const userObject = await Auth.signIn(
          this.state.email.replace(/[@.]/g, '|'),
          this.state.password
        );
        console.log('userObject', userObject);
        if (userObject.challengeName) {
          // Auth challenges are pending prior to token issuance
          this.setState({ userObject, stage: 1 });
        } else {
          // No remaining auth challenges need to be satisfied
          const session = await Auth.currentSession();
          // console.log('Cognito User Access Token:', session.getAccessToken().getJwtToken());
          console.log('Cognito User Identity Token:', session.getIdToken().getJwtToken());
          // console.log('Cognito User Refresh Token', session.getRefreshToken().getToken());
          this.setState({ stage: 0, email: '', password: '', code: '' });
          this.props.history.replace('/app');
        }
    } catch (err) {
        alert(err.message);
        console.error('Auth.signIn(): ', err);
    }
  }

  async onSubmitVerification(e) {
    e.preventDefault();
    try {
      const data = await Auth.confirmSignIn(
        this.state.userObject,
        this.state.code
      );
      console.log('Cognito User Data:', data);
      const session = await Auth.currentSession();
      // console.log('Cognito User Access Token:', session.getAccessToken().getJwtToken());
      console.log('Cognito User Identity Token:', session.getIdToken().getJwtToken());
      // console.log('Cognito User Refresh Token', session.getRefreshToken().getToken());
      this.setState({ stage: 0, email: '', password: '', code: '' });
      this.props.history.replace('/app');
    } catch (err) {
      alert(err.message);
      console.error('Auth.confirmSignIn(): ', err);
    }
}

  onEmailChanged(e) {
    this.setState({ email: e.target.value.toLowerCase() });
  }

  onPasswordChanged(e) {
    this.setState({ password: e.target.value });
  }

  onCodeChanged(e) {
    this.setState({ code: e.target.value });
  }

  isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  renderSignIn() {
    const isValidEmail = this.isValidEmail(this.state.email);
    const isValidPassword = this.state.password.length > 1;
    const { classes } = this.props;

    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate onSubmit={(e) => this.onSubmitForm(e)}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              className={isValidEmail?'valid':'invalid'}
              placeholder="Email" 
              value={this.state.email}
              onChange={(e) => this.onEmailChanged(e)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              className={isValidPassword?'valid':'invalid'} 
              placeholder="Password" 
              value={this.state.password} 
              onChange={(e) => this.onPasswordChanged(e)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={!(isValidEmail && isValidPassword)}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      	</Container>
    );
  }

  renderConfirm() {
    const isValidEmail = this.isValidEmail(this.state.email);
    const isValidCode = this.state.code.length === 6;
	  const { classes } = this.props;

    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
            Enter MFA Code
            </Typography>
            <form className={classes.form} noValidate id="verifyForm" onSubmit={(e) => this.onSubmitVerification(e)}>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                className={isValidEmail?'valid':'invalid'}
                placeholder="Email" 
                value={this.state.email}
                onChange={(e) => this.onEmailChanged(e)}
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="code"
                label="Verification Code"
                id="code"
                className={isValidCode?'valid':'invalid'} 
                type="text" 
                placeholder="Verification Code" 
                value={this.state.code} 
                onChange={(e) => this.onCodeChanged(e)}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={!(isValidCode&&isValidEmail)}
            >
                Sign In
            </Button>
            <Grid container>
                <Grid item xs>
                <Link href="#" variant="body2">
                    Forgot password?
                </Link>
                </Grid>
                <Grid item>
                <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                </Link>
                </Grid>
            </Grid>
            </form>
        </div>
        </Container>
    );
  }

  render() {
    switch (this.state.stage) {
      case 0:
      default:
        return this.renderSignIn();
      case 1:
        return this.renderConfirm();
    }
  }
}

export default withStyles(styles, { withTheme: true })(withRouter(SignIn));