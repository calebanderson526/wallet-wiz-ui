import React, { useState } from "react";
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';

const FilterForm = ({
    filterValues,
    setFilterValues
}) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClose();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFilterValues({ ...filterValues, [name]: value });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Set Filters
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Apply Filters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className='text-center'>
                        <p>Filters are lower limits for the data that is shown.<br /><small><strong>I.E: setting a holding filter of 10,000 means the holders shown will have at least 10,000 tokens.</strong></small></p>
                    </Row>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Holding:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="amount"
                                        value={filterValues.amount}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Wallet Value:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="wallet_value"
                                        value={filterValues.wallet_value}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Rug Count:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="rug_count"
                                        value={filterValues.rug_count}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Ape Count:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="ape_count"
                                        value={filterValues.ape_count}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Avg Time:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="avg_time"
                                        value={filterValues.avg_time}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Wallet Age:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="wallet_age"
                                        value={filterValues.wallet_age}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Wallet Score:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="wallet_score"
                                        value={filterValues.wallet_score}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <br />
                        <Row className="text-center">
                            <Col>
                                <Button variant="primary" type="submit">
                                    Submit
                                </Button>
                            </Col>
                        </Row>

                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default FilterForm;