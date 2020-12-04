import { React, Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchInput } from '../store';
// import { Auth } from 'aws-amplify';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';


const styles = theme => ({
	root: {
		maxWidth: 345,
	},
	media: {
		height: 140,
	},
});

class SingleInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			input: null
		}
	}

	async componentDidMount() {
		const input = this.props.getInput();
		// const session = await Auth.currentSession();
		this.setState({ input: input });
	}

	render() {
		const input = this.input;
		const classes = this.props.classes;
	
		return (
			<Card className={classes.root} key={ input.id } >
				<CardActionArea>
					<Grid className={classes.root} spacing={0}>
						<Grid item xs={6}>
							<CardMedia
								className={classes.media}
								image={ input.match_image_url }
							/>
						</Grid>
						<Grid item xs={6}>
							<CardMedia
								className={classes.media}
								image={ input.input_image_url }
							/>
						</Grid>
					</Grid>
					<CardContent>
						<Typography gutterBottom variant="h5" component="h2">
							{ input.metadata.title }, { input.metadata.object_date }
						</Typography>
						<Typography variant="body2" color="textSecondary" component="p">
							{ input.metadata.artist_name }, {input.metadata.artist_nationality}
							{ input.metadata.artist_bio }
							{ input.metadata.medium }
							{ input.metadata.repository }
						</Typography>
					</CardContent>
				</CardActionArea>
				<CardActions>
					<Button 
						size="small" 
						color="primary"
						href={input.metadata.object_url}
					>
						Check This Art Work on the Museum Website
					</Button>
				</CardActions>
			</Card>
		);
	}
	
  }

const mapDispatchToProps = (dispatch, ownProps) => {
  const userId = ownProps.userId;
  return {
      getInput (event) {
          event.stopPropagation();
          dispatch(fetchInput(input.id))
      }
  }
}

export default withStyles(styles, { withTheme: true })(withRouter(connect(null, mapDispatchToProps)(SingleInput)));