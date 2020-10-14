import * as React from 'react';
import {Contact} from "../interfaces/Contact";
import Modal from "react-bootstrap/Modal";
import * as strings from "../data/strings/en-us.json";
import configs from "../data/configs/config.json";
import {Button, Form} from "react-bootstrap";
import {ChangeEvent} from "react";

interface ContactProps{
    freePoints: number,
    contacts: Array<Contact>,
    onAdd: any,
    onRemove: any,
    onChange: any
}

interface ContactState{
    showModal: boolean,
    currentContact: Contact
}

export class ContactBox extends React.Component<ContactProps, ContactState>{
    
    constructor(props: ContactProps){
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.onStatChange = this.onStatChange.bind(this);
        
        this.state = { showModal: false, currentContact: {"name": "", "archetype": "", "connection": 0, "loyalty": 0} }
    }

    handleClose() {
        this.setState({ showModal: false, currentContact: {"name": "", "archetype": "", "connection": 0, "loyalty": 0}});
    }

    handleShow() {
        this.setState({ showModal: true });
    }
    
    submitForm(){
        this.props.onAdd(this.state.currentContact);
        this.handleClose();
    }
    
    onStatChange(e: ChangeEvent<HTMLTextAreaElement>){
        let newContact: Contact = this.state.currentContact;
        newContact[e.currentTarget.name] = e.currentTarget.value;
        
        this.setState({currentContact: newContact})
    }
    
    onUpdate(e: ChangeEvent<HTMLTextAreaElement>){
        
    }
    
    render(){
        return(
            <div>
                <Modal show={this.state.showModal} onHide={this.handleClose}
                       size="lg"
                       aria-labelledby="contained-modal-title-vcenter"
                       centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {strings.general.contact_title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {strings.general.contact_greeting}
                        </p>
                        <p>
                            {strings.general.contact_rules}
                        </p>
                        <div>
                            <Form onSubmit={this.handleClose}>
                                <Form.Group controlId="qualSelect">
                                    <Form.Control key="name" name="name" type="text" onChange={this.onStatChange} placeholder={strings.general.contact_name} />
                                    <Form.Control key="arch" name="archetype" type="text" onChange={this.onStatChange} placeholder={strings.general.contact_arch} />
                                    <Form.Control key="con" name="connection" type="number" onChange={this.onStatChange} placeholder={"CON"} min={1} max={6}/>
                                    <Form.Control key="loy" name="loyalty" type="number" onChange={this.onStatChange} placeholder={"LOY"} min={1} max={6}/>
                                </Form.Group>
                            </Form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
                        <Button type="submit" onClick={this.submitForm}>Add</Button>
                    </Modal.Footer>
                </Modal>
                
                Contacts
                <p>{strings.general.free_contacts}: {this.props.freePoints}</p>
                {buildContactList(this.props.contacts, this.props.onRemove, this.props.onChange)}
                <Button onClick={this.handleShow}>{strings.general.contact_add}</Button>
            </div>
        );
    }
    
}

function buildContactList(contacts: Array<Contact>, onRemove: any, onChange: any){
    return(
        <ul>
            {contacts.map(contact => {
                return(
                    <li>
                        <p>{contact.name}&nbsp;({contact.archetype})&nbsp;<Button variant={"secondary"} onClick={() => onRemove(contact)}>--</Button></p>
                        <input type={"number"} name={"connection"} 
                               onChange={e => onChange({"name": contact.name, "archetype": contact.archetype, "connection": e.currentTarget.value, "loyalty": contact.loyalty})} 
                               defaultValue={contact.connection} min={1} max={6}/>
                        <input type={"number"} name={"loyalty"} 
                               onChange={e => onChange({"name": contact.name, "archetype": contact.archetype, "connection": contact.connection, "loyalty": e.currentTarget.value})} 
                               defaultValue={contact.loyalty} min={1} max={6}/>
                    </li>
                )
            })}
        </ul>
    )
}