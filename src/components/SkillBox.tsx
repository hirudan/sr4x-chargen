import React, {ChangeEvent} from 'react';
import {Skill} from '../interfaces/Skill';
import skillData from '../data/character/skills.json';
import {Button, Form} from "react-bootstrap";
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
    selectedSkill: string
}

const AWAKENED_ID: number = 12;

export class SkillBox extends React.Component<SkillProps, SkillState>{
    
    constructor(props: SkillProps){
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.setState(this.state ={
            showModal: false,
            selectedSkill: ""
        });
    }

    handleClose() {
        this.setState({ showModal: false, selectedSkill: "" });
    }

    handleShow() {
        this.setState({ showModal: true });
    }
    
    onSkillChange(e: ChangeEvent<HTMLSelectElement>){
        this.setState({selectedSkill: e.currentTarget.value});
    }

    submitForm(index: number){
        this.props.onAdd(index);
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
                                    <Form.Control as="select" onChange={this.onSkillChange}>
                                        <option key={"default"}>...</option>
                                        {Object.keys(buildSkillGroups()).map(id => {return(
                                            <option key={id}>{strings.skillGroups[id]}</option> && 
                                            skillData.skills.filter(skill => skill.group === Number(id)).map(skill => {return(<option key={skill.id}>&emsp;{strings.skills[skill.id]}</option>)}))})}
                                        {/*{skillData.skills.map((skill) => {return(canDisplaySkill(skill.id, this.props.qualities) && */}
                                        {/*    <option>{strings.skills[skill.id]}&emsp;({skill.linkedAttr.join(",")})</option>*/}
                                        {/*)})}*/}
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
                        <Button type="submit" onClick={() => this.submitForm(skillData.skills.find(skill => skill.name === this.state.selectedSkill).id)}>Add</Button>
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
