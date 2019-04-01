import React from 'react';
import configs from './config.json';
import raceData from './data/character/raceData.json';
// Basic box with increment/decrement arrows that enforces certain rules on
// allowed values
class Character extends React.Component {


  constructor(props){
    super(props);
    this.state = {
      startingBP: configs.startingBP
    };
  }

  render(){
    return(<div>
      Moshi moshi, {this.props.name} desu.
    </div>);
  }
}

export default Character;
