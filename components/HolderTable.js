import { React, useState } from 'react';
import { Button, Table, Placeholder, Row, Col } from 'react-bootstrap';
import TableHeadToolTip from '../components/TableHeadToolTip'
import Pagination from 'react-bootstrap/Pagination'


const HolderTable = ({
    sortField,
    sortOrder,
    handleSort,
    walletTimeStats,
    filtered_holders,
    holderEarlyAlpha,
    chain
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25) // change this to the desired number of rows per page
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    var placeholderArr = [...(new Array(rowsPerPage))]
    var rows = filtered_holders()
    const currentRows =
        filtered_holders().length != 0 ?
            rows.slice(indexOfFirstRow, indexOfLastRow)
            : placeholderArr;
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    }

    const handleItemsCountChange = () => {
        if (rowsPerPage == 25) {
            setRowsPerPage(50)
        } else {
            setRowsPerPage(25)
        }
    }

    function calculateAverage(numbers) {
        let sum = 0;
        for (let i = 0; i < numbers.length; i++) {
            sum += numbers[i];
        }
        return sum / numbers.length;
    }

    const tableAverages = () => {
        if (!rows.length || !walletTimeStats.length || !holderEarlyAlpha.length) {
            return ''
        }
        return (
            <tr>
                <th></th>
                <th>Averages</th>
                <th>{Number(calculateAverage(rows.map(r => r.holding)) * 100).toFixed(3) + ' %'}</th>
                <th>{'$' + Number(calculateAverage(rows.map(r => r.wallet_value))).toFixed(2)}</th>
                {/* <th>{Number(calculateAverage(rows.map(r => r.early_alpha ? r.early_alpha.length : 0))).toFixed(2) + ' tokens'}</th> */}
                <th>{Number(calculateAverage(rows.map(r => r.rug_count ? r.rug_count : 0))).toFixed(2) + ' rugs'}</th>
                <th>{Number(calculateAverage(rows.map(r => r.avg_time ? r.avg_time : 0))).toFixed(2) + ' hours'}</th>
                <th>{Number(calculateAverage(rows.map(r => r.wallet_age ? r.wallet_age : 0))).toFixed(2) + ' days'}</th>
                <th>{Number(calculateAverage(rows.map(r => r.tx_count ? r.tx_count : 0))).toFixed(2) + ' txns'}</th>
            </tr>
        )
    }

    var block_exp_url = chain.toLowerCase() == 'ethereum' ? process.env.NEXT_PUBLIC_ETHEREUM_EXP : process.env.NEXT_PUBLIC_ARBITRUM_EXP

    return (
        <>
            <Row>
                <Table striped bordered hover variant="dark" className="mt-4">
                    <thead>
                        {tableAverages()}
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
                            {/* <th>
                                Early Alpha <br />
                                <TableHeadToolTip headerName='early alpha' />
                            </th> */}
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
                        </tr>
                    </thead>
                    <tbody>
                        {
                            currentRows.map((holder, index) => (
                                <tr key={index}>
                                    <td>{indexOfFirstRow + index + 1}</td>
                                    <td>
                                        {
                                            holder ?
                                                <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={`${block_exp_url}/address/${holder.address}`}
                                                >
                                                    {
                                                        holder.address_name ?
                                                            holder.address_name
                                                            : holder.address
                                                    }
                                                </a>
                                                :
                                                <Placeholder animation="glow">
                                                    <Placeholder xs={8} />
                                                </Placeholder>
                                        }
                                    </td>
                                    <td>
                                        {
                                            holder && holder.holding ?
                                                Number(holder.holding * 100).toFixed(3) + ' %'
                                                :
                                                <Placeholder animation="glow">
                                                    <Placeholder xs={8} />
                                                </Placeholder>
                                        }
                                    </td>
                                    <td>
                                        ${
                                            holder && holder.wallet_value != undefined ?
                                                Number(holder.wallet_value).toFixed(2)
                                                :
                                                <Placeholder animation="glow">
                                                    <Placeholder xs={8} />
                                                </Placeholder>
                                        }
                                    </td>
                                    {/* <td>
                                        {
                                            holder && !holder.address_name
                                                ? holder && holderEarlyAlpha.length == 0 ?
                                                    <Placeholder animation="glow">
                                                        <Placeholder xs={8} />
                                                    </Placeholder> :
                                                    <ul>{
                                                        holder.early_alpha ?
                                                            holder.early_alpha.map((item, index) => (
                                                                <>
                                                                    <li>
                                                                        <a href={`${process.env.NEXT_PUBLIC_ARBISCAN_URL}/address/${item.token_address}`}>
                                                                            {item.name}
                                                                        </a>
                                                                    </li>
                                                                </>
                                                            )) : ''
                                                    }</ul>
                                                : 'N/A'
                                        }
                                    </td> */}
                                    <td>
                                        {
                                            holder && !holder.address_name
                                                ? holder && holder.rug_count == undefined ?
                                                    <Placeholder animation="glow">
                                                        <Placeholder xs={8} />
                                                    </Placeholder> :
                                                    `${holder.rug_count} rugs / ${holder.ape_count} apes`
                                                : 'N/A'
                                        }
                                    </td>
                                    <td>
                                        {
                                            holder && !holder.address_name ?
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
                                            holder && !holder.address_name ?
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
                                            holder && !holder.address_name ?
                                                walletTimeStats.length == 0 ?
                                                    <Placeholder animation="glow">
                                                        <Placeholder xs={8} />
                                                    </Placeholder> :
                                                    `${holder.tx_count ? holder.tx_count : 0} txns`
                                                : 'N/A'
                                        }
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Row>
            <Row className='align-items-center'>
                <Col md={{ "span": "1" }}>
                    <Pagination
                        className="mt-4"
                        size="sm"
                        activePage={currentPage}
                        itemsCountPerPage={rowsPerPage}
                        totalItemsCount={rows.length}
                        pageRangeDisplayed={totalPages}
                        onChange={handlePageChange}
                    >

                        {[...Array(Math.ceil(rows.length / rowsPerPage)).keys()].map(
                            (pageNumber) => (
                                <Pagination.Item
                                    key={pageNumber}
                                    active={pageNumber + 1 === currentPage}
                                    onClick={() => handlePageChange(pageNumber + 1)}
                                >
                                    {pageNumber + 1}
                                </Pagination.Item>
                            )
                        )}

                    </Pagination>
                </Col>
                <Col>
                    <Button variant='link' onClick={handleItemsCountChange}>
                        Show {rowsPerPage == 25 ? 'all' : 'less'}
                    </Button>
                </Col>
            </Row>


        </>
    )
}

export default HolderTable