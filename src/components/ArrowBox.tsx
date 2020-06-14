// Basic box with increment/decrement arrows that enforces certain rules on
// allowed values
import * as React from 'react';

export interface ArrowBoxProps {name: any, value: number, onIncrement: any, onDecrement: any}

export class ArrowBox extends React.Component<ArrowBoxProps, {}> {
    
    

    constructor(props){
        super(props);
        this.handleIncrement = this.handleIncrement.bind(this);
        this.handleDecrement = this.handleDecrement.bind(this);
    }
    
    handleIncrement(){
        this.props.onIncrement(this.props.name);
    }
    
    handleDecrement(){
        this.props.onDecrement(this.props.name);
    }

    render(){
        return(
            <div>
                <button onClick={this.handleDecrement}>
                    &lt;
                </button>
                &nbsp;{this.props.value}&nbsp;
                <button onClick={this.handleIncrement}>
                    &gt;
                </button>
            </div>
        );
    }
}
