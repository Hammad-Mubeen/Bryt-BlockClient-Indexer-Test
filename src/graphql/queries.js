const {
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} = require("graphql");

// import types
const { blocksType } = require("./types/blocks");
const { blocksWithCountType } = require("./types/blocksWithCount");
const { transactionsType } = require("./types/transactions");
const { transactionsWithCountType } = require("./types/transactionsWithCount");
const { blocksORtransactionsType } = require("./types/blocksORtransactions");

const DB = require("../db");
// import Models
var BlockModel = require("../db/models/block.model");
var TransactionModel= require("../db/models/transaction.model");

const blocks = {
  type: blocksWithCountType,
  description: "Latest blocks and view all blocks",
  args: {
    lastId: { type: GraphQLString },
    limit: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {

      // count total blocks
      let arr = await DB(BlockModel.table).count('* as total');
      let count = arr[0].total.toString();

      let db_last_id = BigInt(count - args.lastId);

      //Keyset pagination for blocks data
      let blocks = await DB(BlockModel.table)
      .where('id' ,'<=', db_last_id)
      .orderBy('id','desc')
      .limit(parseFloat(args.limit));

      return {blocks: blocks, count: count};
    } catch (error) {
      throw new Error(error);
    }
  },
};

const block = {
  type: blocksType,
  description: "View a single block",
  args: {
    number: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let block = await DB(BlockModel.table).where({block_number : args.number});
      return block[0];
    } catch (error) {
      throw new Error(error);
    }
  },
};

const transactions = {
  type: transactionsWithCountType,
  description: "Latest transactions and view all transactions",
  args: {
    lastId: { type: GraphQLString },
    limit: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {

      // count total transactions
      let arr = await DB(TransactionModel.table).count('* as total');
      let count = arr[0].total.toString();

      let db_last_id = BigInt(count - args.lastId);

      //Keyset pagination for transactions data
      let transactions = await DB(TransactionModel.table)
      .where('id' ,'<=', db_last_id)
      .orderBy('id','desc')
      .limit(parseFloat(args.limit));
      
      return {transactions: transactions, count: count};
    } catch (error) {
      throw new Error(error);
    }
  },
};

const transaction = {
  type: transactionsType,
  description: "View a single transaction",
  args: {
    hash: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      let transaction = await DB(TransactionModel.table).where({hash : args.hash});
      return transaction[0];
    } catch (error) {
      throw new Error(error);
    }
  },
};

const transactionsByAddress = {
  type: transactionsWithCountType,
  description: "All transactions of an address",
  args: {
    address: { type: GraphQLString },
    searchInto: { type: GraphQLString },
    lastId: { type: GraphQLString },
    limit: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {

      // count total transactions where to and from both
      let arr = await DB(TransactionModel.table)
      .where({from : args.address})
      .orWhere({to: args.address})
      .count('* as total');

      let count = arr[0].total.toString();

      let db_last_id = BigInt(count - args.lastId);

      //Keyset pagination for blocks data
      let transactions = await DB(TransactionModel.table)
      .where('id' ,'<=', db_last_id)
      .where({from : args.address})
      .orWhere({to: args.address})
      .orderBy('id','desc')
      .limit(parseFloat(args.limit));
      

      return {transactions: transactions, count: count};
    } catch (error) {
      throw new Error(error);
    }
  },
};

const search = {
  type: blocksORtransactionsType,
  description: "search by block number, transaction hash or an address",
  args: {
    value: { type: GraphQLString }
  },
  async resolve(parent, args, context) {
    try {
      
      let block = await DB(BlockModel.table).where({block_number : args.value});
      if(block.length == 0)
      {
        let transaction = await DB(TransactionModel.table).where({hash : args.value});
        if(transaction.length == 0)
        {
          let transactions = await DB(TransactionModel.table)
          .where({from : args.value })
          .orWhere({to: args.value});

          transactions.sort((a, b) => b.order - a.order);
          return {block: null, transaction: null, transactions : transactions};
        }
        else{
          return {block: null, transaction : transaction[0], transactions: []};
        }
      }
      else{
        return {block: block[0], transaction: null, transactions: []};
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};
module.exports = {
  blocks,
  block,
  transactions,
  transaction,
  transactionsByAddress,
  search
};
