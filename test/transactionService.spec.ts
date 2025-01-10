import * as transactionService from '../src/services/transactionService';
import * as transactionModel from '../src/models/transactionModel';
import { expect } from 'chai';
import sinon from 'sinon';
import { Request } from 'express';
import { ethers } from 'ethers';

describe('transactionService', () => {
    let getDBTransactionsStub: sinon.SinonStub;
    let providerGetTransactionStub: sinon.SinonStub;
    let providerGetTransactionReceiptStub: sinon.SinonStub;
    let insertTransactionsStub: sinon.SinonStub;
    let linkUserWithTransactionsStub: sinon.SinonStub;
    let findTransactionsByUserIdStub: sinon.SinonStub;
    let findTransactionsStub: sinon.SinonStub;

    const mockUser = { id: 1, username: 'testUser' };

    beforeEach(() => {
        getDBTransactionsStub = sinon.stub(transactionModel, 'getDBTransactions').resolves({
            transactionDTOSFromDB: [],
            transactionDTOSFromDBSet: new Set(),
            transactionIdsFromDB: [],
        });

        insertTransactionsStub = sinon.stub(transactionModel, 'insertTransactions').resolves([1, 2, 3]);
        linkUserWithTransactionsStub = sinon.stub(transactionModel, 'linkUserWithTransactions').resolves();
        findTransactionsByUserIdStub = sinon.stub(transactionModel, 'findTransactionsByUserId').resolves([{ id: 1, hash: '0x1' }, { id: 2, hash: '0x2' }]);
        findTransactionsStub = sinon.stub(transactionModel, 'findTransactions').resolves([{ id: 1, hash: '0x1' }, { id: 2, hash: '0x2' }]);
            
        providerGetTransactionStub = sinon.stub(ethers.JsonRpcProvider.prototype, 'getTransaction');
        providerGetTransactionReceiptStub = sinon.stub(ethers.JsonRpcProvider.prototype, 'getTransactionReceipt');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should decode RLP hex string correctly', () => {
        const rlpHex = 'f90110b842307866633262336236646233386135316462336239636239356465323962373139646538646562393936333036323665346234623939646630353666666237663265b842307834383630336637616466663766626663326131306232326136373130333331656536386632653464316364373361353834643537633838323164663739333536b842307863626339323065376262383963626362353430613436396131363232366266313035373832353238336162386561633366343564303038313165656638613634b842307836643630346666633634346132383266636138636238653737386531653366383234356438626431643439333236653330313661336338373862613063626264';
        const expectedHashes = [
            '0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e',
            '0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356',
            '0xcbc920e7bb89cbcb540a469a16226bf1057825283ab8eac3f45d00811eef8a64',
            '0x6d604ffc644a282fca8cb8e778e1e3f8245d8bd1d49326e3016a3c878ba0cbbd',
        ];

        const result = transactionService.decodeRLP(rlpHex);

        expect(result).to.deep.equal(expectedHashes);
    });

    it('should throw error if RLP hex is invalid', () => {
        const invalidRlpHex = 'invalidhexstring';

        try {
            transactionService.decodeRLP(invalidRlpHex);
        } catch (err: any) {
            expect(err.message).to.equal('Failed to fetch transactions');
        }
    });

    it('should extract parameters correctly from the request (with rlphex)', () => {
        const req = {
            params: { rlphex: 'validRlpHex' },
            query: { transactionHashes: [] },
        } as unknown as Request;

        const result = transactionService.extractGetEthParams(req);

        expect(result).to.deep.equal({ rlphex: 'validRlpHex', hashes: [] });
    });

    it('should throw error when both rlphex and transactionHashes are provided', () => {
        const req = {
            params: { rlphex: 'validRlpHex' },
            query: { transactionHashes: ['hash1'] },
        } as unknown as Request;

        try {
            transactionService.extractGetEthParams(req);
        } catch (err: any) {
            expect(err.message).to.equal('Please provide either rlphex or transactionHashes');
        }
    });

    it('should return transactions from the database and the chain', async () => {
        const mockTransactionHashes = [
            '0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e',
            '0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356',
        ];
    
        providerGetTransactionStub.resolves({ hash: mockTransactionHashes[0], from: '0x1', to: '0x2', value: '100' });
        providerGetTransactionReceiptStub.resolves({ contractAddress: null, logs: [] });
    
        const transactions = await transactionService.getTransactions(mockTransactionHashes, null);
    
        expect(transactions).to.be.an('object');
        expect(transactions).to.have.property('transactionDTOSFromDB');
        expect(transactions).to.have.property('transactionDTOSFromChain');
        expect(transactions.transactionDTOSFromDB).to.be.empty;
        expect(transactions.transactionDTOSFromChain).to.have.length(2);
        
        expect(getDBTransactionsStub.calledOnce).to.be.true;
        expect(insertTransactionsStub.calledOnce).to.be.true;
        expect(linkUserWithTransactionsStub.notCalled).to.be.true;
    
        getDBTransactionsStub.resolves({
            transactionDTOSFromDB: [
                { hash: mockTransactionHashes[0], from: '0x1', to: '0x2', value: '100' },
                { hash: mockTransactionHashes[1], from: '0x3', to: '0x4', value: '200' },
            ],
            transactionDTOSFromDBSet: new Set(mockTransactionHashes),
            transactionIdsFromDB: [1, 2],
        });
    
        const transactions2 = await transactionService.getTransactions(mockTransactionHashes, null);
    
        expect(transactions2).to.be.an('object');
        expect(transactions2).to.have.property('transactionDTOSFromDB');
        expect(transactions2).to.have.property('transactionDTOSFromChain');
        expect(transactions2.transactionDTOSFromChain).to.be.empty;
        expect(transactions2.transactionDTOSFromDB).to.have.length(2);
        expect(providerGetTransactionStub.calledTwice).to.be.true;
        expect(insertTransactionsStub.calledOnce).to.be.true;
        expect(linkUserWithTransactionsStub.notCalled).to.be.true;
    });

    it('should return empty object if no transactions are found', async () => {
        const transactionHashes = ['0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df0aaaaaaaaa'];

        getDBTransactionsStub.restore();
        providerGetTransactionStub.restore();
        providerGetTransactionReceiptStub.restore();
        
        const result = await transactionService.getTransactions(transactionHashes, null);

        expect(result).to.be.an('object');
        expect(result).to.have.property('transactionDTOSFromDB');
        expect(result).to.have.property('transactionDTOSFromChain');
        expect(result.transactionDTOSFromDB).to.be.empty;
        expect(result.transactionDTOSFromChain).to.be.empty;
    });

    it('should link transactions to mockuser', async () => {
        const transactionHashes = ['0xcbc920e7bb89cbcb540a469a16226bf1057825283ab8eac3f45d00811eef8a64', '0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356'];
        const result = await transactionService.getTransactions(transactionHashes, mockUser);
        expect(linkUserWithTransactionsStub.calledOnce).to.be.true;
    });
    
    it('should get user transactions correctly', async () => {
        const mockUserId = 1;

        const result = await transactionService.getUserTransactions(mockUserId);

        expect(result).to.deep.equal([{ id: 1, hash: '0x1' }, { id: 2, hash: '0x2' }]);
        expect(findTransactionsByUserIdStub.calledOnceWith(mockUserId)).to.be.true;
    });

    it('should return all transactions from the database', async () => {
        const result = await transactionService.getAll();

        expect(result).to.deep.equal([{ id: 1, hash: '0x1' }, { id: 2, hash: '0x2' }]);
        expect(findTransactionsStub.calledOnce).to.be.true;
    });

    it('should throw error if fetching transactions fails', async () => {
        const mockTransactionHashes = ['invalidHash'];
    
        providerGetTransactionStub.rejects(new Error('Failed to fetch transaction'));
        try {
            await transactionService.getTransactions(mockTransactionHashes, mockUser);
        } catch (err: any) {
            expect(err.message).to.equal('Failed to fetch transaction');
        }
    });
});