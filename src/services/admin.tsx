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


interface LoginParams {
  email: string,
  password: string,
}

interface User {
  id: string,
  name: string,
  email: string,
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
  tagTypes: ['UserTaxa', 'UserTaxon'],
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
      query: (params) => `taxa?page=${params.page}&page_size=${params.pageSize}`,
    }),

    //
    // User Taxa Lists
    //
    userTaxaList: builder.query<UserTaxaList, void>({
      query: (_) => 'user_taxa',
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
    userTaxaItems: builder.query<UserTaxaItems, UserTaxa>({
      query: (user_taxa) => `user_taxa/${user_taxa.id}/items`,
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
} = adminApi;
