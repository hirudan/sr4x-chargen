import React from 'react';
import raceData from './data/character/raceData.json';

// Basic box with increment/decrement arrows that enforces certain rules on
// allowed values
class ArrowBox extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      value: props.initVal,
    };
  }

  render(){
    return(
      <div>
        <button onClick={() => this.props.onDecrement()}>
          --
        </button>
        {this.state.value}
        <button onClick={() => this.props.onIncrement()}>
          ++
       </button>
     </div>

   );
  }
}

// Panel that allows the player to enter basic data about their character:
// Name, Age, Size, Nickname, and most importantly, Metatype
class MetaBox extends React.Component{

  // constructor(props){
  //  super(props);
  //  this.state = {selectedRace: "Human"};
  // }

  // Gets metatype names to build selection combo box options
  createSelectItems(){
    let items = [];
    let races = raceData["metatypes"];
    for (let i = 0; i < races.length; i++) {
      items.push(<option key={i} value={races[i]["name"]}>{races[i]["name"]}</option>);
    }

    return items;
  }

  render(){
    let selectedRace;
    return(
      <div>
        <select name="metatype"
        value={selectedRace}
        onChange={this.props.onMetatypeChanged}>
          {this.createSelectItems()}
        </select>
      </div>
    );
  }
}

export { ArrowBox, MetaBox }
