import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table,  Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Error from '../components/Error.js'

const Index = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [holders, setHolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});

  const handleTestToken = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/test-token`, {
        address: tokenAddress
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      setHolders(response.data);
    } catch (err) {
      setIsLoading(false);
      setError(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="root bg-dark text-light">
      <Container>
        <Row className={error != '' ? 'pt-4' : ''}>
          <Error className="pt-4" error={error} setError={setError} />
        </Row>
        <Row>
          <Col>
            <h1 className="text-center mt-4 mb-4">Wallet Wiz</h1>
            <Row>
              <Form>
                <Form.Group as={Row} controlId="formTokenAddress">
                  <Form.Label column sm="2">Enter Token</Form.Label>
                  <Col sm="8">
                    <Form.Control type="text" placeholder="Token Address" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
                  </Col>
                  <Button as={Col} sm="2" variant="primary" onClick={handleTestToken} disabled={isLoading}>
                    {isLoading ? (<><Spinner size="sm" /> Loading...</>) : 'Get Holder Info'}
                  </Button>
                </Form.Group>

              </Form>
            </Row>
            {holders.length && !isLoading ? (
              <Table striped bordered hover variant="dark" className="mt-4">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Holder</th>
                    <th>Amount<br /><small>(tokens held)</small></th>
                    <th>Wallet Value<br /><small>(USDC, ETH, USDT)</small></th>
                    <th>Rugs / Apes<br /><small>(SushiSwap)</small></th>
                    <th>Avg Time Between TX <br /><small>(hours)</small></th>
                    <th>Wallet Age<br /><small>(days)</small></th>
                    <th>Tx Count</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{holder.address_name ? holder.address_name : holder.address}</td>
                      <td>{Number(holder.holding).toFixed(2)}</td>
                      <td>${Number(holder.wallet_value).toFixed(2)}</td>
                      <td>{!holder.address_name ? `${holder.rug_count} rugs / ${holder.ape_count} apes` : 'N/A'}</td>
                      <td>{!holder.address_name ? `${Number(holder.avg_time).toFixed(1)} hrs` : 'N/A'}</td>
                      <td>{!holder.address_name ? `${holder.wallet_age} days` : 'N/A'}</td>
                      <td>{!holder.address_name ? `${holder.tx_count} txns` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              !isLoading ? (
                <h3 className="no-token mt-4">No token address entered yet</h3>
              ) : (
                <>
                  <div className="text-center">
                    <Row className="mt-4">
                      <h3>
                        Processing request for {tokenAddress}
                      </h3>
                    </Row>
                    <Row>
                      <h5>Sit tight! This usually takes about 30 seconds</h5>
                    </Row>
                  </div>
                  <div className="bar mt-4">
                    <div className="in"></div>
                  </div> 
                  <br />
                </>
              )
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Index;
