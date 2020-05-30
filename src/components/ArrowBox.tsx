// Basic box with increment/decrement arrows that enforces certain rules on
// allowed values
import * as React from 'react';

export interface ArrowBoxProps {name?: string, initVal: number, onIncrement: void, onDecrement: void}

export class ArrowBox extends React.Component<ArrowBoxProps, {}> {
    
    state = {
        value: 0
    }

    constructor(props){
        super(props);
        this.state = {
            value: props.initVal,
        };
    }

    render(){
        return(
            <div>
                <button onClick={() => this.props.onDecrement}>
                    &lt;
                </button>
                {this.state.value}
                <button onClick={() => this.props.onIncrement}>
                    &gt;
                </button>
            </div>

        );
    }
}
