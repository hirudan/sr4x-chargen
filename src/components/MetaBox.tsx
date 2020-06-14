// Panel that allows the player to enter basic data about their character:
// Name, Age, Size, Nickname, and most importantly, Metatype
import * as React from 'react';
import {ArrowBox} from "./ArrowBox";
import raceData from '../data/character/raceData.json';
import {AttrArray} from "./Character";
import {Attribute} from "./Enums";

export interface MetaBoxProps {attributes: AttrArray, onMetatypeChanged: any, onAttrIncrement: any, onAttrDecrement: any}

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
        let races = raceData.metatypes;
        for (let i = 0; i < races.length; i++) {
            items.push(<option key={i} value={races[i].name}>{races[i].name}</option>);
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
                <ArrowBox name={Attribute.AGI}
                          value={this.props.attributes.AGI}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                REA
                <ArrowBox name={Attribute.REA}
                          value={this.props.attributes.REA}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                STR
                <ArrowBox name={Attribute.STR}
                          value={this.props.attributes.STR}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                CHA
                <ArrowBox name={Attribute.CHA}
                          value={this.props.attributes.CHA}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                INT
                <ArrowBox name={Attribute.INT}
                          value={this.props.attributes.INT}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                LOG
                <ArrowBox name={Attribute.LOG}
                          value={this.props.attributes.LOG}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                EDG
                <ArrowBox name={Attribute.EDG}
                          value={this.props.attributes.EDG}
                          onIncrement={this.props.onAttrIncrement}
                          onDecrement={this.props.onAttrDecrement}>
                </ArrowBox>
                <p>
                BOD&nbsp;
                {this.props.attributes.BOD}
                </p>
                <p>
                ESS&nbsp;
                {this.props.attributes.ESS}
                </p>
                <p>
                INI&nbsp;
                {this.props.attributes.INI}
                </p>
                <p>
                WIL&nbsp;
                {this.props.attributes.WIL}
                </p>
            </div>
        );
    }
}
