import * as React from 'react';

import {Attribute, KnowSkillCategory} from './Enums'
import {AttrArray} from "../interfaces/AttrArray";
import {Quality} from "../interfaces/Quality";
import {Skill} from "../interfaces/Skill";
import {SkillGroup} from "../interfaces/SkillGroup";
import {Contact} from "../interfaces/Contact";
import configs from '../data/configs/config.json';
import raceData from '../data/character/raceData.json';
import qualData from '../data/character/qualities.json';
import skillData from '../data/character/skills.json'
import * as messages from '../data/strings/en-us.json';
import {KnowSkillBox} from './KnowSkillBox';
import {MetaBox} from './MetaBox';
import {QualBox} from "./QualBox";
import {SkillBox} from "./SkillBox";
import {KnowledgeSkill} from "../interfaces/KnowledgeSkill";
import {Col, Container, Row} from "react-bootstrap";
import {ContactBox} from "./ContactBox";

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
  skills: Array<SkillGroup>,
  knowSkills: Array<KnowledgeSkill>,
  bpSpentKnowSkills: number,
  bpSpentContacts: number,
  contacts: Array<Contact>
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
  private readonly UNGROUPED_ID: number = 24;

  constructor(props: CharacterProps){
    super(props);
    let protoSkills = new Array<SkillGroup>();
    for(let i in Object.keys(messages.skillGroups)) protoSkills[Number(i)] = {rating: 0, skills: {}};
    this.state = {
      bp: configs.startingBP, // amount of BP available
      metatype: "Human", // the character's metatype,
      qualities: new Array<number>(),
      qualDelta: [0,0],
      attributes: {AGI: 3, REA: 3, STR: 3, CHA: 3, INT: 3, LOG: 3, EDG: 2, MAG: 0, BOD: 3, INI: 6, ESS: 6, WIL: 3}, // The character's attribute array
      attrDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0, MAG: 0}, // How many points of attribute increase / sell-off have happened
      augAttrDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0}, // How many points attributes have been increased by augmentation
      augSkillDelta: {AGI: 0, REA: 0, STR: 0, CHA: 0, INT: 0, LOG: 0, EDG: 0}, // How many points skills have been increased by augmentation
      skills: protoSkills, // The active skills the character possesses
      knowSkills: new Array<KnowledgeSkill>(), // The character's knowledge skill array
      bpSpentKnowSkills: 0, // How many BP have actually been spent on knowledge skills (above free points)
      bpSpentContacts: 0, // How many BP have actually been spent on contacts (above free points)
      contacts: new Array<Contact>(), // The character's contacts
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
    this.onAddKnowSkill = this.onAddKnowSkill.bind(this);
    this.onRemoveKnowSkill = this.onRemoveKnowSkill.bind(this);
    this.onIncrementKnowSkill = this.onIncrementKnowSkill.bind(this);
    this.onDecrementKnowSkill = this.onDecrementKnowSkill.bind(this);
    this.onAddContact = this.onAddContact.bind(this);
    this.onRemoveContact = this.onRemoveContact.bind(this);
    this.onChangeContact = this.onChangeContact.bind(this);
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
    
    let turboSkillGroups: Array<SkillGroup> = [];
    
    // Rule: max skill group rating is 4
    Object.keys(this.state.skills).forEach(sg => {
     if (this.state.skills[sg].rating >= configs.skillGroupMaxChargen) 
       turboSkillGroups.push(this.state.skills[sg]);
    });
    turboSkillGroups.forEach((sg, index) => {
      if(sg.rating > configs.skillGroupMaxChargen)
      {
        this.errorLog.push(messages.error.exceeded_skillgroup_max.format(messages.skillGroups[index], String(configs.skillGroupMaxChargen)));
      }
    })
    
    // Rule: may only have 2 skill groups at rating 4 at chargen
    if(turboSkillGroups.length > configs.numSkillGroupsMax)
      this.errorLog.push(messages.error.exceeded_num_max_skillgroups.format(String(configs.skillGroupMaxChargen)));
    
    // Rule: un-augmented skill values may not exceed an allowed max
    let maxxedSkills: SkillGroup[] = [];
    Object.keys(this.state.skills).forEach(sg => {
      if(Object.values(this.state.skills[sg].skills).every(s => s >= configs.skillMaxUnaug))
        maxxedSkills.push(this.state.skills[sg]);
    });
    
    maxxedSkills.forEach(sg => Object.keys(sg.skills).map(skill => {
      if(sg.skills[skill] > configs.skillMaxUnaug){
        this.errorLog.push(messages.error.exceeded_skill_max.format(messages.skills[skill], String(configs.skillMaxUnaug)))
      }
    }))
    
    // Rule: characters may have one knowledge skill at rating 6 or two at rating 5 at chargen
    let maxKnowSkills = this.state.knowSkills.filter(skill => skill.rating >= configs.knowskillMaxChargen -1);
    maxKnowSkills.forEach(skill => {
      if(skill.rating > configs.knowskillMaxChargen)
        this.errorLog.push(messages.error.exceeded_knowskill_max.format(skill.name, String(configs.knowskillMaxChargen)));
    })
    if(maxKnowSkills.filter(skill => skill.rating === configs.knowskillMaxChargen).length > configs.numSkillsMax)
      this.errorLog.push(messages.error.exceeded_num_max_knowskills.format(String(configs.knowskillMaxChargen)))
    if(maxKnowSkills.length > configs.numSkillsNearMax){
      this.errorLog.push(messages.error.exceeded_num_max_knowskills.format(String(configs.knowskillMaxChargen - 1)));
    }
    
    return this.errorLog.length === 0;
  }
  
  private static getAttrFromConfig(metatype: string, statBlock: string): any{
    return raceData.metatypes.find(m => m.name === metatype)[statBlock] || null;
  }
  
  private static getQualityById(id: number): Quality{
    return qualData.qualities.find(q => q.id === id) || null;
  }
  
  private static getSkillById(id: number): Skill{
    return skillData.skills.find(q => q.id === id) || null;
  }
  
  private computeKnowSkillPoints(): number{
    let starting: number = (this.state.attributes.INT + this.state.attributes.LOG) * 3;
    let pointsExpended: number = 0;
    this.state.knowSkills.forEach(skill => pointsExpended += skill.rating);
    
    return Math.max(starting - pointsExpended, 0);
  }
  
  private computeContactPoints(): number{
    let starting: number = this.state.attributes.CHA * 2;
    let pointsExpended: number = 0;
    this.state.contacts.forEach(contact => pointsExpended += (contact.connection * contact.loyalty));
    
    return Math.max(starting - pointsExpended, 0);
  }
  
  // Corrects BP spent on contacts if the player raises or lowers CHA, thus changing their available free CP total
  private async correctContactExpenditureAsync(positive: boolean) {
    console.log("At the beginning: \nbpSpentContacts: " + this.state.bpSpentContacts);
    let sign = positive ? 1 : -1;
    let maxCp: number = (this.state.attributes.CHA) * 2; // This will get called before the update to CHA goes through
    let totalContactCostCp: number = 0;
    this.state.contacts.forEach(contact => totalContactCostCp += (contact.connection * contact.loyalty));
    let cpSpent = Math.min(maxCp, totalContactCostCp); // Either spent the cost of the contacts or the max allowed
    // correct bP spent = total contact cost - cp spent. Delta is difference between this and what's in state.
    // if CHA went up (sign is 1), we need to give BP back. If CHA went down, we (probably) need to charge BP.
    // So deltaBp is negative when CHA decreases and positive when it increases
    console.log("Total contact cost: " + totalContactCostCp);
    console.log("CP spent: " + cpSpent);
    let correctBpSpentContacts = (totalContactCostCp - cpSpent) / configs.cpConversion;
    // let deltaBp = -1 * correctBpSpentContacts - this.state.bpSpentContacts / configs.cpConversion;
    console.log("At the end: \nbpSpentContacts: " + correctBpSpentContacts);
    this.setState({
      bp: this.state.bp + this.state.bpSpentContacts - correctBpSpentContacts,
      bpSpentContacts: correctBpSpentContacts
    })
  }
  
  render(){
    this.valid = this.validate();
    return(
        <Container>
          <Row>
            <div>
              <p>Moshi moshi, {this.props.name} desu.</p>
              <p>I have {this.state.bp} build points.</p>
              <p>State: {this.valid ? "Valid" : "Invalid"}</p>
              {this.makeErrorList(this.valid)}
            </div>
          </Row>
          <Row>
            <Col>
              <MetaBox attributes={this.state.attributes} 
                       onMetatypeChanged={this.onMetatypeChanged} 
                       onAttrDecrement={this.onAttrDecrement}
                       onAttrIncrement={this.onAttrIncrement}/>
            </Col>
            <Col>
              <QualBox qualities={this.state.qualities}
                       onAdd={this.onAddQuality}
                       onRemove={this.onRemoveQuality}
                       metatype={this.state.metatype}/>
            </Col>
          </Row>
          <Row>
            <Col>
              <SkillBox skills={this.state.skills} 
                        qualities={this.state.qualities}
                        onAdd={this.onAddSkill}
                        onRemove={this.onRemoveSkill}
                        onIncrement={this.onIncrementSkill}
                        onDecrement={this.onDecrementSkill} />
            </Col>
            <Col>
              <KnowSkillBox freePoints={this.computeKnowSkillPoints()}
                            onAdd={this.onAddKnowSkill}
                            onRemove={this.onRemoveKnowSkill}
                            onIncrement={this.onIncrementKnowSkill}
                            onDecrement={this.onDecrementKnowSkill}
                            knowSkills={this.state.knowSkills}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <ContactBox freePoints={this.computeContactPoints()} contacts={this.state.contacts} onAdd={this.onAddContact} onRemove={this.onRemoveContact} onChange={this.onChangeContact}/>
            </Col>
          </Row>
        </Container>);
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
     if(attr == Attribute.CHA) await this.correctContactExpenditureAsync(true);
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
     if(attr == Attribute.CHA) await this.correctContactExpenditureAsync(false);
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
  onAddSkill(toAdd: Array<[number, boolean]>){
    let deltaBp: number = 0;
    let newSkills: Array<SkillGroup> = Object.assign({}, this.state.skills);
    
     for(let i = 0; i < toAdd.length; i++){
       let id: number = Number(toAdd[i][0]);
       let isGroup: boolean = Boolean(toAdd[i][1]);
       if(isGroup){
         // Skip if the user tried to add "ungrouped skills" or if they already have this skill group
         if(id === this.UNGROUPED_ID || newSkills[id].rating != 0) continue;
         // If the user already had one or more of the skills in this group, refund their cost
         newSkills[id].rating = 1;
         let groupedSkills: Array<Skill> = skillData.skills.filter(skill => skill.group === id);
         groupedSkills.map(skill => {
           let skillValue: number = newSkills[skill.group].skills[skill.id] ?? 0;
           let overMax: number = Math.max(skillValue - configs.skillMaxUnaug + 1, 0);
           let underMax: number = skillValue - overMax;
           deltaBp += configs.skillCost * (underMax + 2 * overMax);
           newSkills[skill.group].skills[skill.id] = 1;
         });
         deltaBp -= configs.skillGroupCost;
       }
       else{
         let skill : Skill = Character.getSkillById(id);
         if(newSkills[skill.group].skills[skill.id] > 0) continue;
         newSkills[skill.group].skills[skill.id] = 1;
         deltaBp -= configs.skillCost;
       }
     }
     
     this.setState({
       bp: this.state.bp + deltaBp,
       skills: newSkills
    })
  }

  // Recipient: SkillBox
  // Purpose: Adds a skill or skill group to the character's active skills
  onRemoveSkill(toRemove: number, isGroup: boolean){
    let deltaBp: number = 0;
    let newSkills: Array<SkillGroup> = Object.assign({}, this.state.skills);
    if(isGroup){
      deltaBp += configs.skillGroupCost * newSkills[toRemove].rating;
      Object.keys(newSkills[toRemove].skills).forEach(s => {
        let skill: Skill = Character.getSkillById(Number(s));
        let skillValue: number = newSkills[skill.group].skills[skill.id] ?? 0;
        let overMax: number = Math.max(skillValue - configs.skillMaxUnaug + 1, 0);
        let underMax: number = skillValue - newSkills[toRemove].rating - overMax;
        deltaBp += configs.skillCost * (underMax + 2 * overMax);
        newSkills[toRemove].skills[skill.id] = 0;
      });
      newSkills[toRemove].rating = 0;
    }
    else{
      let skill: Skill = Character.getSkillById(toRemove);
      let skillValue: number = newSkills[skill.group].skills[skill.id] ?? 0;
      let overMax: number = Math.max(skillValue - configs.skillMaxUnaug + 1, 0);
      let underMax: number = skillValue - overMax;
      deltaBp += configs.skillCost * (underMax + 2 * overMax);
      newSkills[skill.group].skills[skill.id] = 0;
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
      // For now, we don't allow raising of skill groups if all the skills aren't at an equal rating. Skills can still 
      // be raised above their group level, though.
      if(!Object.values(newSkills[toBump].skills).every((s, _, arr) => s == arr[0])) return;
      deltaBp -= configs.skillGroupCost;
      newSkills[toBump].rating += 1;
      for(let skill in newSkills[toBump].skills){
        newSkills[toBump].skills[Number(skill)]++;
      }
    }
    else{
      let skill: Skill = Character.getSkillById(toBump);
      newSkills[skill.group].skills[toBump] >= configs.skillMaxUnaug - 1 ? deltaBp -= 2 * configs.skillCost : deltaBp -= configs.skillCost;
      newSkills[skill.group].skills[toBump]++;
    }
    
    this.setState({
      bp: this.state.bp + deltaBp,
      skills: newSkills
    })
  }

  // Recipient: SkillBox
  // Purpose: Decrements the rating of a skill or skill group
  onDecrementSkill(toNerf: number, isGroup: boolean) {
    let deltaBp: number = 0;
    let newSkills = Object.assign({}, this.state.skills);

    if (isGroup) {
      if(this.state.skills[toNerf].rating === 1) return;
      deltaBp += configs.skillGroupCost;
      newSkills[toNerf].rating -= 1;
      for (let skill in newSkills[toNerf].skills) {
        newSkills[toNerf].skills[Number(skill)]--;
      }
    } else {
      let skill: Skill = Character.getSkillById(toNerf);
      // Return if the skill is already at rating 1 or if this is a grouped skill and decreasing it would take it below
      // the skill group rating.
      if(this.state.skills[skill.group].skills[skill.id] === 1 || 
          this.state.skills[skill.group].skills[skill.id] === this.state.skills[skill.group].rating)
        return;
      newSkills[skill.group].skills[toNerf] >= configs.skillMaxUnaug ? deltaBp += 2 * configs.skillCost : deltaBp += configs.skillCost;
      newSkills[skill.group].skills[toNerf]--;
    }

    this.setState({
      bp: this.state.bp + deltaBp,
      skills: newSkills
    })
  }
  
  // Recipient: KnowSkillBox
  // Purpose: Add a knowledge skill to the relevant category
  onAddKnowSkill(name: string, category: KnowSkillCategory){
     let deltaBp: number = this.computeKnowSkillPoints() > 0 ? 0 : -configs.knowledgeSkillCost;
     let newSkills = this.state.knowSkills;
     newSkills.push({name: name, category: category, rating: 1});
     
     this.setState({
       bp: this.state.bp + deltaBp,
       knowSkills: newSkills,
       bpSpentKnowSkills: deltaBp < 0 ? this.state.bpSpentKnowSkills + Math.abs(deltaBp) : this.state.bpSpentKnowSkills
     })
  }

  // Recipient: KnowSkillBox
  // Purpose: Remove a knowledge skill from the relevant category
  onRemoveKnowSkill(name: string, category: KnowSkillCategory){
    let newSkills = this.state.knowSkills;
    let rating: number = this.state.knowSkills.filter(s => s.name == name && s.category == category)[0].rating;
    let deltaBp: number = this.state.bpSpentKnowSkills >= rating ? rating : this.state.bpSpentKnowSkills;
    newSkills.splice(newSkills.findIndex(s => s.name == name && s.category == category), 1);

    this.setState({
      bp: this.state.bp + deltaBp,
      knowSkills: newSkills,
      bpSpentKnowSkills: this.state.bpSpentKnowSkills >= rating ? this.state.bpSpentKnowSkills - rating : 0
    })
  }

  // Recipient: KnowSkillBox
  // Purpose: Increment a knowledge skill rating
  onIncrementKnowSkill(name: string, category: KnowSkillCategory){
     let deltaBp: number = this.computeKnowSkillPoints() > 0 ? 0 : -configs.knowledgeSkillCost;
     let newSkills = this.state.knowSkills;
     newSkills.find(s => s.name == name && s.category == category).rating += 1;
     
     this.setState({
       bp: this.state.bp + deltaBp,
       knowSkills: newSkills,
       bpSpentKnowSkills: this.state.bpSpentKnowSkills + Math.abs(deltaBp)
     });
  }

  // Recipient: KnowSkillBox
  // Purpose: Decrement a knowledge skill rating
  onDecrementKnowSkill(name: string, category: KnowSkillCategory){
    let deltaBp: number = this.state.bpSpentKnowSkills > 0 ? configs.knowledgeSkillCost : 0;
    let newSkills = this.state.knowSkills;
    newSkills.find(s => s.name == name && s.category == category).rating -= 1;
    
    this.setState({
      bp: this.state.bp + deltaBp,
      knowSkills: newSkills,
      bpSpentKnowSkills: Math.abs(deltaBp)
    });
  }
  
  // Recipient: ContactBox
  // Purpose: Add a contact
  onAddContact(contact: Contact){
     let cost: number = contact.connection * contact.loyalty;
     let cpAvailable: number = this.computeContactPoints();
     let deltaBp: number = cpAvailable >= cost ? 0 : -(cost-cpAvailable)/configs.cpConversion;
     let newContacts = this.state.contacts;
     newContacts.push(contact);
     
     this.setState({
       bp: Math.round((this.state.bp + deltaBp)*10000)/10000,
       bpSpentContacts: Math.round((this.state.bpSpentContacts + Math.abs(deltaBp))*10000)/10000,
       contacts: newContacts
     })
     
  }

  // Recipient: ContactBox
  // Purpose: Remove a contact
  onRemoveContact(contact: Contact){
    let cost: number = contact.connection * contact.loyalty;
    let cpAvailable: number = this.computeContactPoints();
    let deltaBp: number = this.state.bpSpentContacts >= cost/configs.cpConversion ? cost/configs.cpConversion : this.state.bpSpentContacts;
    let newContacts = this.state.contacts;
    newContacts.splice(newContacts.findIndex(c => c.name === contact.name && c.archetype === contact.archetype), 1);
    let newBpSpent = this.state.bpSpentContacts >= cost/configs.cpConversion ? this.state.bpSpentContacts - cost/configs.cpConversion : 0;
    
    this.setState({
      bp: Math.round((this.state.bp + deltaBp)*10000)/10000,
      contacts: newContacts,
      bpSpentContacts: Math.round(newBpSpent * 10000)/10000
    })
  }

  // Recipient: ContactBox
  // Purpose: Change a contact's connection or loyalty
  onChangeContact(contact: Contact){
    let oldContact = this.state.contacts.find(c  => c.name == contact.name && c.archetype == contact.archetype);
    let oldIndex: number = this.state.contacts.findIndex(c  => c.name == contact.name && c.archetype == contact.archetype);
    let deltaCost = (contact.connection * contact.loyalty) - (oldContact.connection * oldContact.loyalty);
    let newContacts = this.state.contacts;
    let deltaBp: number = 0;
    if(deltaCost < 0){
      // The contact was nerfed
      // deltaBp = this.computeContactPoints() - deltaCost < 0 ? -(deltaCost-this.computeContactPoints())/configs.cpConversion : (this.computeContactPoints() > 0 || this.state.bpSpentContacts == 0 ? 0 : -deltaCost/configs.cpConversion);
      deltaBp = this.state.bpSpentContacts > Math.abs(deltaCost/configs.cpConversion) ? Math.abs(deltaCost/configs.cpConversion) : this.state.bpSpentContacts;
    }
    else{
      // The contact was buffed
      let freePoints = this.computeContactPoints();
      deltaBp = freePoints >= deltaCost ? 0 : -(deltaCost - freePoints)/configs.cpConversion;
    }
    newContacts[oldIndex] = contact;
    
    console.log(this.state.bpSpentContacts);
    
    this.setState({
      bp: Math.round((this.state.bp + deltaBp)*10000)/10000,
      contacts: newContacts,
      bpSpentContacts: Math.round((this.state.bpSpentContacts - deltaBp)*10000)/10000
    });
  }
}
