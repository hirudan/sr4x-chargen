import React from 'react';
// Basic box with increment/decrement arrows that enforces certain rules on
// allowed values
class Character extends React.Component {


  constructor(props){
    super(props);
  }

  render(){
    return(<div>
      Moshi moshi, {this.props.name} desu.
    </div>);
  }
}

export default Character;
