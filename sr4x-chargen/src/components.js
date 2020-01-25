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
          &lt;
        </button>
        {this.state.value}
        <button onClick={() => this.props.onIncrement()}>
          &gt;
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
      <div name="metaSelect">
        <select name="metatype"
        value={selectedRace}
        onChange={this.props.onMetatypeChanged}>
          {this.createSelectItems()}
        </select>
        {console.log(selectedRace)}
        <p>
          AGI
          <ArrowBox name="AGI"
          initVal="3"
          onIncrement={this.props.onAttrIncrement}
          onDecrement={this.props.onAttrDecrement}>
          </ArrowBox>
        </p>
        <p>
          REA
          <ArrowBox name="REA"
          initVal="3"
          onIncrement={this.props.onAttrIncrement}
          onDecrement={this.props.onAttrDecrement}>
          </ArrowBox>
        </p>
        <p>
          STR
          <ArrowBox name="STR"
          initVal="3"
          onIncrement={this.props.onAttrIncrement}
          onDecrement={this.props.onAttrDecrement}>
          </ArrowBox>
        </p>
        <p>
          CHA
          <ArrowBox name="CHA"
          initVal="3"
          onIncrement={this.props.onAttrIncrement}
          onDecrement={this.props.onAttrDecrement}>
          </ArrowBox>
        </p>
        <p>
          INT
          <ArrowBox name="INT"
          initVal="3"
          onIncrement={this.props.onAttrIncrement}
          onDecrement={this.props.onAttrDecrement}>
          </ArrowBox>
        </p>
        <p>
          LOG
          <ArrowBox name="LOG"
          initVal="3"
          onIncrement={this.props.onAttrIncrement}
          onDecrement={this.props.onAttrDecrement}>
          </ArrowBox>
        </p>
        <p>
          EDG
          <ArrowBox name="EDG"
          initVal="2"
          onIncrement={this.props.onAttrIncrement}
          onDecrement={this.props.onAttrDecrement}>
          </ArrowBox>
        </p>
      </div>
    );
  }
}

export { ArrowBox, MetaBox }
