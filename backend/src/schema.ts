export const typeDefs = `#graphql
  type Lead {
    id: Int!
    name: String!
    email: String!
    mobile: String!
    postcode: String!
    services: [String!]!
    createdAt: String!
  }

  type LeadsPage {
    items: [Lead!]!
    total: Int!
  }

  type Query {
    leads(limit: Int, offset: Int, services: [String!]): LeadsPage!
    lead(id: Int!): Lead
  }

  type Mutation {
    register(
      name: String!
      email: String!
      mobile: String!
      postcode: String!
      services: [String!]!
    ): Lead!
  }
`;
