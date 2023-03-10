import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Spinner, Placeholder } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Error from '../components/Error.js'


const Index = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [holders, setHolders] = useState([]);
  const [holderBalances, setHolderBalances] = useState([]);
  const [holderNames, setHolderNames] = useState([]);
  const [walletTimeStats, setWalletTimeStats] = useState([]);
  const [walletScores, setWalletScores] = useState([]);
  const [holderRugVsApe, setHolderRugVsApe] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});

  useEffect(() => {
    // declare the data fetching function
    const fetchWalletScores = async () => {
      var test = holders.length != 0 && holderBalances.length != 0;
      test = test && holderRugVsApe.length != 0;
      test = test && walletTimeStats.length != 0;
      test = test && holderNames.length != 0;
      if (test) {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/calculate-scores`,
          { holders: merge_holders()},
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
        setWalletScores(response.data)
      }
    }

    // call the function
    fetchWalletScores()
      // make sure to catch any error
      .catch(console.error);
  }, [holders, holderBalances, holderRugVsApe, walletTimeStats, holderNames])

  const merge_holders = () => {
    var merged = [];
    for (let i = 0; i < holders.length; i++) {
      merged.push({
        ...holders[i],
        ...(holderNames.find((item) => item.address == holders[i].address)),
        ...(walletTimeStats.find((item) => item.address == holders[i].address)),
        ...(holderRugVsApe.find((item) => item.address == holders[i].address)),
        ...(holderBalances.find((item) => item.address == holders[i].address)),
        ...(walletScores.find((item) => item.address == holders[i].address)),
      })
    }
    return merged
  }

  const mutateHolderCall = async (route, cur_holders) => {
    if (route == '/get-holders') {
      var body = { address: tokenAddress }
    } else {
      var body = { holders: cur_holders }
    }
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${route}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
    return response.data
  }

  const handleTestToken = async () => {
    setHolders([]);
    setIsLoading(true);
    try {

      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/get-holders`,
        { address: tokenAddress },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      ).then(async (res) => {
        setHolders(res.data)

        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/get-contract-names`,
          { holders: res.data },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        ).then(async (res) => {
          setHolderNames(res.data)

          var holderBalancesRes = await mutateHolderCall('/get-holder-balances', res.data)
          setHolderBalances(holderBalancesRes)

          var holderRugVsApeRes = await mutateHolderCall('/get-holder-rug-vs-ape', res.data)
          setHolderRugVsApe(holderRugVsApeRes)

          var walletTimeStatsRes = await mutateHolderCall('/get-wallet-time-stats', res.data)
          setWalletTimeStats(walletTimeStatsRes)
        })
        // .finally(async () => {
        //   var wallet_scores = await mutateHolderCall('/calculate-scores', merge_holders())
        //   console.log(merge_holders().length)
        //   console.log(wallet_scores)
        //   setWalletScores(wallet_scores)
        // })
        setIsLoading(false)
      });
    } catch (err) {
      console.log(err)
      setIsLoading(false);
      setError(err);
    }
  };

  return (
    <div className="root bg-dark text-light">
      <Container>
        <Row className={error != {} ? 'pt-4' : ''}>
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
            {holders.length != 0 ? (
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
                    <th>Wallet Health</th>
                  </tr>
                </thead>
                <tbody>
                  {merge_holders().map((holder, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {
                          holder.address_name ?
                            holder.address_name
                            : holder.address
                        }
                      </td>
                      <td>
                        {
                          Number(holder.holding).toFixed(2)
                        }
                      </td>
                      <td>
                        ${
                          holder.wallet_value != undefined ?
                            Number(holder.wallet_value).toFixed(2)
                            :
                            <Placeholder animation="glow">
                              <Placeholder xs={8} />
                            </Placeholder>
                        }
                      </td>
                      <td>
                        {
                          !holder.address_name
                            ? holder.rug_count == undefined ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${holder.rug_count} rugs / ${holder.ape_count} apes`
                            : 'N/A'
                        }
                      </td>
                      <td>
                        {
                          !holder.address_name ?
                            holder.avg_time == undefined ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${Number(holder.avg_time).toFixed(1)} hrs`
                            : 'N/A'
                        }
                      </td>
                      <td>
                        {
                          !holder.address_name ?
                            holder.wallet_age == undefined ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${holder.wallet_age} days`
                            : 'N/A'
                        }
                      </td>
                      <td>
                        {
                          !holder.address_name ?
                            holder.tx_count == undefined ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${holder.tx_count} txns`
                            : 'N/A'
                        }
                      </td>
                      <td>
                        {
                          !holder.address_name ?
                            holder.wallet_score == undefined ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${holder.wallet_score}`
                            : 'N/A'
                        }
                      </td>
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
