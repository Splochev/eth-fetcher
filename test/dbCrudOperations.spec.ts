import { expect } from 'chai';
import * as transactionModel from '../src/models/transactionModel';
import * as userModel from '../src/models/userModel';
import knex from 'knex';
import sinon from 'sinon';
import config from '../src/knexfile';
import TransactionDTO from '../src/dto/TransactionDTO';

const db = knex(config.development);

describe('Database CRUD operations', () => {
    let mock_user_id: number;
    
    before(async () => {
        await db.migrate.latest();
    });

    it('should delete all insertions', async () => {
        await db('users_transactions').leftJoin('users', 'users_transactions.user_id', 'users.id').where('users.username', 'ilike', '%test@@@test@@@user%').delete();
        await db('users').where('username', 'ilike', '%test@@@test@@@user%').delete();
        await db('transactions').where('transactionHash', 'ilike', '%____test____%').delete();
    });

    it('should insert a new user', async () => {
        const user = {
            username: 'test@@@test@@@user',
            password: 'test@@@test@@@user',
        };
        const userId = await userModel.insertUser(user);
        mock_user_id = userId;
        expect(userId).to.be.a('number');
    });

    it('should get a user by username', async () => {
        const user = await userModel.findUserByUsername('test@@@test@@@user');
        expect(user).to.be.an('object');
        expect(user.username).to.equal('test@@@test@@@user');
    });

    it('should get a user by id', async () => {
        const user = await userModel.findUserById(mock_user_id);
        expect(user).to.be.an('object');
        expect(user.username).to.equal('test@@@test@@@user');
    });

    it('should insert new transactions', async () => {
        const transactions = [
            {
                "transactionHash": "0x48603f7adff7fbfc____test____331ee68f2e4d1cd73a584d57c8821df79356",
                "transactionStatus": 1,
                "blockHash": "0x61914f9b5d11dcf30b943f9b6adf4d1c965f31de9157094ec2c51714cb505577",
                "blockNumber": 5703601,
                "from": "0x1fc35B79FB11Ea7D4532dA128DfA9Db573C51b09",
                "to": "0xAa449E0226B45D2044B1f721D04001fDe02ABb08",
                "contractAddress": null,
                "logsCount": 0,
                "input": "0x",
                "value": "500000000000000000"
            },
            {
                "transactionHash": "0xcbc920e7bb89cbcb____test____6bf1057825283ab8eac3f45d00811eef8a64",
                "transactionStatus": 1,
                "blockHash": "0xc5a3664f031da2458646a01e18e6957fd1f43715524d94b7336a004b5635837d",
                "blockNumber": 5702816,
                "from": "0xd5e6f34bBd4251195c03e7Bf3660677Ed2315f70",
                "to": "0x4c16D8C078eF6B56700C1BE19a336915962df072",
                "contractAddress": null,
                "logsCount": 1,
                "input": "0x6a627842000000000000000000000000d5e6f34bbd4251195c03e7bf3660677ed2315f70",
                "value": "0"
            },
            {
                "transactionHash": "0x6d604ffc644a282f____test____e3f8245d8bd1d49326e3016a3c878ba0cbbd",
                "transactionStatus": 1,
                "blockHash": "0x7912669279e63809e02890644fb6584876685856545771319a1063687a382b76",
                "blockNumber": 5703703,
                "from": "0xA0Fcc5F09B4D221AB1C69F1798BD1F5E5F167139",
                "to": "0xE0E6b9851f2a67B21dC467fd06bE8cD26A851087",
                "contractAddress": null,
                "logsCount": 0,
                "input": "0xa9059cbb000000000000000000000000e0e6b9851f2a67b21dc467fd06be8cd26a8510870000000000000000000000000000000000000000000000000de0b6b3a7640000",
                "value": "0"
            }
        ] as TransactionDTO[];

        const transactionIds = await transactionModel.insertTransactions(transactions);
        expect(transactionIds).to.be.an('array');
        expect(transactionIds).to.have.length(3);
        expect(transactionIds[0]).to.be.a('number');
    });

    it('should get all transactions by transaction hashes', async () => {
        const hashes = [
            '0x48603f7adff7fbfc____test____331ee68f2e4d1cd73a584d57c8821df79356',
            '0xcbc920e7bb89cbcb____test____6bf1057825283ab8eac3f45d00811eef8a64'
        ];
        const transactions = await transactionModel.getDBTransactions(hashes);
        expect(transactions.transactionDTOSFromDB).to.be.an('array');
        expect(transactions.transactionDTOSFromDB).to.have.length(2);
        expect(transactions.transactionDTOSFromDB[0]).to.be.an('object');
        expect(transactions.transactionDTOSFromDB[0].transactionHash).to.equal(hashes[0]);
    });

    it('should get all transactions', async () => {
        const transactions = await transactionModel.findTransactions();
        expect(transactions).to.be.an('array');
        expect(transactions).to.have.length(3);
        expect(transactions[0]).to.be.an('object');
    });

    it('should link a user with transactions', async () => {
        const user = { id: mock_user_id, username: 'test@@@test@@@user' };
        const transactionIds = await db('transactions').select('id');
        await transactionModel.linkUserWithTransactions(user, transactionIds.map(obj => obj.id));
    });

    it('should get all transactions by user id', async () => {
        const transactions = await transactionModel.findTransactionsByUserId(mock_user_id);
        expect(transactions).to.be.an('array');
        expect(transactions).to.have.length(3);
        expect(transactions[0]).to.be.an('object');
    });

    it('should delete all insertions', async () => {
        await db('users_transactions').where('user_id', '=', mock_user_id).delete();
        await db('users').where('id', '=', mock_user_id).delete();
        await db('transactions').where('transactionHash', 'ilike', '%____test____%').delete();
    });
});
