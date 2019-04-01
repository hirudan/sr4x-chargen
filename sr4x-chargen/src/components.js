import React from 'react';
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

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div class="wrapper">
        <select name="metatype" onChange={()=>props.onMetatypeChanged}>

        </select>
      </div>
    );
  }
}

export default ArrowBox;
export default MetaBox;
