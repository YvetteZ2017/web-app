import React from 'react';
import { connect } from 'react-redux';
import { deleteInput } from '../store';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';


const useStyles =  makeStyles((theme) => ({
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
		right: '2%',
		top: '2%',
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
}));

const getMatchedImageUrl = (match_image_id) => {
	return 'https://artworkfaces.s3.amazonaws.com/' + match_image_id
}

const getInputImageUrl = (input_id) => {
	return 'https://userinputs.s3.amazonaws.com/test_user_id/' + input_id
}

const InputItem = (props) => {
	const input = props.input;
	const classes = useStyles();
	const matchedImageUrl = getMatchedImageUrl(input.match_image_id)  
	const inputImageUrl = getInputImageUrl(input.id)  
  
	return (
		<div key={ input.id }>
			<Link className="thumbnail  media-body" to={`/inputs/${input.id}`}>
				<Paper className={classes.paper}>
					<IconButton aria-label="close" className={classes.closeButton} onClick={props.removeInput} >
						<CloseIcon />
					</IconButton>
					<Grid container className={classes.images}>
						<Grid item xs={6}>
							<ButtonBase className={classes.image}>
								<img className={classes.img} alt="complex" src={ matchedImageUrl } />
							</ButtonBase>
						</Grid>
						<Grid item xs={6}>
							<ButtonBase className={classes.image}>
								<img className={classes.img} alt="complex" src={ inputImageUrl } />
							</ButtonBase>
						</Grid>
					</Grid>
				</Paper>
			</Link>
		</div>
	);
  }

const mapDispatchToProps = (dispatch, ownProps) => {
  const input = ownProps.input;
  return {
      removeInput (event) {
          event.stopPropagation();
          dispatch(deleteInput(input.id))
      }
  }
}

export default connect(null, mapDispatchToProps)(InputItem);
