import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Spinner, Placeholder, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Error from '../components/Error.js'
import SearchBox from '../components/SearchBox'
import FilterForm from '../components/FilterForm'
import TableHeadToolTip from '../components/TableHeadToolTip'
import CommonTokens from '../components/CommonTokens'
import HolderTable from '../components/HolderTable'


const Index = () => {
  const [token, setToken] = useState({});
  const [holders, setHolders] = useState([]);
  const [holderBalances, setHolderBalances] = useState([]);
  const [holderNames, setHolderNames] = useState([]);
  const [walletTimeStats, setWalletTimeStats] = useState([]);
  const [holderRugVsApe, setHolderRugVsApe] = useState([]);
  const [holderEarlyAlpha, setHolderEarlyAlpha] = useState([])
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
  });
  const [hoursAfterLaunch, setHoursAfterLaunch] = useState(-1);
  const [commonRugs, setCommonRugs] = useState([])
  const [commonApes, setCommonApes] = useState([])
  const [showCommonCards, setShowCommonCards] = useState(false)


  useEffect(() => {
    if ((token && token.address) && token.pairCreatedAt) {
      handleTestToken()
      setShowCommonCards(true)
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
        ...(holderEarlyAlpha.find((item) => item.address == holders[i].address)),
      })
    }
    return merged
  }

  const filtered_holders = () => {
    if (isLoading) {
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
        (holder.wallet_age == undefined || holder.wallet_age >= filterValues.wallet_age)
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
    console.log(response.data)
    return response.data
  }

  function hoursToMilliseconds(hours) {
    return hours * 60 * 60 * 1000;
  }

  const handleTestToken = async () => {
    setHolders([]);
    setWalletTimeStats([])
    setHolderBalances([])
    setHolderRugVsApe([])
    setHolderNames([])
    setCommonRugs([])
    setCommonApes([])
    setHolderEarlyAlpha([])
    setIsLoading(true);
    try {
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/holders`,
        {
          address: token.address,
          start_date: token.pairCreatedAt,
          snapshot_time: hoursAfterLaunch != -1 ? token.pairCreatedAt + hoursToMilliseconds(hoursAfterLaunch) : -1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      ).then(async (res) => {
        setHolders(res.data.holders)
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contract-names`,
          { holders: res.data.holders },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        ).then(async (res) => {
          setHolderNames(res.data.holders)


          mutateHolderCall('/holder-balances', res.data.holders)
            .then((holderBalancesRes) => {
              setHolderBalances(holderBalancesRes.holders)
            }).catch((error) => {
              setError(error)
            })

          mutateHolderCall('/holder-rug-vs-ape', res.data.holders)
            .then((holderRugVsApeRes) => {
              setHolderRugVsApe(holderRugVsApeRes.holders)
              setCommonRugs(holderRugVsApeRes.common_rugs)
              setCommonApes(holderRugVsApeRes.common_apes)
            }).catch((error) => {
              setError(error)
            })

          mutateHolderCall('/early-alpha', res.data.holders)
            .then((earlyAlphaRes) => {
              setHolderEarlyAlpha(earlyAlphaRes.holders)
            }).catch((error) => {
              setError(error)
            })

          mutateHolderCall('/wallet-time-stats', res.data.holders)
            .then((walletTimeStatsRes) => {
              setWalletTimeStats(walletTimeStatsRes.holders)
            }).catch((error) => {
              setError(error)
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

        <Row className='mt-4'>
          <Col md={{ 'offset': 1, 'span': 5 }}>
            <CommonTokens
              commonTokens={commonApes}
              text={'apes'}
              showCommonCards={showCommonCards} />
          </Col>
          <Col md={{ 'offset': 0, 'span': 5 }}>
            <CommonTokens
              commonTokens={commonRugs}
              text={'rugs'}
              showCommonCards={showCommonCards}
            />
          </Col>
        </Row>
        <Row className={error != {} ? 'pt-4' : ''}>
          <Error className="pt-4" error={error} setError={setError} />
        </Row>
        {token.address ?
          <>
            <Row className='mt-4 mb-2'>
              <Col>
                <FilterForm
                  filterValues={filterValues}
                  setFilterValues={setFilterValues}
                />
              </Col>
            </Row>
          </>
          : ''
        }
        <Row>
          <Col>
            {
              !isLoading && holders.length == 0 ? (
                <h3 className="no-token mt-4">No token entered yet</h3>
              ) : (
                <>
                  <HolderTable
                    sortField={sortField}
                    sortOrder={sortOrder}
                    handleSort={handleSort}
                    holders={holders}
                    filtered_holders={filtered_holders}
                    walletTimeStats={walletTimeStats}
                    holderEarlyAlpha={holderEarlyAlpha}
                  />
                </>
              )
            }
          </Col>
        </Row>
      </Container>
    </div >
  );
};

export default Index;
