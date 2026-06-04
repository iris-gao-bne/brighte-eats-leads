import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";

export interface Service {
  slug: string;
  label: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  services: string[];
  createdAt: string;
}

export interface GetServicesData {
  services: Service[];
}

export interface GetLeadsData {
  leads: { total: number; items: Lead[] };
}

export interface GetLeadsVars {
  limit?: number;
  offset?: number;
  services?: string[];
}

export interface GetLeadData {
  lead: Lead | null;
}

export interface GetLeadVars {
  id: number;
}

export const SERVICES_QUERY: TypedDocumentNode<
  GetServicesData,
  Record<string, never>
> = gql`
  query GetServices {
    services {
      slug
      label
    }
  }
`;

export const LEADS_QUERY: TypedDocumentNode<GetLeadsData, GetLeadsVars> = gql`
  query GetLeads($limit: Int, $offset: Int, $services: [String!]) {
    leads(limit: $limit, offset: $offset, services: $services) {
      total
      items {
        id
        name
        email
        mobile
        postcode
        services
        createdAt
      }
    }
  }
`;

export const LEAD_QUERY: TypedDocumentNode<GetLeadData, GetLeadVars> = gql`
  query GetLead($id: Int!) {
    lead(id: $id) {
      id
      name
      email
      mobile
      postcode
      services
      createdAt
    }
  }
`;
