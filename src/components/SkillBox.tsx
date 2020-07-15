import React, {ChangeEvent} from 'react';
import {Skill} from '../interfaces/Skill';
import skillData from '../data/character/skills.json';
import {Button, ButtonGroup, Form, ToggleButton} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import * as strings from "../data/strings/en-us.json";
import * as configs from "../data/configs/config.json";
import {ArrowBox} from "./ArrowBox";

export interface SkillProps{
    skills: Object,
    qualities: Array<number>,
    onAdd: any,
    onRemove: any,
    onIncrement: any,
    onDecrement: any
}

interface SkillState{
    showModal: boolean,
    selectedSkills: boolean[]
}

const AWAKENED_ID: number = 12;
const skillGroups = buildSkillGroups();
const NUM_SKILL_GROUPS: number = Object.keys(skillGroups).length;

export class SkillBox extends React.Component<SkillProps, SkillState>{
    
    constructor(props: SkillProps){
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.onSelectSkill = this.onSelectSkill.bind(this);
        this.onSelectSkillGroup = this.onSelectSkillGroup.bind(this)
        this.submitForm = this.submitForm.bind(this);
        const selectedSkills: boolean[] = new Array(NUM_SKILL_GROUPS + skillData.skills.length);
        selectedSkills.fill(false);
        this.setState(this.state ={
            showModal: false,
            selectedSkills: selectedSkills
        });
    }

    handleClose() {
        this.setState({ showModal: false });
    }

    handleShow() {
        this.setState({ showModal: true });
    }
    
    onSelectSkill(id: number){
        let newSelectedSkills = this.state.selectedSkills;
        newSelectedSkills[id + NUM_SKILL_GROUPS] = !newSelectedSkills[id + NUM_SKILL_GROUPS];
        if(!newSelectedSkills[id + NUM_SKILL_GROUPS]){
            let skill: Skill = Object.values(skillGroups).concat.apply([], Object.values(skillGroups)).find(
                target => target.id === id);
            if(skill != null) newSelectedSkills[skill.group] = false;
        }
        this.setState({selectedSkills: newSelectedSkills});
    }
    
    onSelectSkillGroup(id: number){
        let newSelectedSkills = this.state.selectedSkills;
        newSelectedSkills[id] = !newSelectedSkills[id];
        skillGroups[id].map(skill => newSelectedSkills[skill.id + NUM_SKILL_GROUPS] = newSelectedSkills[id]);
        this.setState({selectedSkills: newSelectedSkills});
    }

    submitForm(){
        console.log("moshi moshi");
        this.state.selectedSkills.map((item, index) => {
            if(item){
                let id = index >= NUM_SKILL_GROUPS ? index - NUM_SKILL_GROUPS : index;
                this.props.onAdd(id, index < NUM_SKILL_GROUPS);
            }
        });
        
        this.handleClose();
    }

    // Renders an individual quality item
    buildSkillList(): any{
        return(
            <div>
                <ul>
                    {Object.keys(this.props.skills).map(function(skill){
                        let info = getSkillById(Number(skill));
                        return (<li key={skill}>{info.name}
                        {<ArrowBox name="" value={this.props.skills[skill]} onIncrement={this.props.onIncrement} onDecrement={this.props.onDecrement} />}
                        {<button onClick={() => this.props.onRemove(skill)}>--</button>}</li>)
                    })}
                </ul>
            </div>
        );
    }
    
    render(){
        return(
            <div>
                Active Skills:
                {this.buildSkillList}
                <Button onClick={this.handleShow}>++</Button>
                <Modal show={this.state.showModal} onHide={this.handleClose}
                       size="lg"
                       aria-labelledby="contained-modal-title-vcenter"
                       centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {strings.general.skill_title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {strings.general.skill_greeting}
                        </p>
                        <p>
                            {strings.general.skill_rules.format(configs.qualMax.toString())}
                        </p>
                        <div>
                            <Form onSubmit={this.handleClose}>
                                <Form.Group controlId="skillSelect">
                                    <div className={"row"}>
                                        <div className={"column"}>
                                            <ButtonGroup vertical className={"mb-1"}>
                                                {Object.keys(skillGroups).map((_, id) => (
                                                    <ToggleButton 
                                                        key={id}
                                                        value={strings.skillGroups[id]}
                                                        type={"checkbox"}
                                                        checked={this.state.selectedSkills[id]}
                                                        onChange={() => this.onSelectSkillGroup(id)}>
                                                        {strings.skillGroups[id]}
                                                    </ToggleButton>
                                                ))}
                                            </ButtonGroup>
                                        </div>
                                        <div className={"column"}>
                                            <ButtonGroup vertical className={"mb-1"}>
                                                {skillData.skills.map((skill, id) => (
                                                    <ToggleButton
                                                        key={id}
                                                        value={strings.skills[skill.id]}
                                                        type={"checkbox"}
                                                        checked={this.state.selectedSkills[id + NUM_SKILL_GROUPS]}
                                                        onChange={() => this.onSelectSkill(id)}>
                                                        {strings.skills[skill.id]}
                                                    </ToggleButton>
                                                ))}
                                            </ButtonGroup>
                                        </div>
                                    </div>
                                </Form.Group>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
                        <Button type="submit" onClick={this.submitForm}>Add</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

function canDisplaySkill(skill: number, qualities: Array<number>): boolean{
    let data = getSkillById(skill);
    return data.reqAwakened ? qualities.indexOf(AWAKENED_ID) !== -1 : true;
}

function getSkillById(id: number){
    return skillData.skills.find(skill => skill.id === id);
}

function buildSkillGroups(): Object{
    let groupedSkills = { };
    // As a convention, assign non-grouped skills to "group -1"
    Object.keys(strings.skillGroups).map(group => groupedSkills[group] = skillData.skills.filter(skill => skill.group === Number(group)));
    return groupedSkills;
}
