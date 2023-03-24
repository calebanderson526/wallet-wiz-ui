import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';

const TableHeadToolTip = ({ headerName }) => {
    const renderTooltip = (text) => (
        <Tooltip id="button-tooltip">{text}</Tooltip>
    );

    const getTooltipText = () => {
        switch (headerName) {
            case 'holder':
                return 'The public address or address label for the holder of the token.';
            case 'amount':
                return 'The amount of the token held in the wallet or account.';
            case 'wallet value':
                return 'The total value of the wallet or account, including ETH, USDC, USDT holdings.';
            case 'rugs / apes':
                return 'Apes is the number of unique tokens transferred from the account. A rug is a token that was aped but has no transactions in the last 10 hours.';
            case 'avg time between tx':
                return 'The average time between transactions in the wallet or account.';
            case 'wallet age':
                return 'The age of the wallet or account, measured from the first transaction.';
            case 'tx count':
                return 'The total number of transactions made by the wallet or account.';
            case 'wallet health':
                return 'A cumulative score calculated using the on chain data analyzed by Wallet Wiz';
            case 'common apes':
                return 'These are the apes and how common they were (tokens transferred from wallet) among the top 50 holders.'
            case 'common rugs':
                return 'These are the rugs and how common they were (tokens with no recent transfers) among the top 50 holders'
            default:
                return '';
        }
    };

    return (
        <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip(getTooltipText())}
        >
            <QuestionCircle style={{ marginLeft: '5px' }} />
        </OverlayTrigger>
    );
};

export default TableHeadToolTip;