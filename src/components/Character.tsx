import * as React from 'react';
import {MetaBox} from './MetaBox';
import {Attribute} from './Enums'
import * as Console from "console";
import {AttrArray} from "../interfaces/AttrArray";
import {QualBox} from "./QualBox";
import {Quality} from "../interfaces/Quality";
import {Skill} from "../interfaces/Skill";

import configs from '../data/configs/config.json';
import raceData from '../data/character/raceData.json';
import qualData from '../data/character/qualities.json';
import skillData from '../data/character/skills.json'
import * as messages from '../data/strings/en-us.json';
import {SkillBox} from "./SkillBox";

export interface CharacterProps {name?: string; bp?: number}

interface String {
  format(...replacements: string[]): string;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
          ? args[number]
          : match
          ;
    });
  };
}



// The elements of state a Character object tracks
interface State {
  bp: number,
  metatype: string,
  qualities: Array<number>,
  qualDelta: [number, number],
  attributes: AttrArray,
  attrDelta: AttrArray,
  augAttrDelta: AttrArray,
  augSkillDelta: AttrArray,
  skills: any
}

const averages = "attr_averages", softcaps = "attr_softcaps", hardcaps = "attr_hardcaps";

export class Character extends React.Component<CharacterProps, State> {
  public static defaultProps = {
    name: "Chummer",
    bp: configs.startingBP
  };
  
  private errorLog: Array<string> = new Array<string>();
  private valid: boolean = true;
  private readonly AWAKENED_ID: number = 12;
  private readonly SIGHT_ID: number = 42;
  private readonly ARTIFICER_ID: number = 9;
  private readonly INITIATE_ID: number = 28;

  constructor(props: CharacterProps){
    super(props);
    this.state = {
      bp: configs.startingBP, // amount of BP available
      metatype: "Human", // the character's metatype,
      qualities: new Array<number>(),
      qualDelta: [0,0],
      attributes: {AGI: 3, REA: 3, STR: 3, CHA: 3, INT: 3, LOG: 3, EDG: 2, MAG: 0, BOD: 3, INI: 6, ESS: 6, WIL: 3}, // The character's attribute array
      attrDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0, MAG: 0}, // How many points of attribute increase / sell-off have happened
      augAttrDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0}, // How many points attributes have been increased by augmentation
      augSkillDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0}, // How many points skills have been increased by augmentation
      skills: { }
    };
    this.onMetatypeChanged = this.onMetatypeChanged.bind(this);
    this.onAttrIncrement = this.onAttrIncrement.bind(this);
    this.onAttrDecrement = this.onAttrDecrement.bind(this);
    this.onAddQuality = this.onAddQuality.bind(this);
    this.onRemoveQuality = this.onRemoveQuality.bind(this);
    this.onAddSkill = this.onAddSkill.bind(this);
    this.onRemoveSkill = this.onRemoveSkill.bind(this);
    this.onIncrementSkill = this.onIncrementSkill.bind(this);
    this.onDecrementSkill = this.onDecrementSkill.bind(this);
  }
  
  // Updates the derived attributes of BOD, ESS (eventually, after cyberware is implemented), INI, and WIL on the 
  // given attribute array
  private async updateDerivedAttributes(toUpdate: AttrArray): Promise<any>{
    toUpdate.BOD = Math.floor((toUpdate.AGI + toUpdate.REA + toUpdate.STR)/3);
    toUpdate.ESS = 6; // Will compute when cyberware is implemented
    toUpdate.INI = toUpdate.INT + toUpdate.REA;
    toUpdate.WIL = Math.floor((toUpdate.CHA + toUpdate.INT + toUpdate.LOG)/3);
    if(this.state.qualities.indexOf(this.AWAKENED_ID) !== -1 ||
      this.state.qualities.indexOf(this.SIGHT_ID) !== -1 ||
      this.state.qualities.indexOf(this.ARTIFICER_ID) !== -1){
      toUpdate.MAG = 1 + this.state.attrDelta.MAG;
    }
    else{
      // Refund magic BP if you delete your last magic quality
      toUpdate.MAG = 0;
      let newDelta = Object.assign({},this.state.attrDelta);
      newDelta.MAG = 0;
      let newBp: number = this.state.bp + this.state.attrDelta.MAG * configs.attrCost;
      console.log(newBp);
      this.setState({
        bp: newBp,
        attrDelta: newDelta
      });
    }
  }

  makeErrorList(valid: boolean): any{
    if(!valid){
      return(
          <div>
            Error(s) encountered:
            <ul>
              {this.errorLog.map(function(error){
                return <li>{error}</li>
              })}
            </ul>
          </div>
      );
    }
    return null;
  }
  
  // Runs a series of checks on the Character object and determines if it is valid or not.
  // Any errors will be logged to errorLog for later display. 
  private validate(): boolean{
    this.errorLog = new Array<string>();
    // Rule: attributes shall not exceed racial softcaps
    for(let attribute in this.state.attributes){
      if(this.state.attributes[attribute] > Character.getAttrFromConfig(this.state.metatype, softcaps)[attribute]){
        this.errorLog.push(messages.error.exceeded_softcap.format(attribute, this.state.metatype));
      }
    }
    // Rule: players shall not spend more than 20BP on qualities, nor shall they gain more than 20 in negative
    // qualities.
    let tempQualDelta = Object.assign({}, this.state.qualDelta);
    if(this.state.qualities.indexOf(this.AWAKENED_ID) !== -1){
      tempQualDelta[0] -= qualData.qualities[this.AWAKENED_ID].cost;
    }
    if(tempQualDelta[0] > configs.qualMax)
      this.errorLog.push(messages.error.exceeded_allowed_pos_quals.format(String(configs.qualMax)));
    if(Math.abs(tempQualDelta[1]) > configs.qualMax)
      this.errorLog.push(messages.error.exceeded_allowed_neg_quals.format(String(configs.qualMax)))
    
    // Rule: enforce quality requirements
    this.state.qualities.map((quality: number) => {
      let foundQuality = Character.getQualityById(quality);
      if(foundQuality.requirements.filter(r => r >= 0).length > 0){
        if(!foundQuality.requirements.filter(r => r > 0).some(q => this.state.qualities.indexOf(q) !== -1)){
          this.errorLog.push(messages.error.qual_req_not_met.format(Character.getQualityById(quality).name, 
              messages.qualities[foundQuality.requirements[0]].name));
        }
      }
    });
    
    // Rule: enforce magic limits from essence
    let initGrade: number = this.state.qualities.indexOf(this.INITIATE_ID) === -1 ? 0 : 1; 
    if(this.state.attributes.MAG > Math.floor(this.state.attributes.ESS) + initGrade){
      this.errorLog.push(messages.error.exceeded_max_mag_ess.format(String(this.state.attributes.MAG), 
          String(this.state.attributes.ESS), String(initGrade)));
    }
    
    // Rule: enforce magic limits from qualities
    if((this.state.qualities.indexOf(this.ARTIFICER_ID) !== -1 || this.state.qualities.indexOf(this.SIGHT_ID) !== -1) && this.state.attributes.MAG > 1){
      this.errorLog.push(messages.error.exceeded_max_mag_qual.format(String(this.state.attributes.MAG), 
          messages.qualities[this.ARTIFICER_ID].name, messages.qualities[this.SIGHT_ID].name));
    }
    
    return this.errorLog.length === 0;
  }
  
  private static getAttrFromConfig(metatype: string, statBlock: string): any{
    return raceData.metatypes.find(m => m.name === metatype)[statBlock] || null;
  }
  
  private static getQualityById(id: number): Quality{
    return qualData.qualities.find(q => q.id === id) || null;
  }
  
  render(){
    this.valid = this.validate();
    return(<div>
      <p>Moshi moshi, {this.props.name} desu.</p>
      <p>I have {this.state.bp} build points.</p>
      <p>State: {this.valid ? "Valid" : "Invalid"}</p>
      {this.makeErrorList(this.valid)}
      <MetaBox attributes={this.state.attributes} 
               onMetatypeChanged={this.onMetatypeChanged} 
               onAttrDecrement={this.onAttrDecrement}
               onAttrIncrement={this.onAttrIncrement}/>
      <QualBox qualities={this.state.qualities}
               onAdd={this.onAddQuality}
               onRemove={this.onRemoveQuality}
               metatype={this.state.metatype}/>
      <SkillBox skills={this.state.skills} 
                qualities={this.state.qualities}
                onAdd={this.onAddSkill}
                onRemove={this.onRemoveSkill}
                onIncrement={this.onIncrementSkill}
                onDecrement={this.onDecrementSkill} />
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
     this.updateDerivedAttributes(new_averages);
     
     // Refund BP if attributes were changed
     for(let x in this.state.attrDelta) {
       let delta: number = this.state.attrDelta[x];
       delta >= 0 ? deltaBP += configs.attrCost * delta : deltaBP += configs.sellAttrCost * delta;
       this.state.attrDelta[x] = 0;
     }
     
     // Handle quality changes
     let freeQualities = Character.getAttrFromConfig(newMetatype, "qualities");
     let oldFreeQualities = Character.getAttrFromConfig(this.state.metatype, "qualities");
     let newQualities = this.state.qualities;

     // Remove old free qualities
     oldFreeQualities.map((quality: number) => {
       if(newQualities.indexOf(quality) !== -1)
         newQualities.splice(newQualities.indexOf(quality), 1);
     });
     
     this.state.qualities.map((quality: number) => {
       // Refund BP spent on any qualities that come free with the new metatype
       if(freeQualities.indexOf(quality) !== -1)
        deltaBP += qualData.qualities.find(foundQuality => foundQuality.id === quality).cost;
     });
     
     // Add new free qualities
     freeQualities.map((quality: number) => {
       if(newQualities.indexOf(quality) === -1)
         newQualities.push(quality);
     });
     
     this.setState({
       metatype: newMetatype,
       attributes: new_averages,
       qualities: newQualities,
       bp: this.state.bp + deltaBP
     });
     
   }

   // Recipient: MetaBox
   // Purpose  : Increments selected attribute
   async onAttrIncrement(attr: Attribute){
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
     await this.updateDerivedAttributes(newAttributes);
     this.setState({
       bp: this.state.bp + deltaBp,
       attributes: newAttributes,
       attrDelta: newAttributeDelta
     })
   }

   // Recipient: MetaBox
   // Purpose  : Decrements selected attribute
   async onAttrDecrement(attr: Attribute){
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
     await this.updateDerivedAttributes(newAttributes);
     this.setState({
       bp: this.state.bp + deltaBp,
       attributes: newAttributes,
       attrDelta: newAttributeDelta
     })
   }
   
   // Recipient: QualBox
   // Purpose: Adds a quality to the character's qualities
  async onAddQuality(toAdd: number){
     let quality: Quality = qualData.qualities.find(q => q.id === toAdd);
     let newQualities = this.state.qualities;
     newQualities.push(quality?.id);
     let column, sign : number;
     if(quality?.positive){
       column = 0;
       sign = -1;
     }
     else{
       column = 1;
       sign = 1;
     }
     let newQualDelta: [number, number] = this.state.qualDelta;
     newQualDelta[column] += quality?.cost;
     
     await this.updateDerivedAttributes(this.state.attributes);
      
     this.setState({
       bp: this.state.bp + sign * quality?.cost,
       qualDelta: newQualDelta,
       qualities: newQualities
     }
     );
  }
  
  // Recipient: QualBox
  // Purpose: Removes a quality from the character's qualities
  async onRemoveQuality(toRemove: number){
    let quality: Quality = qualData.qualities.find(q => q.id === toRemove);
    let newQualities = this.state.qualities;
    newQualities.splice(this.state.qualities.indexOf(toRemove),1);
    let column, sign : number;
    if(quality?.positive){
      column = 0;
      sign = 1;
    }
    else{
      column = 1;
      sign = -1;
    }
    let newQualDelta: [number, number] = this.state.qualDelta;
    newQualDelta[column] -= quality?.cost;
    
    await this.updateDerivedAttributes(this.state.attributes);

    this.setState({
          bp: this.state.bp + sign * quality?.cost,
          qualDelta: newQualDelta,
          qualities: newQualities
        }
    );
  }
  
  // Recipient: SkillBox
  // Purpose: Adds a skill or skill group to the character's active skills
  onAddSkill(toAdd: number, isGroup: boolean){
     let deltaBp: number = 0;
     let newSkills: Object = {};
     if(isGroup){
       skillData.skills.filter(skill => skill.group === toAdd).map(skill => newSkills[skill.id] = 1);
       deltaBp -= configs.skillGroupCost;
     }
     else{
       newSkills[toAdd] = 1;
       deltaBp -= configs.skillCost;
     }
     
     this.setState({
       bp: this.state.bp + deltaBp,
       skills: newSkills
    })
  }

  // Recipient: SkillBox
  // Purpose: Adds a skill or skill group to the character's active skills
  onRemoveSkill(toAdd: number, isGroup: boolean){
    let deltaBp: number = 0;
    let newSkills: Object = {};
    if(isGroup){
      skillData.skills.filter(skill => skill.group === toAdd).map(skill => delete newSkills[skill.id] 
          || console.log("hauu nanodesu"));
      deltaBp += configs.skillGroupCost;
    }
    else{
      newSkills[toAdd] = 1;
      deltaBp += configs.skillCost;
    }

    this.setState({
      bp: this.state.bp + deltaBp,
      skills: newSkills
    })
  }
  
  // Recipient: SkillBox
  // Purpose: Increments the rating of a skill or skill group
  onIncrementSkill(toBump: number, isGroup: boolean){
    let deltaBp: number = 0;
    let newSkills = Object.assign({}, this.state.skills);
    
    if(isGroup){
      deltaBp -= configs.skillGroupCost;
      newSkills.keys.map(skill => {if(skillData.skills[skill].group === toBump) newSkills[toBump] += 1});
    }
    else{
      newSkills[toBump] >= configs.skillMax - 1 ? deltaBp -= 2* configs.skillCost : deltaBp -= configs.skillCost;
      newSkills[toBump]++;
    }
    
    this.setState({
      bp: this.state.bp + deltaBp,
      skills: newSkills
    })
  }

  // Recipient: SkillBox
  // Purpose: Increments the rating of a skill or skill group
  onDecrementSkill(toNerf: number, isGroup: boolean){
    let deltaBp: number = 0;
    let newSkills = Object.assign({}, this.state.skills);

    if(isGroup){
      deltaBp += configs.skillGroupCost;
      newSkills.keys.map(skill => {if(skillData.skills[skill].group === toNerf) newSkills[toNerf] -= 1});
    }
    else{
      newSkills[toNerf] >= configs.skillMax ? deltaBp += 2* configs.skillCost : deltaBp += configs.skillCost;
      newSkills[toNerf]++;
    }

    this.setState({
      bp: this.state.bp + deltaBp,
      skills: newSkills
    })
  }
}
