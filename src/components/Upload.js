import React from 'react';
// import { Auth } from 'aws-amplify';
import { connect } from 'react-redux';
import { postInput } from "../store";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import '../css/app.css'


const styles = theme => ({
    root: {
        flexGrow: 1,
    },
        margin: {
        margin: theme.spacing(1),
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
      width: '10%',
    },
    media: {
        height: 140,
      },
    cardroot: {
        maxWidth: 345,
    },
  });

const CssTextField = withStyles({
    root: {
        '& label.Mui-focused': {
        color: 'green',
        },
        '& .MuiInput-underline:after': {
        borderBottomColor: 'green',
        },
        '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'red',
        },
        '&:hover fieldset': {
            borderColor: 'yellow',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'green',
        },
        },
    },
})(TextField);

class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: '',
            matchUrl: ''
        };
    }

    async onSubmitForm(e) {
        e.preventDefault();
        try {
            await this.props.handleSubmit(e)

        } catch (err) {
            alert(err.message);
            console.error(err);
        }
        this.setState({ url: '', matchUrl:''});
    }

    onUrlChanged(e) {
        e.preventDefault();
        this.setState({ 
            url: e.target.value,
         });
    }

    render() {
        const { classes } = this.props;
        const url = this.state.url
        const matchUrl = this.state.matchUrl
        return (

            <Grid container className={classes.root} spacing={2}>
                <Grid item xs={12}>
                    <Grid container justify="center" spacing={1}>
                        <Grid item>
                        <CardMedia
                            className={classes.media}
                            image={ url }
                            title="Input Image"
                        />
                        </Grid>
                        <Grid item>
                        <CardMedia
                            className={classes.media}
                            image={ matchUrl }
                            title="Match Image"
                        />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <form className={classes.root} noValidate onSubmit={(e) => this.onSubmitForm(e)}>
                        <CssTextField 
                            className={classes.margin} 
                            id="url"
                            label="Image URL"
                            name="url"
                            autoComplete="url"
                            variant="outlined"
                            value={this.state.url}
                            onChange={(e) => this.onUrlChanged(e)}
                             />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >Upload</Button>
                    </form>
                </Grid>
            </Grid>
            
        );
    }
}

const mapStatesToProps = (state) => (
    {
        userId: state.userId,
        inputs: state.inputs
    }
)


const mapDispatchToProps = function (dispatch, ownProps) {
    return {
        handleSubmit (event) {
            event.preventDefault();
            let userId = localStorage.getItem('userId')
            const url = event.target.url.value;
            dispatch(postInput(userId, url));
        }
    };
};

export default withStyles(styles, { withTheme: true})(connect(mapStatesToProps, mapDispatchToProps)(Upload));