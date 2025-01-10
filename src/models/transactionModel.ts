import UserDto from '../dto/UserDto';
import TransactionDTO from '../dto/TransactionDTO';
import knex from "knex";
import config from "../knexfile";
const db = knex(config.development);

export async function insertTransactions(transactions: TransactionDTO[]) {
    try {
        if (!transactions.length) return [];
        const insertedData = await db("transactions").insert(transactions).returning("id");
        return insertedData.map(obj => obj.id);
    } catch (error) {
        throw new Error("Failed to insert transactions");
    }
}

export async function getDBTransactions(transactionHashes: string[]): Promise<{ transactionDTOSFromDB: TransactionDTO[], transactionDTOSFromDBSet: Set<string>, transactionIdsFromDB: number[] }> {
    try {
        const transactions = await db("transactions").select(
            "id", "transactionHash", "transactionStatus", "blockHash", "blockNumber",
            "from", "to", "contractAddress", "logsCount", "input", "value"
        ).whereIn("transactionHash", transactionHashes);

        const transactionIds: number[] = [];

        const transactionDTOSFromDBSet = new Set<string>();
        transactions.forEach(transaction => {
            transactionDTOSFromDBSet.add(transaction.transactionHash as string)
            transactionIds.push(transaction.id);
            delete transaction.id;
        });
        return { transactionDTOSFromDB: transactions, transactionDTOSFromDBSet, transactionIdsFromDB: transactionIds };
    } catch (error) {
        throw new Error("Failed to fetch transactions from DB");
    }
}

export async function linkUserWithTransactions(user: UserDto, transactionIds: number[]) {
    try {
        const userTransactions = transactionIds.map((transactionId) => ({ user_id: user.id, transaction_id: transactionId }));
        await db("users_transactions").insert(userTransactions).onConflict(["user_id", "transaction_id"]).ignore();
    } catch (error) {
        throw new Error("Failed to link user with transactions");
    }
}

export async function findTransactions() {
    try {
        const all = await db("transactions").select(
            "transactionHash", "transactionStatus", "blockHash", "blockNumber",
            "from", "to", "contractAddress", "logsCount", "input", "value"
        );

        return all;
    } catch (error) {
        throw new Error("Failed to fetch all transactions");
    }
}

export async function findTransactionsByUserId(userId?: number) {
    try {
        const myTransactions = await db("transactions")
            .join("users_transactions", "transactions.id", "users_transactions.transaction_id")
            .where("users_transactions.user_id", userId)
            .select(
                "transactionHash", "transactionStatus", "blockHash", "blockNumber",
                "from", "to", "contractAddress", "logsCount", "input", "value"
            );

        return myTransactions;
    } catch (error) {
        throw new Error("Failed to fetch my transactions");
    }
}