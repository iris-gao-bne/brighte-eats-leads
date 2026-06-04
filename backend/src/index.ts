import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import "dotenv/config";
import { typeDefs } from "./schema.js";
import { queryResolvers } from "./resolvers/query.js";
import { mutationResolvers } from "./resolvers/mutation.js";
import { leadFieldResolvers } from "./resolvers/lead.js";
import { createContext } from "./context.js";

const resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Lead: leadFieldResolvers,
};

const server = new ApolloServer({ typeDefs, resolvers });

const port = Number(process.env.PORT) || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => createContext(req.headers.authorization),
});

console.log(`GraphQL server ready at ${url}`);
