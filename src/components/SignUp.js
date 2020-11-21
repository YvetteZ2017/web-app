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
      width: '100%', 
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  });

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stage: 0,
            email: '',
            password: '',
            confirm: '',
            code: ''
        };
    }
    
    async onSubmitForm(e) {
        e.preventDefault();
        try {
            const params = {
                username: this.state.email.replace(/[@.]/g, '|'),
                password: this.state.password,
                attributes: {
                    email: this.state.email,
                },
                validationData: []
            };
            const data = await Auth.signUp(params);
            console.log(data);
            this.setState({ stage: 1 });
        } catch (err) {
            if (err === "No userPool") {
            console.error("User Pool not defined");
            alert("User Pool not defined. Amplify config must be updated with user pool config");
            } else if (err.message === "User already exists") {
                this.setState({ stage: 1 });
            } else {
                if (err.message.indexOf("phone number format") >= 0) {err.message = "Invalid phone number format. Must include country code. Example: +14252345678"}
                alert(err.message);
                console.error("Exception from Auth.signUp: ", err);
                this.setState({ stage: 0, email: '', password: '', confirm: '' });
            }
        }
        console.log('Form Submitted');
    }

    async onSubmitVerification(e) {
        e.preventDefault();
        try {
        const data = await Auth.confirmSignUp(
            this.state.email.replace(/[@.]/g, '|'),
            this.state.code
        );
        console.log(data);
        // Go to the sign in page
        this.props.history.replace('/signin');
        } catch (err) {
        alert(err.message);
        console.error("Exception from Auth.confirmSignUp: ", err);
        }
        console.log('Verification Submitted');
    }

    onEmailChanged(e) {
    this.setState({ email: e.target.value.toLowerCase() });
    }

    onPhoneChanged(e) {
    this.setState({ phone: e.target.value });
    }

    onPasswordChanged(e) {
    this.setState({ password: e.target.value });
    }

    onConfirmationChanged(e) {
    this.setState({ confirm: e.target.value });
    }

    onCodeChanged(e) {
    this.setState({ code: e.target.value });
    }

    isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
    }

    renderSignUp() {
        const isValidEmail = this.isValidEmail(this.state.email);
        const isValidPassword = this.state.password.length > 1;
        const isValidConfirmation = isValidPassword && this.state.password === this.state.confirm;
        const { classes } = this.props;

        return (
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                    Sign up
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={(e) => this.onSubmitForm(e)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={this.state.email} 
                            onChange={(e) => this.onEmailChanged(e)}
                            className={isValidEmail?'valid':'invalid'} 
                            type="email" 
                            placeholder="Email"
                        />
                        </Grid>
                        <Grid item xs={12}>
                        <TextField
                            variant="outlined"
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
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={!(isValidEmail && isValidPassword && isValidConfirmation)} 
                    >
                        Sign Up
                    </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                        <Link href="#" variant="body2" to={'/signin'}>
                            Already have an account? Sign in
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
                    Sign up
                    </Typography>
                    <form className={classes.form} id="verifyForm" onSubmit={(e) => this.onSubmitVerification(e)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={this.state.email} 
                            onChange={(e) => this.onEmailChanged(e)}
                            className={isValidEmail?'valid':'invalid'} 
                            type="email" 
                            placeholder="Email"
                        />
                        </Grid>
                        <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="verification-code"
                            label="Verification Code"
                            name="verification-code"
                            value={this.state.code} 
                            onChange={(e) => this.onCodeChanged(e)}
                            className={isValidCode?'valid':'invalid'} 
                            type="text" 
                            placeholder="Verification Code" 
                        />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={!(isValidCode&&isValidEmail)}
                    >
                        Sign Up
                    </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                        <Link href="#" variant="body2" to={'/signin'}>
                            Already have an account? Sign in
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
            return this.renderSignUp();
          case 1:
            return this.renderConfirm();
        }
      }
}

export default withStyles(styles, { withTheme: true})(withRouter(SignUp));