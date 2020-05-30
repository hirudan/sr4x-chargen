import * as React from 'react';
import configs from '../data/configs/config.json';
import raceData from '../data/character/raceData.json';
import {MetaBox} from './MetaBox';

export interface CharacterProps {name?: string; bp?: number}

// Represents all normal/derived/special attributes for a character
interface AttrArray {
  AGI: number,
  REA: number,
  STR: number,
  CHA: number,
  INT: number,
  LOG: number,
  EDG: number,
  BOD?: number,
  INI?: number,
  ESS?: number
}

// The elements of state a Character object tracks
interface State {
  valid: boolean,
  bp: number,
  metatype: string,
  attr: AttrArray,
  attrDelta: AttrArray,
  augAttrDelta: AttrArray,
  augSkillDelta: AttrArray
}

export class Character extends React.Component<CharacterProps, State> {
  public static defaultProps = {
    name: "Chummer",
    bp: configs.startingBP
  };
  private readonly zeroAttrObj: AttrArray;

  constructor(props){
    super(props);
    this.zeroAttrObj = {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0};
    this.state = {
      valid: true, // whether or not the character as-built is legal
      bp: configs.startingBP, // amount of BP available
      metatype: "Human", // the character's metatype
      attr: {AGI: 3, REA: 3, STR: 3, CHA: 3, INT: 3, LOG: 3, EDG: 2, BOD: 3, INI: 6, ESS: 6}, // The character's attribute array
      attrDelta: this.zeroAttrObj, // How many points of attribute increase / sell-off have happened
      augAttrDelta: this.zeroAttrObj, // How many points attributes have been increased by augmentation
      augSkillDelta: this.zeroAttrObj // How many points skills have been increased by augmentation
    };
  }

  render(){
    return(<div>
      <p>Moshi moshi, {this.props.name} desu.</p>
      <p>I have {this.props.bp} build points.</p>
      <MetaBox onMetatypeChanged={this.onMetatypeChanged.bind(this)} 
                onAttrDecrement={this.onAttrDecrement}
                onAttrIncrement={this.onAttrIncrement}/>
    </div>);
  }

  /*
   * Functions to be passed down to various components
   */

   // Passed to: MetaBox
   // Function: computes BP and attribute changes when user
   //           selects a different metatype
   onMetatypeChanged(event: React.FormEvent<HTMLSelectElement>){
     let newMetatype: string = event.currentTarget.value;
     let deltaBP: number = 0;
     if(newMetatype !== this.state.metatype){
       if(newMetatype !== "Human" && this.state.metatype === "Human"){
        deltaBP = -1 * configs.metatypeCost;
       }
       else if (newMetatype === "Human" && this.state.metatype !== "Human") {
         deltaBP = configs.metatypeCost;
       }
     }
     this.setState({
       metatype: newMetatype,
       attr: raceData["metatypes"][newMetatype]["attr_averages"],
       bp: this.state.bp + deltaBP
     })
   }
   
   onAttrIncrement(){
     
   }
   
   onAttrDecrement(){
     
   }
}
