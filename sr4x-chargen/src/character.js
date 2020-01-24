import React from 'react';
import configs from './config.json';
import raceData from './data/character/raceData.json';
import { ArrowBox, MetaBox } from './components';

class Character extends React.Component {

  constructor(props){
    super(props);
    this.zeroAttrObj = {
      "AGI": 0,
      "REA": 0,
      "STR": 0,
      "CHA": 0,
      "INT": 0,
      "LOG": 0,
      "EDG": 0
    };
    this.state = {
      valid: true, // whether or not the character as-built is legal
      bp: configs.startingBP, // amount of BP available
      metatype: "Human", // the character's metatype
      attr: {
        "AGI": 3,
				"REA": 3,
				"STR": 3,
				"CHA": 3,
				"INT": 3,
				"LOG": 3,
        "EDG": 2
      }, // The character's attribute array
      attrDelta: this.zeroAttrObj, // How many points of attribute increase / sell-off have happened
      augAttrDelta: this.zeroAttrObj, // How many points attributes have been increased by augmentation
      augSkillDelta: this.zeroAttrObj // How many points skills have been increased by augmentation
    };
  }

  render(){
    return(<div>
      <p>Moshi moshi, {this.props.name} desu.</p>
      <p>I have {this.state.bp} build points.</p>
      <MetaBox onMetatypeChanged={(e) => this.onMetatypeChanged(e.target.value)} />
    </div>);
  }

  /*
   * Functions to be passed down to various components
   */

   // Passed to: MetaBox
   // Function: computes BP and attribute changes when user
   //           selects a different metatype
   onMetatypeChanged(newMetatype){
     console.log(newMetatype);
     var deltaBP = 0;
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
       attr: raceData["metatypes"].indexOf(newMetatype)["attr_averages"],
       bp: this.state.bp + deltaBP
     })
   }
}

export default Character;
