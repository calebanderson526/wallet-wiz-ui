import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const SearchBox = ({
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    setToken
}) => {
    
    const [showModal, setShowModal] = useState(false);
   
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
        // Filter out objects with chainId not equal to 'arbitrum'
        let filtered = objects.filter(obj => obj.chainId === 'arbitrum');
      
        // Filter out objects without pairCreatedAt property
        filtered = filtered.filter(obj => obj.pairCreatedAt !== undefined);
        // Filter out objects without liquidity property
        filtered = filtered.filter(obj => obj.liquidity.usd !== undefined);
      
        // Create two new objects for each original object
        const tokenObjects = filtered.flatMap(obj => [
          { token: obj.baseToken, pairCreatedAt: obj.pairCreatedAt, pairAddress: obj.pairAddress },
          { token: obj.quoteToken, pairCreatedAt: obj.pairCreatedAt, pairAddress: obj.pairAddress }
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

    return (
        <>
            <Button onClick={handleModalOpen}>Search for a Token</Button>

            <Modal show={showModal} onHide={handleModalClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Search</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleSearchInputChange}>
                        <Form.Group controlId="searchQuery">
                            <Form.Label>Search Query</Form.Label>
                            <Form.Control
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                            />
                        </Form.Group>
                    </Form>

                    <ListGroup>
                        {searchResults.map((result, index) => (
                            <ListGroup.Item 
                                key={index}
                                onClick={() => handleSearchClick(result)}
                                action
                            >
                                <Row>
                                    <Col>
                                        Name: {result.token.name}
                                    </Col>
                                    <Col>
                                        Symbol: {result.token.symbol}
                                    </Col>
                                    <Col>
                                        Address: {result.token.address.substring(0,10)}...
                                    </Col>
                                    <Col>
                                        Created: {new Date(result.pairCreatedAt).toString()}
                                    </Col>
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