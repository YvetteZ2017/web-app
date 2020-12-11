import React from 'react';
import { connect } from 'react-redux';
import {deleteInput} from '../store';
import axios from "axios";
import awsConfig from "../config";

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';


const apiPath = awsConfig.API.endpoints[0].endpoint
async function getInputItem (userId, inputId) {
    console.log('userId', userId)
    const input = await axios.get(`${apiPath}/${inputId}`, {params: {user_id: userId}})
        .then(res => res.data);
    console.log('res.data', input.data)
    return input
}

const useStyles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: '60%',
        maxHeight: '60%',
        flexDirection: 'row',

    },
    closeButton: {
        position: 'relative',
        left: '47%',
        color: theme.palette.grey[500],
    },
    image: {
        margin: '2%',
    },
    images: {
        textAlign: 'center',
    },
    img: {
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    },
});


const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
});

const getMatchedImageUrl = (match_image_id) => {
    return 'https://artworkfaces.s3.amazonaws.com/' + match_image_id
}

const getInputImageUrl = (user_id, match_image_id) => {
    return 'https://userinputs.s3.amazonaws.com/' + user_id + '/' + match_image_id
}

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

class InputItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            extendInput: null,
            open: false,
            input: null
        };
    }

    async handleClickOpen(inputId) {
        const userId = localStorage.getItem('userId')
        try {
            let extendInput = await getInputItem(userId, inputId)
            this.setState({extendInput:extendInput, open: true, input: this.props.input})
        } catch (err) {
            alert(err.message);
            console.error(err);
        }
    };

    handleClose = () => {
        this.setState({open: false})
    };

    render() {
        const input = this.props.input;
        const extendInput = this.state.extendInput;
        const { classes } = this.props;
        const matchedImageUrl = getMatchedImageUrl(input.match_image_id)
        const inputImageUrl = getInputImageUrl(input.user_id, input.id)

        return (
            <div key={input.id}>
                <Paper className={classes.paper}>
                    <IconButton aria-label="close" className={classes.closeButton} onClick={this.props.removeInput}>
                        <CloseIcon/>
                    </IconButton>
                    <Grid container className={classes.images} onClick={() => this.handleClickOpen(input.id)}>
                        <Grid item xs={6}>
                            <ButtonBase className={classes.image}>
                                <img className={classes.img} alt="complex" src={matchedImageUrl}/>
                            </ButtonBase>
                        </Grid>
                        <Grid item xs={6}>
                            <ButtonBase className={classes.image}>
                                <img className={classes.img} alt="complex" src={inputImageUrl}/>
                            </ButtonBase>
                        </Grid>
                    </Grid>
                </Paper>
                {   this.state.open ? (
                    <Dialog onClose={this.handleClose} aria-labelledby="customized-dialog-title" open={this.state.open}>
                        <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
                            {extendInput.metadata.title}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container className={classes.images}>
                                <Grid item xs={6}>
                                    <ButtonBase className={classes.image}>
                                        <img className={classes.img} alt="complex" src={matchedImageUrl}/>
                                    </ButtonBase>
                                </Grid>
                                <Grid item xs={6}>
                                    <ButtonBase className={classes.image}>
                                        <img className={classes.img} alt="complex" src={inputImageUrl}/>
                                    </ButtonBase>
                                </Grid>
                            </Grid>
                            <div className={classes.images}>
                            <Typography gutterBottom variant="h5" component="h2">
                                {extendInput.metadata.object_date}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {extendInput.metadata.artist_name}, {extendInput.metadata.artist_nationality}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {extendInput.metadata.artist_bio}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {extendInput.metadata.medium}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {extendInput.metadata.repository}
                            </Typography>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                autoFocus
                                size="small"
                                color="primary"
                                href={extendInput.metadata.object_url}
                            >
                                Check Details
                            </Button>
                        </DialogActions>
                    </Dialog> ) : <div/>
                }
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    const input = ownProps.input;
    let userId = ownProps.userId;
    if (!userId) {
        userId = localStorage.getItem('userId')
    }
    return {
        removeInput (event) {
            event.stopPropagation();
            dispatch(deleteInput(userId, input.id))
        }
    }
}

export default withStyles(useStyles, { withTheme: true})(connect(null, mapDispatchToProps)(InputItem));
