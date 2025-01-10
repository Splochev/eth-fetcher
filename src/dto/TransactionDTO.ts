export default interface TransactionDTO {
    id?: number;
    transactionHash: string;
    transactionStatus: number;
    blockHash: string | null;
    blockNumber: number | null;
    from: string;
    to: string | null;
    contractAddress: string | null;
    logsCount: number;
    input: string;
    value: string;
}