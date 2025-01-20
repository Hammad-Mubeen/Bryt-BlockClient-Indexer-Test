const {
    GraphQLObjectType,
    GraphQLList
} = require("graphql");

const { blocksType } = require('./blocks');
const { transactionsType }= require('./transactions');

const blocksORtransactionsType = new GraphQLObjectType({
  
    name: "blocksORtransactions",
    description: "blocks and transactions type",
    fields: () => ({
        block: {type: blocksType },
        transaction: {type: transactionsType },
        transactions: {type: GraphQLList(transactionsType)}
  })
});
  
module.exports = { blocksORtransactionsType };

