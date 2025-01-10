import UserDto from '../dto/UserDto';
import { Request } from 'express';
import RLP from 'rlp';
import { ethers } from 'ethers';
import { TransactionResponse, TransactionReceipt } from "ethers";
import TransactionDTO from '../dto/TransactionDTO';
import dotenv from 'dotenv';
import {findUserById} from '../models/userModel';
import { linkUserWithTransactions, getDBTransactions, insertTransactions, findTransactionsByUserId, findTransactions } from '../models/transactionModel';
dotenv.config();

const ALCHEMY_URL = process.env.ETH_NODE_URL;
if (!ALCHEMY_URL) throw new Error("ETH_NODE_URL is not set");

const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);

export async function getEth(req: Request, user: UserDto | null) {
    if (user) {
        const userFromDB = await findUserById(user.id);
        if (!userFromDB) throw new Error("User not found in DB");
    }
    let { rlphex, hashes } = extractGetEthParams(req);
    if (rlphex) hashes = getRLPHashes(rlphex, user);
    const data = await getTransactions(hashes, user);
    return [...data.transactionDTOSFromChain, ...data.transactionDTOSFromDB];
}

export function extractGetEthParams(req: Request): { rlphex: string, hashes: string[] } {
    const { rlphex } = req.params;
    const hashes: string[] = [];

    if (Array.isArray(req.query.transactionHashes)) {
        hashes.push(...req.query.transactionHashes as string[]);
    } else if (req.query.transactionHashes) {
        hashes.push(req.query.transactionHashes as string);
    }

    if ((!rlphex && !hashes.length) || (rlphex && hashes.length)) {
        throw new Error("Please provide either rlphex or transactionHashes");
    }

    return { rlphex, hashes };
}

export function getRLPHashes(rlphex: string, user: UserDto | null): string[] {
    try {
        let transactionHashes = decodeRLP(rlphex);
        return transactionHashes;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getTransactions(transactionHashes: string[], user: UserDto | null) {
    try {
        const { transactionDTOSFromDB, transactionDTOSFromDBSet, transactionIdsFromDB } = await getDBTransactions(transactionHashes);
        transactionHashes = transactionHashes.filter((hash) => !transactionDTOSFromDBSet.has(hash));
        const transactionDTOS = transactionHashes.length ? await getChainTransactions(transactionHashes) : [];
        const transactionIds = transactionDTOS.length ? await insertTransactions(transactionDTOS) : [];
        if (user) await linkUserWithTransactions(user, [...transactionIds, ...transactionIdsFromDB]);
        return { transactionDTOSFromChain: transactionDTOS, transactionDTOSFromDB: transactionDTOSFromDB };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getChainTransactions(transactionHashes: string[]): Promise<TransactionDTO[]> {
    const promises: Promise<TransactionResponse | null>[] = [];
    const receiptPromises: Promise<TransactionReceipt | null>[] = [];

    transactionHashes.forEach((transactionHash) => {
        promises.push(provider.getTransaction(transactionHash))
        receiptPromises.push(provider.getTransactionReceipt(transactionHash))
    });

    const transactions = await Promise.all(promises);
    const receipts = await Promise.all(receiptPromises);

    const transactionDTOS: TransactionDTO[] = [];
    
    transactions.forEach((transaction, i) => {
        const receipt = receipts[i];

        if (!transaction) return;

        const contractAddress = receipt?.contractAddress || null;
        const logsCount = receipt?.logs ? receipt.logs.length : 0;

        transactionDTOS.push({
            transactionHash: transaction.hash,
            transactionStatus: transaction.blockNumber === null ? 0 : 1,
            blockHash: transaction.blockHash,
            blockNumber: transaction.blockNumber,
            from: transaction.from,
            to: transaction.to,
            contractAddress,
            logsCount,
            input: transaction.data,
            value: transaction.value.toString(),
        });
    });

    return transactionDTOS;
}

export function decodeRLP(rlphex: string) {
    const buffer = Buffer.from(rlphex, 'hex');
    const decodedData = RLP.decode(buffer) as Buffer[];
    let transactionHashes = decodedData.map((data) => data.toString('utf8'));
    return transactionHashes;
}

export async function getUserTransactions(userId: number) {
    try {
        const transactions = await findTransactionsByUserId(userId);
        return transactions;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getAll() {
    try {
        const transactions = await findTransactions()
        return transactions;
    } catch (error: any) {
        throw new Error(error.message);
    }
}