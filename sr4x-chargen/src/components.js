import React from 'react';
// Basic box with increment/decrement arrows that enforces certain rules on
// allowed values
class ArrowBox extends React.Component {

  //var value = 0;

  constructor(props){
    super(props);
    this.state = {
      value: props.initVal,
    };
  }

  render(){
    return(
      <div>
        <button onClick={() => this.setState({value: this.state.value-1})}>
          --
        </button>
        {this.state.value}
        <button onClick={() => this.setState({value: this.state.value+1})}>
          ++
       </button>
     </div>

    )
  }
}

export default ArrowBox;
