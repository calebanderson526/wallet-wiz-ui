import { Col, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


const Header = ({
    setChain
}) => {
    return (
        <>
            <Col
                md={{ span: 1 }}
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
                md={{ span: 1 }}
            >
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className='btn btn-secondary'
                    href="https://wallet-wiz.gitbook.io/wallet-wiz/"
                >
                    Docs <br />
                    <img width="25px" height="auto" src="https://www.vectorlogo.zone/logos/gitbook/gitbook-icon.svg" />
                </a>
            </Col>
            <Col md={{span: 2}}>
                <Form>
                    <Form.Group controlId="chainSelect">
                        <Form.Label>Choose Chain</Form.Label>
                        <Form.Select onChange={(e) => setChain(e.target.value)}>
                            <option>Arbitrum</option>
                            <option>Ethereum</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Col>
            <Col
                md={{ span: 4 }}
            >
                <h1 className="text-center">Wallet Wiz</h1>
            </Col>
        </>
    )
}

export default Header