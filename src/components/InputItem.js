// import React, { Component }from 'react';
import React from 'react';
// import { connect } from 'react-redux';
// import { deleteInput } from '../store';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});

const InputItem = (props) => {
  // const input = props.input
  const classes = useStyles();

  return (
    <Card className={classes.root} >
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image="/static/images/cards/contemplative-reptile.jpg"
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            Lizard
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
            across all continents except Antarctica
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          Check This Art Work on the Museum Website
        </Button>
      </CardActions>
    </Card>
  );
}

// const mapDispatchToProps = (dispatch, ownProps) => {
//   const input = ownProps.input;
//   return {
//       removeStudent (event) {
//           event.stopPropagation();
//           dispatch(deleteInput(input.id))
//       }
//   }
// }

// export default connect(null, mapDispatchToProps)(InputItem);
export default InputItem;