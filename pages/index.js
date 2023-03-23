import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Spinner, Placeholder, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Error from '../components/Error.js'
import SearchBox from '../components/SearchBox'
import FilterForm from '../components/FilterForm'
import TableHeadToolTip from '../components/TableHeadToolTip'


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
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterValues, setFilterValues] = useState({
    amount: 0,
    wallet_value: 0,
    rug_count: 0,
    ape_count: 0,
    avg_time: 0,
    wallet_age: 0,
    wallet_score: 0,
  });
  const [hoursAfterLaunch, setHoursAfterLaunch] = useState(-1);

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
    if ((token && token.address) && token.pairCreatedAt) {
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

  const filtered_holders = () => {
    if (!walletScores.length) {
      return sortedHolders
    }
    return sortedHolders.filter((holder) => {
      if (holder.is_contract) {
        return holder.holding >= filterValues.amount &&
        holder.wallet_value >= filterValues.wallet_value
      }
      return (
        (holder.holding == undefined || holder.holding >= filterValues.amount) &&
        (holder.wallet_value == undefined || holder.wallet_value >= filterValues.wallet_value) &&
        (holder.rug_count == undefined || holder.rug_count >= filterValues.rug_count) &&
        (holder.ape_count == undefined || holder.ape_count >= filterValues.ape_count) &&
        (holder.avg_time == undefined || holder.avg_time >= filterValues.avg_time) &&
        (holder.wallet_age == undefined || holder.wallet_age >= filterValues.wallet_age) &&
        (holder.wallet_score == undefined || holder.wallet_score >= filterValues.wallet_score - 50)
      );
    });
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

  function hoursToMilliseconds(hours) {
    return hours * 60 * 60 * 1000;
  }

  const handleTestToken = async () => {
    setHolders([]);
    setWalletScores([])
    setWalletTimeStats([])
    setHolderBalances([])
    setHolderRugVsApe([])
    setHolderNames([])
    setIsLoading(true);
    console.log(hoursAfterLaunch)
    console.log(hoursAfterLaunch != -1 ? token.pairCreatedAt + hoursToMilliseconds(hoursAfterLaunch) : -1)
    try {
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/get-holders`,
        { 
          address: token.address, 
          start_date: token.pairCreatedAt, 
          snapshot_time: hoursAfterLaunch != -1 ? token.pairCreatedAt + hoursToMilliseconds(hoursAfterLaunch) : -1},
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


          mutateHolderCall('/get-holder-balances', res.data)
            .then((holderBalancesRes) => {
              setHolderBalances(holderBalancesRes)
            })

          mutateHolderCall('/get-holder-rug-vs-ape', res.data)
            .then((holderRugVsApeRes) => {
              setHolderRugVsApe(holderRugVsApeRes)
            })

          mutateHolderCall('/get-wallet-time-stats', res.data)
            .then((walletTimeStatsRes) => {
              setWalletTimeStats(walletTimeStatsRes)
            })

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

  const sortedHolders = sortField
    ? [...merge_holders()].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    })
    : merge_holders();

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
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
        <Row
          className='align-items-center mb-4 mt-3'
        >
          <Col
            md={{ span: 2 }}
          >
            <a
              target="_blank"
              rel="noopener noreferrer"
              className='btn btn-secondary'
              href="https://t.me/WalletWiz"
            >
              Join
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" />
            </a>
          </Col>
          <Col
            md={{ span: 8 }}
          >
            <h1 className="text-center">Wallet Wiz</h1>
          </Col>
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
            setHoursAfterLaunch={setHoursAfterLaunch}
            hoursAfterLaunch={hoursAfterLaunch}
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
              <h4><strong>Average Wallet Health: {50 + calculate_average_score()}%</strong></h4>
            </Row> : ''
        }
        {
          holders.length ?
            <FilterForm
              filterValues={filterValues}
              setFilterValues={setFilterValues}
            />
            : ''
        }
        <Row>
          <Col>
            {holders.length != 0 ? (
              <Table striped bordered hover variant="dark" className="mt-4">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Holder <TableHeadToolTip headerName='holder' /></th>
                    <th onClick={() => handleSort("holding")}>
                      Amount<br />
                      <small>(tokens held)</small><br />
                      <Button
                        variant="link"
                        style={
                          sortField === "holding" && sortOrder === "asc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9650;
                      </Button>
                      <Button
                        variant="link"
                        style={
                          sortField === "holding" && sortOrder === "desc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9660;
                      </Button>
                      <TableHeadToolTip headerName='amount' />
                    </th>
                    <th onClick={() => handleSort("wallet_value")}>
                      Wallet Value<br />
                      <small>(USDC, ETH, USDT)</small><br />
                      <Button
                        variant="link"
                        style={
                          sortField === "wallet_value" && sortOrder === "asc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9650;
                      </Button>
                      <Button
                        variant="link"
                        style={
                          sortField === "wallet_value" && sortOrder === "desc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9660;
                      </Button>
                      <TableHeadToolTip headerName='wallet value' />
                    </th>
                    <th onClick={() => handleSort("rug_count")}>
                      Rugs / Apes<br />
                      <Button
                        variant="link"
                        style={
                          sortField === "rug_count" && sortOrder === "asc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9650;
                      </Button>
                      <Button
                        variant="link"
                        style={
                          sortField === "rug_count" && sortOrder === "desc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9660;
                      </Button>
                      <TableHeadToolTip headerName='rugs / apes' />
                    </th>
                    <th onClick={() => handleSort("avg_time")}>
                      Avg Time Between TX <br /><small>(hours)</small><br />
                      <Button
                        variant="link"
                        style={
                          sortField === "avg_time" && sortOrder === "asc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9650;
                      </Button>
                      <Button
                        variant="link"
                        style={
                          sortField === "avg_time" && sortOrder === "desc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9660;
                      </Button>
                      <TableHeadToolTip headerName='avg time between tx' />
                    </th>
                    <th onClick={() => handleSort("wallet_age")}>
                      Wallet Age<br /><small>(days)</small><br />
                      <Button
                        variant="link"
                        style={
                          sortField === "wallet_age" && sortOrder === "asc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9650;
                      </Button>
                      <Button
                        variant="link"
                        style={
                          sortField === "wallet_age" && sortOrder === "desc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9660;
                      </Button>
                      <TableHeadToolTip headerName='wallet age' />
                    </th>
                    <th onClick={() => handleSort("tx_count")}>
                      Tx Count<br />
                      <Button
                        variant="link"
                        style={
                          sortField === "tx_count" && sortOrder === "asc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9650;
                      </Button>
                      <Button
                        variant="link"
                        style={
                          sortField === "tx_count" && sortOrder === "desc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9660;
                      </Button>
                      <TableHeadToolTip headerName='tx count' />
                    </th>
                    <th onClick={() => handleSort("wallet_score")}>
                      Wallet Health<br />
                      <Button
                        variant="link"
                        style={
                          sortField === "wallet_score" && sortOrder === "asc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9650;
                      </Button>
                      <Button
                        variant="link"
                        style={
                          sortField === "wallet_score" && sortOrder === "desc"
                            ? { "color": "blue" }
                            : { "color": "grey" }
                        }
                        className="p-0 ml-1">
                        &#9660;
                      </Button>
                      <TableHeadToolTip headerName='wallet health' />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered_holders().map((holder, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`${process.env.NEXT_PUBLIC_ARBISCAN_URL}/address/${holder.address}`}
                        >
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
                              `${holder.wallet_score + 50}%`
                            : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              !isLoading ? (
                <h3 className="no-token mt-4">No token entered yet</h3>
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
