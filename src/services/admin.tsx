import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


interface Taxon {
  scientificName?: string,
  scientific_name_authorship?: string,
  canonical_name?: string,
  generic_name?: string,
  specific_epithet?: string,
  intraspecific_epithet?: string,
  taxon_rank?: string,
  name_according_to?: string,
  name_published_in?: string,
  taxonomic_status?: string,
  kingdom?: string,
  phylum?: string,
  class?: string,
  order?: string,
  family?: string,
  genus?: string,
};

type TaxaListParams = {
  page: number,
  pageSize: number,
  source?: string,
  taxaListsId?: string,
};

interface TaxaList {
  total: number,
  records: Taxon[],
};

export interface UserTaxa {
  id: string,
  name: string,
  description?: string,
}

interface UserTaxaList {
  total: number,
  records: UserTaxa[],
};

type UserTaxaListParams = {
  page: number,
  pageSize: number,
};


export interface UserTaxon {
  id: string,
  taxa_lists_id: string,
  scientific_name?: string,
  scientific_name_authorship?: string,
  canonical_name?: string,
  generic_name?: string,
  specific_epithet?: string,
  intraspecific_epithet?: string,
  taxon_rank?: string,
  name_according_to?: string,
  name_published_in?: string,
  taxonomic_status?: string,
  kingdom?: string,
  phylum?: string,
  class?: string,
  order?: string,
  family?: string,
  genus?: string,
};

interface UserTaxaItems {
  total: number,
  records: UserTaxon[],
}

type UserTaxaItemsParams = {
  userTaxa: UserTaxa,
  page: number,
  pageSize: number,
};


interface LoginParams {
  email: string,
  password: string,
}

interface User {
  id: string,
  name: string,
  email: string,
}


export interface Attribute {
  id: string,
  name: string,
  data_type: string,
  description?: string,
  reference_url?: string,
}

interface AttributeList {
  total: number,
  records: Attribute[],
};

type AttributeListParams = {
  page: number,
  pageSize: number,
};


export interface TaxaImport {
  file: string,
  name: string,
  description?: string,
}


const baseQuery = fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_ARGA_API_URL, credentials: "include" });

const baseQueryWithAuth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    window.location.href = "/admin/login";
  }

  return result;
}

export const adminApi = createApi({
  reducerPath: 'admin',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['UserTaxa', 'UserTaxon', 'Attribute'],
  endpoints: (builder) => ({

    // Auth
    login: builder.mutation<User, LoginParams>({
      query(data) {
        return {
          url: 'login',
          method: 'POST',
          body: data,
        }
      },
    }),

    taxaList: builder.query<TaxaList, TaxaListParams>({
      query(params) {
        let paramStrings = [
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        if (params.source) paramStrings.push(`source=${params.source}`);
        if (params.taxaListsId) paramStrings.push(`taxa_lists_id=${params.taxaListsId}`);

        return `taxa?${paramStrings.join('&')}`
      },
    }),

    //
    // User Taxa Lists
    //
    userTaxaList: builder.query<UserTaxaList, UserTaxaListParams>({
      query(params) {
        let paramStrings = [
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        return `user_taxa?${paramStrings.join('&')}`
      },
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'UserTaxa', id } as const)),
            { type: 'UserTaxa', id: 'LIST' },
          ]
        } else {
          return [{ type: 'UserTaxa', id: 'LIST' }]
        }
      },
    }),

    createUserTaxa: builder.mutation<UserTaxa, Partial<UserTaxa>>({
      query(data) {
        return {
          url: 'user_taxa',
          method: 'POST',
          body: data,
        }
      },
      invalidatesTags: [{ type: 'UserTaxa', id: 'LIST' }],
    }),

    getUserTaxa: builder.query<UserTaxa, string>({
      query: (id) => `user_taxa/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'UserTaxa', id }],
    }),

    updateUserTaxa: builder.mutation<UserTaxa, Partial<UserTaxa>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `user_taxa/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxa', id }],
    }),

    deleteUserTaxa: builder.mutation<UserTaxa, UserTaxa>({
      query(data) {
        return {
          url: `user_taxa/${data.id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxa', id }],
    }),

    //
    // User Taxa Items
    //
    userTaxaItems: builder.query<UserTaxaItems, UserTaxaItemsParams>({
      query(params) {
        let paramStrings = [
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        return `user_taxa/${params.userTaxa.id}/items?${paramStrings.join('&')}`
      },
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'UserTaxon', id } as const)),
            { type: 'UserTaxon', id: 'LIST' },
          ]
        } else {
          return [{ type: 'UserTaxon', id: 'LIST' }]
        }
      },
    }),

    createUserTaxon: builder.mutation<UserTaxon, Partial<UserTaxon>>({
      query(data) {
        return {
          url: `user_taxa/${data.taxa_lists_id}/items`,
          method: 'POST',
          body: data,
        }
      },
      invalidatesTags: [{ type: 'UserTaxon', id: 'LIST' }],
    }),

    getUserTaxon: builder.query<UserTaxon, string>({
      query: (id) => `user_taxon/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'UserTaxon', id }],
    }),

    updateUserTaxon: builder.mutation<UserTaxon, Partial<UserTaxon>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `user_taxon/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxon', id }],
    }),

    deleteUserTaxon: builder.mutation<UserTaxon, UserTaxon>({
      query(data) {
        return {
          url: `user_taxon/${data.id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxon', id }],
    }),


    //
    // Attributes
    //
    attributeList: builder.query<AttributeList, AttributeListParams>({
      query(params) {
        let paramStrings = [
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        return `attributes?${paramStrings.join('&')}`
      },
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'Attribute', id } as const)),
            { type: 'Attribute', id: 'LIST' },
          ]
        } else {
          return [{ type: 'Attribute', id: 'LIST' }]
        }
      },
    }),

    createAttribute: builder.mutation<Attribute, Partial<Attribute>>({
      query(data) {
        return {
          url: 'attributes',
          method: 'POST',
          body: data,
        }
      },
      invalidatesTags: [{ type: 'Attribute', id: 'LIST' }],
    }),

    getAttribute: builder.query<Attribute, string>({
      query: (id) => `attributes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Attribute', id }],
    }),

    updateAttribute: builder.mutation<Attribute, Partial<Attribute>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `attributes/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attribute', id }],
    }),

    deleteAttribute: builder.mutation<Attribute, Attribute>({
      query(data) {
        return {
          url: `attributes/${data.id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attribute', id }],
    }),


    //
    // Imports
    //
    createTaxaImport: builder.mutation<null, Partial<TaxaImport>>({
      query(data) {
        return {
          url: 'queue',
          method: 'POST',
          body: data,
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,

  useTaxaListQuery,

  useUserTaxaListQuery,
  useGetUserTaxaQuery,
  useCreateUserTaxaMutation,
  useUpdateUserTaxaMutation,
  useDeleteUserTaxaMutation,

  useUserTaxaItemsQuery,
  useGetUserTaxonQuery,
  useCreateUserTaxonMutation,
  useUpdateUserTaxonMutation,
  useDeleteUserTaxonMutation,

  useAttributeListQuery,
  useGetAttributeQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,

  useCreateTaxaImportMutation,
} = adminApi;
