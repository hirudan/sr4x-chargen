import * as React from 'react';
import configs from '../data/configs/config.json';
import raceData from '../data/character/raceData.json';
import * as messages from '../data/strings/en-us.json';
import {MetaBox} from './MetaBox';
import {Attribute} from './Enums'
import * as Console from "console";

export interface CharacterProps {name?: string; bp?: number}

// Represents all normal/derived/special attributes for a character
export interface AttrArray {
  AGI: number,
  REA: number,
  STR: number,
  CHA: number,
  INT: number,
  LOG: number,
  EDG: number,
  BOD?: number,
  ESS?: number,
  INI?: number,
  WIL?: number
}

// The elements of state a Character object tracks
interface State {
  bp: number,
  metatype: string,
  attributes: AttrArray,
  attrDelta: AttrArray,
  augAttrDelta: AttrArray,
  augSkillDelta: AttrArray
}

const averages = "attr_averages", softcaps = "attr_softcaps", hardcaps = "attr_hardcaps";

export class Character extends React.Component<CharacterProps, State> {
  public static defaultProps = {
    name: "Chummer",
    bp: configs.startingBP
  };
  
  private errorLog: Array<string> = new Array<string>();
  private valid: boolean = true;

  constructor(props: CharacterProps){
    super(props);
    this.state = {
      bp: configs.startingBP, // amount of BP available
      metatype: "Human", // the character's metatype
      attributes: {AGI: 3, REA: 3, STR: 3, CHA: 3, INT: 3, LOG: 3, EDG: 2, BOD: 3, INI: 6, ESS: 6, WIL: 3}, // The character's attribute array
      attrDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0}, // How many points of attribute increase / sell-off have happened
      augAttrDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0}, // How many points attributes have been increased by augmentation
      augSkillDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0} // How many points skills have been increased by augmentation
    };
    this.onMetatypeChanged = this.onMetatypeChanged.bind(this);
    this.onAttrIncrement = this.onAttrIncrement.bind(this);
    this.onAttrDecrement = this.onAttrDecrement.bind(this);
  }
  
  // Updates the derived attributes of BOD, ESS (eventually, after cyberware is implemented), INI, and WIL on the 
  // given attribute array
  private static updateDerivedAttributes(toUpdate: AttrArray): void{
    toUpdate.BOD = Math.floor((toUpdate.AGI + toUpdate.REA + toUpdate.STR)/3);
    toUpdate.ESS = 6; // Will compute when cyberware is implemented
    toUpdate.INI = toUpdate.AGI + toUpdate.REA;
    toUpdate.WIL = Math.floor((toUpdate.CHA + toUpdate.INT + toUpdate.LOG)/3);
  }
  
  // Runs a series of checks on the Character object and determines if it is valid or not.
  // Any errors will be logged to errorLog for later display. 
  private validate(): boolean{
    this.errorLog = new Array<string>();
    for(let attribute in this.state.attributes){
      if(this.state.attributes[attribute] > Character.getAttrFromConfig(this.state.metatype, softcaps)[attribute]){
        // this.errorLog.push(messages.error.exceeded_softcap.format(attribute, this.state.metatype));
        this.errorLog.push("foo");
      }
    }
    return this.errorLog.length === 0;
  }
  
  private static getAttrFromConfig(metatype: string, statBlock: string): AttrArray{
    return raceData.metatypes.find(m => m.name === metatype)[statBlock] || null;
  }
  
  render(){
    this.valid = this.validate();
    return(<div>
      <p>Moshi moshi, {this.props.name} desu.</p>
      <p>I have {this.state.bp} build points.</p>
      <p>State: {this.valid ? "Valid" : "Invalid"}</p>
      <MetaBox attributes={this.state.attributes} 
               onMetatypeChanged={this.onMetatypeChanged} 
               onAttrDecrement={this.onAttrDecrement}
               onAttrIncrement={this.onAttrIncrement}/>
    </div>);
  }

  /*
   * Functions to be passed down to various components
   */

   // Recipient: MetaBox
   // Purpose  : computes BP and attribute changes when user
   //            selects a different metatype
   onMetatypeChanged(newMetatype: string){
     let deltaBP: number = 0;
     if(newMetatype !== this.state.metatype){
       if(newMetatype !== "Human" && this.state.metatype === "Human"){
        deltaBP = -1 * configs.metatypeCost;
       }
       else if (newMetatype === "Human" && this.state.metatype !== "Human") {
         deltaBP = configs.metatypeCost;
       }
     }
     let new_averages: AttrArray = Object.assign({}, Character.getAttrFromConfig(newMetatype, averages));
     Character.updateDerivedAttributes(new_averages);
     
     // Refund BP if attributes were changed
     for(let x in this.state.attrDelta) {
       let delta: number = this.state.attrDelta[x];
       delta >= 0 ? deltaBP += configs.attrCost * delta : deltaBP += configs.sellAttrCost * delta;
       this.state.attrDelta[x] = 0;
     }
          
     this.setState({
       metatype: newMetatype,
       attributes: new_averages,
       // attrDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0},
       bp: this.state.bp + deltaBP
     })
     
   }

   // Recipient: MetaBox
   // Purpose  : computes BP and attribute changes when user
   //            selects a different metatype
   onAttrIncrement(attr: Attribute){
     let deltaBp: number = (this.state.attrDelta[attr] >= 0) ? -1 * configs.attrCost : -1 * configs.sellAttrCost;
     let deltaAttr: number = 1;
     // Rule: raising an attribute to its racial max costs 1.5x the normal attribute cost
     if(this.state.attributes[attr] + 1 >= Character.getAttrFromConfig(this.state.metatype, softcaps)[attr]){
       deltaBp *= 1.5;
       deltaAttr += 0.5;
     }
     let newAttributes = this.state.attributes;
     let newAttributeDelta = this.state.attrDelta;
     newAttributes[attr] += 1;
     newAttributeDelta[attr] += deltaAttr;
     Character.updateDerivedAttributes(newAttributes);
     Console.log(newAttributeDelta);
     this.setState({
       bp: this.state.bp + deltaBp,
       attributes: newAttributes,
       attrDelta: newAttributeDelta
     })
   }

   // Recipient: MetaBox
   // Purpose  : computes BP and attribute changes when user
   //           selects a different metatype
   onAttrDecrement(attr: Attribute){
     if(this.state.attributes[attr] <= 1)
       return;
     let deltaBp: number = (this.state.attrDelta[attr] <= 0) ? configs.sellAttrCost : configs.attrCost;
     let deltaAttr: number = 1;
     if(this.state.attributes[attr] >= Character.getAttrFromConfig(this.state.metatype, softcaps)[attr]){
       deltaBp *= 1.5;
       deltaAttr += 0.5;
     }
     let newAttributes = this.state.attributes;
     let newAttributeDelta = this.state.attrDelta;
     newAttributes[attr] -= 1;
     newAttributeDelta[attr] -= deltaAttr;
     Character.updateDerivedAttributes(newAttributes);
     Console.log(newAttributeDelta);
     this.setState({
       bp: this.state.bp + deltaBp,
       attributes: newAttributes,
       attrDelta: newAttributeDelta
     })
   }
}
