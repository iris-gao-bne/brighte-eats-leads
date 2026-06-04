import { gql } from "@apollo/client";
import type { Lead } from "./queries";

export const REGISTER_MUTATION = gql`
  mutation Register(
    $name: String!
    $email: String!
    $mobile: String!
    $postcode: String!
    $services: [String!]!
  ) {
    register(
      name: $name
      email: $email
      mobile: $mobile
      postcode: $postcode
      services: $services
    ) {
      id
      name
      email
      services
      createdAt
    }
  }
`;

export interface RegisterVars {
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  services: string[];
}

export interface RegisterData {
  register: Lead;
}
