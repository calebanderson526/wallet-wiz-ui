import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table,  Spinner, Alert } from 'react-bootstrap';

export default function Error({
    error,
    setError
}) {

    const errorText = () => {
        if (error.response && error.response.status > 500) {
            return 'Seems like the issue was on our end, this token might be overloading our servers.'
        } else if (error.response && error.response.status > 400) {
            return 'The request was invalid in some way, there might be an issue with your token address.'
        }
    }

    if (error && error != '') {
        return (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
                <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                <p>{error.message}</p>
                <p>{errorText()}</p>
                {console.log(error)}
                {console.log(Object.keys(error))}
            </Alert>
        )
    }
}