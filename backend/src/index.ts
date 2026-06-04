import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import "dotenv/config";
import { typeDefs } from "./schema.js";
import { queryResolvers } from "./resolvers/query.js";
import { mutationResolvers } from "./resolvers/mutation.js";

const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
};

const server = new ApolloServer({ typeDefs, resolvers });

const port = Number(process.env.PORT) || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => ({ req }),
});

console.log(`GraphQL server ready at ${url}`);
