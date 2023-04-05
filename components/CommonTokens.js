import { React, useState } from 'react';
import { Card, Table, Placeholder } from 'react-bootstrap';
import TableHeadToolTip from '../components/TableHeadToolTip'
import Pagination from 'react-bootstrap/Pagination'

const CommonTokens = ({ commonTokens, text, showCommonCards }) => {
  const [currentPage, setCurrentPage] = useState(1);
  var rowsPerPage = 5 // change this to the desired number of rows per page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  var rows = commonTokens
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  }

  const paginationNums = () => {
    if (currentPage + 2 >= totalPages) {
      return { first: currentPage - 4 + totalPages - currentPage, last: totalPages }
    } else if (currentPage - 2 <= 1) {
      return { first: 1, last: 5 }
    } else {
      return { first: currentPage - 2, last: currentPage + 2 }
    }
  }

  var placeholderArr = [1, 2, 3, 4, 5]
  if (!showCommonCards) {
    return ''
  }
  return (
    <Card size="sm" className='bg-dark'>
      <Card.Header>
        <Card.Title className='text-white'><strong>Common {text}</strong><TableHeadToolTip headerName={`common ${text}`} /></Card.Title>

      </Card.Header>
      <Card.Body>
        <Table striped hover>
          <thead>
            <tr className='text-white'>
              <th>#</th>
              <th>Address</th>
              <th># of Traders</th>
            </tr>
          </thead>
          <tbody>
            {
              commonTokens.length != 0 ? currentRows.map((token, index) => (
                <tr key={index}>
                  <td className='text-white'>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className='text-white'>
                    <a
                      href={`https://arbiscan.io/address/${token.address ? token.address : token.funder}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {!token.name ? token.funder ? token.funder.slice(0, 8) + '. . .' + token.funder.slice(token.funder.length - 8, token.funder.length - 1) : 'Unknown Token' : token.name}
                    </a>
                  </td>
                  <td className='text-white'>{token.count}</td>
                </tr>
              )) :
                placeholderArr.map((token, index) => (
                  <tr key={index}>
                    <td className='text-white'>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className='text-white'>
                      <Placeholder animation="glow">
                        <Placeholder xs={8} />
                      </Placeholder>
                    </td>
                    <td className='text-white'>
                      <Placeholder animation="glow">
                        <Placeholder xs={8} />
                      </Placeholder>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </Table>

        <Pagination
          className="mt-4"
          size="sm"
          activePage={currentPage}
          itemsCountPerPage={rowsPerPage}
          totalItemsCount={rows.length}
          pageRangeDisplayed={totalPages}
          onChange={handlePageChange}
        >
          <Pagination.First onClick={() => handlePageChange(1)} />
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1 <= 0 ? 1 : currentPage - 1)} />

          {[...Array(Math.ceil(rows.length / rowsPerPage)).keys()].slice(paginationNums().first - 1, paginationNums().last).map(
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
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1 >= totalPages ? totalPages : currentPage + 1)} />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} />
        </Pagination>

      </Card.Body>
    </Card>
  );
};

export default CommonTokens;