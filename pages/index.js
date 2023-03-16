import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Spinner, Placeholder, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Error from '../components/Error.js'
import SearchBox from '../components/SearchBox'


const Index = () => {
  const [token, setToken] = useState({});
  const [holders, setHolders] = useState([]);
  const [holderBalances, setHolderBalances] = useState([]);
  const [holderNames, setHolderNames] = useState([]);
  const [walletTimeStats, setWalletTimeStats] = useState([]);
  const [walletScores, setWalletScores] = useState([]);
  const [holderRugVsApe, setHolderRugVsApe] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    // declare the data fetching function
    const fetchWalletScores = async () => {
      var test = holders.length != 0 && holderBalances.length != 0;
      test = test && holderRugVsApe.length != 0;
      test = test && walletTimeStats.length != 0;
      test = test && holderNames.length != 0;
      if (test) {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/calculate-scores`,
          { holders: merge_holders() },
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

  useEffect(() => {
    console.log(token)
    if ((token && token.address) && token.pairCreatedAt) {
      console.log(token.pairCreatedAt)
      handleTestToken()
    }
  }, [token])

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
      var body = { address: token.address, start_date: token.pairCreatedAt }
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
    setWalletScores([])
    setWalletTimeStats([])
    setHolderBalances([])
    setHolderRugVsApe([])
    setHolderNames([])
    setIsLoading(true);
    try {

      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/get-holders`,
        { address: token.address, start_date: token.pairCreatedAt },
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
          var holderRugVsApeRes = await mutateHolderCall('/get-holder-rug-vs-ape', res.data)
          var walletTimeStatsRes = await mutateHolderCall('/get-wallet-time-stats', res.data)

          setHolderBalances(holderBalancesRes)
          setHolderRugVsApe(holderRugVsApeRes)
          setWalletTimeStats(walletTimeStatsRes)
        })
          .catch((err) => {
            console.log(err)
            setIsLoading(false);
            setError(err);
          })
        setIsLoading(false)
      }).catch((err) => {
        console.log(err)
        setIsLoading(false);
        setError(err);
      });
    } catch (err) {
      console.log(err)
      setIsLoading(false);
      setError(err);
    }
  };

  const calculate_average_score = () => {
    const sum = walletScores.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.wallet_score;
    }, 0);
    
    const average = sum / walletScores.length;

    return average
  }

  var dexscreener_url = token.address ? "https://dexscreener.com/arbitrum/" + token.pairAddress + "?embed=1&theme=dark" : ''
  return (
    <div className="root bg-dark text-light">
      <Container>

        <Row className={error != {} ? 'pt-4' : ''}>
          <Error className="pt-4" error={error} setError={setError} />
        </Row>
        <Row>
          <h1 className="text-center mt-4 mb-4">Wallet Wiz</h1>
        </Row>
        <Row>
          <SearchBox
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            setError={setError}
            handleTestToken={handleTestToken}
            setToken={setToken}
          />
        </Row>
        {token.address ?
          <Row>
            <div id="dexscreener-embed"><iframe src={dexscreener_url}></iframe></div>
          </Row>
          : ''
        }
        {
          walletScores.length != 0 ? 
            <Row className='mt-4'>
              <h4><strong>Average Wallet Score: {calculate_average_score()}</strong></h4>
            </Row> : ''
        }
        <Row>
          <Col>


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
                        <a href={`${process.env.NEXT_PUBLIC_ARBISCAN_URL}/address/${holder.address}`}>
                          {
                            holder.address_name ?
                              holder.address_name
                              : holder.address
                          }
                        </a>
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
                            walletTimeStats.length == 0 ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${holder.avg_time ? Number(holder.avg_time).toFixed(1) : '?'} hrs`
                            : 'N/A'
                        }
                      </td>
                      <td>
                        {
                          !holder.address_name ?
                            walletTimeStats.length == 0 ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${holder.wallet_age ? holder.wallet_age : '?'} days`
                            : 'N/A'
                        }
                      </td>
                      <td>
                        {
                          !holder.address_name ?
                            walletTimeStats.length == 0 ?
                              <Placeholder animation="glow">
                                <Placeholder xs={8} />
                              </Placeholder> :
                              `${holder.tx_count ? holder.tx_count : 0} txns`
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
                        Processing request for {token.address}
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
