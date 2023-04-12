import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';

const SearchBox = ({
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    setToken,
    setHoursAfterLaunch,
    hoursAfterLaunch,
    chain
}) => {

    const [showModal, setShowModal] = useState(false); const [showSnapshotTime, setShowSnapshotTime] = useState(false);

    const handleCheckboxChange = (e) => {
        setShowSnapshotTime(e.target.checked);
        if (!e.target.checked) {
            setHoursAfterLaunch(-1)
        }
    };

    const handleHoursAfterLaunchChange = (e) => {
        setHoursAfterLaunch(e.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get(`${process.env.NEXT_PUBLIC_DEXSC_URL}latest/dex/search/?q=${searchQuery}`);
                var filtered_results = filterAndGroup(result.data.pairs)
                setSearchResults(filtered_results);
            } catch (error) {
                console.log(error);
            }
        };

        const timer = setTimeout(() => {
            if (searchQuery) {
                fetchData();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // removes duplicate tokens and trims results to only the necessary requirements
    function filterAndGroup(objects) {
        // Filter out objects with chainId not equal to current chain
        let filtered = objects.filter(obj => obj.chainId == chain.toLowerCase());

        // Filter out objects without pairCreatedAt property
        filtered = filtered.filter(obj => obj.pairCreatedAt !== undefined);
        // Filter out objects without liquidity property
        filtered = filtered.filter(obj => obj.liquidity.usd !== undefined);

        // Create two new objects for each original object
        const tokenObjects = filtered.flatMap(obj => [
            { 
                token: obj.baseToken, 
                pairCreatedAt: obj.pairCreatedAt, 
                pairAddress: obj.pairAddress, 
                liquidity: obj.liquidity, 
                baseToken: obj.baseToken,
                fdv: obj.fdv,
                h24vol: obj.volume.h24
            },
            { 
                token: obj.quoteToken, 
                pairCreatedAt: obj.pairCreatedAt, 
                pairAddress: obj.pairAddress, 
                liquidity: obj.liquidity, 
                baseToken: obj.baseToken,
                fdv: obj.fdv,
                h24vol: obj.volume.h24
            }
        ]);

        // Remove duplicates based on token address and keep one with lowest pairCreatedAt
        const uniqueTokenObjects = [];
        tokenObjects.forEach(obj => {
            const existing = uniqueTokenObjects.find(o => o.token.address === obj.token.address);
            if (!existing || existing.pairCreatedAt > obj.pairCreatedAt) {
                uniqueTokenObjects.push(obj);
            }
        });

        return uniqueTokenObjects;
    }



    const handleSearchInputChange = (event) => {
        event.preventDefault()
        setSearchQuery(event.target.value);
    };

    const handleModalOpen = () => {
        setSearchQuery('');
        setSearchResults([])
        setShowModal(true);
    }

    const handleModalClose = () => setShowModal(false);

    const handleSearchClick = (search_result) => {
        setSearchQuery('')
        handleModalClose()
        var tmp = search_result.token
        tmp.pairCreatedAt = search_result.pairCreatedAt
        tmp.pairAddress = search_result.pairAddress
        setToken(tmp)
    }

    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">{text}</Tooltip>
    );

    const calculateAge = (timestamp) => {
        const now = (new Date()).getTime()
        const diff = (now - timestamp)
        const hours = Math.floor(diff / 60 / 60 / 1000)
        const days = Math.floor(hours / 24)
        if (days > 0) {
            return `${days} days ${hours % 24} hrs`
        } else {
            return `${hours} hrs`
        }
    }

    return (
        <>
            <Button className='mb-2' onClick={handleModalOpen}>Search for a Token</Button>

            <Modal show={showModal} onHide={handleModalClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Search</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSearchInputChange}>
                        <Row className="align-items-end">
                            <Col>
                                <Form.Group controlId="searchQuery">
                                    <Form.Label>Search Query <small>  (click the one you want to analyze)  </small></Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            {/* <Col md={{ "span": 2 }}>
                                <Form.Label>
                                    Set a snapshot time
                                </Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label={<OverlayTrigger
                                        placement="right"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={renderTooltip("Capture a snapshot of the holders at a specified amount of time after the token launched. Default is to get the current holders.")}
                                    >
                                        <QuestionCircle style={{ marginLeft: '5px' }} />
                                    </OverlayTrigger>}
                                    onChange={handleCheckboxChange}
                                />
                            </Col> */}
                            {showSnapshotTime && (
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Hours after launch</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            value={hoursAfterLaunch}
                                            onChange={handleHoursAfterLaunchChange}
                                        />
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>
                    </Form>

                    <ListGroup>
                        {searchResults.map((result, index) => (
                            <ListGroup.Item
                                key={index}
                                onClick={() => handleSearchClick(result)}
                                action
                            >
                                <Row>
                                    <Row className="mb-1">
                                        <Col md={{span: 3}}>
                                            Token: <strong>{result.token.name}</strong> ({result.token.symbol})
                                        </Col>
                                        <Col md={{span: 2}}>
                                            Age: {calculateAge(result.pairCreatedAt)}
                                        </Col>
                                        <Col>
                                            Liquidity: {
                                                result.liquidity ? 
                                                    result.liquidity.usd ? 
                                                        `$${Number(result.liquidity.usd).toFixed(0)}`
                                                        : `${Number(result.liquidity.base).toFixed(0)} ${result.baseToken.symbol}`
                                                        : 'N/A'
                                            }
                                        </Col>
                                    </Row>
                                    <Row className="mb-1">
                                        <Col md={{span: 3}}>
                                            {result.token.symbol}: {result.token.address.substring(0, 10)}...
                                        </Col>
                                        <Col md={{span: 2}}>
                                            Pair: {result.pairAddress.substring(0, 10)}...
                                        </Col>
                                        <Col>
                                            24H Volume: {`$${Number(result.h24vol).toFixed(0)}`}
                                        </Col>
                                    </Row>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SearchBox;