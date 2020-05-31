// Panel that allows the player to enter basic data about their character:
// Name, Age, Size, Nickname, and most importantly, Metatype
import * as React from 'react';
import {ArrowBox} from "./ArrowBox";
import raceData from '../data/character/raceData.json';

export interface MetaBoxProps {onMetatypeChanged: any, onAttrIncrement: any, onAttrDecrement: any}

export class MetaBox extends React.Component<MetaBoxProps, {}>{

    constructor(props: MetaBoxProps) {
        super(props);
        this.handleMetatypeChange = this.handleMetatypeChange.bind(this);
    }
    
    handleMetatypeChange(e: React.FormEvent<HTMLSelectElement>){
        this.props.onMetatypeChanged(e.currentTarget.value);
    }
    
    // Gets metatype names to build selection combo box options
    private static createSelectItems(){
        let items = [];
        let races = raceData["metatypes"];
        for (let i = 0; i < races.length; i++) {
            items.push(<option key={i} value={races[i]["name"]}>{races[i]["name"]}</option>);
        }

        return items;
    }

    render(){
        return(
            <div>
                <select name="metatype"
                        onChange={this.handleMetatypeChange}>
                    {MetaBox.createSelectItems()}
                </select>
                <p>&nbsp;</p>
                AGI
                <ArrowBox name="AGI"
                          initVal={3}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                REA
                <ArrowBox name="REA"
                          initVal={3}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                STR
                <ArrowBox name="STR"
                          initVal={3}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                CHA
                <ArrowBox name="CHA"
                          initVal={3}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                INT
                <ArrowBox name="INT"
                          initVal={3}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                LOG
                <ArrowBox name="LOG"
                          initVal={3}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                EDG
                <ArrowBox name="EDG"
                          initVal={2}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
            </div>
        );
    }
}
