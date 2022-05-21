import { FormControl, InputGroup, Button, Form } from "react-bootstrap";
import { useState } from 'react';

const SendMessageForm = ({sendMessage}) => {
    const [message, setMessage] = useState('');
    return <Form
        onSubmit={e => {
            e.preventDefault();
            sendMessage(message);
            setMessage('');
        }}>
        <InputGroup className="mb-3">
            <FormControl placeholder='message...'
                onChange={e => setMessage(e.target.value)} value={message} 
            />
            <Button variant='primary' type="submit" disabled={!message} id="button-addon2">
                Send
            </Button>
                {/* <InputGroup.Append>
                </InputGroup.Append> */}
        </InputGroup>
    </Form>
} 

export default SendMessageForm;